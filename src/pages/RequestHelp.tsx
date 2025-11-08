import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/components/ui/ToastContainer'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LocationPicker from '@/components/LocationPicker'
import PaymentWarningBanner from '@/components/PaymentWarningBanner'
import { FileText, Phone, Calendar, Clock, DollarSign, MapPin, User, ShoppingBag, MessageSquare, Mail } from 'lucide-react'
import { 
  categorySchema, 
  dateSchema, 
  timeSchema, 
  durationSchema, 
  nameSchema, 
  phoneSchema, 
  locationSchema, 
  amountSchema, 
  contactMethodsSchema,
  textFieldSchema 
} from '@/lib/validation'
import { sanitizeInput, validatePhoneNumber, validateCoordinates } from '@/lib/security'

interface RequestSummary {
  category: string
  date: string
  time: string
  duration: number
  durationUnit: string
  requesterName: string
  phone: string
  location: {
    address: string
    latitude: number
    longitude: number
  }
  paymentType: 'fixed' | 'range'
  fixedAmount?: number
  minAmount?: number
  maxAmount?: number
  preferenceShop: string
  additionalInfo: string
}

export default function RequestHelp() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()

  const [step, setStep] = useState<'form' | 'summary'>('form')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('')
  const [durationUnit, setDurationUnit] = useState('hours')
  const [requesterName, setRequesterName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState<{ address: string; latitude: number; longitude: number } | null>(null)
  const [paymentType, setPaymentType] = useState<'fixed' | 'range'>('fixed')
  const [fixedAmount, setFixedAmount] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [preferenceShop, setPreferenceShop] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [preferredContactMethods, setPreferredContactMethods] = useState<('call' | 'message' | 'email')[]>(['call', 'message', 'email'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileLoaded, setProfileLoaded] = useState(false)
  
  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  if (!user) {
    navigate('/auth?redirect=/request-help')
    return null
  }

  // Auto-fill from profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone, location, latitude, longitude')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (data) {
          if (data.full_name && !requesterName) setRequesterName(data.full_name)
          if (data.phone && !phone) setPhone(data.phone)
          if (data.location && data.latitude && data.longitude && !location) {
            setLocation({
              address: data.location,
              latitude: data.latitude,
              longitude: data.longitude,
            })
          }
        }
        setProfileLoaded(true)
      } catch (err) {
        console.error('Error loading profile:', err)
        setProfileLoaded(true)
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user])

  const handleLocationSelect = (loc: { address: string; latitude: number; longitude: number }) => {
    setLocation(loc)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validate all fields
    const errors: Record<string, string> = {}

    // Category
    try {
      categorySchema.parse(category)
    } catch (err: any) {
      errors.category = err.errors?.[0]?.message || 'Please select a category'
    }

    // Date
    try {
      dateSchema.parse(date)
    } catch (err: any) {
      errors.date = err.errors?.[0]?.message || 'Please select a valid date'
    }

    // Time
    try {
      timeSchema.parse(time)
    } catch (err: any) {
      errors.time = err.errors?.[0]?.message || 'Please enter a valid time'
    }

    // Duration
    try {
      durationSchema.parse(duration)
    } catch (err: any) {
      errors.duration = err.errors?.[0]?.message || 'Please enter a valid duration'
    }

    // Name
    try {
      nameSchema.parse(requesterName.trim())
    } catch (err: any) {
      errors.requesterName = err.errors?.[0]?.message || 'Please enter a valid name'
    }

    // Phone
    try {
      phoneSchema.parse(phone.trim())
      const phoneValidation = validatePhoneNumber(phone.trim())
      if (!phoneValidation.valid) {
        errors.phone = 'Please enter a valid phone number (10-13 digits)'
      }
    } catch (err: any) {
      errors.phone = err.errors?.[0]?.message || 'Please enter a valid phone number'
    }

    // Location
    if (!location) {
      errors.location = 'Please select a location on the map'
    } else {
      if (!validateCoordinates(location.latitude, location.longitude)) {
        errors.location = 'Invalid location coordinates'
      } else {
        try {
          locationSchema.parse(location)
        } catch (err: any) {
          errors.location = err.errors?.[0]?.message || 'Invalid location'
        }
      }
    }

    // Payment amounts
    if (paymentType === 'fixed') {
      try {
        amountSchema.parse(fixedAmount)
      } catch (err: any) {
        errors.fixedAmount = err.errors?.[0]?.message || 'Please enter a valid amount'
      }
    } else {
      try {
        amountSchema.parse(minAmount)
      } catch (err: any) {
        errors.minAmount = err.errors?.[0]?.message || 'Please enter a valid minimum amount'
      }
      try {
        amountSchema.parse(maxAmount)
      } catch (err: any) {
        errors.maxAmount = err.errors?.[0]?.message || 'Please enter a valid maximum amount'
      }
      if (minAmount && maxAmount) {
        const min = parseFloat(minAmount)
        const max = parseFloat(maxAmount)
        if (min > max) {
          errors.maxAmount = 'Maximum amount must be greater than minimum amount'
        }
      }
    }

    // Contact methods
    try {
      contactMethodsSchema.parse(preferredContactMethods)
    } catch (err: any) {
      errors.contactMethods = err.errors?.[0]?.message || 'Please select at least one contact method'
    }

    // Optional fields (preference shop, additional info)
    if (preferenceShop) {
      try {
        textFieldSchema(0, 200).parse(preferenceShop)
      } catch (err: any) {
        errors.preferenceShop = err.errors?.[0]?.message || 'Preference shop must be less than 200 characters'
      }
    }

    if (additionalInfo) {
      try {
        textFieldSchema(0, 1000).parse(additionalInfo)
      } catch (err: any) {
        errors.additionalInfo = err.errors?.[0]?.message || 'Additional info must be less than 1000 characters'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      const firstError = Object.values(errors)[0]
      setError(firstError)
      showToast(firstError, 'error')
      return
    }

    setStep('summary')
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Sanitize all inputs before saving
      const sanitizedCategory = sanitizeInput(category)
      const sanitizedRequesterName = sanitizeInput(requesterName.trim())
      const sanitizedPhone = phone.trim()
      const sanitizedLocation = sanitizeInput(location!.address)
      const sanitizedPreferenceShop = preferenceShop ? sanitizeInput(preferenceShop.trim()) : null
      const sanitizedAdditionalInfo = additionalInfo ? sanitizeInput(additionalInfo.trim()) : null

      // Build request data, conditionally including preferred_contact_methods
      const requestData: any = {
        user_id: user.id,
        title: sanitizedCategory ? `${sanitizedCategory.charAt(0).toUpperCase() + sanitizedCategory.slice(1)} Help Request` : 'Help Request',
        description: `Category: ${sanitizedCategory}\nDate: ${date}\nTime: ${time}\nDuration: ${duration} ${durationUnit}\nAdditional Info: ${sanitizedAdditionalInfo || 'None'}`,
        location: sanitizedLocation,
        latitude: location!.latitude,
        longitude: location!.longitude,
        phone: sanitizedPhone,
        requester_name: sanitizedRequesterName,
        date_needed: date,
        time_needed: time,
        duration: `${duration} ${durationUnit}`,
        payment_type: paymentType,
        fixed_amount: paymentType === 'fixed' ? parseFloat(fixedAmount) : null,
        min_amount: paymentType === 'range' ? parseFloat(minAmount) : null,
        max_amount: paymentType === 'range' ? parseFloat(maxAmount) : null,
        preference_shop: sanitizedPreferenceShop,
        additional_info: sanitizedAdditionalInfo,
        status: 'pending',
      }

      // Only include preferred_contact_methods if column exists (will be handled by try-catch)
      const contactMethods = preferredContactMethods.length > 0 ? preferredContactMethods : ['call', 'message', 'email']
      
      // Try inserting with preferred_contact_methods first
      let insertError = null
      try {
        const { error } = await supabase
          .from('help_requests')
          .insert({ ...requestData, preferred_contact_methods: contactMethods })
        insertError = error
      } catch (err: any) {
        // If error is about missing column, try without it
        if (err.message?.includes('preferred_contact_methods') || err.message?.includes('column')) {
          console.warn('preferred_contact_methods column not found, inserting without it. Please run the SQL migration.')
          const { error } = await supabase
            .from('help_requests')
            .insert(requestData)
          insertError = error
        } else {
          throw err
        }
      }

      if (insertError) {
        // Check if error is about missing preferred_contact_methods column
        if (insertError.message?.includes('preferred_contact_methods') || insertError.message?.includes('schema cache')) {
          const migrationMessage = 'Database migration required. Please run RUN_THIS_MIGRATION_NOW.sql in Supabase SQL Editor. The request will be saved without contact preferences for now.'
          console.error('Migration needed:', migrationMessage)
          // Try inserting without preferred_contact_methods
          const { error: retryError } = await supabase
            .from('help_requests')
            .insert(requestData)
          if (retryError) throw retryError
          showToast('Request saved! (Note: Please run the SQL migration to enable contact preferences)', 'success')
        } else {
          throw insertError
        }
      } else {
        showToast(t('requestHelp.submitSuccess'), 'success')
      }
      
      // Navigate to my requests page to see the submitted request
      setTimeout(() => {
        navigate('/my-requests')
      }, 1000)
    } catch (err: any) {
      const errorMessage = err.message || t('requestHelp.submitError')
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const summary: RequestSummary = {
    category,
    date,
    time,
    duration: parseFloat(duration) || 0,
    durationUnit,
    requesterName,
    phone,
    location: location!,
    paymentType,
    fixedAmount: paymentType === 'fixed' ? parseFloat(fixedAmount) : undefined,
    minAmount: paymentType === 'range' ? parseFloat(minAmount) : undefined,
    maxAmount: paymentType === 'range' ? parseFloat(maxAmount) : undefined,
    preferenceShop,
    additionalInfo,
  }

  if (step === 'summary') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-8 text-center dark:text-white tracking-tight">Request Summary</h1>

          <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10 mb-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Service Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-muted dark:text-gray-400">Category</p>
                      <p className="text-foreground dark:text-white">{summary.category || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-muted dark:text-gray-400">Date & Time</p>
                      <p className="text-foreground dark:text-white">{summary.date} at {summary.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-muted dark:text-gray-400">Duration</p>
                      <p className="text-foreground dark:text-white">{summary.duration} {summary.durationUnit}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-muted dark:text-gray-400">Name</p>
                      <p className="text-foreground dark:text-white">{summary.requesterName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-muted dark:text-gray-400">Phone</p>
                      <p className="text-foreground dark:text-white">{summary.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Location</h3>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted dark:text-gray-400" />
                  <p className="text-foreground dark:text-white">{summary.location.address}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Payment</h3>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted dark:text-gray-400" />
                  <p className="text-foreground dark:text-white">
                    {summary.paymentType === 'fixed'
                      ? `₹${summary.fixedAmount}`
                      : `₹${summary.minAmount} - ₹${summary.maxAmount}`}
                  </p>
                </div>
              </div>

              {summary.preferenceShop && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">Preferred Shop/Store</h3>
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-muted dark:text-gray-400" />
                    <p className="text-foreground dark:text-white">{summary.preferenceShop}</p>
                  </div>
                </div>
              )}

              {summary.additionalInfo && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">Additional Information</h3>
                  <p className="text-foreground dark:text-white">{summary.additionalInfo}</p>
                </div>
              )}
            </div>
          </Card>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 dark:border dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('form')}
              className="flex-1"
            >
              {t('requestHelp.editRequest')}
            </Button>
            <Button
              type="button"
              onClick={handleFinalSubmit}
              loading={loading}
              className="flex-1"
            >
              {t('requestHelp.submitRequest')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-6 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-6">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center animate-fade-in dark:text-white tracking-tight px-2">
          {t('card.requestHelp.title')}
        </h1>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
          <PaymentWarningBanner />
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 dark:border dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('form.serviceDetails')}</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category-select" className="block text-sm font-medium mb-2 dark:text-white">
                    {t('form.category')} <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <select
                    id="category-select"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value)
                      if (fieldErrors.category) setFieldErrors({ ...fieldErrors, category: '' })
                    }}
                    aria-invalid={!!fieldErrors.category}
                    aria-describedby={fieldErrors.category ? 'category-error' : undefined}
                    className={`flex h-10 w-full rounded-lg border bg-white/80 dark:bg-[#1A1A1A]/80 px-3 py-2 text-sm text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white/20 transition-all ${
                      fieldErrors.category
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-white/10 focus:border-gray-400 dark:focus:border-white/20'
                    }`}
                    required
                  >
                    <option value="">{t('form.selectCategory')}</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="cooking">Cooking</option>
                    <option value="delivery">Delivery</option>
                    <option value="moving">Moving</option>
                    <option value="repairs">Repairs</option>
                    <option value="tutoring">Tutoring</option>
                    <option value="pet-care">Pet Care</option>
                    <option value="groceries">Groceries</option>
                    <option value="other">Other</option>
                  </select>
                  {fieldErrors.category && (
                    <p id="category-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {fieldErrors.category}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label={t('form.date')}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value)
                      if (fieldErrors.date) setFieldErrors({ ...fieldErrors, date: '' })
                    }}
                    error={fieldErrors.date}
                    required
                  />
                  <Input
                    type="time"
                    label={t('form.time')}
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value)
                      if (fieldErrors.time) setFieldErrors({ ...fieldErrors, time: '' })
                    }}
                    error={fieldErrors.time}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      label={t('form.duration')}
                      value={duration}
                      onChange={(e) => {
                        setDuration(e.target.value)
                        if (fieldErrors.duration) setFieldErrors({ ...fieldErrors, duration: '' })
                      }}
                      placeholder={t('form.enterDuration')}
                      min="0.5"
                      step="0.5"
                      error={fieldErrors.duration}
                      required
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-sm font-medium mb-2 dark:text-white">{t('form.unit')}</label>
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white/80 dark:bg-[#1A1A1A]/80 px-3 py-2 text-sm text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white/20 focus:border-gray-400 dark:focus:border-white/20 transition-all min-h-[44px]"
                    >
                      <option value="hours">{t('form.hours')}</option>
                      <option value="minutes">{t('form.minutes')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('form.contactInformation')}</h2>
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-[2.75rem] transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400 z-10 pointer-events-none" />
                  <Input
                    type="text"
                    label={t('form.fullName')}
                    value={requesterName}
                    onChange={(e) => {
                      setRequesterName(e.target.value)
                      if (fieldErrors.requesterName) setFieldErrors({ ...fieldErrors, requesterName: '' })
                    }}
                    placeholder={t('form.enterName')}
                    className="pl-10"
                    error={fieldErrors.requesterName}
                    required
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-[2.75rem] transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400 z-10 pointer-events-none" />
                  <Input
                    type="tel"
                    label={t('form.phone')}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' })
                    }}
                    placeholder={t('form.enterPhone')}
                    className="pl-10"
                    error={fieldErrors.phone}
                    required
                  />
                </div>

                {/* Preferred Contact Methods */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">
                    {t('form.contactMethods')} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-muted dark:text-gray-400 mb-3">
                    Select how helpers can contact you
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {(['call', 'message', 'email'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          if (preferredContactMethods.includes(method)) {
                            if (preferredContactMethods.length > 1) {
                              setPreferredContactMethods(preferredContactMethods.filter((m) => m !== method))
                            }
                          } else {
                            setPreferredContactMethods([...preferredContactMethods, method])
                          }
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                          preferredContactMethods.includes(method)
                            ? 'bg-foreground text-background dark:bg-white/20 dark:text-white border-white/20 dark:border-white/10'
                            : 'bg-white/10 dark:bg-white/5 border-gray-300 dark:border-white/10 text-foreground dark:text-white'
                        }`}
                      >
                        {method === 'call' && <Phone className="w-4 h-4" />}
                        {method === 'message' && <MessageSquare className="w-4 h-4" />}
                        {method === 'email' && <Mail className="w-4 h-4" />}
                        <span className="capitalize">{method}</span>
                      </button>
                    ))}
                  </div>
                  {preferredContactMethods.length === 0 && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                      Please select at least one contact method
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('form.locationDetails')}</h2>
              <LocationPicker 
                onLocationSelect={(loc) => {
                  handleLocationSelect(loc)
                  if (fieldErrors.location) setFieldErrors({ ...fieldErrors, location: '' })
                }} 
                initialLocation={location || undefined}
              />
              {fieldErrors.location && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                  {fieldErrors.location}
                </p>
              )}
            </div>

            {/* Payment Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('form.paymentDetails')}</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentType('fixed')}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      paymentType === 'fixed'
                        ? 'bg-foreground text-background dark:bg-white/20 dark:text-white border-white/20 dark:border-white/10'
                        : 'bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-foreground dark:text-white'
                    }`}
                  >
                    {t('form.fixedAmount')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('range')}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      paymentType === 'range'
                        ? 'bg-foreground text-background dark:bg-white/20 dark:text-white border-white/20 dark:border-white/10'
                        : 'bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-foreground dark:text-white'
                    }`}
                  >
                    {t('form.minAmount')} - {t('form.maxAmount')}
                  </button>
                </div>

                {paymentType === 'fixed' ? (
                  <Input
                    type="number"
                    label="Amount (₹)"
                    value={fixedAmount}
                    onChange={(e) => {
                      setFixedAmount(e.target.value)
                      if (fieldErrors.fixedAmount) setFieldErrors({ ...fieldErrors, fixedAmount: '' })
                    }}
                    placeholder="e.g., 500"
                    min="0"
                    step="50"
                    error={fieldErrors.fixedAmount}
                    required
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Minimum (₹)"
                      value={minAmount}
                      onChange={(e) => {
                        setMinAmount(e.target.value)
                        if (fieldErrors.minAmount) setFieldErrors({ ...fieldErrors, minAmount: '', maxAmount: '' })
                      }}
                      placeholder="e.g., 300"
                      min="0"
                      step="50"
                      error={fieldErrors.minAmount}
                      required
                    />
                    <Input
                      type="number"
                      label="Maximum (₹)"
                      value={maxAmount}
                      onChange={(e) => {
                        setMaxAmount(e.target.value)
                        if (fieldErrors.maxAmount) setFieldErrors({ ...fieldErrors, maxAmount: '' })
                      }}
                      placeholder="e.g., 600"
                      min="0"
                      step="50"
                      error={fieldErrors.maxAmount}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Preference Shop/Store */}
            <div className="relative">
              <ShoppingBag className="absolute left-3 top-[2.75rem] transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400 z-10 pointer-events-none" />
              <Input
                type="text"
                label="Preferred Shop/Store/Place (Optional)"
                value={preferenceShop}
                onChange={(e) => setPreferenceShop(e.target.value)}
                placeholder="e.g., Walmart, Local Market, Specific Address"
                className="pl-10"
              />
            </div>

            {/* Additional Information */}
            <div>
              <label htmlFor="additional-info" className="block text-sm font-medium mb-2 dark:text-white">
                Additional Information (Optional)
              </label>
              <textarea
                id="additional-info"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Any extra details, special instructions, or preferences..."
                aria-label="Additional information"
                className="flex min-h-[120px] w-full rounded-lg border border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#1A1A1A]/80 px-3 py-2 text-sm text-foreground dark:text-white placeholder:text-muted dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white/20 focus:ring-offset-2 transition-all"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                {t('requestHelp.cancel')}
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                {t('requestHelp.continueSummary')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
