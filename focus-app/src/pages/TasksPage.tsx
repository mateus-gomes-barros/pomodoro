import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useProjects } from '@/hooks/projects/useProjects'
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useToggleTask,
  useTrashTasks,
  useUpdateTask,
} from '@/hooks/tasks/useTasks'

import type {
  Task,
  TaskCategory,
} from '@/types'

import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { cn } from '../utils'

type StatusFilter =
  | 'pending'
  | 'completed'
  | 'all'

type CategoryFilter =
  | TaskCategory
  | 'all'

const categoryColors: Record<
  TaskCategory,
  string
> = {
  quick: '#34d399',
  planned: '#64748b',
  urgent: '#f87171',
  long_term: '#a78bfa',
}

const categoryOptions: TaskCategory[] = [
  'quick',
  'planned',
  'urgent',
  'long_term',
]

const statusOptions: StatusFilter[] = [
  'pending',
  'completed',
  'all',
]

function toLocalDateInput(
  value?: string,
) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function TasksPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useTasks()

  const {
    data: trashTasks = [],
  } = useTrashTasks()

  const {
    data: projects = [],
  } = useProjects()

  const createTaskMutation =
    useCreateTask()
  const updateTaskMutation =
    useUpdateTask()
  const toggleTaskMutation =
    useToggleTask()
  const deleteTaskMutation =
    useDeleteTask()

  const [modalOpen, setModalOpen] =
    useState(false)

  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] =
    useState<TaskCategory>('planned')
  const [projectId, setProjectId] =
    useState('')
  const [dueDate, setDueDate] =
    useState('')
  const [
    estimatedPomodoros,
    setEstimatedPomodoros,
  ] = useState(1)

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('pending')

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState<CategoryFilter>('all')

  const selectableProjects =
    projects.filter(
      (project) =>
        project.status === 'active' ||
        (
          editingTaskId !== null &&
          project.id === projectId
        ),
    )

  const isCreating =
    createTaskMutation.isPending
  const isEditing =
    updateTaskMutation.isPending
  const isSaving =
    isCreating || isEditing

  const visibleTasks = tasks.filter(
    (task) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed'
          ? task.completed
          : !task.completed)

      const matchesCategory =
        categoryFilter === 'all' ||
        task.category === categoryFilter

      return (
        matchesStatus &&
        matchesCategory
      )
    },
  )

  function resetForm() {
    setEditingTaskId(null)
    setTitle('')
    setCategory('planned')
    setProjectId('')
    setDueDate('')
    setEstimatedPomodoros(1)
  }

  function openCreateModal() {
    createTaskMutation.reset()
    updateTaskMutation.reset()
    resetForm()
    setModalOpen(true)
  }

  function openEditModal(task: Task) {
    createTaskMutation.reset()
    updateTaskMutation.reset()

    setEditingTaskId(task.id)
    setTitle(task.title)
    setCategory(task.category)
    setProjectId(task.projectId ?? '')
    setDueDate(
      toLocalDateInput(task.dueAt),
    )
    setEstimatedPomodoros(
      task.estimatedPomodoros,
    )

    setModalOpen(true)
  }

  function closeTaskModal() {
    if (isSaving) {
      return
    }

    resetForm()
    setModalOpen(false)
  }

  async function handleSave() {
    const trimmedTitle = title.trim()

    if (
      !trimmedTitle ||
      isSaving
    ) {
      return
    }

    try {
      if (editingTaskId) {
        await updateTaskMutation.mutateAsync({
          taskId: editingTaskId,
          input: {
            title: trimmedTitle,
            category,
            projectId,
            dueAt: dueDate
              ? new Date(
                  dueDate +
                    'T23:59:59',
                ).toISOString()
              : null,
            estimatedPomodoros,
          },
        })
      } else {
        await createTaskMutation.mutateAsync({
          title: trimmedTitle,
          category,
          projectId,
          dueAt: dueDate
            ? new Date(
                dueDate + 'T23:59:59',
              ).toISOString()
            : null,
          priority: 'medium',
          estimatedPomodoros,
        })
      }

      resetForm()
      setModalOpen(false)
    } catch (mutationError) {
      console.error(
        editingTaskId
          ? 'Failed to update task:'
          : 'Failed to create task:',
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
        'Failed to move task to trash:',
        mutationError,
      )
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-6 lg:px-10 lg:pb-10">
        <PageHeader
          title={t('tasksPage.title')}
          subtitle={t(
            'tasksPage.loading',
          )}
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
      <div className="mx-auto max-w-3xl px-6 pb-6 lg:px-10 lg:pb-10">
        <PageHeader
          title={t('tasksPage.title')}
          subtitle={t(
            'tasksPage.unableToLoad',
          )}
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
    <div className="mx-auto max-w-3xl px-6 pb-6 lg:px-10 lg:pb-10">
      <PageHeader
        title={t('tasksPage.title')}
        subtitle={t(
          'tasksPage.count',
          { count: tasks.length },
        )}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                navigate('/tasks/trash')
              }
              aria-label={t(
                'tasksPage.trash.open',
              )}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-accent-subtle transition hover:border-white/20 hover:text-accent-white"
            >
              <Trash2 size={17} />

              {trashTasks.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-green px-1 text-[10px] font-bold text-black">
                  {trashTasks.length > 99
                    ? '99+'
                    : trashTasks.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} />

              <span className="hidden sm:inline">
                {t('tasksPage.add')}
              </span>

              <span className="sm:hidden">
                {t('tasksPage.addShort')}
              </span>
            </button>
          </div>
        }
      />

      {(toggleTaskMutation.isError ||
        deleteTaskMutation.isError) && (
        <div className="card mb-4 p-4">
          <p className="text-sm text-red-400">
            {t('tasksPage.updateError')}
          </p>
        </div>
      )}

      <div className="card mb-5 space-y-4 p-3">
        <div
          className="grid grid-cols-3 gap-1 rounded-xl bg-black/15 p-1"
          role="group"
          aria-label={t(
            'tasksPage.filters.status',
          )}
        >
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() =>
                setStatusFilter(status)
              }
              className={cn(
                'rounded-lg px-2 py-2 text-xs font-medium transition',
                statusFilter === status
                  ? 'bg-white/[0.08] text-accent-white'
                  : 'text-accent-subtle hover:text-accent-white',
              )}
            >
              {t(
                `tasksPage.filters.${status}`,
              )}
            </button>
          ))}
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() =>
              setCategoryFilter('all')
            }
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition',
              categoryFilter === 'all'
                ? 'border-accent-green/50 bg-accent-green/10 text-accent-green'
                : 'border-white/10 text-accent-subtle hover:border-white/20',
            )}
          >
            {t(
              'tasksPage.categories.all',
            )}
          </button>

          {categoryOptions.map(
            (option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setCategoryFilter(option)
                }
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  categoryFilter === option
                    ? 'border-accent-green/50 bg-accent-green/10 text-accent-white'
                    : 'border-white/10 text-accent-subtle hover:border-white/20',
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      categoryColors[option],
                  }}
                />

                {t(
                  `tasksPage.categories.${option}.label`,
                )}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="space-y-3">
        {visibleTasks.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-accent-subtle">
              {tasks.length === 0
                ? t('tasksPage.empty')
                : t(
                    'tasksPage.filters.empty',
                  )}
            </p>

            {tasks.length === 0 && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 text-sm font-medium text-accent-green"
              >
                {t(
                  'tasksPage.emptyAction',
                )}
              </button>
            )}
          </div>
        ) : (
          visibleTasks.map(
            (task, index) => {
              const isToggling =
                toggleTaskMutation.isPending &&
                toggleTaskMutation.variables
                  ?.id === task.id

              const isDeleting =
                deleteTaskMutation.isPending &&
                deleteTaskMutation.variables ===
                  task.id

              const isEditingTask =
                updateTaskMutation.isPending &&
                updateTaskMutation.variables
                  ?.taskId === task.id

              const isUpdating =
                isToggling ||
                isDeleting ||
                isEditingTask

              const project = projects.find(
                (currentProject) =>
                  currentProject.id ===
                  task.projectId,
              )

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
                  className={cn(
                    'card flex items-start gap-3 p-4',
                    task.completed &&
                      'opacity-60',
                    isUpdating &&
                      'pointer-events-none opacity-50',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      void handleToggle(
                        task.id,
                      )
                    }}
                    disabled={isUpdating}
                    className="mt-0.5 shrink-0"
                    aria-label={
                      task.completed
                        ? t(
                            'tasksPage.reopen',
                            {
                              title:
                                task.title,
                            },
                          )
                        : t(
                            'tasksPage.complete',
                            {
                              title:
                                task.title,
                            },
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

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'break-words text-sm font-medium text-accent-white',
                        task.completed &&
                          'line-through text-accent-subtle',
                      )}
                    >
                      {task.title}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-accent-subtle">
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

                      {project && (
                        <span>
                          {project.emoji}{' '}
                          {project.name}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Clock3 size={11} />

                        {t(
                          'tasksPage.pomodoroCount',
                          {
                            count:
                              task.estimatedPomodoros,
                          },
                        )}
                      </span>

                      {task.dueAt && (
                        <span className="flex items-center gap-1 text-amber-200/70">
                          <CalendarDays
                            size={11}
                          />
                          {t(
                            'tasksPage.dueDateLabel',
                            {
                              date:
                                new Date(
                                  task.dueAt,
                                ).toLocaleDateString(
                                  i18n.language,
                                  {
                                    day: '2-digit',
                                    month: 'short',
                                  },
                                ),
                            },
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(task)
                    }
                    disabled={isUpdating}
                    aria-label={t(
                      'tasksPage.edit',
                      {
                        title: task.title,
                      },
                    )}
                    className="mt-0.5 shrink-0 text-accent-subtle transition-colors hover:text-accent-white disabled:opacity-40"
                  >
                    {isEditingTask ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Pencil size={16} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      void handleDelete(
                        task.id,
                      )
                    }}
                    disabled={isUpdating}
                    aria-label={t(
                      'tasksPage.trash.move',
                      {
                        title: task.title,
                      },
                    )}
                    className="mt-0.5 shrink-0 text-accent-subtle transition-colors hover:text-red-400 disabled:opacity-40"
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
            },
          )
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeTaskModal}
        title={t(
          editingTaskId
            ? 'tasksPage.editTask'
            : 'tasksPage.newTask',
        )}
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-xs font-medium text-accent-subtle"
            >
              {t(
                'tasksPage.form.name',
              )}
            </label>

            <input
              id="task-title"
              className="input"
              placeholder={t(
                'tasksPage.placeholder',
              )}
              value={title}
              disabled={isSaving}
              maxLength={160}
              autoFocus
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter'
                ) {
                  void handleSave()
                }
              }}
            />
          </div>

          <div>
            <span className="mb-2 block text-xs font-medium text-accent-subtle">
              {t(
                'tasksPage.form.category',
              )}
            </span>

            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      setCategory(option)
                    }
                    className={cn(
                      'rounded-xl border p-3 text-left transition disabled:opacity-50',
                      category === option
                        ? 'border-accent-green/50 bg-accent-green/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20',
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-accent-white">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            categoryColors[
                              option
                            ],
                        }}
                      />

                      {t(
                        `tasksPage.categories.${option}.label`,
                      )}
                    </span>

                    <span className="mt-1.5 block text-[11px] leading-relaxed text-accent-subtle">
                      {t(
                        `tasksPage.categories.${option}.description`,
                      )}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="task-project"
              className="mb-2 block text-xs font-medium text-accent-subtle"
            >
              {t(
                'tasksPage.form.project',
              )}
            </label>

            <select
              id="task-project"
              value={projectId}
              disabled={isSaving}
              onChange={(event) =>
                setProjectId(
                  event.target.value,
                )
              }
              className="input"
            >
              <option value="">
                {t(
                  'tasksPage.form.noProject',
                )}
              </option>

              {selectableProjects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.emoji}{' '}
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="task-due-date"
                className="block text-xs font-medium text-accent-subtle"
              >
                {t(
                  'tasksPage.form.dueDate',
                )}
              </label>
              <span className="text-[10px] uppercase tracking-[0.12em] text-accent-subtle/60">
                {t(
                  'tasksPage.form.optional',
                )}
              </span>
            </div>

            <input
              id="task-due-date"
              type="date"
              className="input"
              value={dueDate}
              disabled={isSaving}
              onChange={(event) =>
                setDueDate(
                  event.target.value,
                )
              }
            />

            <p className="mt-2 text-[11px] leading-relaxed text-accent-subtle">
              {t(
                'tasksPage.form.dueDateHelp',
              )}
            </p>
          </div>

          <div>
            <label
              htmlFor="task-estimate"
              className="mb-2 block text-xs font-medium text-accent-subtle"
            >
              {t(
                'tasksPage.form.estimate',
              )}
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={
                  isSaving ||
                  estimatedPomodoros <= 1
                }
                onClick={() =>
                  setEstimatedPomodoros(
                    (value) =>
                      Math.max(
                        1,
                        value - 1,
                      ),
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-accent-white transition hover:border-white/20 disabled:opacity-30"
              >
                −
              </button>

              <div className="flex h-10 min-w-24 items-center justify-center rounded-xl bg-white/[0.035] px-4 text-sm font-medium text-accent-white">
                {t(
                  'tasksPage.pomodoroCount',
                  {
                    count:
                      estimatedPomodoros,
                  },
                )}
              </div>

              <button
                type="button"
                disabled={
                  isSaving ||
                  estimatedPomodoros >= 20
                }
                onClick={() =>
                  setEstimatedPomodoros(
                    (value) =>
                      Math.min(
                        20,
                        value + 1,
                      ),
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-accent-white transition hover:border-white/20 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {(createTaskMutation.isError ||
            updateTaskMutation.isError) && (
            <p className="text-sm text-red-400">
              {t(
                editingTaskId
                  ? 'tasksPage.editError'
                  : 'tasksPage.createError',
              )}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              void handleSave()
            }}
            disabled={
              !title.trim() || isSaving
            }
            className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-40"
          >
            {isSaving && (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            )}

            {editingTaskId
              ? isEditing
                ? t(
                    'tasksPage.saving',
                  )
                : t('tasksPage.save')
              : isCreating
                ? t(
                    'tasksPage.creating',
                  )
                : t(
                    'tasksPage.create',
                  )}
          </button>
        </div>
      </Modal>
    </div>
  )
}
