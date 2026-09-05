import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  LoaderCircle,
  Plus,
  Trash2,
} from 'lucide-react'

import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useToggleTask,
} from '@/hooks/tasks/useTasks'

import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { cn } from '../utils'

export function TasksPage() {
  const { t } = useTranslation()

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useTasks()

  const createTaskMutation = useCreateTask()
  const toggleTaskMutation = useToggleTask()
  const deleteTaskMutation = useDeleteTask()

  const [modalOpen, setModalOpen] =
    useState(false)

  const [title, setTitle] = useState('')

  const isCreating =
    createTaskMutation.isPending

  function openCreateModal() {
    createTaskMutation.reset()
    setModalOpen(true)
  }

  function closeCreateModal() {
    if (isCreating) {
      return
    }

    setTitle('')
    setModalOpen(false)
  }

  async function handleAdd() {
    if (!title.trim() || isCreating) {
      return
    }

    try {
      await createTaskMutation.mutateAsync({
        title,
        priority: 'medium',
        estimatedPomodoros: 1,
      })

      setTitle('')
      setModalOpen(false)
    } catch (mutationError) {
      console.error(
        'Failed to create task:',
        mutationError,
      )
    }
  }

  async function handleToggle(
    taskId: string,
  ) {
    const task = tasks.find(
      (currentTask) =>
        currentTask.id === taskId,
    )

    if (!task) {
      return
    }

    try {
      await toggleTaskMutation.mutateAsync(
        task,
      )
    } catch (mutationError) {
      console.error(
        'Failed to toggle task:',
        mutationError,
      )
    }
  }

  async function handleDelete(
    taskId: string,
  ) {
    try {
      await deleteTaskMutation.mutateAsync(
        taskId,
      )
    } catch (mutationError) {
      console.error(
        'Failed to delete task:',
        mutationError,
      )
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-6 lg:px-10 lg:pb-10">
        <PageHeader
          title={t('tasksPage.title')}
          subtitle={t('tasksPage.loading')}
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
      <div className="mx-auto max-w-2xl px-6 pb-6 lg:px-10 lg:pb-10">
        <PageHeader
          title={t('tasksPage.title')}
          subtitle={t('tasksPage.unableToLoad')}
        />

        <div className="card p-6">
          <p className="text-sm text-accent-subtle">
            {error instanceof Error
              ? error.message
              : t('tasksPage.loadError')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-6 lg:px-10 lg:pb-10">
      <PageHeader
        title={t('tasksPage.title')}
        subtitle={t(
          'tasksPage.count',
          { count: tasks.length },
        )}
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />

            {t('tasksPage.add')}
          </button>
        }
      />

      {(toggleTaskMutation.isError ||
        deleteTaskMutation.isError) && (
        <div className="card p-4 mb-4">
          <p className="text-sm text-red-400">
            {t('tasksPage.updateError')}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="card p-8 text-center text-accent-subtle">
            {t('tasksPage.empty')}
          </div>
        ) : (
          tasks.map((task, index) => {
            const isToggling =
              toggleTaskMutation.isPending &&
              toggleTaskMutation.variables
                ?.id === task.id

            const isDeleting =
              deleteTaskMutation.isPending &&
              deleteTaskMutation.variables ===
                task.id

            const isUpdating =
              isToggling || isDeleting

            return (
              <motion.div
                key={task.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                transition={{
                  delay: index * 0.05,
                }}
                className={cn(
                  'card p-4 flex items-center gap-3',
                  task.completed &&
                    'opacity-60',
                  isUpdating &&
                    'pointer-events-none opacity-50',
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    void handleToggle(task.id)
                  }}
                  disabled={isUpdating}
                  aria-label={
                    task.completed
                      ? t(
                          'tasksPage.reopen',
                          { title: task.title },
                        )
                      : t(
                          'tasksPage.complete',
                          { title: task.title },
                        )
                  }
                >
                  {isToggling ? (
                    <LoaderCircle
                      size={20}
                      className="animate-spin text-accent-subtle"
                    />
                  ) : task.completed ? (
                    <CheckCircle2
                      size={20}
                      className="text-accent-green"
                    />
                  ) : (
                    <Circle
                      size={20}
                      className="text-accent-subtle"
                    />
                  )}
                </button>

                <span
                  className={cn(
                    'flex-1 text-accent-white',
                    task.completed &&
                      'line-through text-accent-subtle',
                  )}
                >
                  {task.title}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    void handleDelete(task.id)
                  }}
                  disabled={isUpdating}
                  aria-label={t(
                    'tasksPage.delete',
                    { title: task.title },
                  )}
                  className="text-accent-subtle hover:text-red-400 transition-colors disabled:opacity-40"
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

      <Modal
        isOpen={modalOpen}
        onClose={closeCreateModal}
        title={t('tasksPage.newTask')}
      >
        <div className="space-y-4">
          <input
            className="input"
            placeholder={t('tasksPage.placeholder')}
            value={title}
            disabled={isCreating}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void handleAdd()
              }
            }}
          />

          {createTaskMutation.isError && (
            <p className="text-sm text-red-400">
              {t('tasksPage.createError')}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              void handleAdd()
            }}
            disabled={
              !title.trim() || isCreating
            }
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isCreating && (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            )}

            {isCreating
              ? t('tasksPage.creating')
              : t('tasksPage.create')}
          </button>
        </div>
      </Modal>
    </div>
  )
}