import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { calculateDistance } from '@/lib/utils'
import Card from '@/components/ui/Card'
import { MapPin, Phone, Clock, DollarSign, ShoppingBag, Navigation, Send } from 'lucide-react'
import ContactModal from '@/components/ContactModal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastContainer'
import { amountSchema, counterOfferSchema } from '@/lib/validation'
import { sanitizeInput } from '@/lib/security'

interface HelpRequest {
  id: string
  user_id: string
  title: string
  description: string
  location: string
  latitude: number
  longitude: number
  phone: string
  requester_name?: string
  date_needed?: string
  time_needed?: string
  duration?: string
  payment_type?: string
  fixed_amount?: number
  min_amount?: number
  max_amount?: number
  preference_shop?: string
  preferred_contact_methods?: ('call' | 'message' | 'email')[]
  requester_email?: string
  created_at: string
  status: string
  distance?: number
}

interface HelperLocation {
  service_latitude: number
  service_longitude: number
  service_radius: number
  service_radius_unit: string
}

export default function OfferHelp() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()

  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [helperLocation, setHelperLocation] = useState<HelperLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [contactModal, setContactModal] = useState<{ isOpen: boolean; request: HelpRequest | null }>({
    isOpen: false,
    request: null,
  })
  const [counterOffers, setCounterOffers] = useState<Record<string, { amount: string; showInput: boolean }>>({})
  const [submittingCounterOffer, setSubmittingCounterOffer] = useState<Record<string, boolean>>({})

  if (!user) {
    navigate('/auth?redirect=/offer-help')
    return null
  }

  useEffect(() => {
    loadHelperLocation()
    loadRequests()
  }, [user])

  const loadHelperLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('helpers')
        .select('service_latitude, service_longitude, service_radius, service_radius_unit')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setHelperLocation(data)
      }
    } catch (err) {
      console.error('Error loading helper location:', err)
    }
  }

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .select(`
          *,
          profiles!help_requests_user_id_fkey(email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      
      // CRITICAL: Filter out requests created by the current user
      // Users don't want to see their own requests when offering help
      let filteredRequests = (data || []).filter((request: any) => request.user_id !== user?.id)
      
      // Filter by distance if helper location is set
      if (helperLocation && helperLocation.service_latitude && helperLocation.service_longitude) {
        filteredRequests = filteredRequests
          .filter((request: any) => {
            if (!request.latitude || !request.longitude) return false
            const distance = calculateDistance(
              helperLocation.service_latitude,
              helperLocation.service_longitude,
              request.latitude,
              request.longitude
            )
            const maxDistance = helperLocation.service_radius_unit === 'miles' 
              ? helperLocation.service_radius * 1.60934 
              : helperLocation.service_radius
            return distance <= maxDistance
          })
          .map((request: any) => ({
            ...request,
            distance: calculateDistance(
              helperLocation.service_latitude,
              helperLocation.service_longitude,
              request.latitude,
              request.longitude
            ),
            requester_email: request.profiles?.email,
            preferred_contact_methods: request.preferred_contact_methods || ['call', 'message', 'email'],
          }))
          .sort((a: any, b: any) => a.distance - b.distance)
      } else {
        filteredRequests = filteredRequests.map((request: any) => ({
          ...request,
          requester_email: request.profiles?.email,
          preferred_contact_methods: request.preferred_contact_methods || ['call', 'message', 'email'],
        }))
      }
      
      setRequests(filteredRequests)
    } catch (err) {
      console.error('Error loading requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleContact = (request: HelpRequest) => {
    setContactModal({ isOpen: true, request })
  }

  const handleCounterOffer = async (requestId: string) => {
    const counterOffer = counterOffers[requestId]
    
    // Validate amount
    if (!counterOffer || !counterOffer.amount) {
      showToast('Please enter an amount', 'error')
      return
    }

    // Validate using schema
    try {
      amountSchema.parse(counterOffer.amount)
    } catch (err: any) {
      showToast(err.errors?.[0]?.message || 'Please enter a valid amount', 'error')
      return
    }

    // Validate counter offer schema
    try {
      counterOfferSchema.parse({
        amount: counterOffer.amount,
        requestId,
      })
    } catch (err: any) {
      showToast(err.errors?.[0]?.message || 'Invalid counter offer', 'error')
      return
    }

    setSubmittingCounterOffer({ ...submittingCounterOffer, [requestId]: true })

    try {
      const sanitizedAmount = parseFloat(counterOffer.amount)
      
      const { error } = await supabase
        .from('counter_offers')
        .insert({
          help_request_id: requestId,
          helper_id: user?.id,
          proposed_amount: sanitizedAmount,
          status: 'pending',
        })

      if (error) throw error

      showToast('Counter offer sent successfully!', 'success')
      setCounterOffers({ ...counterOffers, [requestId]: { amount: '', showInput: false } })
    } catch (err: any) {
      console.error('Error submitting counter offer:', err)
      showToast(err.message || 'Failed to send counter offer', 'error')
    } finally {
      setSubmittingCounterOffer({ ...submittingCounterOffer, [requestId]: false })
    }
  }

  const toggleCounterOfferInput = (requestId: string) => {
    setCounterOffers({
      ...counterOffers,
      [requestId]: {
        amount: '',
        showInput: !counterOffers[requestId]?.showInput,
      },
    })
  }

  const formatDistance = (distance: number, unit: string = 'km') => {
    if (unit === 'miles') {
      const miles = distance / 1.60934
      return `${miles.toFixed(1)} miles`
    }
    return `${distance.toFixed(1)} km`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-6 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center dark:text-white tracking-tight px-2">
          {t('card.offerHelp.title')}
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-muted dark:border-muted border-t-foreground dark:border-t-foreground rounded-full animate-spin"></div>
            </div>
            <p className="text-muted dark:text-muted mt-4">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
            <p className="text-muted dark:text-gray-300 text-lg">
              No help requests available at the moment.
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {requests.map((request: any, index) => (
              <Card 
                key={request.id} 
                className="hover:scale-[1.03] hover:-translate-y-2 transition-all duration-300 animate-fade-in group backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-xl font-bold mb-2 dark:text-gray-100 tracking-tight">{request.title}</h3>
                <p className="text-muted dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {request.description}
                </p>

                <div className="space-y-2 mb-4">
                  {/* Payment Amount */}
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted dark:text-gray-400" />
                    <span className="font-semibold text-foreground dark:text-white">
                      {request.payment_type === 'fixed'
                        ? `₹${request.fixed_amount}`
                        : request.payment_type === 'range'
                        ? `₹${request.min_amount} - ₹${request.max_amount}`
                        : 'Not specified'}
                    </span>
                  </div>

                  {/* Preference Shop */}
                  {request.preference_shop && (
                    <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                      <ShoppingBag className="w-4 h-4 text-muted dark:text-gray-400" />
                      <span className="font-normal">Prefers: {request.preference_shop}</span>
                    </div>
                  )}

                  {/* Location with Distance */}
                  <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-muted dark:text-gray-400" />
                    <div className="flex-1">
                      <span className="font-normal">{request.location}</span>
                      {request.distance !== undefined && helperLocation && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                          {formatDistance(request.distance, helperLocation.service_radius_unit)} away
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  {(request.date_needed || request.time_needed) && (
                    <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                      <Clock className="w-4 h-4 text-muted dark:text-gray-400" />
                      <span className="font-normal">
                        {request.date_needed && new Date(request.date_needed).toLocaleDateString()}
                        {request.time_needed && ` at ${request.time_needed}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Counter Offer Section */}
                <div className="mb-3 pt-3 border-t border-white/10 dark:border-white/5">
                  {!counterOffers[request.id]?.showInput ? (
                    <Button
                      variant="outline"
                      onClick={() => toggleCounterOfferInput(request.id)}
                      className="w-full flex items-center justify-center gap-2 text-sm"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Propose Different Amount</span>
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        label="Your Proposed Amount (₹)"
                        value={counterOffers[request.id]?.amount || ''}
                        onChange={(e) =>
                          setCounterOffers({
                            ...counterOffers,
                            [request.id]: {
                              ...counterOffers[request.id],
                              amount: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g., 1500"
                        min="1"
                        step="100"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCounterOffer(request.id)}
                          disabled={submittingCounterOffer[request.id]}
                          loading={submittingCounterOffer[request.id]}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Send Counter Offer</span>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => toggleCounterOfferInput(request.id)}
                          className="px-4"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleContact(request)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Contact Requester</span>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {contactModal.request && (
        <ContactModal
          isOpen={contactModal.isOpen}
          onClose={() => setContactModal({ isOpen: false, request: null })}
          phone={contactModal.request.phone}
          email={contactModal.request.requester_email}
          requesterName={contactModal.request.requester_name}
          preferredMethods={contactModal.request.preferred_contact_methods || ['call', 'message', 'email']}
        />
      )}
    </div>
  )
}
