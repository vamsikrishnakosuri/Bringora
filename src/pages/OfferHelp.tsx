import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LocationPicker from '@/components/LocationPicker'
import { User, Phone, Mail, Camera, Upload, CheckCircle, Clock, MapPin, Navigation } from 'lucide-react'

type Step = 'application' | 'verification' | 'service-area'

export default function OfferHelp() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()

  const [step, setStep] = useState<Step>('application')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [idPhoto, setIdPhoto] = useState<File | null>(null)
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null)
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null)
  const [selfiePhotoPreview, setSelfiePhotoPreview] = useState<string | null>(null)
  const [location, setLocation] = useState<{ address: string; latitude: number; longitude: number } | null>(null)
  const [serviceRadius, setServiceRadius] = useState('')
  const [radiusUnit, setRadiusUnit] = useState<'km' | 'miles'>('km')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [applicationId, setApplicationId] = useState<string | null>(null)

  const idPhotoInputRef = useRef<HTMLInputElement>(null)
  const selfiePhotoInputRef = useRef<HTMLInputElement>(null)

  if (!user) {
    navigate('/auth?redirect=/offer-help')
    return null
  }

  const handleIdPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIdPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelfiePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelfiePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelfiePhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!idPhoto || !selfiePhoto) {
      setError('Please upload both ID photo and selfie with ID')
      setLoading(false)
      return
    }

    try {
      // Upload ID photo
      const idPhotoExt = idPhoto.name.split('.').pop()
      const idPhotoPath = `${user.id}/id_photo.${idPhotoExt}`
      const { error: idUploadError } = await supabase.storage
        .from('helper-verification')
        .upload(idPhotoPath, idPhoto, { upsert: true })

      if (idUploadError) throw idUploadError

      // Upload selfie photo
      const selfiePhotoExt = selfiePhoto.name.split('.').pop()
      const selfiePhotoPath = `${user.id}/selfie.${selfiePhotoExt}`
      const { error: selfieUploadError } = await supabase.storage
        .from('helper-verification')
        .upload(selfiePhotoPath, selfiePhoto, { upsert: true })

      if (selfieUploadError) throw selfieUploadError

      // Get public URLs
      const { data: idPhotoData } = supabase.storage
        .from('helper-verification')
        .getPublicUrl(idPhotoPath)

      const { data: selfiePhotoData } = supabase.storage
        .from('helper-verification')
        .getPublicUrl(selfiePhotoPath)

      // Create helper application
      const { data: applicationData, error: applicationError } = await supabase
        .from('helper_applications')
        .insert({
          user_id: user.id,
          status: 'pending',
          id_photo_url: idPhotoData.publicUrl,
          selfie_photo_url: selfiePhotoData.publicUrl,
        })
        .select()
        .single()

      if (applicationError) throw applicationError

      setApplicationId(applicationData.id)
      setStep('verification')
    } catch (err: any) {
      setError(err.message || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  const handleServiceAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!location) {
      setError('Please select your service location on the map')
      return
    }

    setLoading(true)

    try {
      // Create helper profile
      const { error: helperError } = await supabase
        .from('helpers')
        .insert({
          user_id: user.id,
          service_location: location.address,
          service_latitude: location.latitude,
          service_longitude: location.longitude,
          service_radius: parseFloat(serviceRadius),
          service_radius_unit: radiusUnit,
          is_active: false, // Will be activated after admin approval
        })

      if (helperError) throw helperError

      // Update profile
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          email: email || null,
          is_helper: true,
        })
        .eq('id', user.id)

      alert('Application submitted successfully! You will be notified once verified.')
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Failed to save service area')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (loc: { address: string; latitude: number; longitude: number }) => {
    setLocation(loc)
  }

  // Step 1: Application Form
  if (step === 'application') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-8 text-center dark:text-white tracking-tight">
            Become a Helper - Step 1 of 3
          </h1>

          <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 dark:border dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleApplicationSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400" />
                      <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400" />
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 1234567890"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">Email (Optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Identity Verification (Required)</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Government-Issued ID Photo
                    </label>
                    <p className="text-xs text-muted dark:text-gray-400 mb-3">
                      Upload a clear photo of your driver's license, passport, or national ID (must show face)
                    </p>
                    <input
                      ref={idPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleIdPhotoChange}
                      className="hidden"
                    />
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => idPhotoInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload ID Photo
                      </Button>
                      {idPhotoPreview && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/20 dark:border-white/10">
                          <img src={idPhotoPreview} alt="ID Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Selfie with ID
                    </label>
                    <p className="text-xs text-muted dark:text-gray-400 mb-3">
                      Take a photo of yourself holding the ID next to your face
                    </p>
                    <input
                      ref={selfiePhotoInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleSelfiePhotoChange}
                      className="hidden"
                    />
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => selfiePhotoInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Take Selfie
                      </Button>
                      {selfiePhotoPreview && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/20 dark:border-white/10">
                          <img src={selfiePhotoPreview} alt="Selfie Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  // Step 2: Verification Status
  if (step === 'verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10 text-center">
            <div className="py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4 dark:text-white">Application Submitted</h2>
              <div className="mb-6">
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                  ⏳ Verification Pending
                </p>
                <p className="text-muted dark:text-gray-300">
                  Our team will manually verify your identity within 24 hours. You'll receive a notification once your application is reviewed.
                </p>
              </div>
              <Button onClick={() => setStep('service-area')} className="w-full">
                Continue to Service Area Setup
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Step 3: Service Area Setup
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-center dark:text-white tracking-tight">
          Service Area Setup - Step 3 of 3
        </h1>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 dark:border dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleServiceAreaSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Service Location</h2>
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Service Radius</h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 dark:text-white">Distance</label>
                  <Input
                    type="number"
                    value={serviceRadius}
                    onChange={(e) => setServiceRadius(e.target.value)}
                    placeholder="e.g., 10"
                    min="1"
                    step="1"
                    required
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium mb-2 dark:text-white">Unit</label>
                  <select
                    value={radiusUnit}
                    onChange={(e) => setRadiusUnit(e.target.value as 'km' | 'miles')}
                    className="flex h-10 w-full rounded-lg border border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#1A1A1A]/80 px-3 py-2 text-sm text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white/20"
                  >
                    <option value="km">Kilometers</option>
                    <option value="miles">Miles</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted dark:text-gray-400 mt-2">
                How far are you willing to travel to help others?
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('verification')}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
