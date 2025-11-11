import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/ToastContainer'
import Card from './ui/Card'
import Button from './ui/Button'
import { X, Star, Loader2 } from 'lucide-react'
import { sanitizeInput } from '@/lib/security'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  ratedUserId: string
  ratedUserName: string
  helpRequestId?: string
  onRated?: () => void
}

export default function RatingModal({
  isOpen,
  onClose,
  ratedUserId,
  ratedUserName,
  helpRequestId,
  onRated,
}: RatingModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || rating === 0) {
      showToast('Please select a rating', 'error')
      return
    }

    setSubmitting(true)
    try {
      const sanitizedReview = review.trim() ? sanitizeInput(review.trim()) : null

      // Insert rating
      const { error: ratingError } = await supabase
        .from('ratings')
        .upsert({
          rater_id: user.id,
          rated_user_id: ratedUserId,
          help_request_id: helpRequestId || null,
          rating,
          review: sanitizedReview,
        }, {
          onConflict: 'rater_id,rated_user_id,help_request_id'
        })

      if (ratingError) throw ratingError

      // Mark request as rated if helpRequestId exists
      if (helpRequestId) {
        await supabase
          .from('help_requests')
          .update({ rated: true })
          .eq('id', helpRequestId)
      }

      showToast('Rating submitted successfully!', 'success')
      onRated?.()
      onClose()
      
      // Reset form
      setRating(0)
      setReview('')
    } catch (err: any) {
      console.error('Error submitting rating:', err)
      showToast('Failed to submit rating. Please try again.', 'error')
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
          <div>
            <h3 className="text-xl font-bold dark:text-white">Rate {ratedUserName}</h3>
            <p className="text-sm text-muted dark:text-gray-400">How was your experience?</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-foreground dark:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-3 dark:text-white">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 text-sm text-muted dark:text-gray-400">
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Great!'}
                {rating === 3 && 'Good'}
                {rating === 2 && 'Fair'}
                {rating === 1 && 'Poor'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white min-h-[120px] resize-y"
              maxLength={500}
            />
            <p className="text-xs text-muted dark:text-gray-400 mt-1">
              {review.length}/500 characters
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
              disabled={submitting || rating === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 fill-current" />
                  Submit Rating
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

