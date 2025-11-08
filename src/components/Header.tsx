import { Globe, LogOut, FileText, Menu, X, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { LANGUAGES, LanguageCode } from '@/lib/constants'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Button from './ui/Button'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

export default function Header() {
  const { user, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const navigate = useNavigate()

  // Load user avatar
  useEffect(() => {
    const loadAvatar = async () => {
      if (!user) {
        setAvatarUrl(null)
        return
      }

      try {
        // First check if user has avatar from Google OAuth (in user_metadata)
        const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture
        
        if (googleAvatar) {
          setAvatarUrl(googleAvatar)
          // Also save it to profiles table if not already there
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single()
          
          if (profile && !profile.avatar_url) {
            await supabase
              .from('profiles')
              .update({ avatar_url: googleAvatar })
              .eq('id', user.id)
          }
        } else {
          // Check profiles table for avatar_url
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single()
          
          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url)
          }
        }
      } catch (err) {
        console.error('Error loading avatar:', err)
      }
    }

    loadAvatar()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="w-full border-b border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl dark:backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 rounded-lg p-1 min-w-[44px] min-h-[44px] flex items-center"
          aria-label="Go to homepage"
        >
          <Logo />
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowLangMenu(false)
              }}
              aria-expanded={showLangMenu}
              aria-haspopup="true"
              aria-label="Select language"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors backdrop-blur-sm border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 min-w-[44px] min-h-[44px]"
            >
              <Globe className="w-4 h-4 text-foreground dark:text-white" aria-hidden="true" />
              <span className="text-sm text-foreground dark:text-white hidden lg:inline">
                {LANGUAGES.find((l: { code: string; name: string }) => l.code === language)?.name}
              </span>
            </button>
            {showLangMenu && (
              <div
                className="absolute right-0 mt-2 w-40 backdrop-blur-xl bg-white/90 dark:bg-[#1A1A1A]/90 border border-white/20 dark:border-white/10 rounded-lg shadow-lg z-50"
                role="menu"
                aria-label="Language options"
              >
                {LANGUAGES.map((lang: { code: string; name: string }) => (
                  <button
                    key={lang.code}
                    role="menuitem"
                    onClick={() => {
                      setLanguage(lang.code as LanguageCode)
                      setShowLangMenu(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setShowLangMenu(false)
                    }}
                    aria-selected={language === lang.code}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white min-h-[44px] ${
                      language === lang.code
                        ? 'bg-foreground text-background dark:bg-white/20 dark:text-white'
                        : 'text-foreground dark:text-white hover:bg-white/10 dark:hover:bg-white/10'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* My Requests */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/my-requests')}
              aria-label="View my requests"
              className="flex items-center gap-2 min-h-[44px] text-foreground dark:text-white hover:text-foreground dark:hover:text-white"
            >
              <FileText className="w-4 h-4 text-foreground dark:text-white" aria-hidden="true" />
              <span className="hidden lg:inline">My Requests</span>
            </Button>
          )}

          {/* Profile Button */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              aria-label="View profile"
              className="flex items-center gap-2 min-h-[44px] text-foreground dark:text-white hover:text-foreground dark:hover:text-white"
            >
              <User className="w-4 h-4 text-foreground dark:text-white" aria-hidden="true" />
              <span className="hidden lg:inline">Profile</span>
            </Button>
          )}

          {/* Sign Out */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="flex items-center gap-2 min-h-[44px] text-foreground dark:text-white hover:text-foreground dark:hover:text-white"
            >
              <LogOut className="w-4 h-4 text-foreground dark:text-white" aria-hidden="true" />
              <span className="hidden lg:inline">{t('nav.signOut')}</span>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
          aria-expanded={showMobileMenu}
        >
          {showMobileMenu ? (
            <X className="w-6 h-6 text-foreground dark:text-white" />
          ) : (
            <Menu className="w-6 h-6 text-foreground dark:text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-white/20 dark:border-white/10 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Language Selector Mobile */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors backdrop-blur-sm border border-white/20 dark:border-white/10 min-h-[44px]"
                aria-label="Select language"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-foreground dark:text-white" />
                  <span className="text-sm font-medium text-foreground dark:text-white">
                    {LANGUAGES.find((l: { code: string; name: string }) => l.code === language)?.name}
                  </span>
                </div>
              </button>
              {showLangMenu && (
                <div className="mt-2 w-full backdrop-blur-xl bg-white/90 dark:bg-[#1A1A1A]/90 border border-white/20 dark:border-white/10 rounded-lg shadow-lg">
                  {LANGUAGES.map((lang: { code: string; name: string }) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as LanguageCode)
                        setShowLangMenu(false)
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg min-h-[44px] ${
                        language === lang.code
                          ? 'bg-foreground text-background dark:bg-white/20 dark:text-white'
                          : 'text-foreground dark:text-white hover:bg-white/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle Mobile */}
            <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-white/20 dark:border-white/10 min-h-[44px]">
              <span className="text-sm font-medium text-foreground dark:text-white">Theme</span>
              <ThemeToggle />
            </div>

            {/* My Requests Mobile */}
            {user && (
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/my-requests')
                  setShowMobileMenu(false)
                }}
                className="w-full justify-start min-h-[44px] text-foreground dark:text-white hover:text-foreground dark:hover:text-white"
              >
                <FileText className="w-5 h-5 mr-3 text-foreground dark:text-white" />
                <span>My Requests</span>
              </Button>
            )}

            {/* Profile Mobile */}
            {user && (
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/profile')
                  setShowMobileMenu(false)
                }}
                className="w-full justify-start min-h-[44px] text-foreground dark:text-white hover:text-foreground dark:hover:text-white"
              >
                <User className="w-5 h-5 mr-3 text-foreground dark:text-white" />
                <span>Profile</span>
              </Button>
            )}

            {/* Sign Out Mobile */}
            {user && (
              <Button
                variant="ghost"
                onClick={() => {
                  handleSignOut()
                  setShowMobileMenu(false)
                }}
                className="w-full justify-start min-h-[44px] text-foreground dark:text-white hover:text-foreground dark:hover:text-white"
              >
                <LogOut className="w-5 h-5 mr-3 text-foreground dark:text-white" />
                <span>{t('nav.signOut')}</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

