import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  signInWithOAuth,
  setSession,
  exchangeCodeForSession,
  getSession,
  signOut,
} = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
  setSession: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  getSession: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth,
      setSession,
      exchangeCodeForSession,
      getSession,
      signOut,
    },
  },
}))

import { getAuthState, signInWithGoogle, signOutUser } from './authService'

beforeEach(() => {
  vi.clearAllMocks()

  Object.assign(globalThis, {
    chrome: {
      identity: {
        getRedirectURL: vi.fn(() => 'https://extension-id.chromiumapp.org/auth'),
        launchWebAuthFlow: vi.fn(),
      },
    },
  })
})

describe('extension auth service', () => {
  it('returns signed-out state when Supabase has no session', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null })

    await expect(getAuthState()).resolves.toEqual({
      session: null,
      user: null,
    })
  })

  it('completes Google OAuth from an implicit redirect', async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: 'https://supabase.example/oauth' },
      error: null,
    })

    vi.mocked(chrome.identity.launchWebAuthFlow).mockResolvedValue(
      'https://extension-id.chromiumapp.org/auth#access_token=access&refresh_token=refresh',
    )

    setSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    })

    const session = await signInWithGoogle()

    expect(chrome.identity.launchWebAuthFlow).toHaveBeenCalledWith({
      url: 'https://supabase.example/oauth',
      interactive: true,
    })
    expect(setSession).toHaveBeenCalledWith({
      access_token: 'access',
      refresh_token: 'refresh',
    })
    expect(session?.user.id).toBe('user-1')
  })

  it('signs out through Supabase', async () => {
    signOut.mockResolvedValue({ error: null })

    await signOutUser()

    expect(signOut).toHaveBeenCalledTimes(1)
  })
})
