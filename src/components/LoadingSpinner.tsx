export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-muted dark:border-muted rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-foreground dark:border-t-foreground rounded-full animate-spin"></div>
      </div>
    </div>
  )
}

