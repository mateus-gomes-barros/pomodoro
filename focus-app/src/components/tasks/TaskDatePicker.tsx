import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  format,
  getDaysInMonth,
  parseISO,
  startOfMonth,
} from 'date-fns'
import {
  enUS,
  ptBR,
} from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

import { cn } from '@/utils'

interface TaskDatePickerProps {
  id: string
  label: string
  help: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  language: string
  optionalLabel: string
  emptyLabel: string
  clearLabel: string
  todayLabel: string
  closeLabel: string
}

export function TaskDatePicker({
  id,
  label,
  help,
  value,
  onChange,
  disabled = false,
  language,
  optionalLabel,
  emptyLabel,
  clearLabel,
  todayLabel,
  closeLabel,
}: TaskDatePickerProps) {
  const selectedDate = value
    ? parseISO(value)
    : null

  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] =
    useState(() =>
      startOfMonth(
        selectedDate ?? new Date(),
      ),
    )

  const locale =
    language === 'pt-BR'
      ? ptBR
      : enUS

  const daysInVisibleMonth =
    getDaysInMonth(visibleMonth)

  function openCalendar() {
    setVisibleMonth(
      startOfMonth(
        selectedDate ?? new Date(),
      ),
    )
    setOpen(true)
  }

  function selectMonth(month: number) {
    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        month,
        1,
      ),
    )
  }

  function selectDay(day: number) {
    const date = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day,
      12,
    )

    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  function selectToday() {
    const today = new Date()

    onChange(format(today, 'yyyy-MM-dd'))
    setVisibleMonth(startOfMonth(today))
    setOpen(false)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="block whitespace-nowrap text-xs font-semibold text-emerald-300"
        >
          {label}
        </label>

        <span className="text-[10px] uppercase tracking-[0.12em] text-accent-subtle/60">
          {optionalLabel}
        </span>
      </div>

      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={openCalendar}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            'input flex w-full items-center gap-2 text-left disabled:opacity-50',
            open &&
              'border-accent-green/35',
          )}
        >
          <CalendarDays
            size={15}
            className="shrink-0 text-accent-green"
          />

          <span
            className={cn(
              'min-w-0 flex-1 truncate',
              !selectedDate &&
                'text-accent-subtle',
            )}
          >
            {selectedDate
              ? format(
                  selectedDate,
                  'dd MMM yyyy',
                  { locale },
                )
              : emptyLabel}
          </span>
        </button>

        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={clearLabel}
            title={clearLabel}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-accent-subtle">
        {help}
      </p>

      {open &&
        createPortal(
          <>
            <motion.button
              type="button"
              aria-label={closeLabel}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[9998] cursor-default bg-black/70 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={label}
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="glass-modal fixed left-1/2 top-1/2 z-[9999] h-[min(390px,calc(100vw-2rem))] w-[min(390px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-white/[0.16] bg-[#07100d]/95 p-0 shadow-[0_32px_100px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.10),0_0_40px_rgba(52,211,153,0.06)] backdrop-blur-3xl"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-accent-green/[0.09] blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-white/[0.035] blur-3xl"
              />

              <div className="relative h-full w-full">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-3 rounded-full border border-white/[0.07] shadow-[inset_0_1px_16px_rgba(255,255,255,0.025)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[50px] rounded-full border border-white/[0.06] bg-white/[0.012]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[112px] rounded-full border border-accent-green/[0.10] bg-black/20 shadow-[0_0_30px_rgba(52,211,153,0.04)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[14%] top-[8%] h-[28%] w-[52%] -rotate-[18deg] rounded-full bg-white/[0.035] blur-xl"
                />

                {Array.from({
                  length: daysInVisibleMonth,
                }).map((_, dayIndex) => {
                  const day = dayIndex + 1
                  const angle =
                    (dayIndex /
                      daysInVisibleMonth) *
                      Math.PI *
                      2 -
                    Math.PI / 2
                  const radius = 43
                  const left =
                    50 +
                    Math.cos(angle) *
                      radius
                  const top =
                    50 +
                    Math.sin(angle) *
                      radius
                  const selected =
                    selectedDate?.getFullYear() ===
                      visibleMonth.getFullYear() &&
                    selectedDate?.getMonth() ===
                      visibleMonth.getMonth() &&
                    selectedDate?.getDate() ===
                      day
                  const today = new Date()
                  const isToday =
                    today.getFullYear() ===
                      visibleMonth.getFullYear() &&
                    today.getMonth() ===
                      visibleMonth.getMonth() &&
                    today.getDate() === day

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() =>
                        selectDay(day)
                      }
                      className={cn(
                        'absolute flex h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[9px] font-medium transition',
                        'text-white/40 hover:bg-white/[0.07] hover:text-white',
                        isToday &&
                          'ring-1 ring-inset ring-accent-green/40 text-accent-green',
                        selected &&
                          'bg-accent-green text-[#06110d] shadow-[0_0_14px_rgba(52,211,153,0.28)]',
                      )}
                      style={{
                        left: left + '%',
                        top: top + '%',
                      }}
                    >
                      {day}
                    </button>
                  )
                })}

                {Array.from({
                  length: 12,
                }).map((_, monthIndex) => {
                  const monthDate = new Date(
                    visibleMonth.getFullYear(),
                    monthIndex,
                    1,
                  )
                  const angle =
                    (monthIndex / 12) *
                      Math.PI *
                      2 -
                    Math.PI / 2
                  const radius = 31.5
                  const left =
                    50 +
                    Math.cos(angle) *
                      radius
                  const top =
                    50 +
                    Math.sin(angle) *
                      radius
                  const selected =
                    monthIndex ===
                    visibleMonth.getMonth()

                  return (
                    <button
                      key={monthIndex}
                      type="button"
                      onClick={() =>
                        selectMonth(monthIndex)
                      }
                      className={cn(
                        'absolute flex h-7 min-w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border px-2 text-[9px] font-medium capitalize transition',
                        selected
                          ? 'border-white/80 bg-white/[0.055] text-white shadow-[0_0_16px_rgba(255,255,255,0.06)]'
                          : 'border-white/[0.035] bg-white/[0.012] text-white/25 hover:border-white/10 hover:text-white/55',
                      )}
                      style={{
                        left: left + '%',
                        top: top + '%',
                      }}
                    >
                      {format(
                        monthDate,
                        'MMM',
                        { locale },
                      )}
                    </button>
                  )
                })}

                <div className="absolute left-1/2 top-1/2 flex h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/80 bg-white/[0.035] shadow-[inset_0_1px_16px_rgba(255,255,255,0.035),0_0_28px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleMonth(
                          new Date(
                            visibleMonth.getFullYear() -
                              1,
                            visibleMonth.getMonth(),
                            1,
                          ),
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white/25 transition hover:bg-white/[0.05] hover:text-white/70"
                    >
                      <ChevronLeft size={13} />
                    </button>

                    <span className="min-w-10 text-center text-base font-semibold text-white">
                      {visibleMonth.getFullYear()}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setVisibleMonth(
                          new Date(
                            visibleMonth.getFullYear() +
                              1,
                            visibleMonth.getMonth(),
                            1,
                          ),
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white/25 transition hover:bg-white/[0.05] hover:text-white/70"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={selectToday}
                    className="mt-1 rounded-full border border-accent-green/15 bg-accent-green/[0.06] px-2.5 py-1 text-[9px] font-medium text-accent-green/80 transition hover:bg-accent-green/[0.12]"
                  >
                    {todayLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </>,
          document.body,
        )}
    </div>
  )
}
