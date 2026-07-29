import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Timer } from 'lucide-react'

import { useProjectsStore } from '../store/projectsStore'

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
    projects,
    addProject,
    updateProject,
    deleteProject,
  } = useProjectsStore()

  const [modalOpen, setModalOpen] = useState(false)

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [deleteConfirmId, setDeleteConfirmId] =
    useState<string | null>(null)

  const [form, setForm] =
    useState<ProjectForm>(EMPTY_FORM)

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

  function handleSubmit() {
    if (!form.name.trim()) return

    if (editingId) {
      updateProject(editingId, form)
    } else {
      addProject(form)
    }

    setForm(EMPTY_FORM)
    setEditingId(null)
    setModalOpen(false)
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
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16}/>
            New Project
          </button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState onAdd={openCreate}/>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          <AnimatePresence>

            {projects.map(
              (project,index)=>(
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onEdit={() =>
                    openEdit(project)
                  }
                  onDelete={() =>
                    setDeleteConfirmId(project.id)
                  }
                />
              )
            )}

          </AnimatePresence>

        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
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
                emoji=>(
                  <button
                    key={emoji}
                    onClick={() =>
                      setForm(
                        f=>({
                          ...f,
                          emoji
                        })
                      )
                    }
                    className={cn(
                      'w-10 h-10 rounded-xl transition-all',
                      'bg-bg-secondary',
                      form.emoji===emoji &&
                      'bg-bg-elevated border border-border-muted'
                    )}
                  >
                    {emoji}
                  </button>
                )
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
              onChange={(e)=>
                setForm(
                  f=>({
                    ...f,
                    name:e.target.value
                  })
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
              onChange={(e)=>
                setForm(
                  f=>({
                    ...f,
                    description:e.target.value
                  })
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
                color=>(
                  <button
                    key={color}
                    onClick={() =>
                      setForm(
                        f=>({
                          ...f,
                          color
                        })
                      )
                    }
                    style={{
                      backgroundColor:color
                    }}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      form.color===color &&
                      'ring-2 ring-white scale-110'
                    )}
                  />
                )
              )}

            </div>

          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className="btn-primary w-full disabled:opacity-40"
          >
            {editingId
              ? 'Save Changes'
              : 'Create Project'}
          </button>

        </div>

      </Modal>

      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() =>
          setDeleteConfirmId(null)
        }
        title="Delete Project"
      >

        <div className="space-y-4">

          <p className="text-sm text-accent-subtle">
            Delete this project permanently?
          </p>

          <div className="flex gap-3">

            <button
              onClick={() =>
                setDeleteConfirmId(null)
              }
              className="flex-1 btn-ghost"
            >
              Cancel
            </button>

            <button
              onClick={()=>{
                if(deleteConfirmId){
                  deleteProject(deleteConfirmId)
                }

                setDeleteConfirmId(null)
              }}
              className="flex-1 btn-primary"
            >
              Delete
            </button>

          </div>

        </div>

      </Modal>

    </div>
  )
}

function ProjectCard({
  project,
  index,
  onEdit,
  onDelete,
}:{
  project:Project
  index:number
  onEdit:()=>void
  onDelete:()=>void
}) {

  return(
    <motion.div
      initial={{
        opacity:0,
        y:10
      }}
      animate={{
        opacity:1,
        y:0
      }}
      transition={{
        delay:index*0.06
      }}
      className="card p-5"
    >

      <div className="flex justify-between">

        <div>

          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background:
              project.color+'20'
            }}
          >
            {project.emoji}
          </div>

          <h3 className="mt-3 font-semibold text-accent-white">
            {project.name}
          </h3>

          {!!project.description && (
            <p className="text-sm text-accent-subtle">
              {project.description}
            </p>
          )}

        </div>

        <div className="flex gap-2">

          <button onClick={onEdit}>
            <Pencil size={15}/>
          </button>

          <button onClick={onDelete}>
            <Trash2 size={15}/>
          </button>

        </div>

      </div>

      <div className="mt-5 surface p-3 rounded-xl">

        <div className="flex items-center gap-2">

          <Timer size={14}/>

          <span className="text-sm">
            {formatDuration(
              project.totalFocusMinutes
            )}
          </span>

        </div>

      </div>

    </motion.div>
  )
}

function EmptyState({
  onAdd
}:{
  onAdd:()=>void
}) {

  return(
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
        onClick={onAdd}
        className="btn-primary"
      >
        Create Project
      </button>

    </div>
  )
}