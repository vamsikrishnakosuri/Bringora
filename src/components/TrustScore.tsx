import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrustScoreProps {
  userId: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showBreakdown?: boolean
}

export default function TrustScore({
  userId,
  size = 'md',
  showLabel = true,
  showBreakdown = false,
}: TrustScoreProps) {
  const [score, setScore] = useState<number | null>(null)
  const [factors, setFactors] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrustScore()
  }, [userId])

  const loadTrustScore = async () => {
    try {
      const { data, error } = await supabase
        .from('trust_scores')
        .select('score, factors')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setScore(data.score)
        setFactors(data.factors)
      } else {
        // Default score if not found
        setScore(50)
      }
    } catch (err) {
      console.error('Error loading trust score:', err)
      setScore(50) // Fallback
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 animate-pulse" />
        {showLabel && <span className="text-sm text-muted dark:text-gray-400">Loading...</span>}
      </div>
    )
  }

  const scoreValue = score || 50
  const percentage = scoreValue
  const circumference = 2 * Math.PI * 18 // radius = 18
  const offset = circumference - (percentage / 100) * circumference

  const getScoreColor = () => {
    if (scoreValue >= 80) return 'text-green-500 dark:text-green-400'
    if (scoreValue >= 50) return 'text-yellow-500 dark:text-yellow-400'
    return 'text-red-500 dark:text-red-400'
  }

  const getScoreBgColor = () => {
    if (scoreValue >= 80) return 'bg-green-500 dark:bg-green-400'
    if (scoreValue >= 50) return 'bg-yellow-500 dark:bg-yellow-400'
    return 'bg-red-500 dark:bg-red-400'
  }

  const getScoreLabel = () => {
    if (scoreValue >= 80) return 'Excellent'
    if (scoreValue >= 70) return 'Very Good'
    if (scoreValue >= 50) return 'Good'
    if (scoreValue >= 30) return 'Fair'
    return 'Poor'
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  }

  return (
    <div className="flex items-center gap-2">
      {/* Circular Progress */}
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="50%"
            cy="50%"
            r="18"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="50%"
            cy="50%"
            r="18"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${getScoreColor()} transition-all duration-500`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${getScoreColor()}`}>{scoreValue}</span>
        </div>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Shield className={`w-4 h-4 ${getScoreColor()}`} />
            <span className={`text-sm font-medium ${getScoreColor()}`}>
              {getScoreLabel()}
            </span>
          </div>
          <span className="text-xs text-muted dark:text-gray-400">Trust Score</span>
        </div>
      )}

      {showBreakdown && factors && (
        <div className="ml-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/20 dark:border-white/10">
          <p className="text-xs font-medium mb-2 dark:text-white">Score Breakdown:</p>
          <div className="space-y-1 text-xs">
            {factors.ratings && (
              <div className="flex items-center gap-2">
                <span className="text-muted dark:text-gray-400">Ratings:</span>
                <span className="dark:text-white">{factors.ratings.toFixed(1)}/5.0</span>
              </div>
            )}
            {factors.tasks !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-muted dark:text-gray-400">Tasks:</span>
                <span className="dark:text-white">{factors.tasks}</span>
              </div>
            )}
            {factors.response_time && (
              <div className="flex items-center gap-2">
                <span className="text-muted dark:text-gray-400">Response:</span>
                <span className="dark:text-white">
                  {Math.floor(factors.response_time / 60)} min
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

