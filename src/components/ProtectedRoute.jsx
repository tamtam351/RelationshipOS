import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRelationship } from '../contexts/RelationshipContext'
import { Skeleton } from './ui/Skeleton'

export function ProtectedRoute({ children, requireRelationship = true }) {
  const { isAuthenticated, loading: authLoading, profile } = useAuth()
  const { hasRelationship, loading: relLoading } = useRelationship()
  const location = useLocation()
  const onOnboarding = location.pathname.startsWith('/onboarding')

  // Onboarding must NOT unmount when createRelationship refreshes data
  const showLoader =
    authLoading ||
    (isAuthenticated && relLoading && requireRelationship && !onOnboarding)

  if (showLoader) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-background)]">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (profile && !profile.onboarding_completed && !onOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  if (requireRelationship && !hasRelationship && !onOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}