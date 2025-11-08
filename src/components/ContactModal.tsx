import { useState } from 'react'
import { Phone, MessageSquare, Mail, X } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  phone: string
  email?: string
  requesterName?: string
  preferredMethods: ('call' | 'message' | 'email')[]
}

export default function ContactModal({
  isOpen,
  onClose,
  phone,
  email,
  requesterName,
  preferredMethods,
}: ContactModalProps) {
  if (!isOpen) return null

  const handleCall = () => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleMessage = () => {
    // Open WhatsApp or SMS based on device
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}`
    const smsUrl = `sms:${phone}`
    
    // Try WhatsApp first, fallback to SMS
    window.open(whatsappUrl, '_blank')
  }

  const handleEmail = () => {
    if (email) {
      window.open(`mailto:${email}`, '_self')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md mx-4 backdrop-blur-xl bg-white/90 dark:bg-[#1A1A1A]/90 border-white/30 dark:border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold dark:text-white">
            Contact {requesterName || 'Requester'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-foreground dark:text-white" />
          </button>
        </div>

        <div className="space-y-3">
          {preferredMethods.includes('call') && (
            <Button
              onClick={handleCall}
              className="w-full flex items-center justify-center gap-3 h-12 text-base"
            >
              <Phone className="w-5 h-5" />
              <span>Call</span>
            </Button>
          )}

          {preferredMethods.includes('message') && (
            <Button
              onClick={handleMessage}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 h-12 text-base"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Message (WhatsApp/SMS)</span>
            </Button>
          )}

          {preferredMethods.includes('email') && email && (
            <Button
              onClick={handleEmail}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 h-12 text-base"
            >
              <Mail className="w-5 h-5" />
              <span>Email</span>
            </Button>
          )}

          {preferredMethods.length === 0 && (
            <p className="text-sm text-muted dark:text-gray-400 text-center py-4">
              No contact methods available for this requester.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

