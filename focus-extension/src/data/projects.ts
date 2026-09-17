import { supabase } from '../lib/supabase'

export type ExtensionProject = {
  id: string
  name: string
  emoji: string
  color: string
}

type ProjectRow = {
  id: string
  name: string
  emoji: string
  color: string | null
  status: string
  created_at: string
}

export async function getExtensionProjects(): Promise<ExtensionProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, emoji, color, status, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return (data as ProjectRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    color: row.color ?? '#10b981',
  }))
}
