import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from '../types'

import {
  generateId,
  PROJECT_COLORS,
  PROJECT_EMOJIS
} from '../utils'

interface ProjectsState {
  projects: Project[]
  addProject: (data: Pick<Project, 'name' | 'color' | 'emoji' | 'description'>) => Project
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void
  incrementSession: (id: string, minutes: number) => void
  getProject: (id: string) => Project | undefined
}

const SEED_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'Deep Work',
    color: PROJECT_COLORS[0],
    emoji: '💻',
    description: 'Core development & engineering tasks',
    totalSessions: 24,
    completedSessions: 18,
    totalFocusMinutes: 450,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_2',
    name: 'Research',
    color: PROJECT_COLORS[1],
    emoji: '📚',
    description: 'Reading, notes, and learning',
    totalSessions: 12,
    completedSessions: 10,
    totalFocusMinutes: 250,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_3',
    name: 'Design',
    color: PROJECT_COLORS[2],
    emoji: '🎨',
    description: 'UI/UX and visual design work',
    totalSessions: 8,
    completedSessions: 5,
    totalFocusMinutes: 175,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: SEED_PROJECTS,

      addProject: (data) => {
        const project: Project = {
          id: generateId(),
          ...data,
          totalSessions: 0,
          completedSessions: 0,
          totalFocusMinutes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set(state => ({ projects: [...state.projects, project] }))
        return project
      },

      updateProject: (id, data) => {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      deleteProject: (id) => {
        set(state => ({ projects: state.projects.filter(p => p.id !== id) }))
      },

      incrementSession: (id, minutes) => {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id
              ? {
                  ...p,
                  totalSessions: p.totalSessions + 1,
                  completedSessions: p.completedSessions + 1,
                  totalFocusMinutes: p.totalFocusMinutes + minutes,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }))
      },

      getProject: (id) => get().projects.find(p => p.id === id),
    }),
    { name: 'focus_projects' }
  )
)

export { PROJECT_COLORS, PROJECT_EMOJIS }