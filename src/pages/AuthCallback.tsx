import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (data.session && !error) {
        navigate('/')
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

