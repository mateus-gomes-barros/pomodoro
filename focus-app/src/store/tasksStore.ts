import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task } from '../types'
import { generateId, getTodayString } from '../utils'

interface TasksState {
  tasks: Task[]
  addTask: (data: Pick<Task, 'title' | 'projectId' | 'priority' | 'estimatedPomodoros'>) => Task
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  reorderTasks: (activeId: string, overId: string) => void
  incrementTaskPomodoro: (id: string) => void
  getTodayTasks: () => Task[]
}

const SEED_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'Review pull requests and leave detailed feedback',
    completed: false,
    projectId: 'proj_1',
    priority: 'high',
    estimatedPomodoros: 2,
    completedPomodoros: 1,
    createdAt: new Date().toISOString(),
    order: 0,
  },
  {
    id: 'task_2',
    title: 'Read chapter 4 of "Deep Work" by Cal Newport',
    completed: true,
    projectId: 'proj_2',
    priority: 'medium',
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    order: 1,
  },
  {
    id: 'task_3',
    title: 'Design new onboarding flow mockups',
    completed: false,
    projectId: 'proj_3',
    priority: 'high',
    estimatedPomodoros: 3,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
    order: 2,
  },
  {
    id: 'task_4',
    title: 'Write unit tests for authentication module',
    completed: false,
    projectId: 'proj_1',
    priority: 'medium',
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
    order: 3,
  },
  {
    id: 'task_5',
    title: 'Prepare weekly team sync agenda',
    completed: true,
    priority: 'low',
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    order: 4,
  },
]

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: SEED_TASKS,

      addTask: (data) => {
        const tasks = get().tasks
        const task: Task = {
          id: generateId(),
          ...data,
          completed: false,
          completedPomodoros: 0,
          createdAt: new Date().toISOString(),
          order: tasks.length,
        }
        set(state => ({ tasks: [...state.tasks, task] }))
        return task
      },

      updateTask: (id, data) => {
        set(state => ({
          tasks: state.tasks.map(t => (t.id === id ? { ...t, ...data } : t)),
        }))
      },

      deleteTask: (id) => {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }))
      },

      toggleTask: (id) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : undefined,
                }
              : t
          ),
        }))
      },

      reorderTasks: (activeId, overId) => {
        set(state => {
          const tasks = [...state.tasks]
          const activeIndex = tasks.findIndex(t => t.id === activeId)
          const overIndex = tasks.findIndex(t => t.id === overId)
          if (activeIndex === -1 || overIndex === -1) return state
          const [removed] = tasks.splice(activeIndex, 1)
          tasks.splice(overIndex, 0, removed)
          return { tasks: tasks.map((t, i) => ({ ...t, order: i })) }
        })
      },

      incrementTaskPomodoro: (id) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
          ),
        }))
      },

      getTodayTasks: () => {
        const today = getTodayString()
        return get()
          .tasks.filter(t => t.createdAt.startsWith(today) || (t.completedAt ?? '').startsWith(today))
          .sort((a, b) => a.order - b.order)
      },
    }),
    { name: 'focus_tasks' }
  )
)