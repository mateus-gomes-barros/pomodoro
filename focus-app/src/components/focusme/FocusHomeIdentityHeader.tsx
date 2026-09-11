import {
  LoaderCircle,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'

import {
  FocusHomeSymbol,
} from '@/components/focusme/FocusHomeSymbol'
import {
  FocusMeIcon,
} from '@/components/icons/FocusMeIcon'
import {
  useFocusHomeProfile,
} from '@/hooks/focusme/useFocusHomeProfile'
import {
  FOCUS_HOME_PREVIEW,
} from '@/config/focusHomePreview'

export function FocusHomeIdentityHeader() {
  const { t } = useTranslation()

  const profileQuery =
    useFocusHomeProfile()

  const profile =
    profileQuery.data

  const focusHome =
    FOCUS_HOME_PREVIEW ??
    profile?.focusHome

  return (
    <header className="mb-8 flex min-w-0 items-start justify-between gap-4 sm:gap-8">
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex items-center gap-2">
          <FocusMeIcon
            size={22}
            className="shrink-0 text-accent-green"
          />

          <h1 className="text-2xl font-bold tracking-tight text-accent-white sm:text-3xl">
            FocusMe
          </h1>
        </div>

        <p className="mt-2 max-w-xl text-sm leading-relaxed text-accent-subtle">
          {t(
            'focusMePage.reportsSubtitle',
          )}
        </p>
      </div>

      <div className="flex min-w-[104px] shrink-0 flex-col items-center text-center sm:min-w-[150px]">
        {profileQuery.isLoading ? (
          <div className="flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
            <LoaderCircle
              size={24}
              className="animate-spin text-accent-green"
            />
          </div>
        ) : focusHome ? (
          <>
            <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
              <div className="absolute inset-3 rounded-full bg-white/[0.025] blur-xl" />

              <div className="relative">
                <FocusHomeSymbol
                  type={
                    focusHome
                  }
                  size={88}
                  className="sm:h-24 sm:w-24"
                />
              </div>
            </div>

            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-accent-subtle">
              {t(
                'focusHomeIdentity.current',
              )}
            </span>

            <strong className="mt-1 text-sm font-semibold capitalize text-accent-white">
              {focusHome}
            </strong>

            {profile && (
              <span className="mt-1 max-w-[150px] text-[10px] leading-relaxed text-accent-subtle">
                {t(
                  `focusHomeIdentity.archetypes.${profile.archetype}`,
                )}
                {' · '}
                {t(
                  `focusHomeIdentity.temporal.${profile.temporalExpression}`,
                )}
              </span>
            )}
          </>
        ) : (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-white/20 sm:h-24 sm:w-24">
              <FocusMeIcon
                size={62}
              />
            </div>

            <span className="mt-2 max-w-[130px] text-[10px] font-medium leading-relaxed text-accent-subtle">
              {t(
                'focusHomeIdentity.locked',
              )}
            </span>
          </>
        )}
      </div>
    </header>
  )
}
