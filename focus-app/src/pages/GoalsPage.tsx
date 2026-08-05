import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  Check,
  CheckCircle2,
  Circle,
  LoaderCircle,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Trophy,
} from 'lucide-react'
import { format } from 'date-fns'

import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useToggleGoal,
} from '@/hooks/goals/useGoals'

import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/utils'

export function GoalsPage() {
  const currentYear =
    new Date().getFullYear()

  const {
    data: goals = [],
    isLoading,
    isError,
    error,
  } = useGoals(currentYear)

  const createGoalMutation =
    useCreateGoal(currentYear)

  const toggleGoalMutation =
    useToggleGoal(currentYear)

  const deleteGoalMutation =
    useDeleteGoal(currentYear)

  const [modalOpen, setModalOpen] =
    useState(false)

  const [title, setTitle] =
    useState('')

  const completedGoals =
    goals.filter(
      (goal) => goal.completed,
    )

  const pendingGoals =
    goals.filter(
      (goal) => !goal.completed,
    )

  const isCreating =
    createGoalMutation.isPending

  const progressPercentage =
    goals.length > 0
      ? Math.round(
          (completedGoals.length /
            goals.length) *
            100,
        )
      : 0

  function openCreateModal() {
    createGoalMutation.reset()
    setTitle('')
    setModalOpen(true)
  }

  function closeCreateModal() {
    if (isCreating) {
      return
    }

    setTitle('')
    setModalOpen(false)
  }

  async function handleAddGoal() {
    const normalizedTitle =
      title.trim()

    if (
      !normalizedTitle ||
      isCreating
    ) {
      return
    }

    try {
      await createGoalMutation
        .mutateAsync({
          title: normalizedTitle,
          year: currentYear,
        })

      setTitle('')
      setModalOpen(false)
    } catch (mutationError) {
      console.error(
        'Failed to create goal:',
        mutationError,
      )
    }
  }

  async function handleToggleGoal(
    goalId: string,
  ) {
    const goal = goals.find(
      (currentGoal) =>
        currentGoal.id === goalId,
    )

    if (!goal) {
      return
    }

    try {
      await toggleGoalMutation
        .mutateAsync(goal)
    } catch (mutationError) {
      console.error(
        'Failed to toggle goal:',
        mutationError,
      )
    }
  }

  async function handleDeleteGoal(
    goalId: string,
  ) {
    try {
      await deleteGoalMutation
        .mutateAsync(goalId)
    } catch (mutationError) {
      console.error(
        'Failed to delete goal:',
        mutationError,
      )
    }
  }

  function formatCompletedDate(
    completedAt?: string,
  ) {
    if (!completedAt) {
      return `Completed in ${currentYear}`
    }

    return `Completed on ${format(
      new Date(completedAt),
      'MMM d, yyyy',
    )}`
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 pb-6 lg:px-10 lg:pb-10">
        <PageHeader
          title="Goals"
          subtitle={`Loading ${currentYear} goals`}
        />

        <div className="flex items-center justify-center py-20">
          <LoaderCircle
            size={28}
            className="animate-spin text-accent-subtle"
          />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-6 pb-6 lg:px-10 lg:pb-10">
        <PageHeader
          title="Goals"
          subtitle="Unable to load goals"
        />

        <div className="card p-6">
          <p className="text-sm text-accent-subtle">
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred while loading your goals.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pb-6 lg:px-10 lg:pb-10">
      <PageHeader
        title="Goals"
        subtitle={`${currentYear} yearly goals`}
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />

            Add Goal
          </button>
        }
      />

      <motion.section
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          card
          mb-10
          overflow-hidden
          p-5
          sm:p-6
        "
      >
        <div className="flex items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-emerald-400/10
                text-accent-green
              "
            >
              <Trophy size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Goals done this year
              </p>

              <p className="mt-1 text-xs text-white/40">
                {completedGoals.length} of{' '}
                {goals.length} completed
              </p>
            </div>
          </div>

          <span className="shrink-0 text-4xl font-bold tracking-tight text-accent-green">
            {completedGoals.length}
          </span>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: `${progressPercentage}%`,
            }}
            transition={{
              duration: 0.5,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="h-full rounded-full bg-accent-green"
          />
        </div>
      </motion.section>

      {(toggleGoalMutation.isError ||
        deleteGoalMutation.isError) && (
        <div className="card mb-5 p-4">
          <p className="text-sm text-red-400">
            Unable to update the goal.
            Please try again.
          </p>
        </div>
      )}

      <section>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Target
                size={18}
                className="shrink-0 text-accent-green"
              />

              <h2 className="text-xl font-semibold text-white">
                Your goals
              </h2>
            </div>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/40">
              Check off each goal as you
              complete it.
            </p>
          </div>

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
              rounded-full
              border
              border-white/[0.07]
              bg-white/[0.03]
              px-3
              py-1.5
            "
          >
            <span className="text-sm font-semibold text-accent-green">
              {pendingGoals.length}
            </span>

            <span className="text-xs text-white/40">
              remaining
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="card p-10 text-center">
              <div
                className="
                  mx-auto
                  mb-4
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-400/10
                  text-accent-green
                "
              >
                <Target size={22} />
              </div>

              <p className="font-medium text-white">
                No goals yet
              </p>

              <p className="mt-2 text-sm text-white/40">
                Add your first goal for{' '}
                {currentYear}.
              </p>
            </div>
          ) : (
            goals.map((goal, index) => {
              const isToggling =
                toggleGoalMutation.isPending &&
                toggleGoalMutation.variables
                  ?.id === goal.id

              const isDeleting =
                deleteGoalMutation.isPending &&
                deleteGoalMutation.variables ===
                  goal.id

              const isUpdating =
                isToggling ||
                isDeleting

              return (
                <motion.article
                  key={goal.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  className={cn(
                    `
                      card
                      relative
                      flex
                      items-center
                      gap-4
                      overflow-hidden
                      p-4
                      sm:p-5
                    `,
                    goal.completed &&
                      'bg-emerald-400/[0.025]',
                    isUpdating &&
                      'pointer-events-none opacity-50',
                  )}
                >
                  <div
                    className={cn(
                      `
                        absolute
                        bottom-0
                        left-0
                        top-0
                        w-1
                      `,
                      goal.completed
                        ? 'bg-accent-green'
                        : 'bg-emerald-400/25',
                    )}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      void handleToggleGoal(
                        goal.id,
                      )
                    }}
                    disabled={isUpdating}
                    aria-label={
                      goal.completed
                        ? `Reopen ${goal.title}`
                        : `Complete ${goal.title}`
                    }
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      transition-colors
                      hover:bg-white/[0.05]
                    "
                  >
                    {isToggling ? (
                      <LoaderCircle
                        size={22}
                        className="animate-spin text-accent-subtle"
                      />
                    ) : goal.completed ? (
                      <CheckCircle2
                        size={24}
                        className="text-accent-green"
                      />
                    ) : (
                      <Circle
                        size={24}
                        className="text-emerald-400/60"
                      />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        `
                          break-words
                          text-base
                          font-semibold
                          leading-snug
                        `,
                        goal.completed
                          ? 'text-white/45 line-through'
                          : 'text-accent-green',
                      )}
                    >
                      {goal.title}
                    </p>

                    {goal.completed ? (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Check
                          size={12}
                          className="text-accent-green"
                        />

                        <p className="text-xs text-white/35">
                          {formatCompletedDate(
                            goal.completedAt,
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-xs text-white/30">
                        Goal for {currentYear}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void handleDeleteGoal(
                        goal.id,
                      )
                    }}
                    disabled={isUpdating}
                    aria-label={`Delete ${goal.title}`}
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-white/25
                      transition-colors
                      hover:bg-red-400/10
                      hover:text-red-400
                      disabled:opacity-40
                    "
                  >
                    {isDeleting ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </motion.article>
              )
            })
          )}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <Sparkles
              size={18}
              className="text-accent-green"
            />

            <h2 className="text-xl font-semibold text-white">
              Achievements this year
            </h2>
          </div>

          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/40">
            Every completed goal becomes
            part of your yearly journey.
          </p>
        </div>

        {completedGoals.length === 0 ? (
          <div
            className="
              card
              flex
              min-h-44
              flex-col
              items-center
              justify-center
              p-8
              text-center
            "
          >
            <div
              className="
                mb-4
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white/[0.04]
                text-white/30
              "
            >
              <Award size={23} />
            </div>

            <p className="font-medium text-white/70">
              No achievements yet
            </p>

            <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/35">
              Your completed goals will
              appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {completedGoals.map(
              (goal, index) => (
                <motion.article
                  key={goal.id}
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="
                    card
                    flex
                    items-start
                    gap-4
                    border-emerald-400/10
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-emerald-400/10
                    "
                  >
                    <Trophy
                      size={19}
                      className="text-accent-green"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-green">
                      Achievement
                    </p>

                    <h3 className="break-words font-semibold leading-snug text-white">
                      {goal.title}
                    </h3>

                    <p className="mt-2 text-xs text-white/35">
                      {formatCompletedDate(
                        goal.completedAt,
                      )}
                    </p>
                  </div>
                </motion.article>
              ),
            )}
          </div>
        )}
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={closeCreateModal}
        title="New Goal"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="goal-title"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              What do you want to achieve?
            </label>

            <input
              id="goal-title"
              className="input"
              placeholder={`Goal for ${currentYear}...`}
              value={title}
              maxLength={200}
              disabled={isCreating}
              autoFocus
              onChange={(event) => {
                setTitle(
                  event.target.value,
                )
              }}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter'
                ) {
                  void handleAddGoal()
                }
              }}
            />

            <p className="mt-2 text-xs text-white/30">
              {title.length}/200
            </p>
          </div>

          {createGoalMutation.isError && (
            <p className="text-sm text-red-400">
              Unable to create the goal.
              Please try again.
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              void handleAddGoal()
            }}
            disabled={
              !title.trim() ||
              isCreating
            }
            className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-40"
          >
            {isCreating && (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            )}

            {isCreating
              ? 'Creating...'
              : 'Create Goal'}
          </button>
        </div>
      </Modal>
    </div>
  )
}