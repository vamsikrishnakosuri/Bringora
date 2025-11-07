import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({
  children,
  requireAdmin: _requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <p className="text-muted dark:text-muted">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Add admin check here if needed
  // if (requireAdmin && !isAdmin(user)) {
  //   return <Navigate to="/" replace />
  // }

  return <>{children}</>
}

