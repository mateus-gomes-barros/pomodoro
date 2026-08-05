import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

import { supabase } from '@/lib/supabase'

const nativeRedirectUrl =
  'com.mateusgomes.focusapp://login-callback'

async function handleNativeAuthCallback(
  url: string,
) {
  if (!url.startsWith(nativeRedirectUrl)) {
    return
  }

  const callbackUrl = new URL(url)

  const params = new URLSearchParams(
    callbackUrl.hash.substring(1),
  )

  const accessToken =
    params.get('access_token')

  const refreshToken =
    params.get('refresh_token')

  const errorDescription =
    params.get('error_description')

  if (errorDescription) {
    throw new Error(errorDescription)
  }

  if (!accessToken || !refreshToken) {
    throw new Error(
      'Não foi possível concluir o login com o Google.',
    )
  }

  const { error } =
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

  if (error) {
    throw new Error(error.message)
  }

  await Browser.close()
}

if (Capacitor.isNativePlatform()) {
  void App.addListener(
    'appUrlOpen',
    ({ url }) => {
      void handleNativeAuthCallback(
        url,
      )
    },
  )
}

export async function signInWithGoogle() {
  const isNative =
    Capacitor.isNativePlatform()

  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: isNative
          ? nativeRedirectUrl
          : window.location.origin,
        skipBrowserRedirect: isNative,
      },
    })

  if (error) {
    throw new Error(error.message)
  }

  if (isNative) {
    if (!data.url) {
      throw new Error(
        'Não foi possível abrir o login com o Google.',
      )
    }

    await Browser.open({
      url: data.url,
    })
  }

  return data
}

export async function updateDisplayName(
  displayName: string,
) {
  const normalizedName =
    displayName.trim()

  if (!normalizedName) {
    throw new Error(
      'Please enter your display name.',
    )
  }

  if (normalizedName.length > 40) {
    throw new Error(
      'Your display name must have 40 characters or fewer.',
    )
  }

  const { data, error } =
    await supabase.auth.updateUser({
      data: {
        display_name:
          normalizedName,
      },
    })

  if (error) {
    throw new Error(error.message)
  }

  return data.user
}

export async function signOut() {
  const { error } =
    await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}