import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import {
  AnimatePresence,
  motion,
} from 'framer-motion'
import {
  CheckCircle2,
  LoaderCircle,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Timer,
  Trash2,
} from 'lucide-react'

import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useToggleProjectStatus,
  useUpdateProject,
} from '@/hooks/projects/useProjects'

import {
  Modal,
} from '../components/ui/Modal'
import {
  PageHeader,
} from '../components/ui/PageHeader'

import {
  cn,
  formatDuration,
  PROJECT_COLORS,
  PROJECT_EMOJIS,
} from '../utils'

import type {
  Project,
  ProjectStatus,
} from '../types'

interface ProjectForm {
  name: string
  description: string
  color: string
  emoji: string
}

const EMPTY_FORM: ProjectForm = {
  name: '',
  description: '',
  color: PROJECT_COLORS[0],
  emoji: PROJECT_EMOJIS[0],
}

const STATUS_FILTERS: Array<
  ProjectStatus | 'all'
> = [
  'active',
  'completed',
  'all',
]

export function ProjectsPage() {
  const { t } = useTranslation()

  const {
    data: projects = [],
    isLoading,
    isError,
    error,
  } = useProjects()

  const createProjectMutation =
    useCreateProject()

  const updateProjectMutation =
    useUpdateProject()

  const toggleProjectStatusMutation =
    useToggleProjectStatus()

  const deleteProjectMutation =
    useDeleteProject()

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false)

  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(
    null,
  )

  const [
    deleteConfirmId,
    setDeleteConfirmId,
  ] = useState<string | null>(
    null,
  )

  const [
    form,
    setForm,
  ] = useState<ProjectForm>(
    EMPTY_FORM,
  )

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    ProjectStatus | 'all'
  >('active')

  const activeProjectsCount =
    projects.filter(
      (project) =>
        project.status === 'active',
    ).length

  const visibleProjects =
    statusFilter === 'all'
      ? projects
      : projects.filter(
          (project) =>
            project.status ===
            statusFilter,
        )

  const isSaving =
    createProjectMutation.isPending ||
    updateProjectMutation.isPending

  const isDeleting =
    deleteProjectMutation.isPending

  const isCustomColor =
    !PROJECT_COLORS.some(
      (presetColor) =>
        presetColor.toLowerCase() ===
        form.color.toLowerCase(),
    )

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(
    project: Project,
  ) {
    setEditingId(project.id)

    setForm({
      name: project.name,
      description:
        project.description || '',
      color: project.color,
      emoji: project.emoji,
    })

    setModalOpen(true)
  }

  function closeProjectModal() {
    if (isSaving) {
      return
    }

    setModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit() {
    if (
      !form.name.trim() ||
      isSaving
    ) {
      return
    }

    try {
      if (editingId) {
        await updateProjectMutation.mutateAsync(
          {
            projectId: editingId,
            input: form,
          },
        )
      } else {
        await createProjectMutation.mutateAsync(
          form,
        )
      }

      setForm(EMPTY_FORM)
      setEditingId(null)
      setModalOpen(false)
    } catch (mutationError) {
      console.error(
        'Failed to save project:',
        mutationError,
      )
    }
  }

  async function handleToggleStatus(
    project: Project,
  ) {
    try {
      await toggleProjectStatusMutation.mutateAsync(
        project,
      )
    } catch (mutationError) {
      console.error(
        'Failed to update project status:',
        mutationError,
      )
    }
  }

  async function handleDelete() {
    if (
      !deleteConfirmId ||
      isDeleting
    ) {
      return
    }

    try {
      await deleteProjectMutation.mutateAsync(
        deleteConfirmId,
      )

      setDeleteConfirmId(null)
    } catch (mutationError) {
      console.error(
        'Failed to delete project:',
        mutationError,
      )
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-6 lg:px-10 lg:pb-10">
        <PageHeader
          title={t('projectsPage.title')}
          subtitle={t('projectsPage.loading')}
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
      <div className="mx-auto max-w-5xl px-6 pb-6 lg:px-10 lg:pb-10">
        <PageHeader
          title={t('projectsPage.title')}
          subtitle={t('projectsPage.unableToLoad')}
        />

        <div className="card p-6">
          <p className="text-sm text-accent-subtle">
            {error instanceof Error
              ? error.message
              : t('projectsPage.loadError')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-6 lg:px-10 lg:pb-10">
      <PageHeader
        title={t('projectsPage.title')}
        subtitle={t(
          'projectsPage.active',
          {
            count:
              activeProjectsCount,
          },
        )}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />

            {t(
              'projectsPage.newProject',
            )}
          </button>
        }
      />

      <div
        className="card mb-5 grid grid-cols-3 gap-1 p-1"
        role="group"
        aria-label={t(
          'projectsPage.filters.label',
        )}
      >
        {STATUS_FILTERS.map(
          (filter) => (
            <button
              key={filter}
              type="button"
              onClick={() =>
                setStatusFilter(filter)
              }
              className={cn(
                'rounded-xl px-3 py-2.5 text-xs font-medium transition',
                statusFilter === filter
                  ? 'bg-white/[0.08] text-accent-white'
                  : 'text-accent-subtle hover:text-accent-white',
              )}
            >
              {t(
                `projectsPage.filters.${filter}`,
              )}
            </button>
          ),
        )}
      </div>

      {toggleProjectStatusMutation.isError && (
        <div className="card mb-4 p-4">
          <p className="text-sm text-red-400">
            {t(
              'projectsPage.statusUpdateError',
            )}
          </p>
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          onAdd={openCreate}
        />
      ) : visibleProjects.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-accent-subtle">
            {t(
              'projectsPage.filters.empty',
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {visibleProjects.map(
              (
                project,
                index,
              ) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isToggling={
                    toggleProjectStatusMutation.isPending &&
                    toggleProjectStatusMutation.variables
                      ?.id ===
                      project.id
                  }
                  onToggle={() => {
                    void handleToggleStatus(
                      project,
                    )
                  }}
                  onEdit={() =>
                    openEdit(project)
                  }
                  onDelete={() =>
                    setDeleteConfirmId(
                      project.id,
                    )
                  }
                />
              ),
            )}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={
          closeProjectModal
        }
        title={
          editingId
            ? t(
                'projectsPage.editProject',
              )
            : t(
                'projectsPage.createProject',
              )
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">
              {t('projectsPage.form.icon')}
            </label>

            <div className="flex flex-wrap gap-2">
              {PROJECT_EMOJIS.map(
                (emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() =>
                      setForm(
                        (
                          currentForm,
                        ) => ({
                          ...currentForm,
                          emoji,
                        }),
                      )
                    }
                    disabled={
                      isSaving
                    }
                    aria-label={t(
                      'projectsPage.form.selectIcon',
                      { emoji },
                    )}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all',
                      'bg-bg-secondary',
                      form.emoji ===
                        emoji &&
                        'border border-border-muted bg-bg-elevated scale-105',
                      isSaving &&
                        'cursor-not-allowed opacity-50',
                    )}
                  >
                    {emoji}
                  </button>
                ),
              )}
            </div>
          </div>

          <div>
            <label className="label mb-2 block">
              {t('projectsPage.form.name')}
            </label>

            <input
              className="input"
              placeholder={t('projectsPage.form.namePlaceholder')}
              value={form.name}
              disabled={isSaving}
              onChange={(event) =>
                setForm(
                  (
                    currentForm,
                  ) => ({
                    ...currentForm,
                    name:
                      event.target
                        .value,
                  }),
                )
              }
            />
          </div>

          <div>
            <label className="label mb-2 block">
              {t('projectsPage.form.description')}
            </label>

            <input
              className="input"
              placeholder={t('projectsPage.form.descriptionPlaceholder')}
              value={
                form.description
              }
              disabled={isSaving}
              onChange={(event) =>
                setForm(
                  (
                    currentForm,
                  ) => ({
                    ...currentForm,
                    description:
                      event.target
                        .value,
                  }),
                )
              }
            />
          </div>

          <div>
            <label className="label mb-2 block">
              {t('projectsPage.form.color')}
            </label>

            <div className="flex flex-wrap items-center gap-2">
              {PROJECT_COLORS.map(
                (color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setForm(
                        (
                          currentForm,
                        ) => ({
                          ...currentForm,
                          color,
                        }),
                      )
                    }
                    disabled={
                      isSaving
                    }
                    aria-label={t(
                      'projectsPage.form.selectColor',
                      { color },
                    )}
                    style={{
                      backgroundColor:
                        color,
                    }}
                    className={cn(
                      'h-8 w-8 rounded-full transition-all',
                      form.color.toLowerCase() ===
                        color.toLowerCase() &&
                        'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#111111]',
                      isSaving &&
                        'cursor-not-allowed opacity-50',
                    )}
                  />
                ),
              )}

              <label
                className={cn(
                  'relative flex h-8 cursor-pointer items-center gap-2 overflow-hidden rounded-full',
                  'border border-white/[0.1] bg-white/[0.04] px-3',
                  'text-[11px] font-medium text-white/55 transition-all',
                  'hover:border-white/20 hover:bg-white/[0.07] hover:text-white/80',
                  isCustomColor &&
                    'scale-[1.03] border-white/35 bg-white/[0.08] text-white ring-2 ring-white/60',
                  isSaving &&
                    'pointer-events-none cursor-not-allowed opacity-50',
                )}
              >
                <span
                  className="h-4 w-4 flex-shrink-0 rounded-full border border-white/25"
                  style={{
                    backgroundColor:
                      form.color,
                  }}
                />

                <Palette size={13} />

                <span>
                  {t('projectsPage.form.custom')}
                </span>

                <input
                  type="color"
                  value={
                    form.color
                  }
                  disabled={isSaving}
                  aria-label={t('projectsPage.form.customColor')}
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        currentForm,
                      ) => ({
                        ...currentForm,
                        color:
                          event.target
                            .value,
                      }),
                    )
                  }
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>

              <span className="ml-1 font-mono text-[11px] uppercase text-white/35">
                {form.color}
              </span>
            </div>

            <p className="mt-2 text-[10px] text-white/25">
              {t(
                'projectsPage.form.colorHelp',
              )}
            </p>
          </div>

          {(createProjectMutation.isError ||
            updateProjectMutation.isError) && (
            <p className="text-sm text-red-400">
              {t(
                'projectsPage.form.saveError',
              )}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              void handleSubmit()
            }}
            disabled={
              !form.name.trim() ||
              isSaving
            }
            className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-40"
          >
            {isSaving && (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            )}

            {isSaving
              ? t(
                  'projectsPage.form.saving',
                )
              : editingId
                ? t(
                    'projectsPage.form.saveChanges',
                  )
                : t(
                    'projectsPage.form.create',
                  )}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(
          deleteConfirmId,
        )}
        onClose={() => {
          if (!isDeleting) {
            setDeleteConfirmId(
              null,
            )
          }
        }}
        title={t('projectsPage.delete.title')}
      >
        <div className="space-y-4">
          <p className="text-sm text-accent-subtle">
            {t(
              'projectsPage.delete.confirmation',
            )}
          </p>

          {deleteProjectMutation.isError && (
            <p className="text-sm text-red-400">
              {t(
                'projectsPage.delete.error',
              )}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                setDeleteConfirmId(
                  null,
                )
              }
              disabled={
                isDeleting
              }
              className="btn-ghost flex-1 disabled:opacity-40"
            >
              {t(
                'projectsPage.delete.cancel',
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                void handleDelete()
              }}
              disabled={
                isDeleting
              }
              className="btn-primary flex flex-1 items-center justify-center gap-2 disabled:opacity-40"
            >
              {isDeleting && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {isDeleting
                ? t(
                    'projectsPage.delete.deleting',
                  )
                : t(
                    'projectsPage.delete.delete',
                  )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

interface ProjectCardProps {
  project: Project
  index: number
  isToggling: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

function ProjectCard({
  project,
  index,
  isToggling,
  onToggle,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const { t, i18n } =
    useTranslation()

  const isCompleted =
    project.status === 'completed'

  const completedDate =
    project.completedAt
      ? new Intl.DateTimeFormat(
          i18n.language,
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          },
        ).format(
          new Date(
            project.completedAt,
          ),
        )
      : null

  return (
    <motion.div
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
        delay: index * 0.06,
      }}
      className={cn(
        'card p-5 transition',
        isCompleted &&
          'border-accent-green/20',
      )}
    >
      <div className="flex justify-between gap-4">
        <div className="min-w-0">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
            style={{
              background: `${project.color}20`,
            }}
          >
            {project.emoji}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h3 className="break-words font-semibold text-accent-white">
              {project.name}
            </h3>

            {isCompleted && (
              <span className="rounded-full border border-accent-green/30 bg-accent-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-green">
                {t(
                  'projectsPage.card.completed',
                )}
              </span>
            )}
          </div>

          {project.description && (
            <p className="mt-1 break-words text-sm text-accent-subtle">
              {project.description}
            </p>
          )}

          {completedDate && (
            <p className="mt-2 text-[11px] text-accent-green/80">
              {t(
                'projectsPage.card.completedOn',
                {
                  date:
                    completedDate,
                },
              )}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-3 text-accent-subtle">
          <button
            type="button"
            onClick={onToggle}
            disabled={isToggling}
            aria-label={t(
              isCompleted
                ? 'projectsPage.card.reopen'
                : 'projectsPage.card.complete',
              {
                name: project.name,
              },
            )}
            className="transition hover:text-accent-green disabled:opacity-40"
          >
            {isToggling ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            ) : isCompleted ? (
              <RotateCcw size={15} />
            ) : (
              <CheckCircle2
                size={15}
              />
            )}
          </button>

          <button
            type="button"
            onClick={onEdit}
            disabled={isToggling}
            aria-label={t(
              'projectsPage.card.edit',
              {
                name: project.name,
              },
            )}
            className="transition hover:text-accent-white disabled:opacity-40"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isToggling}
            aria-label={t(
              'projectsPage.card.delete',
              {
                name: project.name,
              },
            )}
            className="transition hover:text-red-400 disabled:opacity-40"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="surface mt-5 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <Timer size={14} />

          <span className="text-sm">
            {formatDuration(
              project.totalFocusMinutes,
            )}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

interface EmptyStateProps {
  onAdd: () => void
}

function EmptyState({
  onAdd,
}: EmptyStateProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 text-5xl">
        📁
      </div>

      <h2 className="mb-2 text-xl font-semibold">
        {t(
          'projectsPage.empty.title',
        )}
      </h2>

      <p className="mb-6 text-accent-subtle">
        {t(
          'projectsPage.empty.description',
        )}
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="btn-primary"
      >
        {t(
          'projectsPage.empty.action',
        )}
      </button>
    </div>
  )
}