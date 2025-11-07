import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import FeatureCard from '@/components/FeatureCard'
import AnimatedBackground from '@/components/AnimatedBackground'
import { Phone, HeartHandshake } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()

  const handleRequestHelp = () => {
    if (!user) {
      navigate('/auth?redirect=/request-help')
      return
    }
    navigate('/request-help')
  }

  const handleOfferHelp = () => {
    if (!user) {
      navigate('/auth?redirect=/offer-help')
      return
    }
    navigate('/offer-help')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up tracking-tight">
            <span className="gradient-text dark:text-foreground dark:bg-gradient-to-r dark:from-white dark:via-gray-200 dark:to-white dark:bg-clip-text dark:text-transparent">
              {t('app.tagline')}
            </span>
          </h1>
          <p className="text-xl text-muted dark:text-muted/90 max-w-2xl mx-auto animate-slide-up font-light leading-relaxed" style={{ animationDelay: '0.2s' }}>
            {t('app.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={Phone}
            title={t('card.requestHelp.title')}
            description={t('card.requestHelp.description')}
            features={[
              t('card.requestHelp.feature1'),
              t('card.requestHelp.feature2'),
              t('card.requestHelp.feature3'),
            ]}
            buttonText={t('card.requestHelp.button')}
            onClick={handleRequestHelp}
          />

          <FeatureCard
            icon={HeartHandshake}
            title={t('card.offerHelp.title')}
            description={t('card.offerHelp.description')}
            features={[
              t('card.offerHelp.feature1'),
              t('card.offerHelp.feature2'),
              t('card.offerHelp.feature3'),
            ]}
            buttonText={t('card.offerHelp.button')}
            onClick={handleOfferHelp}
          />
        </div>
      </div>
    </div>
  )
}

