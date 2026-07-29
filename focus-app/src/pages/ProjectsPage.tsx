import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LoaderCircle,
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

import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'

import {
  cn,
  formatDuration,
  PROJECT_COLORS,
  PROJECT_EMOJIS,
} from '../utils'

import type { Project } from '../types'

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

  const [modalOpen, setModalOpen] =
    useState(false)

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [deleteConfirmId, setDeleteConfirmId] =
    useState<string | null>(null)

  const [form, setForm] =
    useState<ProjectForm>(EMPTY_FORM)

  const isSaving =
    createProjectMutation.isPending ||
    updateProjectMutation.isPending

  const isDeleting =
    deleteProjectMutation.isPending

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(project: Project) {
    setEditingId(project.id)

    setForm({
      name: project.name,
      description: project.description || '',
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
    if (!form.name.trim() || isSaving) {
      return
    }

    try {
      if (editingId) {
        await updateProjectMutation.mutateAsync({
          projectId: editingId,
          input: form,
        })
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
    if (!deleteConfirmId || isDeleting) {
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
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
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
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
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
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
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
        <EmptyState onAdd={openCreate} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {projects.map(
              (project, index) => (
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
        onClose={closeProjectModal}
        title={
          editingId
            ? 'Edit Project'
            : 'Create Project'
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label block mb-2">
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
                        (currentForm) => ({
                          ...currentForm,
                          emoji,
                        }),
                      )
                    }
                    disabled={isSaving}
                    className={cn(
                      'w-10 h-10 rounded-xl transition-all',
                      'bg-bg-secondary',
                      form.emoji === emoji &&
                        'bg-bg-elevated border border-border-muted',
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
            <label className="label block mb-2">
              Name
            </label>

            <input
              className="input"
              placeholder="Project name"
              value={form.name}
              disabled={isSaving}
              onChange={(event) =>
                setForm(
                  (currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }),
                )
              }
            />
          </div>

          <div>
            <label className="label block mb-2">
              Description
            </label>

            <input
              className="input"
              placeholder="Optional description"
              value={form.description}
              disabled={isSaving}
              onChange={(event) =>
                setForm(
                  (currentForm) => ({
                    ...currentForm,
                    description:
                      event.target.value,
                  }),
                )
              }
            />
          </div>

          <div>
            <label className="label block mb-2">
              Color
            </label>

            <div className="flex gap-2">
              {PROJECT_COLORS.map(
                (color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setForm(
                        (currentForm) => ({
                          ...currentForm,
                          color,
                        }),
                      )
                    }
                    disabled={isSaving}
                    style={{
                      backgroundColor: color,
                    }}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      form.color === color &&
                        'ring-2 ring-white scale-110',
                      isSaving &&
                        'cursor-not-allowed opacity-50',
                    )}
                  />
                ),
              )}
            </div>
          </div>

          {(createProjectMutation.isError ||
            updateProjectMutation.isError) && (
            <p className="text-sm text-red-400">
              Unable to save the project. Please
              try again.
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              void handleSubmit()
            }}
            disabled={
              !form.name.trim() || isSaving
            }
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
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
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => {
          if (!isDeleting) {
            setDeleteConfirmId(null)
          }
        }}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-sm text-accent-subtle">
            Delete this project permanently?
          </p>

          {deleteProjectMutation.isError && (
            <p className="text-sm text-red-400">
              Unable to delete the project. Please
              try again.
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                setDeleteConfirmId(null)
              }
              disabled={isDeleting}
              className="flex-1 btn-ghost disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                void handleDelete()
              }}
              disabled={isDeleting}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
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
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
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
              {project.description}
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

      <div className="mt-5 surface p-3 rounded-xl">
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
      <div className="text-5xl mb-4">
        📁
      </div>

      <h2 className="text-xl font-semibold mb-2">
        No projects yet
      </h2>

      <p className="text-accent-subtle mb-6">
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