import type { Session, User } from '@supabase/supabase-js'

import {
  clearAuthDiagnostic,
  saveAuthDiagnostic,
} from './authDiagnostics'
import { supabase } from '../lib/supabase'

export type ExtensionAuthState = {
  session: Session | null
  user: User | null
}

export async function getAuthState(): Promise<ExtensionAuthState> {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return {
    session: data.session,
    user: data.session?.user ?? null,
  }
}

function getRedirectError(redirectUrl: string) {
  const parsed = new URL(redirectUrl)
  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''))

  return (
    hashParams.get('error_description') ??
    parsed.searchParams.get('error_description') ??
    hashParams.get('error') ??
    parsed.searchParams.get('error')
  )
}

async function failAuth(
  stage: string,
  message: string,
  redirectTo: string,
): Promise<never> {
  await saveAuthDiagnostic({
    stage,
    message,
    redirectTo,
    createdAt: new Date().toISOString(),
  })

  throw new Error(message)
}

export async function signInWithGoogle(): Promise<Session | null> {
  const redirectTo = chrome.identity.getRedirectURL('auth')
  await clearAuthDiagnostic()

  let oauthUrl: string

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    })

    if (error) {
      return await failAuth('supabase-start', error.message, redirectTo)
    }

    if (!data.url) {
      return await failAuth(
        'supabase-start',
        'Could not start Google sign in.',
        redirectTo,
      )
    }

    oauthUrl = data.url
  } catch (error) {
    return await failAuth(
      'supabase-start',
      error instanceof Error ? error.message : 'Could not start Google sign in.',
      redirectTo,
    )
  }

  let callbackUrl: string | undefined

  try {
    callbackUrl = await chrome.identity.launchWebAuthFlow({
      url: oauthUrl,
      interactive: true,
    })
  } catch (error) {
    return await failAuth(
      'launch-web-auth-flow',
      error instanceof Error ? error.message : 'Chrome OAuth flow failed.',
      redirectTo,
    )
  }

  if (!callbackUrl) {
    return await failAuth(
      'launch-web-auth-flow',
      'Google sign in was cancelled or Chrome did not receive the callback.',
      redirectTo,
    )
  }

  const redirectError = getRedirectError(callbackUrl)

  if (redirectError) {
    return await failAuth('provider-redirect', redirectError, redirectTo)
  }

  const parsed = new URL(callbackUrl)
  const code = parsed.searchParams.get('code')

  if (code) {
    const { data: exchanged, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return await failAuth(
        'exchange-code',
        exchangeError.message,
        redirectTo,
      )
    }

    await clearAuthDiagnostic()
    return exchanged.session
  }

  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''))
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')

  if (!accessToken || !refreshToken) {
    return await failAuth(
      'parse-callback',
      'Chrome received the OAuth callback without a Supabase session.',
      redirectTo,
    )
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

  if (sessionError) {
    return await failAuth('set-session', sessionError.message, redirectTo)
  }

  await clearAuthDiagnostic()
  return sessionData.session
}

export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}
