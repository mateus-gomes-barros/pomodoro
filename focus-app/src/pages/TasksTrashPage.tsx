import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  LoaderCircle,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import {
  useDeleteTaskPermanently,
  useRestoreTask,
  useTrashTasks,
} from '@/hooks/tasks/useTasks'

import type {
  Task,
  TaskCategory,
} from '@/types'

import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'

const categoryColors: Record<
  TaskCategory,
  string
> = {
  quick: '#34d399',
  planned: '#64748b',
  urgent: '#f87171',
  long_term: '#a78bfa',
}

function getDaysRemaining(
  scheduledDeletionAt?: string,
) {
  if (!scheduledDeletionAt) {
    return 0
  }

  const difference =
    new Date(
      scheduledDeletionAt,
    ).getTime() - Date.now()

  return Math.max(
    0,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24),
    ),
  )
}

export function TasksTrashPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useTrashTasks()

  const restoreMutation =
    useRestoreTask()

  const permanentDeleteMutation =
    useDeleteTaskPermanently()

  const [
    selectedTask,
    setSelectedTask,
  ] = useState<Task | null>(null)

  const isDeleting =
    permanentDeleteMutation.isPending

  async function handleRestore(
    taskId: string,
  ) {
    try {
      await restoreMutation.mutateAsync(
        taskId,
      )
    } catch (mutationError) {
      console.error(
        'Failed to restore task:',
        mutationError,
      )
    }
  }

  async function handlePermanentDelete() {
    if (
      !selectedTask ||
      isDeleting
    ) {
      return
    }

    try {
      await permanentDeleteMutation.mutateAsync(
        selectedTask.id,
      )

      setSelectedTask(null)
    } catch (mutationError) {
      console.error(
        'Failed to permanently delete task:',
        mutationError,
      )
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-10 lg:px-10 lg:pb-14">
      <button
        type="button"
        onClick={() =>
          navigate('/tasks')
        }
        className="mb-5 flex items-center gap-2 text-sm text-accent-subtle transition-colors hover:text-accent-white"
      >
        <ArrowLeft size={17} />

        {t(
          'tasksPage.trash.back',
        )}
      </button>

      <PageHeader
        title={t(
          'tasksPage.trash.title',
        )}
        subtitle={t(
          'tasksPage.trash.subtitle',
        )}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoaderCircle
            size={28}
            className="animate-spin text-accent-subtle"
          />
        </div>
      ) : isError ? (
        <div className="card p-6">
          <p className="text-sm text-red-400">
            {error instanceof Error
              ? error.message
              : t(
                  'tasksPage.trash.loadError',
                )}
          </p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.035] text-accent-subtle">
            <Trash2 size={20} />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-accent-white">
            {t(
              'tasksPage.trash.empty',
            )}
          </h2>

          <p className="mt-2 text-sm text-accent-subtle">
            {t(
              'tasksPage.trash.emptyDescription',
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(
            (task, index) => {
              const daysRemaining =
                getDaysRemaining(
                  task.scheduledDeletionAt,
                )

              const isRestoring =
                restoreMutation.isPending &&
                restoreMutation.variables ===
                  task.id

              const isDeletingTask =
                isDeleting &&
                permanentDeleteMutation.variables ===
                  task.id

              return (
                <motion.div
                  key={task.id}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.035,
                  }}
                  style={{
                    borderLeftColor:
                      categoryColors[
                        task.category
                      ],
                    borderLeftWidth: 3,
                  }}
                  className="card flex items-start gap-4 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-accent-white">
                      {task.title}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-accent-subtle">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              categoryColors[
                                task.category
                              ],
                          }}
                        />

                        {t(
                          `tasksPage.categories.${task.category}.label`,
                        )}
                      </span>

                      <span>
                        {daysRemaining === 0
                          ? t(
                              'tasksPage.trash.deleteToday',
                            )
                          : t(
                              'tasksPage.trash.daysRemaining',
                              {
                                count:
                                  daysRemaining,
                              },
                            )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void handleRestore(
                        task.id,
                      )
                    }}
                    disabled={
                      isRestoring ||
                      isDeletingTask
                    }
                    aria-label={t(
                      'tasksPage.trash.restoreTask',
                      {
                        title: task.title,
                      },
                    )}
                    className="text-accent-subtle transition hover:text-accent-green disabled:opacity-40"
                  >
                    {isRestoring ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <RotateCcw
                        size={17}
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTask(task)
                    }
                    disabled={
                      isRestoring ||
                      isDeletingTask
                    }
                    aria-label={t(
                      'tasksPage.trash.deleteTask',
                      {
                        title: task.title,
                      },
                    )}
                    className="text-accent-subtle transition hover:text-red-400 disabled:opacity-40"
                  >
                    {isDeletingTask ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </motion.div>
              )
            },
          )}
        </div>
      )}

      <Modal
        isOpen={selectedTask !== null}
        onClose={() => {
          if (!isDeleting) {
            setSelectedTask(null)
          }
        }}
        title={t(
          'tasksPage.trash.confirmTitle',
        )}
      >
        <p className="text-sm leading-relaxed text-accent-subtle">
          {t(
            'tasksPage.trash.confirmDescription',
            {
              title:
                selectedTask?.title ??
                '',
            },
          )}
        </p>

        {permanentDeleteMutation.isError && (
          <p className="mt-4 text-sm text-red-400">
            {t(
              'tasksPage.trash.deleteError',
            )}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() =>
              setSelectedTask(null)
            }
            className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-accent-subtle transition hover:border-white/20 hover:text-accent-white disabled:opacity-40"
          >
            {t(
              'tasksPage.trash.cancel',
            )}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              void handlePermanentDelete()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:opacity-40"
          >
            {isDeleting && (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            )}

            {isDeleting
              ? t(
                  'tasksPage.trash.deleting',
                )
              : t(
                  'tasksPage.trash.deletePermanently',
                )}
          </button>
        </div>
      </Modal>
    </div>
  )
}
