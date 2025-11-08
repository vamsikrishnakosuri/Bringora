import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LocationPicker from '@/components/LocationPicker'
import { User, Phone, MapPin, ArrowRight, CheckCircle } from 'lucide-react'
import { onboardingSchema, nameSchema, phoneSchema, locationSchema } from '@/lib/validation'
import { sanitizeInput, validatePhoneNumber, validateCoordinates } from '@/lib/security'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState<{ address: string; latitude: number; longitude: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'info' | 'location' | 'complete'>('info')
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; phone?: string; location?: string }>({})

  if (!user) {
    navigate('/auth')
    return null
  }

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Sanitize inputs
    const sanitizedName = sanitizeInput(fullName.trim())
    const sanitizedPhone = phone.trim()

    // Validate name
    try {
      nameSchema.parse(sanitizedName)
    } catch (err: any) {
      setFieldErrors({ fullName: err.errors?.[0]?.message || 'Invalid name' })
      return
    }

    // Validate phone
    try {
      phoneSchema.parse(sanitizedPhone)
      const phoneValidation = validatePhoneNumber(sanitizedPhone)
      if (!phoneValidation.valid) {
        setFieldErrors({ phone: 'Please enter a valid phone number (10-13 digits)' })
        return
      }
    } catch (err: any) {
      setFieldErrors({ phone: err.errors?.[0]?.message || 'Invalid phone number' })
      return
    }

    setStep('location')
  }

  const handleLocationSubmit = async () => {
    setError('')
    setFieldErrors({})

    if (!location) {
      setFieldErrors({ location: 'Please select your location' })
      return
    }

    // Validate location coordinates
    if (!validateCoordinates(location.latitude, location.longitude)) {
      setFieldErrors({ location: 'Invalid location coordinates' })
      return
    }

    // Validate location schema
    try {
      locationSchema.parse(location)
    } catch (err: any) {
      setFieldErrors({ location: err.errors?.[0]?.message || 'Invalid location' })
      return
    }

    setLoading(true)
    setError('')

    try {
      // Sanitize location address
      const sanitizedAddress = sanitizeInput(location.address)
      const sanitizedName = sanitizeInput(fullName.trim())
      const sanitizedPhone = phone.trim()

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: sanitizedName,
          phone: sanitizedPhone,
          location: sanitizedAddress,
          latitude: location.latitude,
          longitude: location.longitude,
          profile_completed: true,
        }, {
          onConflict: 'id'
        })

      if (profileError) throw profileError

      setStep('complete')
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (loc: { address: string; latitude: number; longitude: number }) => {
    setLocation(loc)
    setError('')
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] px-4">
        <Card className="max-w-md w-full backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Profile Complete!</h2>
            <p className="text-muted dark:text-gray-400">
              Your profile has been set up successfully. Redirecting to homepage...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] px-4 py-12">
      <Card className="max-w-2xl w-full backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step === 'info' 
                ? 'bg-foreground dark:bg-white text-background dark:text-foreground' 
                : 'bg-green-500 text-white'
            }`}>
              {step === 'info' ? '1' : <CheckCircle className="w-6 h-6" />}
            </div>
            <div className={`h-1 w-20 transition-all ${
              step === 'location' ? 'bg-foreground dark:bg-white' : 'bg-muted dark:bg-gray-700'
            }`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step === 'location' 
                ? 'bg-foreground dark:bg-white text-background dark:text-foreground' 
                : 'bg-muted dark:bg-gray-700 text-muted dark:text-gray-400'
            }`}>
              2
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2 dark:text-white tracking-tight">
            {step === 'info' ? 'Complete Your Profile' : 'Set Your Location'}
          </h2>
          <p className="text-center text-muted dark:text-gray-400">
            {step === 'info' 
              ? 'We need a few details to get you started' 
              : 'This helps us show you nearby requests'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {step === 'info' ? (
          <form onSubmit={handleInfoSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400" />
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: undefined })
                  }}
                  placeholder="Enter your full name"
                  className="pl-10"
                  error={fieldErrors.fullName}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: undefined })
                  }}
                  placeholder="Enter your phone number (10-13 digits)"
                  className="pl-10"
                  error={fieldErrors.phone}
                  required
                />
              </div>
              <p className="text-xs text-muted dark:text-gray-400 mt-1">
                This will be used for contact when you request or offer help
              </p>
            </div>

            <Button type="submit" className="w-full flex items-center justify-center gap-2">
              Continue to Location
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Your Location <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-muted dark:text-gray-400 mb-4">
                Select your location on the map. This helps us show you nearby help requests.
              </p>
              {fieldErrors.location && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm">
                  {fieldErrors.location}
                </div>
              )}
              <LocationPicker onLocationSelect={handleLocationSelect} />
              {location && (
                <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-800 dark:text-green-300">{location.address}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('info')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleLocationSubmit}
                disabled={!location || loading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
                {!loading && <CheckCircle className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
