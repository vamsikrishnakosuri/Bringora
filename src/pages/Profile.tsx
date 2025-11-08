import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LocationPicker from '@/components/LocationPicker'
import { User, Phone, Mail, MapPin, Save, ArrowLeft, CheckCircle, Camera } from 'lucide-react'
import { nameSchema, phoneSchema, locationSchema } from '@/lib/validation'
import { sanitizeInput, validatePhoneNumber, validateCoordinates } from '@/lib/security'
import { useToast } from '@/components/ui/ToastContainer'

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState<{ address: string; latitude: number; longitude: number } | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; phone?: string; location?: string }>({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }

    const fetchProfile = async () => {
      try {
        // First check Google OAuth avatar
        const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture
        if (googleAvatar) {
          setAvatarUrl(googleAvatar)
        }

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('full_name, phone, email, location, latitude, longitude, avatar_url')
          .eq('id', user.id)
          .single()

        if (fetchError) {
          console.error('Error fetching profile:', fetchError)
          setError('Failed to load profile. Please try again.')
          setFetching(false)
          return
        }

        if (data) {
          setFullName(data.full_name || '')
          setPhone(data.phone || '')
          setEmail(data.email || user.email || '')
          
          // Set avatar from profile if not already set from Google
          if (!avatarUrl && data.avatar_url) {
            setAvatarUrl(data.avatar_url)
          } else if (googleAvatar && !data.avatar_url) {
            // Save Google avatar to profile if not saved
            await supabase
              .from('profiles')
              .update({ avatar_url: googleAvatar })
              .eq('id', user.id)
          }
          
          if (data.latitude && data.longitude && data.location) {
            setLocation({
              address: data.location,
              latitude: data.latitude,
              longitude: data.longitude,
            })
          }
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile. Please try again.')
      } finally {
        setFetching(false)
      }
    }

    fetchProfile()
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setSuccess(false)

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

    // Validate location
    if (!location) {
      setFieldErrors({ location: 'Please select your location' })
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

    setLoading(true)
    setError('')

    try {
      // Sanitize location address
      const sanitizedAddress = sanitizeInput(location.address)

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          email: user!.email,
          full_name: sanitizedName,
          phone: sanitizedPhone,
          location: sanitizedAddress,
          latitude: location.latitude,
          longitude: location.longitude,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })

      if (profileError) throw profileError

      setSuccess(true)
      showToast('Profile updated successfully!', 'success')
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
      showToast('Failed to update profile. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (loc: { address: string; latitude: number; longitude: number }) => {
    setLocation(loc)
    setError('')
    if (fieldErrors.location) {
      setFieldErrors({ ...fieldErrors, location: undefined })
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-muted dark:border-muted border-t-foreground dark:border-t-foreground rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted dark:text-muted">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] px-4 py-12">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-foreground dark:text-white hover:text-foreground dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
          <div className="mb-8">
            {/* Profile Avatar Display */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName || 'Profile'}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/20 dark:border-white/10 shadow-lg"
                    onError={() => setAvatarUrl(null)}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-foreground to-muted dark:from-white dark:to-gray-400 flex items-center justify-center border-4 border-white/20 dark:border-white/10 shadow-lg">
                    <User className="w-10 h-10 text-background dark:text-[#0A0A0A]" />
                  </div>
                )}
                {user.user_metadata?.provider === 'google' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-[#1A1A1A] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold dark:text-white tracking-tight">
                  {fullName || 'Your Profile'}
                </h1>
                <p className="text-muted dark:text-gray-400 text-sm">
                  {email || user.email}
                </p>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2 dark:text-white">Profile Settings</h2>
            <p className="text-muted dark:text-gray-400 text-sm">
              Manage your account information and preferences
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="pl-10 bg-muted/50 dark:bg-gray-800/50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted dark:text-gray-400 mt-1">
                Email cannot be changed. Contact support if you need to update it.
              </p>
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

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Location <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-muted dark:text-gray-400 mb-4">
                Update your location on the map. This helps us show you nearby help requests.
              </p>
              {fieldErrors.location && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm">
                  {fieldErrors.location}
                </div>
              )}
              <LocationPicker onLocationSelect={handleLocationSelect} initialLocation={location || undefined} />
              {location && (
                <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-800 dark:text-green-300">{location.address}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

