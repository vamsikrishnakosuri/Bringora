import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/ToastContainer'
import Card from './ui/Card'
import Button from './ui/Button'
import { Shield, MapPin, AlertCircle, CheckCircle, Phone } from 'lucide-react'

interface SafetyCheckInProps {
  helpRequestId: string
  checkinType: 'before' | 'during' | 'after'
  onCheckIn?: () => void
}

export default function SafetyCheckIn({
  helpRequestId,
  checkinType,
  onCheckIn,
}: SafetyCheckInProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  const handleCheckIn = async () => {
    if (!user) {
      showToast('Please log in to check in', 'error')
      return
    }

    setCheckingIn(true)
    try {
      // Get current location
      let lat: number | null = null
      let lng: number | null = null

      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false,
          })
        })
        lat = position.coords.latitude
        lng = position.coords.longitude
      }

      // Record check-in
      const { error } = await supabase
        .from('safety_checkins')
        .insert({
          user_id: user.id,
          help_request_id: helpRequestId,
          checkin_type: checkinType,
          location_lat: lat,
          location_lng: lng,
        })

      if (error) throw error

      setCheckedIn(true)
      showToast('Safety check-in recorded', 'success')
      onCheckIn?.()
    } catch (err: any) {
      console.error('Error checking in:', err)
      showToast('Failed to record check-in', 'error')
    } finally {
      setCheckingIn(false)
    }
  }

  const getCheckInMessage = () => {
    switch (checkinType) {
      case 'before':
        return {
          title: 'Pre-Meeting Safety Check',
          description: 'Share your location with a trusted contact before meeting.',
          icon: Shield,
        }
      case 'during':
        return {
          title: 'I\'m Safe',
          description: 'Confirm you\'re safe during the meeting.',
          icon: CheckCircle,
        }
      case 'after':
        return {
          title: 'Meeting Complete',
          description: 'Confirm the meeting completed safely.',
          icon: CheckCircle,
        }
    }
  }

  const message = getCheckInMessage()
  const Icon = message.icon

  if (checkedIn) {
    return (
      <Card className="backdrop-blur-xl bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">
              Check-in Recorded
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Your safety check-in has been saved.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold dark:text-white mb-1">{message.title}</h3>
            <p className="text-sm text-muted dark:text-gray-400">{message.description}</p>
          </div>
        </div>

        {checkinType === 'before' && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                <p className="font-medium mb-1">Safety Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Meet in a public place</li>
                  <li>Tell someone where you're going</li>
                  <li>Share your live location</li>
                  <li>Trust your instincts</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleCheckIn}
          loading={checkingIn}
          className="w-full"
          variant={checkinType === 'during' ? 'default' : 'outline'}
        >
          {checkinType === 'before' && (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Record Pre-Meeting Check
            </>
          )}
          {checkinType === 'during' && (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              I'm Safe
            </>
          )}
          {checkinType === 'after' && (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Completion
            </>
          )}
        </Button>

        {checkinType === 'during' && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <Button
              variant="outline"
              className="w-full border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Phone className="w-4 h-4 mr-2" />
              Emergency Contact
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

