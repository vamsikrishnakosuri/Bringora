import { LucideIcon } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'

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
  return (
    <Card className="flex flex-col h-full group hover:scale-[1.03] transition-all duration-500 hover:-translate-y-2 animate-fade-in">
      <div className="flex-1">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-xl bg-foreground dark:bg-foreground flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden">
            {/* Animated glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Icon className="w-8 h-8 text-background dark:text-background-dark relative z-10" />
          </div>
          <h3 className="text-2xl font-bold mb-3 group-hover:text-foreground dark:group-hover:text-white transition-colors duration-300 tracking-tight">
            {title}
          </h3>
          <p className="text-muted dark:text-muted/90 text-sm leading-relaxed group-hover:text-foreground/80 dark:group-hover:text-gray-300 transition-colors duration-300 font-normal">
            {description}
          </p>
        </div>

        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li 
              key={index} 
              className="flex items-center gap-2 text-sm group-hover:translate-x-1 transition-transform duration-300 dark:text-gray-300"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-muted dark:bg-gray-400 group-hover:bg-foreground dark:group-hover:bg-white transition-colors duration-300"></span>
              <span className="font-normal">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={onClick}
        className="w-full group-hover:shadow-xl group-hover:shadow-foreground/20 dark:group-hover:shadow-foreground/10 transition-all duration-300 relative overflow-hidden"
      >
        <span className="relative z-10">{buttonText}</span>
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      </Button>
    </Card>
  )
}

