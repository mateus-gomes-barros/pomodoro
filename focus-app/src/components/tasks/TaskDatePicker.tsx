import {
  useMemo,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
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

  const calendarDays = useMemo(() => {
    const monthStart =
      startOfMonth(visibleMonth)
    const monthEnd =
      endOfMonth(visibleMonth)

    return eachDayOfInterval({
      start: startOfWeek(monthStart, {
        weekStartsOn: 0,
      }),
      end: endOfWeek(monthEnd, {
        weekStartsOn: 0,
      }),
    })
  }, [visibleMonth])

  const weekdayLabels = useMemo(
    () =>
      Array.from(
        { length: 7 },
        (_, index) =>
          format(
            new Date(
              2026,
              0,
              4 + index,
            ),
            'EEEEE',
            { locale },
          ),
      ),
    [locale],
  )

  function openCalendar() {
    setVisibleMonth(
      startOfMonth(
        selectedDate ?? new Date(),
      ),
    )
    setOpen(true)
  }

  function selectDate(date: Date) {
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
          className="block text-xs font-medium text-accent-subtle"
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
                y: 8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="glass-modal fixed left-1/2 top-1/2 z-[9999] h-[min(380px,calc(100vw-2rem))] w-[min(380px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-white/[0.16] bg-[#07100d]/95 p-0 shadow-[0_32px_100px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.10),0_0_40px_rgba(52,211,153,0.08)] backdrop-blur-3xl"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-accent-green/[0.10] blur-3xl"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-3 rounded-full border border-white/[0.07] shadow-[inset_0_1px_16px_rgba(255,255,255,0.025)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[34px] rounded-full border border-white/[0.055] bg-white/[0.012]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[82px] rounded-full border border-accent-green/[0.08] bg-black/10 shadow-[0_0_30px_rgba(52,211,153,0.04)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[14%] top-[5%] h-[24%] w-[52%] -rotate-[18deg] rounded-full bg-white/[0.035] blur-xl"
              />

              <div className="relative flex h-full w-full flex-col px-[10%] pb-[8%] pt-[9%]">
                <div className="mb-2 grid grid-cols-[2rem_1fr_2rem] items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleMonth(
                        (month) =>
                          addMonths(month, -1),
                      )
                    }
                    className="glass-control flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:text-white"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <p className="text-center text-sm font-semibold capitalize text-white/85">
                    {format(
                      visibleMonth,
                      'MMMM yyyy',
                      { locale },
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setVisibleMonth(
                        (month) =>
                          addMonths(month, 1),
                      )
                    }
                    className="glass-control flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:text-white"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>

                <div className="mb-1 grid grid-cols-7 gap-1">
                  {weekdayLabels.map(
                    (weekday, index) => (
                      <span
                        key={
                          weekday + index
                        }
                        className="text-center text-[10px] font-medium uppercase text-white/25"
                      >
                        {weekday}
                      </span>
                    ),
                  )}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date) => {
                    const selected =
                      selectedDate
                        ? isSameDay(
                            date,
                            selectedDate,
                          )
                        : false
                    const today =
                      isSameDay(
                        date,
                        new Date(),
                      )
                    const outsideMonth =
                      !isSameMonth(
                        date,
                        visibleMonth,
                      )

                    return (
                      <button
                        key={format(
                          date,
                          'yyyy-MM-dd',
                        )}
                        type="button"
                        onClick={() =>
                          selectDate(date)
                        }
                        className={cn(
                          'relative flex h-8 items-center justify-center rounded-full text-[11px] transition',
                          outsideMonth
                            ? 'text-white/15'
                            : 'text-white/60 hover:bg-white/[0.06] hover:text-white',
                          today &&
                            'ring-1 ring-inset ring-accent-green/35 text-accent-green',
                          selected &&
                            'bg-accent-green text-[#06110d] shadow-[0_0_18px_rgba(52,211,153,0.25)] hover:bg-accent-green',
                        )}
                      >
                        {format(date, 'd')}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onChange('')
                      setOpen(false)
                    }}
                    className="text-xs text-white/35 transition hover:text-white/65"
                  >
                    {clearLabel}
                  </button>

                  <button
                    type="button"
                    onClick={selectToday}
                    className="rounded-full border border-accent-green/20 bg-accent-green/[0.08] px-3 py-1.5 text-xs font-medium text-accent-green transition hover:bg-accent-green/[0.13]"
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
