import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { MapPin, Clock, Calendar, DollarSign, ShoppingBag, Phone, UserCheck, Eye } from 'lucide-react'
import { calculateDistance } from '@/lib/utils'

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
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

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
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // CRITICAL: Filter out requests created by the current user
      // Users don't want to see their own requests when offering help
      let filteredRequests = (data || []).filter((request) => request.user_id !== user?.id)

      let processedRequests = filteredRequests.map((request) => {
        let distance: number | undefined
        if (userLocation && request.latitude && request.longitude) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            request.latitude,
            request.longitude
          )
        }
        return { ...request, distance }
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

  const handleContact = (phone: string, requesterName?: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="w-16 h-16 border-4 border-muted dark:border-muted border-t-foreground dark:border-t-foreground rounded-full animate-spin"></div>
            </div>
            <p className="text-muted dark:text-muted mt-6 text-lg">Loading nearby requests...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Premium Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight dark:text-white">
            Nearby Help Requests
          </h1>
          <p className="text-xl text-muted dark:text-gray-400 max-w-2xl mx-auto font-light">
            These people need your help in your service area
          </p>
        </div>

        {requests.length === 0 ? (
          <Card className="text-center py-16 backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
            <p className="text-muted dark:text-gray-300 text-lg mb-6">
              No help requests available at the moment.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Homepage
            </Button>
          </Card>
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
                  <div className="flex flex-col md:flex-row">
                    {/* Premium Image Section */}
                    <div className="relative w-full md:w-80 h-64 md:h-auto overflow-hidden">
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
                            {request.distance.toFixed(1)} km away
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Premium Content Section */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        {/* Service Title */}
                        <h3 className="text-2xl font-bold mb-4 dark:text-white tracking-tight group-hover:text-foreground dark:group-hover:text-white transition-colors">
                          {request.title}
                        </h3>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

                      {/* Premium Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-white/20 dark:border-white/10">
                        <Button
                          onClick={() => handleContact(request.phone, requesterName)}
                          className="flex-1 flex items-center justify-center gap-2 backdrop-blur-sm bg-foreground dark:bg-white text-background dark:text-foreground hover:opacity-90 transition-all duration-300 group/btn"
                        >
                          <UserCheck className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span className="font-semibold">Contact {requesterName}</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/request-details/${request.id}`)}
                          className="flex items-center justify-center gap-2 backdrop-blur-sm border-2 border-foreground dark:border-white/20 dark:text-white hover:bg-foreground hover:text-background dark:hover:bg-white/10 transition-all duration-300 group/btn"
                        >
                          <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span>View Details</span>
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
    </div>
  )
}

