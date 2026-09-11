import {
  useEffect,
  useState,
} from 'react'
import {
  AnimatePresence,
  motion,
} from 'framer-motion'
import {
  Sparkles,
  X,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'

import {
  FOCUS_HOME_COLORS,
  FOCUS_HOME_KEYS,
  FocusHomeSymbol,
  type FocusHomeKey,
} from '@/components/focusme/FocusHomeSymbol'

export function FocusHomeSymbolGallery() {
  const { t } = useTranslation()

  const [
    selected,
    setSelected,
  ] = useState<
    FocusHomeKey | null
  >(null)

  useEffect(() => {
    if (!selected) {
      return
    }

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === 'Escape') {
        setSelected(null)
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [selected])

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-green">
          FocushoMe
        </p>

        <h2 className="mt-2 font-semibold text-accent-white">
          {t(
            'focusMePage.symbols.title',
          )}
        </h2>

        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-accent-subtle">
          {t(
            'focusMePage.symbols.subtitle',
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {FOCUS_HOME_KEYS.map(
          (key, index) => (
            <motion.button
              key={key}
              type="button"
              onClick={() =>
                setSelected(key)
              }
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay:
                  index * 0.025,
              }}
              className="card group flex min-h-40 flex-col items-center justify-center p-4 text-center transition hover:border-white/[0.12] hover:bg-white/[0.025]"
              aria-label={t(
                'focusMePage.symbols.open',
                {
                  name: key,
                },
              )}
            >
              <div className="relative flex h-24 w-24 items-center justify-center transition duration-300 group-hover:scale-105">
                <div
                  className="absolute inset-3 rounded-full blur-2xl"
                  style={{
                    backgroundColor:
                      `${FOCUS_HOME_COLORS[key]}18`,
                  }}
                />

                <div className="relative">
                  <FocusHomeSymbol
                    type={key}
                    size={88}
                  />
                </div>
              </div>

              <h3
                className="mt-3 text-sm font-semibold capitalize"
                style={{
                  color:
                    FOCUS_HOME_COLORS[key],
                }}
              >
                {key}
              </h3>

              <span className="mt-1 text-[10px] text-accent-subtle">
                {t(
                  'focusMePage.symbols.tap',
                )}
              </span>
            </motion.button>
          ),
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setSelected(null)
            }
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="focushome-dialog-title"
              initial={{
                opacity: 0,
                y: 24,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 24,
                scale: 0.98,
              }}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 30,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/[0.09] glass-modal p-6 shadow-2xl sm:rounded-3xl sm:p-7"
            >
              <button
                type="button"
                onClick={() =>
                  setSelected(null)
                }
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-accent-subtle transition hover:text-accent-white"
                aria-label={t(
                  'focusMePage.symbols.close',
                )}
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="relative flex h-32 w-32 items-center justify-center">
                  <div
                    className="absolute inset-5 rounded-full blur-3xl"
                    style={{
                      backgroundColor:
                        `${FOCUS_HOME_COLORS[selected]}28`,
                    }}
                  />

                  <div className="relative">
                    <FocusHomeSymbol
                      type={selected}
                      size={118}
                    />
                  </div>
                </div>

                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-subtle">
                  FocushoMe
                </p>

                <h2
                  id="focushome-dialog-title"
                  className="mt-2 text-2xl font-semibold capitalize"
                  style={{
                    color:
                      FOCUS_HOME_COLORS[
                        selected
                      ],
                  }}
                >
                  {selected}
                </h2>

                <p className="mt-3 text-sm font-medium text-accent-white">
                  {t(
                    `focusMePage.symbols.items.${selected}.essence`,
                  )}
                </p>
              </div>

              <div className="mt-7 space-y-5 border-t border-white/[0.07] pt-6">
                <p className="text-sm leading-7 text-accent-subtle">
                  {t(
                    `focusMePage.symbols.items.${selected}.description`,
                  )}
                </p>

                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={15}
                      style={{
                        color:
                          FOCUS_HOME_COLORS[
                            selected
                          ],
                      }}
                    />

                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-white">
                      {t(
                        'focusMePage.symbols.strength',
                      )}
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-accent-subtle">
                    {t(
                      `focusMePage.symbols.items.${selected}.strength`,
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-white">
                    {t(
                      'focusMePage.symbols.balance',
                    )}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-accent-subtle">
                    {t(
                      `focusMePage.symbols.items.${selected}.balance`,
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
