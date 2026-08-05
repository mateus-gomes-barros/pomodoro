import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  CheckCircle2,
  Circle,
  LoaderCircle,
  Plus,
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

  function openCreateModal() {
    createGoalMutation.reset()
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
      <div className="mx-auto max-w-4xl p-6 lg:p-10">
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
      <div className="mx-auto max-w-4xl p-6 lg:p-10">
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
    <div className="mx-auto max-w-4xl p-6 lg:p-10">
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

      <section className="card mb-8 flex items-center justify-between gap-6 p-5">
        <div>
          <p className="text-sm text-accent-subtle">
            Goals done this year
          </p>

          <p className="mt-1 text-xs text-accent-subtle/70">
            {completedGoals.length} of{' '}
            {goals.length} completed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Trophy
            size={22}
            className="text-accent-green"
          />

          <span className="text-3xl font-semibold text-accent-white">
            {completedGoals.length}
          </span>
        </div>
      </section>

      {(toggleGoalMutation.isError ||
        deleteGoalMutation.isError) && (
        <div className="card mb-4 p-4">
          <p className="text-sm text-red-400">
            Unable to update the goal.
            Please try again.
          </p>
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-accent-white">
              Your goals
            </h2>

            <p className="mt-1 text-sm text-accent-subtle">
              Check off each goal as you
              complete it.
            </p>
          </div>

          <span className="text-sm text-accent-subtle">
            {pendingGoals.length} remaining
          </span>
        </div>

        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="card p-10 text-center">
              <Trophy
                size={30}
                className="mx-auto mb-4 text-accent-subtle"
              />

              <p className="font-medium text-accent-white">
                No goals yet
              </p>

              <p className="mt-2 text-sm text-accent-subtle">
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
                <motion.div
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
                    'card flex items-center gap-3 p-4',
                    goal.completed &&
                      'opacity-60',
                    isUpdating &&
                      'pointer-events-none opacity-50',
                  )}
                >
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
                  >
                    {isToggling ? (
                      <LoaderCircle
                        size={21}
                        className="animate-spin text-accent-subtle"
                      />
                    ) : goal.completed ? (
                      <CheckCircle2
                        size={21}
                        className="text-accent-green"
                      />
                    ) : (
                      <Circle
                        size={21}
                        className="text-accent-subtle"
                      />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-accent-white',
                        goal.completed &&
                          'line-through text-accent-subtle',
                      )}
                    >
                      {goal.title}
                    </p>

                    {goal.completed && (
                      <p className="mt-1 text-xs text-accent-subtle">
                        {formatCompletedDate(
                          goal.completedAt,
                        )}
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
                    className="text-accent-subtle transition-colors hover:text-red-400 disabled:opacity-40"
                  >
                    {isDeleting ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </motion.div>
              )
            })
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-accent-white">
            Achievements this year
          </h2>

          <p className="mt-1 text-sm text-accent-subtle">
            Every completed goal becomes
            part of your yearly journey.
          </p>
        </div>

        {completedGoals.length === 0 ? (
          <div className="card p-8 text-center">
            <Award
              size={28}
              className="mx-auto mb-3 text-accent-subtle"
            />

            <p className="text-sm text-accent-subtle">
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
                  className="card flex items-start gap-4 p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-green/10">
                    <Trophy
                      size={18}
                      className="text-accent-green"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-medium text-accent-white">
                      {goal.title}
                    </h3>

                    <p className="mt-1 text-xs text-accent-subtle">
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
          <input
            className="input"
            placeholder={`Goal for ${currentYear}...`}
            value={title}
            maxLength={200}
            disabled={isCreating}
            autoFocus
            onChange={(event) => {
              setTitle(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void handleAddGoal()
              }
            }}
          />

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