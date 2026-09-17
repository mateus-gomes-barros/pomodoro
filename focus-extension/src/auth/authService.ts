import type { Session, User } from '@supabase/supabase-js'

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

export async function signInWithGoogle(): Promise<Session | null> {
  const redirectTo = chrome.identity.getRedirectURL('auth')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.url) {
    throw new Error('Could not start Google sign in.')
  }

  const callbackUrl = await chrome.identity.launchWebAuthFlow({
    url: data.url,
    interactive: true,
  })

  if (!callbackUrl) {
    throw new Error('Google sign in was cancelled.')
  }

  const redirectError = getRedirectError(callbackUrl)

  if (redirectError) {
    throw new Error(redirectError)
  }

  const parsed = new URL(callbackUrl)
  const code = parsed.searchParams.get('code')

  if (code) {
    const { data: exchanged, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      throw new Error(exchangeError.message)
    }

    return exchanged.session
  }

  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''))
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')

  if (!accessToken || !refreshToken) {
    throw new Error('Could not complete Google sign in.')
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  return sessionData.session
}

export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}
