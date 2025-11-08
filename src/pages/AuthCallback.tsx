import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (data.session && !error) {
        // Check if profile is completed
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('profile_completed, full_name, phone, latitude, longitude')
          .eq('id', data.session.user.id)
          .single()

        // If profile doesn't exist or is incomplete, redirect to onboarding
        if (profileError || !profile || !profile.profile_completed || !profile.full_name || !profile.phone || !profile.latitude || !profile.longitude) {
          navigate('/onboarding')
        } else {
          navigate('/')
        }
      } else {
        navigate('/auth')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
      <p className="text-muted dark:text-muted">Completing sign in...</p>
    </div>
  )
}

