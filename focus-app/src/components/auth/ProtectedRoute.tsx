import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    user,
    isLoading,
    isDemoMode,
  } = useAuth()

  const location = useLocation()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-accent-subtle">
          Carregando...
        </p>
      </main>
    )
  }

  if (!user && !isDemoMode) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    )
  }

  return children
}