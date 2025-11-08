import { useState } from 'react'
import { MessageSquare, X, Shield } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import Chat from './Chat'
import ReportUser from './ReportUser'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName?: string
  helpRequestId?: string
}

export default function ContactModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  helpRequestId,
}: ContactModalProps) {
  const [showChat, setShowChat] = useState(false)
  const [showReport, setShowReport] = useState(false)

  if (!isOpen) return null

  const handleStartChat = () => {
    setShowChat(true)
  }

  const handleReport = () => {
    setShowReport(true)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <Card
          className="w-full max-w-md backdrop-blur-xl bg-white/90 dark:bg-[#1A1A1A]/90 border-white/30 dark:border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold dark:text-white">
                Contact {recipientName || 'User'}
              </h3>
              <p className="text-sm text-muted dark:text-gray-400 mt-1">
                Secure in-app messaging
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-foreground dark:text-white" />
            </button>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleStartChat}
              className="w-full flex items-center justify-center gap-3 h-12 sm:h-14 text-base min-h-[48px]"
            >
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Start Chat (End-to-End Encrypted)</span>
            </Button>

            <Button
              onClick={handleReport}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 h-12 sm:h-14 text-base min-h-[48px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Report User</span>
            </Button>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Privacy Protected:</strong> Your phone number and email are never shared. 
                All communication happens securely within the app with end-to-end encryption.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {showChat && (
        <Chat
          isOpen={showChat}
          onClose={() => {
            setShowChat(false)
            onClose()
          }}
          recipientId={recipientId}
          recipientName={recipientName || 'User'}
          helpRequestId={helpRequestId}
        />
      )}

      {showReport && (
        <ReportUser
          isOpen={showReport}
          onClose={() => {
            setShowReport(false)
            onClose()
          }}
          reportedUserId={recipientId}
          reportedUserName={recipientName || 'User'}
          helpRequestId={helpRequestId}
        />
      )}
    </>
  )
}

