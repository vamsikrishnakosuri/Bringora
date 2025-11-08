import { ReactNode } from 'react'
import Button from './ui/Button'
import Card from './ui/Card'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="text-center py-16 backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
      {icon && (
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-muted/20 dark:bg-white/5 flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-2xl font-bold mb-3 dark:text-white tracking-tight">{title}</h3>
      <p className="text-muted dark:text-gray-400 text-lg mb-6 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg">
          {actionLabel}
        </Button>
      )}
    </Card>
  )
}

