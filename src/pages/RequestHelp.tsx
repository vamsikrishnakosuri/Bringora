import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LocationPicker from '@/components/LocationPicker'
import { FileText, Phone, Calendar, Clock, DollarSign, MapPin, User, ShoppingBag } from 'lucide-react'

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
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    navigate('/auth?redirect=/request-help')
    return null
  }

  const handleLocationSelect = (loc: { address: string; latitude: number; longitude: number }) => {
    setLocation(loc)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!location) {
      setError('Please select a location on the map')
      return
    }

    setStep('summary')
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const requestData = {
        user_id: user.id,
        title: category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Help Request` : 'Help Request',
        description: `Category: ${category}\nDate: ${date}\nTime: ${time}\nDuration: ${duration} ${durationUnit}\nAdditional Info: ${additionalInfo || 'None'}`,
        location: location!.address,
        latitude: location!.latitude,
        longitude: location!.longitude,
        phone,
        requester_name: requesterName,
        date_needed: date,
        time_needed: time,
        duration: `${duration} ${durationUnit}`,
        payment_type: paymentType,
        fixed_amount: paymentType === 'fixed' ? parseFloat(fixedAmount) : null,
        min_amount: paymentType === 'range' ? parseFloat(minAmount) : null,
        max_amount: paymentType === 'range' ? parseFloat(maxAmount) : null,
        preference_shop: preferenceShop || null,
        additional_info: additionalInfo,
        status: 'pending',
      }

      const { error: insertError } = await supabase
        .from('help_requests')
        .insert(requestData)

      if (insertError) throw insertError

      // Reset form
      setStep('form')
      setCategory('')
      setDate('')
      setTime('')
      setDuration('')
      setRequesterName('')
      setPhone('')
      setLocation(null)
      setFixedAmount('')
      setMinAmount('')
      setMaxAmount('')
      setPreferenceShop('')
      setAdditionalInfo('')
      
      alert('Request submitted successfully!')
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Failed to submit request')
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
              Edit Request
            </Button>
            <Button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-center animate-fade-in dark:text-white tracking-tight">
          {t('card.requestHelp.title')}
        </h1>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 dark:border dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Service Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Category/Requirement</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#1A1A1A]/80 px-3 py-2 text-sm text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white/20"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="cooking">Cooking</option>
                    <option value="delivery">Delivery</option>
                    <option value="moving">Moving</option>
                    <option value="repairs">Repairs</option>
                    <option value="tutoring">Tutoring</option>
                    <option value="pet-care">Pet Care</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">Date</label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">Time</label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 dark:text-white">Duration</label>
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 2"
                      min="0.5"
                      step="0.5"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium mb-2 dark:text-white">Unit</label>
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#1A1A1A]/80 px-3 py-2 text-sm text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white/20"
                    >
                      <option value="hours">Hours</option>
                      <option value="minutes">Minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400" />
                    <Input
                      type="text"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
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
              </div>
            </div>

            {/* Location Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Location Details</h2>
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>

            {/* Payment Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Payment Details</h2>
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
                    Fixed Payment
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
                    Payment Range
                  </button>
                </div>

                {paymentType === 'fixed' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">Amount (₹)</label>
                    <Input
                      type="number"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(e.target.value)}
                      placeholder="e.g., 500"
                      min="0"
                      step="50"
                      required
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Minimum (₹)</label>
                      <Input
                        type="number"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        placeholder="e.g., 300"
                        min="0"
                        step="50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-white">Maximum (₹)</label>
                      <Input
                        type="number"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        placeholder="e.g., 600"
                        min="0"
                        step="50"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preference Shop/Store */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Preferred Shop/Store/Place (Optional)</label>
              <div className="relative">
                <ShoppingBag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400" />
                <Input
                  type="text"
                  value={preferenceShop}
                  onChange={(e) => setPreferenceShop(e.target.value)}
                  placeholder="e.g., Walmart, Local Market, Specific Address"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Additional Information (Optional)</label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Any extra details, special instructions, or preferences..."
                className="flex min-h-[120px] w-full rounded-lg border border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#1A1A1A]/80 px-3 py-2 text-sm text-foreground dark:text-white placeholder:text-muted dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white/20"
              />
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
              <Button type="submit" className="flex-1">
                Continue to Summary
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
