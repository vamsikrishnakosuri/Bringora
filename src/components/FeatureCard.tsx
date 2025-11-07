import { LucideIcon } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import { useLanguage } from '@/contexts/LanguageContext'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  features: string[]
  buttonText: string
  onClick: () => void
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  features,
  buttonText,
  onClick,
}: FeatureCardProps) {
  const { t } = useLanguage()

  return (
    <Card className="flex flex-col h-full group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex-1">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-xl bg-foreground dark:bg-foreground flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 text-background dark:text-background-dark" />
          </div>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-muted dark:text-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-muted dark:bg-muted"></span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={onClick}
        className="w-full group-hover:shadow-lg transition-shadow duration-300"
      >
        {buttonText}
      </Button>
    </Card>
  )
}

