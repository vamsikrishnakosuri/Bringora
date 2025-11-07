import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl bg-card border border-border p-6 card-shadow transition-all duration-300',
          'backdrop-blur-xl',
          'bg-white/80 dark:bg-[#1A1A1A]/80',
          'border-white/20 dark:border-white/10',
          'dark:bg-gradient-to-b dark:from-[#1A1A1A]/90 dark:to-[#151515]/90',
          'hover:shadow-premium dark:hover:shadow-premium-dark',
          'hover:bg-white/90 dark:hover:bg-[#1A1A1A]/90',
          'dark:hover:border-white/20',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export default Card

