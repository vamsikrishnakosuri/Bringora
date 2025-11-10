import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export default function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = {
    width: width || (variant === 'circular' ? '100%' : undefined),
    height: height || (variant === 'circular' ? '100%' : undefined),
    ...style,
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-muted dark:bg-gray-700',
        {
          'rounded-full': variant === 'circular',
          'rounded-lg': variant === 'rectangular',
          'rounded': variant === 'text',
        },
        className
      )}
      style={baseStyles}
      aria-busy="true"
      aria-label="Loading"
      {...props}
    />
  )
}


