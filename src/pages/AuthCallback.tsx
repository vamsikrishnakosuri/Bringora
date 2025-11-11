import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/contexts/ThemeContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { theme } = useTheme()

  useEffect(() => {
    // Ensure theme is preserved from localStorage
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme === 'light' || storedTheme === 'dark') {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(storedTheme)
    }

    const handleAuthCallback = async () => {
      try {
        // Handle OAuth callback with hash fragments
        // Supabase redirects with hash fragments that need to be processed
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        if (hashParams.has('access_token')) {
          // Supabase automatically processes hash fragments, but we need to wait for it
          // The hash fragment will be processed by Supabase's internal handler
          // Wait for the session to be established
          let sessionEstablished = false
          await new Promise<void>((resolve) => {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
              if (event === 'SIGNED_IN' && session) {
                sessionEstablished = true
                subscription.unsubscribe()
                resolve()
              }
            })
            // Timeout after 5 seconds
            setTimeout(() => {
              subscription.unsubscribe()
              resolve()
            }, 5000)
          })
          
          // Give Supabase time to fully process the session
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Clear the hash from URL
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname)
          }
        } else {
          // Wait a bit for Supabase to process the OAuth callback
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        const { data, error } = await supabase.auth.getSession()
        if (data.session && !error) {
          const user = data.session.user
          
          // Get Google profile data
          const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture
          const googleName = user.user_metadata?.full_name || user.user_metadata?.name
          
          // Check if profile exists (handle case where profile doesn't exist yet)
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle() // Use maybeSingle() instead of single() to handle missing profiles gracefully

          // Upsert profile with Google data
          const profileData: any = {
            id: user.id,
            email: user.email,
          }

          // Add Google data if available
          if (googleAvatar) {
            profileData.avatar_url = googleAvatar
          }
          if (googleName) {
            profileData.full_name = googleName
          }

          // If profile exists, preserve existing data
          if (existingProfile && !profileCheckError) {
            // Only update if we have new data
            if (googleAvatar && !existingProfile.avatar_url) {
              profileData.avatar_url = googleAvatar
            }
            if (googleName && !existingProfile.full_name) {
              profileData.full_name = googleName
            }
            // Preserve existing fields
            profileData.phone = existingProfile.phone || null
            profileData.location = existingProfile.location || null
            profileData.latitude = existingProfile.latitude || null
            profileData.longitude = existingProfile.longitude || null
            profileData.profile_completed = existingProfile.profile_completed || false
          }

          // Save/update profile
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert(profileData, {
              onConflict: 'id'
            })

          if (upsertError) {
            console.error('Error saving profile:', upsertError)
          }

          // Check if profile is completed (need phone and location for full profile)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('profile_completed, full_name, phone, latitude, longitude')
            .eq('id', user.id)
            .maybeSingle() // Use maybeSingle() to handle missing profiles

          // If profile doesn't exist or is incomplete, redirect to onboarding
          if (profileError || !profile || !profile.profile_completed || !profile.phone || !profile.latitude || !profile.longitude) {
            navigate('/onboarding')
          } else {
            // Get redirect URL from query params if present
            const urlParams = new URLSearchParams(window.location.search)
            const redirectTo = urlParams.get('redirect') || '/'
            navigate(redirectTo)
          }
        } else {
          console.error('No session found:', error)
          navigate('/auth')
        }
      } catch (err) {
        console.error('Error in auth callback:', err)
        navigate('/auth')
      }
    }

    handleAuthCallback()
  }, [navigate, theme])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
      <p className="text-muted dark:text-muted">Completing sign in...</p>
    </div>
  )
}

