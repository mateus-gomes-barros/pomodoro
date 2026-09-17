import { supabase } from '../lib/supabase'

export type ExtensionTask = {
  id: string
  title: string
  projectId: string | null
  plannedDate: string | null
  dailyPriority: 1 | 2 | 3 | null
  order: number
}

type TaskRow = {
  id: string
  title: string
  project_id: string | null
  planned_date: string | null
  daily_priority: 1 | 2 | 3 | null
  task_order: number
}

export async function getExtensionTasks(): Promise<ExtensionTask[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, project_id, planned_date, daily_priority, task_order')
    .is('deleted_at', null)
    .eq('completed', false)
    .order('task_order', { ascending: true })

  if (error) {
    throw error
  }

  return (data as TaskRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    projectId: row.project_id,
    plannedDate: row.planned_date,
    dailyPriority: row.daily_priority,
    order: row.task_order,
  }))
}
