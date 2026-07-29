import {
    createContext,
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
  
  type AuthContextValue = {
    session: Session | null
    user: User | null
    isLoading: boolean
  }
  
  type AuthProviderProps = {
    children: ReactNode
  }
  
  const AuthContext = createContext<AuthContextValue | undefined>(
    undefined,
  )
  
  export function AuthProvider({
    children,
  }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)
  
    useEffect(() => {
      let isMounted = true
  
      async function loadSession() {
        const {
          data,
          error,
        } = await supabase.auth.getSession()
  
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
        setIsLoading(false)
      }
  
      void loadSession()
  
      const {
        data: {
          subscription,
        },
      } = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!isMounted) {
            return
          }
  
          setSession(nextSession)
          setIsLoading(false)
        },
      )
  
      return () => {
        isMounted = false
        subscription.unsubscribe()
      }
    }, [])
  
    const value = useMemo<AuthContextValue>(
      () => ({
        session,
        user: session?.user ?? null,
        isLoading,
      }),
      [session, isLoading],
    )
  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    )
  }
  
  export function useAuth() {
    const context = useContext(AuthContext)
  
    if (!context) {
      throw new Error(
        'useAuth must be used inside an AuthProvider.',
      )
    }
  
    return context
  }