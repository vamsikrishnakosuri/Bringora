import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { sanitizeInput } from '@/lib/security'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { useToast } from './ui/ToastContainer'

interface ReportUserProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
  helpRequestId?: string
}

const REPORT_TYPES = [
  { value: 'abusive_language', label: 'Abusive Language' },
  { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
  { value: 'fraud', label: 'Fraud or Scam' },
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'fake_profile', label: 'Fake Profile' },
  { value: 'other', label: 'Other' },
] as const

export default function ReportUser({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  helpRequestId,
}: ReportUserProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [reportType, setReportType] = useState<string>('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !reportType || !description.trim()) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    setSubmitting(true)
    try {
      const sanitizedDescription = sanitizeInput(description.trim())
      
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          help_request_id: helpRequestId || null,
          report_type: reportType,
          description: sanitizedDescription,
          status: 'pending',
        })

      if (error) throw error

      showToast('Report submitted successfully. Our team will review it.', 'success')
      onClose()
      // Reset form
      setReportType('')
      setDescription('')
    } catch (err: any) {
      console.error('Error submitting report:', err)
      showToast('Failed to submit report. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md backdrop-blur-xl bg-white/90 dark:bg-[#1A1A1A]/90 border-white/30 dark:border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold dark:text-white">Report User</h3>
              <p className="text-sm text-muted dark:text-gray-400">{reportedUserName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-foreground dark:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Reason for Report <span className="text-red-500">*</span>
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white"
              required
            >
              <option value="">Select a reason</option>
              {REPORT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about the issue..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white min-h-[120px] resize-y"
              required
              maxLength={1000}
            />
            <p className="text-xs text-muted dark:text-gray-400 mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Reports are reviewed by our moderation team. False reports may result in account restrictions.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2"
              disabled={submitting || !reportType || !description.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

