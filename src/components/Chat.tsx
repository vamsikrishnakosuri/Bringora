import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { encryptMessage, decryptMessage, generateConversationKey } from '@/lib/encryption'
import { sanitizeInput } from '@/lib/security'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import { Send, X, Loader2, Check, CheckCheck } from 'lucide-react'
import { useToast } from './ui/ToastContainer'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  encrypted_content: string
  encryption_metadata: any
  status: 'sent' | 'delivered' | 'read'
  created_at: string
  read_at?: string
  decrypted_content?: string // Decrypted on client side
}

interface ChatProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
  helpRequestId?: string
}

export default function Chat({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  helpRequestId,
}: ChatProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Generate conversation ID (deterministic - sorted user IDs)
  const getConversationId = () => {
    if (!user?.id || !recipientId) return ''
    const sortedIds = [user.id, recipientId].sort()
    return helpRequestId 
      ? `${sortedIds[0]}_${sortedIds[1]}_${helpRequestId}`
      : `${sortedIds[0]}_${sortedIds[1]}`
  }
  
  const conversationId = getConversationId()

  // Initialize encryption key
  useEffect(() => {
    if (user && recipientId) {
      generateConversationKey(user.id, recipientId, helpRequestId)
        .then(setEncryptionKey)
        .catch((err) => {
          console.error('Error generating encryption key:', err)
          showToast('Error initializing encryption. Please refresh.', 'error')
        })
    }
  }, [user, recipientId, helpRequestId])

  // Load messages
  useEffect(() => {
    if (!isOpen || !user || !encryptionKey) return

    loadMessages()
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            handleNewMessage(payload.new as any)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen, user, encryptionKey, conversationId])

  // Decrypt and add new message
  const handleNewMessage = async (messageData: any) => {
    if (!encryptionKey) return

    try {
      const decrypted = await decryptMessage(
        messageData.encrypted_content,
        messageData.encryption_metadata?.iv,
        encryptionKey
      )
      
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === messageData.id)) return prev
        return [
          ...prev,
          {
            ...messageData,
            decrypted_content: decrypted,
          },
        ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      })

      // Mark as read if we're the recipient
      if (messageData.recipient_id === user?.id && messageData.status !== 'read') {
        markAsRead(messageData.id)
      }

      scrollToBottom()
    } catch (err) {
      console.error('Error decrypting message:', err)
    }
  }

  // Load messages from database
  const loadMessages = async () => {
    if (!user || !encryptionKey || !conversationId) return

    setLoading(true)
    try {
      // Load messages where user is either sender or recipient
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('help_request_id', helpRequestId || null)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Decrypt all messages
      const decryptedMessages = await Promise.all(
        (data || []).map(async (msg) => {
          try {
            const decrypted = await decryptMessage(
              msg.encrypted_content,
              msg.encryption_metadata?.iv,
              encryptionKey
            )
            return {
              ...msg,
              decrypted_content: decrypted,
            }
          } catch (err) {
            console.error('Error decrypting message:', err)
            return {
              ...msg,
              decrypted_content: '[Unable to decrypt message]',
            }
          }
        })
      )

      setMessages(decryptedMessages)

      // Mark messages as read
      const unreadMessages = decryptedMessages.filter(
        (m) => m.recipient_id === user.id && m.status !== 'read'
      )
      if (unreadMessages.length > 0) {
        unreadMessages.forEach((msg) => markAsRead(msg.id))
      }

      scrollToBottom()
    } catch (err: any) {
      console.error('Error loading messages:', err)
      showToast('Failed to load messages', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', user?.id)
    } catch (err) {
      console.error('Error marking message as read:', err)
    }
  }

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !encryptionKey || sending) return

    const sanitizedMessage = sanitizeInput(newMessage.trim())
    if (!sanitizedMessage) {
      showToast('Message cannot be empty', 'error')
      return
    }

    setSending(true)
    try {
      // Encrypt message
      const { encrypted, iv, metadata } = await encryptMessage(sanitizedMessage, encryptionKey)

      // Save to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          recipient_id: recipientId,
          help_request_id: helpRequestId || null,
          encrypted_content: encrypted,
          encryption_metadata: { ...metadata, iv },
          status: 'sent',
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state (will also be added via real-time subscription)
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          decrypted_content: sanitizedMessage,
        },
      ])

      setNewMessage('')
      scrollToBottom()
    } catch (err: any) {
      console.error('Error sending message:', err)
      showToast('Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl h-[80vh] max-h-[600px] flex flex-col backdrop-blur-xl bg-white/90 dark:bg-[#1A1A1A]/90 border-white/30 dark:border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-white/10">
          <div>
            <h3 className="text-xl font-bold dark:text-white">Chat with {recipientName}</h3>
            <p className="text-sm text-muted dark:text-gray-400">
              End-to-end encrypted • Messages are private
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-foreground dark:text-white" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted dark:text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted dark:text-gray-400">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwn
                        ? 'bg-foreground dark:bg-white text-background dark:text-foreground'
                        : 'bg-muted dark:bg-white/10 text-foreground dark:text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.decrypted_content || '[Encrypted message]'}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isOwn && (
                        <span className="opacity-70">
                          {message.status === 'read' ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : message.status === 'delivered' ? (
                            <CheckCheck className="w-3 h-3 opacity-50" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 dark:border-white/10">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending || !encryptionKey}
              maxLength={1000}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending || !encryptionKey}
              className="min-w-[48px]"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted dark:text-gray-400 mt-1">
            Messages are end-to-end encrypted. Only you and {recipientName} can read them.
          </p>
        </form>
      </Card>
    </div>
  )
}

