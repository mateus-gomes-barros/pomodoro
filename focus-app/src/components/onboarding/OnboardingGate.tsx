import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import {
  useAuth,
} from '@/contexts/AuthContext'

export const ONBOARDING_VERSION = 'v1'

export function getOnboardingStorageKey(
  identity: string,
) {
  return (
    `focus-onboarding-${ONBOARDING_VERSION}:` +
    identity
  )
}

export function OnboardingGate() {
  const {
    user,
    isDemoMode,
  } = useAuth()

  const location = useLocation()

  const identity =
    user?.id ??
    (
      isDemoMode
        ? 'demo'
        : 'anonymous'
    )

  const completed =
    localStorage.getItem(
      getOnboardingStorageKey(
        identity,
      ),
    ) === 'true'

  if (!completed) {
    return (
      <Navigate
        to="/onboarding"
        replace
        state={{
          from: location.pathname,
        }}
      />
    )
  }

  return <Outlet />
}
