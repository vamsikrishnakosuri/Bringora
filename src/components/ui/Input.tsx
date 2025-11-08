import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-2 dark:text-white"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm',
            'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2',
            'focus-visible:ring-offset-background dark:focus-visible:ring-offset-background-dark',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'backdrop-blur-sm bg-white/80 dark:bg-[#1A1A1A]/80',
            'transition-all duration-200',
            // Error state
            hasError
              ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500'
              : 'border-gray-300 dark:border-white/10 focus:border-gray-400 dark:focus:border-white/20',
            'text-foreground dark:text-white',
            'focus:bg-white dark:focus:bg-[#1A1A1A]/90',
            'placeholder:text-muted dark:placeholder:text-gray-400',
            className
          )}
          {...props}
        />
        {hasError && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

