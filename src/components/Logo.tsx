import { useTheme } from '@/contexts/ThemeContext'

export default function Logo({ className = '' }: { className?: string }) {
  const { theme } = useTheme()
  
  // Invert colors: dark chevrons in light mode, light chevrons in dark mode
  const chevronColor = theme === 'dark' ? '#FFFFFF' : '#000000'
  const backgroundColor = theme === 'dark' ? '#000000' : '#FFFFFF'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background circle/square for contrast */}
        <rect
          width="32"
          height="32"
          rx="6"
          fill={backgroundColor}
          className="transition-colors duration-300"
        />
        
        {/* Top row of chevrons */}
        <path
          d="M 6 10 L 10 12 L 6 14 Z"
          fill={chevronColor}
          className="transition-colors duration-300"
        />
        <path
          d="M 12 10 L 16 12 L 12 14 Z"
          fill={chevronColor}
          className="transition-colors duration-300"
        />
        <path
          d="M 18 10 L 22 12 L 18 14 Z"
          fill={chevronColor}
          className="transition-colors duration-300"
        />
        
        {/* Bottom row of chevrons */}
        <path
          d="M 6 18 L 10 20 L 6 22 Z"
          fill={chevronColor}
          className="transition-colors duration-300"
        />
        <path
          d="M 12 18 L 16 20 L 12 22 Z"
          fill={chevronColor}
          className="transition-colors duration-300"
        />
        <path
          d="M 18 18 L 22 20 L 18 22 Z"
          fill={chevronColor}
          className="transition-colors duration-300"
        />
      </svg>
      <span className="text-xl font-bold text-foreground dark:text-foreground transition-colors duration-300">
        Bringora
      </span>
    </div>
  )
}

