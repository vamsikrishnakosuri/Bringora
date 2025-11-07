import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import { MapPin, DollarSign, Calendar, Clock, ShoppingBag, Phone } from 'lucide-react'

interface HelpRequest {
  id: string
  title: string
  description: string
  location: string
  latitude: number
  longitude: number
  phone: string
  category?: string
  date_needed?: string
  time_needed?: string
  duration?: string
  payment_type?: string
  fixed_amount?: number
  min_amount?: number
  max_amount?: number
  preference_shop?: string
  additional_info?: string
  status: string
  created_at: string
}

const categoryImages: Record<string, string> = {
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  cooking: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop',
  delivery: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=300&fit=crop',
  moving: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  repairs: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
  tutoring: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
  'pet-care': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
  groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
  other: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop',
}

export default function MyRequests() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadRequests()
    }
  }, [user])

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
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
    if (combined.includes('repair')) return 'repairs'
    if (combined.includes('tutor')) return 'tutoring'
    if (combined.includes('pet')) return 'pet-care'
    if (combined.includes('grocery') || combined.includes('groceries')) return 'groceries'
    return 'other'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'accepted':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-muted dark:border-muted border-t-foreground dark:border-t-foreground rounded-full animate-spin"></div>
            </div>
            <p className="text-muted dark:text-muted mt-4">Loading your requests...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center dark:text-white tracking-tight">
          My Help Requests
        </h1>

        {requests.length === 0 ? (
          <Card className="text-center py-12 backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
            <p className="text-muted dark:text-gray-300 text-lg">
              You haven't created any help requests yet.
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => {
              const category = getCategoryFromTitle(request.title, request.description)
              const imageUrl = categoryImages[category] || categoryImages.other
              
              return (
                <Card
                  key={request.id}
                  className="overflow-hidden hover:scale-[1.03] hover:-translate-y-2 transition-all duration-300 backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10"
                >
                  {/* Category Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={category}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Service Title */}
                    <h3 className="text-xl font-bold dark:text-white tracking-tight line-clamp-1">
                      {request.title}
                    </h3>

                    {/* Payment Amount */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-muted dark:text-gray-400" />
                      <span className="text-lg font-semibold text-foreground dark:text-white">
                        {request.payment_type === 'fixed'
                          ? `₹${request.fixed_amount}`
                          : request.payment_type === 'range'
                          ? `₹${request.min_amount} - ₹${request.max_amount}`
                          : 'Not specified'}
                      </span>
                    </div>

                    {/* Date & Time */}
                    {(request.date_needed || request.time_needed) && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted dark:text-gray-400" />
                        <span className="text-foreground dark:text-gray-300">
                          {request.date_needed && new Date(request.date_needed).toLocaleDateString()}
                          {request.time_needed && ` at ${request.time_needed}`}
                        </span>
                      </div>
                    )}

                    {/* Duration */}
                    {request.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted dark:text-gray-400" />
                        <span className="text-foreground dark:text-gray-300">{request.duration}</span>
                      </div>
                    )}

                    {/* Preference Shop */}
                    {request.preference_shop && (
                      <div className="flex items-center gap-2 text-sm">
                        <ShoppingBag className="w-4 h-4 text-muted dark:text-gray-400" />
                        <span className="text-foreground dark:text-gray-300">
                          Preferred: {request.preference_shop}
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted dark:text-gray-400" />
                      <span className="text-foreground dark:text-gray-300 line-clamp-1">
                        {request.location}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted dark:text-gray-400 line-clamp-2">
                      {request.description}
                    </p>

                    {/* Additional Info */}
                    {request.additional_info && (
                      <div className="pt-2 border-t border-white/20 dark:border-white/10">
                        <p className="text-xs text-muted dark:text-gray-400 line-clamp-2">
                          {request.additional_info}
                        </p>
                      </div>
                    )}
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

