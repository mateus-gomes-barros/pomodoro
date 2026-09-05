import { useTranslation } from 'react-i18next'
import {
  useEffect,
  useState,
} from 'react'
import {
  Navigate,
  useNavigate,
} from 'react-router-dom'
import { LogIn } from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { signInWithGoogle } from '@/services/authService'
import { setAppLanguage } from '@/i18n'

export function LoginPage() {
  const { t, i18n } = useTranslation()

  const navigate = useNavigate()

  const {
    user,
    isLoading,
    enterDemoMode,
  } = useAuth()

  const [
    isSigningIn,
    setIsSigningIn,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading) {
      setIsSigningIn(false)
    }
  }, [isLoading])

  async function handleGoogleLogin() {
    try {
      setIsSigningIn(true)
      setErrorMessage(null)

      await signInWithGoogle()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('loginPage.googleError')

      setErrorMessage(message)
      setIsSigningIn(false)
    }
  }

  function handleDemoAccess() {
    enterDemoMode()
    navigate('/')
  }

  if (!isLoading && user) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div
        className="absolute right-5 z-20"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
        }}
      >
        <label
          htmlFor="login-language"
          className="sr-only"
        >
          {t('loginPage.language')}
        </label>

        <select
          id="login-language"
          value={
            i18n.language === 'en'
              ? 'en'
              : 'pt-BR'
          }
          onChange={(event) =>
            void setAppLanguage(
              event.target.value as
                | 'en'
                | 'pt-BR',
            )
          }
          className="rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm text-foreground outline-none transition hover:border-white/20 focus:border-primary/50"
        >
          <option value="pt-BR">
            {t('loginPage.portuguese')}
          </option>
          <option value="en">
            {t('loginPage.english')}
          </option>
        </select>
      </div>
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-surface p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LogIn size={26} />
          </div>

          <h1 className="text-3xl font-semibold text-foreground">
            {t('loginPage.title')}
          </h1>

          <p className="mt-3 text-sm leading-6 text-accent-subtle">
            {t('loginPage.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSigningIn}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3 font-medium text-neutral-900 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />

          {isSigningIn
            ? t('loginPage.redirecting')
            : t('loginPage.continueGoogle')}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />

          <span className="text-xs uppercase tracking-wider text-accent-subtle">
            {t('loginPage.or')}
          </span>

          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={isSigningIn}
          className="flex w-full items-center justify-center rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 font-medium text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t('loginPage.demoAccess')}
        </button>

        <p className="mt-3 text-center text-xs leading-5 text-accent-subtle">
          {t('loginPage.guestDescription')}
        </p>

        {errorMessage && (
          <p className="mt-4 text-center text-sm text-red-400">
            {errorMessage}
          </p>
        )}
      </section>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.873h5.382a4.6 4.6 0 0 1-1.996 3.018v2.509h3.232c1.891-1.741 2.982-4.309 2.982-7.355Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964.895 6.618-2.418l-3.232-2.509c-.895.6-2.041.955-3.386.955-2.605 0-4.809-1.759-5.6-4.127H3.059v2.591A9.999 9.999 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.901A6.01 6.01 0 0 1 6.091 12c0-.659.114-1.3.309-1.901V7.508H3.059A9.995 9.995 0 0 0 2 12c0 1.614.386 3.141 1.059 4.492L6.4 13.901Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.973c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.959 2.986 14.695 2 12 2a9.999 9.999 0 0 0-8.941 5.508L6.4 10.099C7.191 7.731 9.395 5.973 12 5.973Z"
      />
    </svg>
  )
}