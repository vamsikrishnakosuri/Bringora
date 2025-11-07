import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import { MapPin, Phone, Clock } from 'lucide-react'

interface HelpRequest {
  id: string
  title: string
  description: string
  location: string
  phone: string
  created_at: string
  status: string
}

export default function OfferHelp() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()

  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)

  if (!user) {
    navigate('/auth?redirect=/offer-help')
    return null
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setRequests(data || [])
    } catch (err) {
      console.error('Error loading requests:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
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
          <Card className="text-center py-12">
            <p className="text-muted dark:text-muted text-lg">
              No help requests available at the moment.
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request, index) => (
              <Card 
                key={request.id} 
                className="hover:scale-[1.03] hover:-translate-y-2 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-xl font-bold mb-2">{request.title}</h3>
                <p className="text-muted dark:text-muted text-sm mb-4 line-clamp-3">
                  {request.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted dark:text-muted" />
                    <span>{request.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted dark:text-muted" />
                    <span>
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${request.phone}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-foreground text-background dark:bg-foreground dark:text-background-dark hover:opacity-90 transition-opacity"
                >
                  <Phone className="w-4 h-4" />
                  <span>Contact Requester</span>
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

