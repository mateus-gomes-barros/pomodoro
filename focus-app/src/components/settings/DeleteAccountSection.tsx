import {
  useState,
} from 'react'
import {
  LoaderCircle,
  Trash2,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'
import {
  useNavigate,
} from 'react-router-dom'

import {
  deleteAccount,
} from '@/services/authService'

export function DeleteAccountSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  async function handleDelete() {
    const confirmed =
      window.confirm(
        [
          t(
            'settings.accountDeletion.title',
          ),
          '',
          t(
            'settings.accountDeletion.description',
          ),
          '',
          t(
            'settings.accountDeletion.warning',
          ),
        ].join('\n'),
      )

    if (!confirmed) {
      return
    }

    try {
      setIsDeleting(true)
      setErrorMessage(null)

      await deleteAccount()

      navigate(
        '/login',
        {
          replace: true,
        },
      )
    } catch (error) {
      console.error(
        'Failed to delete account:',
        error,
      )

      setErrorMessage(
        t(
          'settings.accountDeletion.error',
        ),
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 px-4 py-3 text-sm font-medium text-red-300 transition hover:border-red-400/40 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting ? (
          <LoaderCircle
            size={16}
            className="animate-spin"
          />
        ) : (
          <Trash2 size={16} />
        )}

        {t(
          isDeleting
            ? 'settings.accountDeletion.deleting'
            : 'settings.accountDeletion.button',
        )}
      </button>

      <p className="mt-2 text-center text-[11px] leading-relaxed text-accent-subtle">
        {t(
          'settings.accountDeletion.subtitle',
        )}
      </p>

      {errorMessage && (
        <p className="mt-2 text-center text-xs text-red-300">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
