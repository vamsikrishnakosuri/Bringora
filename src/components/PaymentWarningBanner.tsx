import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Card from './ui/Card'

export default function PaymentWarningBanner() {
  const { t } = useLanguage()
  const [dismissed, setDismissed] = useState(false)

  // Check if user has dismissed this banner before
  const hasDismissed = localStorage.getItem('payment-warning-dismissed') === 'true'

  if (dismissed || hasDismissed) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('payment-warning-dismissed', 'true')
  }

  return (
    <Card className="mb-6 backdrop-blur-xl bg-yellow-50/90 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50 animate-slide-up">
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-1 text-sm sm:text-base">
            {t('warning.noUpfrontPayment')}
          </h3>
          <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300/90 leading-relaxed">
            {t('warning.paymentDisclaimer')}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          aria-label="Dismiss warning"
        >
          <X className="w-4 h-4 text-yellow-700 dark:text-yellow-300" />
        </button>
      </div>
    </Card>
  )
}

