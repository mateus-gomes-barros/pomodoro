import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  Session,
  User,
} from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

const DEMO_MODE_STORAGE_KEY =
  'focus-demo-mode'

type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  isDemoMode: boolean
  enterDemoMode: () => void
  exitDemoMode: () => void
}

type AuthProviderProps = {
  children: ReactNode
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined)

function getInitialDemoMode() {
  return (
    localStorage.getItem(
      DEMO_MODE_STORAGE_KEY,
    ) === 'true'
  )
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] =
    useState<Session | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isDemoMode, setIsDemoMode] =
    useState(getInitialDemoMode)

  const enterDemoMode =
    useCallback(() => {
      localStorage.setItem(
        DEMO_MODE_STORAGE_KEY,
        'true',
      )

      setIsDemoMode(true)
    }, [])

  const exitDemoMode =
    useCallback(() => {
      localStorage.removeItem(
        DEMO_MODE_STORAGE_KEY,
      )

      setIsDemoMode(false)
    }, [])

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const {
        data,
        error,
      } =
        await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error) {
        console.error(
          'Failed to load Supabase session:',
          error.message,
        )
      }

      setSession(data.session)

      if (data.session) {
        localStorage.removeItem(
          DEMO_MODE_STORAGE_KEY,
        )

        setIsDemoMode(false)
      }

      setIsLoading(false)
    }

    void loadSession()

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!isMounted) {
            return
          }

          setSession(nextSession)

          if (nextSession) {
            localStorage.removeItem(
              DEMO_MODE_STORAGE_KEY,
            )

            setIsDemoMode(false)
          }

          setIsLoading(false)
        },
      )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value =
    useMemo<AuthContextValue>(
      () => ({
        session,
        user:
          session?.user ?? null,
        isLoading,
        isDemoMode,
        enterDemoMode,
        exitDemoMode,
      }),
      [
        session,
        isLoading,
        isDemoMode,
        enterDemoMode,
        exitDemoMode,
      ],
    )

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider.',
    )
  }

  return context
}