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
          'dark:bg-card-dark dark:border-border-dark',
          'hover:shadow-premium dark:hover:shadow-premium-dark',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export default Card

