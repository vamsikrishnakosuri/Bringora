import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if running on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    if (isIOS) {
      // Show iOS install instructions
      const hasShownIOSPrompt = localStorage.getItem('ios-install-prompt-shown')
      if (!hasShownIOSPrompt) {
        setShowPrompt(true)
        localStorage.setItem('ios-install-prompt-shown', 'true')
      }
      return
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      const hasShownPrompt = localStorage.getItem('install-prompt-shown')
      if (!hasShownPrompt) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
      localStorage.setItem('install-prompt-shown', 'true')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('install-prompt-shown', 'true')
  }

  // Don't show if already installed
  if (isInstalled || !showPrompt) {
    return null
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm animate-slide-up">
      <Card className="backdrop-blur-xl bg-white/95 dark:bg-[#1A1A1A]/95 border-white/30 dark:border-white/20 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1 dark:text-white">Install Bringora</h3>
            {isIOS ? (
              <div className="text-xs text-muted dark:text-gray-400 space-y-1">
                <p>Tap the <strong>Share</strong> button</p>
                <p>Then select <strong>"Add to Home Screen"</strong></p>
              </div>
            ) : (
              <p className="text-xs text-muted dark:text-gray-400">
                Install our app for a better experience with offline support and faster loading.
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-foreground dark:text-white" />
          </button>
        </div>
        {!isIOS && deferredPrompt && (
          <Button
            onClick={handleInstall}
            className="w-full mt-3 flex items-center justify-center gap-2"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Install App
          </Button>
        )}
      </Card>
    </div>
  )
}

