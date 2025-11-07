import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'backdrop-blur-sm',
          {
            'bg-foreground text-background hover:opacity-90 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 border border-white/20 dark:border-white/10':
              variant === 'default',
            'border-2 border-foreground bg-transparent hover:bg-foreground hover:text-background dark:border-white/20 dark:text-white dark:hover:bg-white/10':
              variant === 'outline',
            'bg-transparent hover:bg-white/10 dark:hover:bg-white/5': variant === 'ghost',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default Button

