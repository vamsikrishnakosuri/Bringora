import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface ProfileCheckProps {
  children: React.ReactNode
}

export default function ProfileCheck({ children }: ProfileCheckProps) {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) return

      if (!user) {
        navigate('/auth')
        return
      }

      try {
        // Check if profile is completed
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_completed, full_name, phone, latitude, longitude')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking profile:', error)
          setChecking(false)
          return
        }

        // If profile doesn't exist or is not completed, redirect to onboarding
        if (!data || !data.profile_completed || !data.full_name || !data.phone || !data.latitude || !data.longitude) {
          navigate('/onboarding')
          return
        }

        setChecking(false)
      } catch (err) {
        console.error('Error checking profile:', err)
        setChecking(false)
      }
    }

    checkProfile()
  }, [user, authLoading, navigate])

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-muted dark:border-muted border-t-foreground dark:border-t-foreground rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted dark:text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}


