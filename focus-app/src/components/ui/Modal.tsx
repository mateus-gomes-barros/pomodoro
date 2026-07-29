import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {

  return (
    <AnimatePresence>

      {isOpen && (
        <>

          {/* Overlay */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="
            fixed
            inset-0
            bg-black/70
            backdrop-blur-sm
            z-50
            "
          />

          {/* Modal */}

          <div
            className="
            fixed
            inset-0
            z-50
            flex
            items-end
            sm:items-center
            justify-center
            p-4
            "
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: .95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: .95,
                y: 10,
              }}
              transition={{
                duration: .25,
              }}
              className="
              bg-[#161616]
              border
              border-[#2A2A2A]
              rounded-3xl
              p-6
              w-full
              max-w-md
              shadow-xl
              "
            >

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-lg font-semibold text-white">
                  {title}
                </h2>

                <button
                  onClick={onClose}
                  className="
                  w-8
                  h-8
                  rounded-xl
                  bg-[#1E1E1E]
                  flex
                  items-center
                  justify-center
                  text-gray-400
                  hover:text-white
                  transition-colors
                  "
                >
                  <X size={16}/>
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