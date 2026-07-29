import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react'

import { useTasksStore } from '../store/tasksStore'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { cn } from '../utils'

export function TasksPage() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasksStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')

  function handleAdd() {
    if (!title.trim()) return

    addTask({
      title,
      priority: 'medium',
      estimatedPomodoros: 1,
    })

    setTitle('')
    setModalOpen(false)
  }

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <PageHeader
        title="Tasks"
        subtitle={`${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add Task
          </button>
        }
      />

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="card p-8 text-center text-accent-subtle">
            No tasks yet
          </div>
        ) : (
          tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'card p-4 flex items-center gap-3',
                task.completed && 'opacity-60'
              )}
            >
              <button onClick={() => toggleTask(task.id)}>
                {task.completed ? (
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
                    'line-through text-accent-subtle'
                )}
              >
                {task.title}
              </span>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-accent-subtle hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Task"
      >
        <div className="space-y-4">
          <input
            className="input"
            placeholder="Task name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button
            onClick={handleAdd}
            className="btn-primary w-full"
          >
            Create Task
          </button>
        </div>
      </Modal>
    </div>
  )
}