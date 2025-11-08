import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { MapPin, Clock, Calendar, DollarSign, ShoppingBag, Phone, UserCheck, Eye, Search, Send } from 'lucide-react'
import { calculateDistance } from '@/lib/utils'
import ContactModal from '@/components/ContactModal'
import Input from '@/components/ui/Input'
import { useToast } from '@/components/ui/ToastContainer'

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
  payment_type?: 'fixed' | 'range'
  fixed_amount?: number
  min_amount?: number
  max_amount?: number
  preference_shop?: string
  additional_info?: string
  preferred_contact_methods?: ('call' | 'message' | 'email')[]
  requester_email?: string
  status: string
  created_at: string
  distance?: number
}

const categoryImages: Record<string, string> = {
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop',
  cooking: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop',
  delivery: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=400&fit=crop',
  moving: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  repairs: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop',
  tutoring: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
  'pet-care': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop',
  groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
  plumber: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop',
  other: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop',
}

export default function BrowseRequests() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [contactModal, setContactModal] = useState<{ isOpen: boolean; request: HelpRequest | null }>({
    isOpen: false,
    request: null,
  })
  const [counterOffers, setCounterOffers] = useState<Record<string, { amount: string; showInput: boolean }>>({})
  const [submittingCounterOffer, setSubmittingCounterOffer] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (user) {
      loadRequests()
      // Try to get user's location from their profile or helper profile
      loadUserLocation()
    } else {
      navigate('/auth?redirect=/browse-requests')
    }
  }, [user])

  const loadUserLocation = async () => {
    try {
      // Try to get from helper profile first
      const { data: helperData } = await supabase
        .from('helpers')
        .select('service_latitude, service_longitude')
        .eq('user_id', user?.id)
        .single()

      if (helperData?.service_latitude && helperData?.service_longitude) {
        setUserLocation({
          latitude: helperData.service_latitude,
          longitude: helperData.service_longitude,
        })
        return
      }

      // Fallback: try to get from user's profile location
      const { data: profileData } = await supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', user?.id)
        .single()

      if (profileData?.latitude && profileData?.longitude) {
        setUserLocation({
          latitude: profileData.latitude,
          longitude: profileData.longitude,
        })
      }
    } catch (err) {
      console.error('Error loading user location:', err)
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
        .limit(50)

      if (error) throw error

      // CRITICAL: Filter out requests created by the current user
      // Users don't want to see their own requests when offering help
      let filteredRequests = (data || []).filter((request) => request.user_id !== user?.id)

      let processedRequests = filteredRequests.map((request: any) => {
        let distance: number | undefined
        if (userLocation && request.latitude && request.longitude) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            request.latitude,
            request.longitude
          )
        }
        return { 
          ...request, 
          distance,
          requester_email: request.profiles?.email,
          preferred_contact_methods: request.preferred_contact_methods || ['call', 'message', 'email']
        }
      })

      // Sort by distance if available
      if (userLocation) {
        processedRequests = processedRequests.sort((a, b) => {
          if (a.distance && b.distance) return a.distance - b.distance
          if (a.distance) return -1
          if (b.distance) return 1
          return 0
        })
      }

      setRequests(processedRequests)
    } catch (err) {
      console.error('Error loading requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryFromTitle = (title: string, description?: string): string => {
    const lowerTitle = title.toLowerCase()
    const lowerDescription = description?.toLowerCase() || ''
    const combined = `${lowerTitle} ${lowerDescription}`

    if (combined.includes('cleaning')) return 'cleaning'
    if (combined.includes('cooking')) return 'cooking'
    if (combined.includes('delivery')) return 'delivery'
    if (combined.includes('moving')) return 'moving'
    if (combined.includes('repair') || combined.includes('plumber')) return 'repairs'
    if (combined.includes('tutor')) return 'tutoring'
    if (combined.includes('pet')) return 'pet-care'
    if (combined.includes('grocery') || combined.includes('groceries')) return 'groceries'
    return 'other'
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    try {
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return time
    }
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    } catch {
      return date
    }
  }

  const handleContact = (request: HelpRequest) => {
    setContactModal({ isOpen: true, request })
  }

  const handleCounterOffer = async (requestId: string) => {
    const counterOffer = counterOffers[requestId]
    if (!counterOffer || !counterOffer.amount || parseFloat(counterOffer.amount) <= 0) {
      showToast('Please enter a valid amount', 'error')
      return
    }

    setSubmittingCounterOffer({ ...submittingCounterOffer, [requestId]: true })

    try {
      const { error } = await supabase
        .from('counter_offers')
        .insert({
          help_request_id: requestId,
          helper_id: user?.id,
          proposed_amount: parseFloat(counterOffer.amount),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <Skeleton variant="text" height={64} className="mb-4 max-w-2xl mx-auto" />
          <Skeleton variant="text" height={24} width="60%" className="mb-12 max-w-xl mx-auto" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <Skeleton variant="rectangular" width={320} height={256} className="md:w-80" />
                  <div className="flex-1 p-6 md:p-8">
                    <Skeleton variant="text" height={32} className="mb-4" />
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <Skeleton variant="text" height={60} />
                      <Skeleton variant="text" height={60} />
                      <Skeleton variant="text" height={60} />
                      <Skeleton variant="text" height={60} />
                    </div>
                    <Skeleton variant="rectangular" height={48} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-6 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Premium Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12 text-center px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 tracking-tight dark:text-white">
            {t('browseRequests.title')}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted dark:text-gray-400 max-w-2xl mx-auto font-light px-4">
            {t('browseRequests.subtitle')}
          </p>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            icon={<Search className="w-10 h-10 text-muted dark:text-gray-400" />}
            title={t('browseRequests.noRequests')}
            description={t('browseRequests.noRequestsDesc')}
            actionLabel={t('browseRequests.goHome')}
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="space-y-6">
            {requests.map((request) => {
              const category = getCategoryFromTitle(request.title, request.description)
              const imageUrl = categoryImages[category] || categoryImages.other
              const requesterName = request.requester_name || 'Requester'

              return (
                <Card
                  key={request.id}
                  className="overflow-hidden backdrop-blur-xl bg-white/90 dark:bg-[#1A1A1A]/90 border-white/30 dark:border-white/20 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5 transition-all duration-500 hover:scale-[1.01] group"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Premium Image Section */}
                    <div className="relative w-full lg:w-80 h-48 sm:h-64 lg:h-auto overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={category}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-2 rounded-full text-sm font-bold backdrop-blur-xl bg-white/90 dark:bg-[#1A1A1A]/90 text-foreground dark:text-white border border-white/20 dark:border-white/10">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                      </div>

                      {/* Distance Badge */}
                      {request.distance && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl bg-white/90 dark:bg-[#1A1A1A]/90 text-foreground dark:text-white border border-white/20 dark:border-white/10">
                            {request.distance.toFixed(1)} {t('browseRequests.kmAway')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Premium Content Section */}
                    <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
                      <div>
                        {/* Service Title */}
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 dark:text-white tracking-tight group-hover:text-foreground dark:group-hover:text-white transition-colors">
                          {request.title}
                        </h3>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                          {/* Time */}
                          {request.time_needed && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-10 h-10 rounded-lg bg-foreground/5 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-white/10">
                                <Clock className="w-5 h-5 text-foreground dark:text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-muted dark:text-gray-400 uppercase tracking-wide">Time</p>
                                <p className="font-semibold text-foreground dark:text-white">{formatTime(request.time_needed)}</p>
                              </div>
                            </div>
                          )}

                          {/* Date */}
                          {request.date_needed && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-10 h-10 rounded-lg bg-foreground/5 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-white/10">
                                <Calendar className="w-5 h-5 text-foreground dark:text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-muted dark:text-gray-400 uppercase tracking-wide">Date</p>
                                <p className="font-semibold text-foreground dark:text-white">{formatDate(request.date_needed)}</p>
                              </div>
                            </div>
                          )}

                          {/* Duration */}
                          {request.duration && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-10 h-10 rounded-lg bg-foreground/5 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-white/10">
                                <Clock className="w-5 h-5 text-foreground dark:text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-muted dark:text-gray-400 uppercase tracking-wide">Duration</p>
                                <p className="font-semibold text-foreground dark:text-white">{request.duration}</p>
                              </div>
                            </div>
                          )}

                          {/* Location */}
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-10 h-10 rounded-lg bg-foreground/5 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-white/10">
                              <MapPin className="w-5 h-5 text-foreground dark:text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-muted dark:text-gray-400 uppercase tracking-wide">Location</p>
                              <p className="font-semibold text-foreground dark:text-white line-clamp-1">{request.location}</p>
                            </div>
                          </div>

                          {/* Payment */}
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-10 h-10 rounded-lg bg-foreground/5 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-white/10">
                              <DollarSign className="w-5 h-5 text-foreground dark:text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-muted dark:text-gray-400 uppercase tracking-wide">Payment</p>
                              <p className="font-semibold text-foreground dark:text-white">
                                {request.payment_type === 'fixed'
                                  ? `₹${request.fixed_amount}`
                                  : request.payment_type === 'range'
                                  ? `₹${request.min_amount} - ₹${request.max_amount}`
                                  : 'Not specified'}
                              </p>
                            </div>
                          </div>

                          {/* Preferred Shop */}
                          {request.preference_shop && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-10 h-10 rounded-lg bg-foreground/5 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-white/10">
                                <ShoppingBag className="w-5 h-5 text-foreground dark:text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-muted dark:text-gray-400 uppercase tracking-wide">Preferred Shop</p>
                                <p className="font-semibold text-foreground dark:text-white line-clamp-1">{request.preference_shop}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Counter Offer Section */}
                      <div className="mt-4 pt-4 border-t border-white/10 dark:border-white/5">
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

                      {/* Premium Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20 dark:border-white/10">
                        <Button
                          onClick={() => handleContact(request)}
                          className="flex-1 flex items-center justify-center gap-2 backdrop-blur-sm bg-foreground dark:bg-white text-background dark:text-foreground hover:opacity-90 transition-all duration-300 group/btn"
                        >
                          <UserCheck className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span className="font-semibold">{t('browseRequests.contact')} {requesterName}</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/request-details/${request.id}`)}
                          className="flex items-center justify-center gap-2 backdrop-blur-sm border-2 border-foreground dark:border-white/20 dark:text-white hover:bg-foreground hover:text-background dark:hover:bg-white/10 transition-all duration-300 group/btn"
                        >
                          <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span>{t('browseRequests.viewDetails')}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
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

