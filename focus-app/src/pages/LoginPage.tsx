import { useState } from 'react'
import { LogIn } from 'lucide-react'

import { signInWithGoogle } from '@/services/authService'

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleGoogleLogin() {
    try {
      setIsLoading(true)
      setErrorMessage(null)

      await signInWithGoogle()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível entrar com o Google.'

      setErrorMessage(message)
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-surface p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LogIn size={26} />
          </div>

          <h1 className="text-3xl font-semibold text-foreground">
            Bem-vindo ao Focus
          </h1>

          <p className="mt-3 text-sm leading-6 text-accent-subtle">
            Entre com sua conta Google para sincronizar suas tarefas,
            projetos, sessões de foco e ofensivas.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3 font-medium text-neutral-900 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />

          {isLoading
            ? 'Redirecionando...'
            : 'Continuar com Google'}
        </button>

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
        d="M12 22c2.7 0 4.964-.895 6.618-2.418l-3.232-2.509c-.895.6-2.041.955-3.386.955-2.605 0-4.809-1.759-5.6-4.127H3.059v2.591A9.999 9.999 0 0 0 12 22Z"
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