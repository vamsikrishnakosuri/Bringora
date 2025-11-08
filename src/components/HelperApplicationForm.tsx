import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/components/ui/ToastContainer'
import { supabase } from '@/lib/supabase'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import { 
  helperApplicationSchema, 
  aadhaarSchema, 
  panSchema, 
  drivingLicenseSchema, 
  passportSchema, 
  voterIdSchema, 
  rationCardSchema 
} from '@/lib/validation'
import { sanitizeInput } from '@/lib/security'
import { 
  validateIdFormat, 
  getIdTypeDisplayName, 
  getIdTypePlaceholder, 
  maskIdNumber,
  type IDType 
} from '@/lib/idVerification'
import { User, Phone, Mail, Camera, FileText, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

interface HelperApplicationFormProps {
  onComplete: () => void
  onCancel?: () => void
}

export default function HelperApplicationForm({ onComplete, onCancel }: HelperApplicationFormProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [idType, setIdType] = useState<IDType>('aadhaar')
  const [idNumber, setIdNumber] = useState('')
  const [idPhoto, setIdPhoto] = useState<File | null>(null)
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null)
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const idPhotoInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)

  // Load user profile data
  useState(() => {
    if (user) {
      loadProfile()
    }
  })

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', user?.id)
        .single()

      if (data) {
        if (data.full_name && !fullName) setFullName(data.full_name)
        if (data.phone && !phone) setPhone(data.phone)
        if (data.email && !email) setEmail(data.email || user?.email || '')
      } else {
        setEmail(user?.email || '')
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setEmail(user?.email || '')
    }
  }

  const handleIdTypeChange = (newType: IDType) => {
    setIdType(newType)
    setIdNumber('')
    if (fieldErrors.idNumber) {
      setFieldErrors({ ...fieldErrors, idNumber: '' })
    }
  }

  const handleIdNumberChange = (value: string) => {
    // Remove spaces and format based on type
    let cleaned = value.replace(/\s+/g, '').toUpperCase()
    
    // Format Aadhaar: 1234 5678 9012
    if (idType === 'aadhaar' && cleaned.length <= 12) {
      if (cleaned.length > 4) {
        cleaned = cleaned.slice(0, 4) + ' ' + cleaned.slice(4)
      }
      if (cleaned.length > 9) {
        cleaned = cleaned.slice(0, 9) + ' ' + cleaned.slice(9)
      }
    }
    
    setIdNumber(cleaned)
    if (fieldErrors.idNumber) {
      setFieldErrors({ ...fieldErrors, idNumber: '' })
    }
  }

  const handleIdPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors({ ...fieldErrors, idPhoto: 'ID photo must be less than 5MB' })
        return
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setFieldErrors({ ...fieldErrors, idPhoto: 'ID photo must be an image (JPEG, PNG, or WebP)' })
        return
      }
      setIdPhoto(file)
      setIdPhotoPreview(URL.createObjectURL(file))
      if (fieldErrors.idPhoto) {
        setFieldErrors({ ...fieldErrors, idPhoto: '' })
      }
    }
  }

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors({ ...fieldErrors, selfiePhoto: 'Selfie photo must be less than 5MB' })
        return
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setFieldErrors({ ...fieldErrors, selfiePhoto: 'Selfie photo must be an image (JPEG, PNG, or WebP)' })
        return
      }
      setSelfiePhoto(file)
      setSelfiePreview(URL.createObjectURL(file))
      if (fieldErrors.selfiePhoto) {
        setFieldErrors({ ...fieldErrors, selfiePhoto: '' })
      }
    }
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validate personal info
    const errors: Record<string, string> = {}
    
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters'
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setStep(2)
  }

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validate ID
    const cleanedIdNumber = idNumber.replace(/\s+/g, '')
    const validation = validateIdFormat(cleanedIdNumber, idType)
    
    if (!validation.valid) {
      setFieldErrors({ idNumber: validation.error || 'Invalid ID number format' })
      return
    }

    if (!idPhoto) {
      setFieldErrors({ idPhoto: 'Please upload your ID photo' })
      return
    }

    if (!selfiePhoto) {
      setFieldErrors({ selfiePhoto: 'Please upload a selfie with your ID' })
      return
    }

    setStep(3)
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Validate all data
      const cleanedIdNumber = idNumber.replace(/\s+/g, '').toUpperCase()
      
      if (!idPhoto || !selfiePhoto) {
        throw new Error('Please upload both ID photo and selfie')
      }

      // Upload photos to Supabase Storage
      const idPhotoPath = `helper-applications/${user?.id}/id_${Date.now()}.${idPhoto.name.split('.').pop()}`
      const selfiePath = `helper-applications/${user?.id}/selfie_${Date.now()}.${selfiePhoto.name.split('.').pop()}`

      const { error: idUploadError } = await supabase.storage
        .from('helper-applications')
        .upload(idPhotoPath, idPhoto, {
          cacheControl: '3600',
          upsert: false
        })

      if (idUploadError) throw idUploadError

      const { error: selfieUploadError } = await supabase.storage
        .from('helper-applications')
        .upload(selfiePath, selfiePhoto, {
          cacheControl: '3600',
          upsert: false
        })

      if (selfieUploadError) throw selfieUploadError

      // Get public URLs
      const { data: idUrlData } = supabase.storage
        .from('helper-applications')
        .getPublicUrl(idPhotoPath)

      const { data: selfieUrlData } = supabase.storage
        .from('helper-applications')
        .getPublicUrl(selfiePath)

      // Create masked ID number for display
      const maskedIdNumber = maskIdNumber(cleanedIdNumber, idType)

      // Perform ID verification using AI Parichay API (for Aadhaar)
      let verificationResult = null
      if (idType === 'aadhaar' && idPhoto) {
        try {
          const { verifyIdWithAPI } = await import('@/lib/idVerification')
          verificationResult = await verifyIdWithAPI(
            idType,
            cleanedIdNumber,
            idPhoto,
            fullName
          )
        } catch (verificationError) {
          console.error('Verification error:', verificationError)
          // Continue with application even if verification fails
        }
      }

      // Prepare verification data
      const verificationData: any = {
        id_verified: verificationResult?.verified || false,
        verification_method: verificationResult?.method || 'format_only',
        verification_confidence: verificationResult?.confidence || null,
        verification_api_response: verificationResult ? {
          verified: verificationResult.verified,
          confidence: verificationResult.confidence,
          extracted_data: verificationResult.extractedData,
          error: verificationResult.error,
        } : null,
      }

      // If verification successful, update verified_at timestamp
      if (verificationResult?.verified) {
        verificationData.verified_at = new Date().toISOString()
      }

      // Save application to database
      const { error: appError } = await supabase
        .from('helper_applications')
        .insert({
          user_id: user?.id,
          full_name: fullName,
          phone: phone,
          email: email || user?.email || null,
          id_type: idType,
          id_number: cleanedIdNumber, // Store full number (encrypted in production)
          id_number_masked: maskedIdNumber,
          id_photo_url: idUrlData.publicUrl,
          selfie_photo_url: selfieUrlData.publicUrl,
          status: verificationResult?.verified ? 'pending' : 'pending', // Still pending for admin review
          ...verificationData,
        })

      if (appError) throw appError

      // Show appropriate message based on verification result
      if (verificationResult?.verified) {
        showToast('Aadhaar verified successfully! Application submitted.', 'success')
      } else if (verificationResult?.error) {
        showToast('Application submitted. Verification pending manual review.', 'info')
      } else {
        showToast('Application submitted successfully! Verification pending.', 'success')
      }
      
      onComplete()
    } catch (err: any) {
      console.error('Error submitting application:', err)
      setError(err.message || 'Failed to submit application')
      showToast(err.message || 'Failed to submit application', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (step === 3) {
    return (
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
        <div className="p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Application Submitted</h2>
          <p className="text-muted dark:text-gray-400 mb-6">
            Your helper application has been submitted successfully. We will verify your government ID and get back to you within 24 hours.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Status:</strong> ⏳ Verification Pending
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
              Your ID ({maskIdNumber(idNumber.replace(/\s+/g, ''), idType)}) will be verified using government databases.
            </p>
          </div>
          <Button onClick={handleFinalSubmit} loading={loading} className="w-full">
            Continue to Service Area Setup
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Become a Helper</h2>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${step >= 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              1. Personal Info
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${step >= 2 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              2. ID Verification
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 dark:border dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Personal Information</h3>
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-[2.75rem] transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400 z-10 pointer-events-none" />
                  <Input
                    type="text"
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' })
                    }}
                    placeholder="Enter your full name as on ID"
                    className="pl-10"
                    error={fieldErrors.fullName}
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-[2.75rem] transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400 z-10 pointer-events-none" />
                  <Input
                    type="tel"
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' })
                    }}
                    placeholder="+91 1234567890"
                    className="pl-10"
                    error={fieldErrors.phone}
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-[2.75rem] transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400 z-10 pointer-events-none" />
                  <Input
                    type="email"
                    label="Email (Optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              )}
              <Button type="submit" className="flex-1">
                Next: ID Verification
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Government ID Verification</h3>
              <p className="text-sm text-muted dark:text-gray-400 mb-4">
                We verify your identity using Indian Government ID databases for security and trust.
              </p>

              <div className="space-y-4">
                {/* ID Type Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">
                    ID Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => handleIdTypeChange(e.target.value as IDType)}
                    className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white/80 dark:bg-[#1A1A1A]/80 px-3 py-2 text-sm text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white/20 focus:border-gray-400 dark:focus:border-white/20 transition-all min-h-[44px]"
                  >
                    <option value="aadhaar">Aadhaar</option>
                    <option value="pan">PAN Card</option>
                    <option value="driving_license">Driving License</option>
                    <option value="passport">Passport</option>
                    <option value="voter_id">Voter ID</option>
                    <option value="ration_card">Ration Card</option>
                  </select>
                </div>

                {/* ID Number */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">
                    {getIdTypeDisplayName(idType)} Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={idNumber}
                    onChange={(e) => handleIdNumberChange(e.target.value)}
                    placeholder={getIdTypePlaceholder(idType)}
                    error={fieldErrors.idNumber}
                    required
                  />
                  <p className="mt-1 text-xs text-muted dark:text-gray-400">
                    Format: {getIdTypePlaceholder(idType)}
                  </p>
                </div>

                {/* ID Photo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">
                    ID Photo <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-muted dark:text-gray-400 mb-2">
                    Upload a clear photo of your {getIdTypeDisplayName(idType)}. Make sure all details are visible.
                  </p>
                  <input
                    ref={idPhotoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleIdPhotoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => idPhotoInputRef.current?.click()}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {idPhoto ? 'Change ID Photo' : 'Upload ID Photo'}
                  </Button>
                  {idPhotoPreview && (
                    <div className="mt-2">
                      <img
                        src={idPhotoPreview}
                        alt="ID preview"
                        className="w-full h-48 object-contain rounded-lg border border-gray-300 dark:border-white/10"
                      />
                    </div>
                  )}
                  {fieldErrors.idPhoto && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.idPhoto}</p>
                  )}
                </div>

                {/* Selfie with ID Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">
                    Selfie with ID <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-muted dark:text-gray-400 mb-2">
                    Take a selfie holding your {getIdTypeDisplayName(idType)} next to your face. Make sure your face and ID are clearly visible.
                  </p>
                  <input
                    ref={selfieInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleSelfieChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => selfieInputRef.current?.click()}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {selfiePhoto ? 'Change Selfie' : 'Upload Selfie with ID'}
                  </Button>
                  {selfiePreview && (
                    <div className="mt-2">
                      <img
                        src={selfiePreview}
                        alt="Selfie preview"
                        className="w-full h-48 object-contain rounded-lg border border-gray-300 dark:border-white/10"
                      />
                    </div>
                  )}
                  {fieldErrors.selfiePhoto && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.selfiePhoto}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Submit Application
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  )
}

