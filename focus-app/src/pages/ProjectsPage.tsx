import { useState } from 'react'
import {
  AnimatePresence,
  motion,
} from 'framer-motion'
import {
  LoaderCircle,
  Palette,
  Pencil,
  Plus,
  Timer,
  Trash2,
} from 'lucide-react'

import {
  useCreateProject,
  useDeleteProject,
  useProjects,
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

export function ProjectsPage() {
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
          title="Projects"
          subtitle="Loading projects"
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
          title="Projects"
          subtitle="Unable to load projects"
        />

        <div className="card p-6">
          <p className="text-sm text-accent-subtle">
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred while loading your projects.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-6 lg:px-10 lg:pb-10">
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} active ${
          projects.length === 1
            ? 'project'
            : 'projects'
        }`}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />

            New Project
          </button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          onAdd={openCreate}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {projects.map(
              (
                project,
                index,
              ) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
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
            ? 'Edit Project'
            : 'Create Project'
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">
              Icon
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
                    aria-label={`Select ${emoji} icon`}
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
              Name
            </label>

            <input
              className="input"
              placeholder="Project name"
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
              Description
            </label>

            <input
              className="input"
              placeholder="Optional description"
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
              Color
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
                    aria-label={`Select project color ${color}`}
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
                  Custom
                </span>

                <input
                  type="color"
                  value={
                    form.color
                  }
                  disabled={isSaving}
                  aria-label="Choose a custom project color"
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
              Choose a preset or
              create your own color.
            </p>
          </div>

          {(createProjectMutation.isError ||
            updateProjectMutation.isError) && (
            <p className="text-sm text-red-400">
              Unable to save the
              project. Please try
              again.
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
              ? 'Saving...'
              : editingId
                ? 'Save Changes'
                : 'Create Project'}
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
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-sm text-accent-subtle">
            Delete this project
            permanently?
          </p>

          {deleteProjectMutation.isError && (
            <p className="text-sm text-red-400">
              Unable to delete the
              project. Please try
              again.
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
              Cancel
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
                ? 'Deleting...'
                : 'Delete'}
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
  onEdit: () => void
  onDelete: () => void
}

function ProjectCard({
  project,
  index,
  onEdit,
  onDelete,
}: ProjectCardProps) {
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
      className="card p-5"
    >
      <div className="flex justify-between">
        <div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
            style={{
              background: `${project.color}20`,
            }}
          >
            {project.emoji}
          </div>

          <h3 className="mt-3 font-semibold text-accent-white">
            {project.name}
          </h3>

          {project.description && (
            <p className="text-sm text-accent-subtle">
              {
                project.description
              }
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${project.name}`}
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${project.name}`}
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
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 text-5xl">
        📁
      </div>

      <h2 className="mb-2 text-xl font-semibold">
        No projects yet
      </h2>

      <p className="mb-6 text-accent-subtle">
        Create your first project
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="btn-primary"
      >
        Create Project
      </button>
    </div>
  )
}