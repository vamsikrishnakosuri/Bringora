import { Globe, LogOut, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { LANGUAGES, LanguageCode } from '@/lib/constants'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

export default function Header() {
  const { user, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="w-full border-b border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl dark:backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2 rounded-lg p-1"
          aria-label="Go to homepage"
        >
          <Logo />
        </button>

        <div className="flex items-center gap-4">
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors backdrop-blur-sm border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white focus:ring-offset-2"
            >
              <Globe className="w-4 h-4 text-foreground dark:text-white" aria-hidden="true" />
              <span className="text-sm text-foreground dark:text-white">
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
                    className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:ring-2 focus:ring-foreground dark:focus:ring-white ${
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
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>My Requests</span>
            </Button>
          )}

          {/* Sign Out */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>{t('nav.signOut')}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

