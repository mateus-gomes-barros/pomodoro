import {
  AnimatePresence,
  motion,
} from 'framer-motion'
import { X } from 'lucide-react'
import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

interface ViewportState {
  height: number
  offsetTop: number
}

function getViewportState(): ViewportState {
  if (typeof window === 'undefined') {
    return {
      height: 0,
      offsetTop: 0,
    }
  }

  const visualViewport =
    window.visualViewport

  return {
    height:
      visualViewport?.height ??
      window.innerHeight,
    offsetTop:
      visualViewport?.offsetTop ?? 0,
  }
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const [
    viewport,
    setViewport,
  ] = useState<ViewportState>(
    getViewportState,
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const visualViewport =
      window.visualViewport

    let animationFrame:
      number | null = null

    function updateViewport() {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(
          animationFrame,
        )
      }

      animationFrame =
        window.requestAnimationFrame(
          () => {
            setViewport(
              getViewportState(),
            )
          },
        )
    }

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    updateViewport()

    const firstUpdate =
      window.setTimeout(
        updateViewport,
        100,
      )

    const secondUpdate =
      window.setTimeout(
        updateViewport,
        350,
      )

    visualViewport?.addEventListener(
      'resize',
      updateViewport,
    )

    visualViewport?.addEventListener(
      'scroll',
      updateViewport,
    )

    window.addEventListener(
      'resize',
      updateViewport,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.clearTimeout(
        firstUpdate,
      )

      window.clearTimeout(
        secondUpdate,
      )

      if (animationFrame !== null) {
        window.cancelAnimationFrame(
          animationFrame,
        )
      }

      visualViewport?.removeEventListener(
        'resize',
        updateViewport,
      )

      visualViewport?.removeEventListener(
        'scroll',
        updateViewport,
      )

      window.removeEventListener(
        'resize',
        updateViewport,
      )
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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
            transition={{
              duration: 0.18,
            }}
            className="
              fixed
              inset-0
              z-50
              bg-black/70
              backdrop-blur-sm
            "
          />

          <div
            role="presentation"
            onClick={onClose}
            className="
              fixed
              left-0
              right-0
              z-50
              flex
              items-center
              justify-center
              p-4
            "
            style={{
              top: viewport.offsetTop,
              height: viewport.height,
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 14,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 10,
              }}
              transition={{
                duration: 0.22,
                ease: [
                  0.16,
                  1,
                  0.3,
                  1,
                ],
              }}
              onClick={(event) => {
                event.stopPropagation()
              }}
              className="
                w-full
                max-w-md
                overflow-y-auto
                overscroll-contain
                rounded-3xl
                border
                border-white/[0.08]
                bg-[#161616]
                p-6
                shadow-2xl
              "
              style={{
                maxHeight: Math.max(
                  240,
                  viewport.height - 32,
                ),
              }}
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">
                  {title}
                </h2>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#1e1e1e]
                    text-gray-400
                    transition-colors
                    hover:text-white
                  "
                >
                  <X size={16} />
                </button>
              </div>

              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}