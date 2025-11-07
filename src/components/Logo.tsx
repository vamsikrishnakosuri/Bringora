import logoImage from '../Logo.png'

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoImage}
        alt="Bringora Logo"
        width="32"
        height="32"
        className="flex-shrink-0"
      />
      <span className="text-xl font-bold text-foreground dark:text-foreground transition-colors duration-300">
        Bringora
      </span>
    </div>
  )
}
