export type AuthDiagnostic = {
  stage: string
  message: string
  redirectTo: string
  createdAt: string
}

const AUTH_DIAGNOSTIC_KEY = 'focus-extension-auth-diagnostic'

export async function saveAuthDiagnostic(
  diagnostic: AuthDiagnostic,
): Promise<void> {
  await chrome.storage.local.set({
    [AUTH_DIAGNOSTIC_KEY]: diagnostic,
  })
}

export async function getAuthDiagnostic(): Promise<AuthDiagnostic | null> {
  const result = await chrome.storage.local.get(AUTH_DIAGNOSTIC_KEY)
  return (result[AUTH_DIAGNOSTIC_KEY] as AuthDiagnostic | undefined) ?? null
}

export async function clearAuthDiagnostic(): Promise<void> {
  await chrome.storage.local.remove(AUTH_DIAGNOSTIC_KEY)
}
