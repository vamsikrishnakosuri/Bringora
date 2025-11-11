import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/ToastContainer'
import { supabase } from '@/lib/supabase'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import LocationPicker from './LocationPicker'
import { MapPin, Navigation } from 'lucide-react'
import { locationSchema } from '@/lib/validation'
import { sanitizeInput, validateCoordinates } from '@/lib/security'

interface ServiceRadiusSetupProps {
  onComplete: () => void
}

export default function ServiceRadiusSetup({ onComplete }: ServiceRadiusSetupProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [location, setLocation] = useState<{ address: string; latitude: number; longitude: number } | null>(null)
  const [radius, setRadius] = useState('')
  const [radiusUnit, setRadiusUnit] = useState<'kilometers' | 'miles'>('kilometers')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ location?: string; radius?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validate location
    if (!location) {
      setFieldErrors({ location: 'Please select your service location' })
      return
    }

    if (!validateCoordinates(location.latitude, location.longitude)) {
      setFieldErrors({ location: 'Invalid location coordinates' })
      return
    }

    try {
      locationSchema.parse(location)
    } catch (err: any) {
      setFieldErrors({ location: err.errors?.[0]?.message || 'Invalid location' })
      return
    }

    // Validate radius
    if (!radius || parseFloat(radius) <= 0) {
      setFieldErrors({ radius: 'Please enter a valid radius (greater than 0)' })
      return
    }

    const radiusValue = parseFloat(radius)
    if (radiusValue < 1 || radiusValue > 1000) {
      setFieldErrors({ radius: 'Radius must be between 1 and 1000' })
      return
    }

    setLoading(true)
    setError('')

    try {
      const sanitizedAddress = sanitizeInput(location.address)
      const radiusInKm = radiusUnit === 'miles' ? radiusValue * 1.60934 : radiusValue
      const dbUnit = radiusUnit === 'miles' ? 'miles' : 'km'

      // Upsert helper record with service area
      const { error: helperError } = await supabase
        .from('helpers')
        .upsert({
          user_id: user?.id,
          service_location: sanitizedAddress,
          service_latitude: location.latitude,
          service_longitude: location.longitude,
          service_radius: radiusInKm, // Store in km for consistency
          service_radius_unit: dbUnit,
          is_active: true,
        }, {
          onConflict: 'user_id'
        })

      if (helperError) throw helperError

      showToast('Service area set successfully!', 'success')
      onComplete()
    } catch (err: any) {
      console.error('Error saving service area:', err)
      setError(err.message || 'Failed to save service area')
      showToast(err.message || 'Failed to save service area', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Set Your Service Area</h2>
        <p className="text-muted dark:text-gray-400 mb-6">
          Set your location and service radius. Only help requests within your radius will be shown to you.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 dark:border dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Service Location <span className="text-red-500">*</span>
            </label>
            <LocationPicker
              onLocationSelect={(loc) => {
                setLocation(loc)
                if (fieldErrors.location) setFieldErrors({ ...fieldErrors, location: '' })
              }}
              initialLocation={location || undefined}
            />
            {fieldErrors.location && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {fieldErrors.location}
              </p>
            )}
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Service Radius <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  value={radius}
                  onChange={(e) => {
                    setRadius(e.target.value)
                    if (fieldErrors.radius) setFieldErrors({ ...fieldErrors, radius: '' })
                  }}
                  placeholder="e.g., 20"
                  min="1"
                  max="1000"
                  step="1"
                  error={fieldErrors.radius}
                  required
                />
              </div>
              <div className="w-32">
                <select
                  value={radiusUnit}
                  onChange={(e) => setRadiusUnit(e.target.value as 'kilometers' | 'miles')}
                  className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white/80 dark:bg-[#1A1A1A]/80 px-3 py-2 text-sm text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white/20 focus:border-gray-400 dark:focus:border-white/20 transition-all min-h-[44px]"
                >
                  <option value="kilometers">Kilometers</option>
                  <option value="miles">Miles</option>
                </select>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted dark:text-gray-400">
              Only requests within {radius || '...'} {radiusUnit} of your location will be shown
            </p>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Save Service Area
          </Button>
        </form>
      </div>
    </Card>
  )
}



