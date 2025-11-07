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
          'dark:bg-gradient-to-b dark:from-[#1A1A1A] dark:to-[#151515]',
          'hover:shadow-premium dark:hover:shadow-premium-dark',
          'dark:hover:border-[#3A3A3A]',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export default Card

