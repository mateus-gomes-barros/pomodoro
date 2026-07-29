import { supabase } from '@/lib/supabase'

interface CreateProjectInput {
  name: string
  description: string
  color: string
  emoji: string
}

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data
}

export async function createProject(
  input: CreateProjectInput,
) {
  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'You must be authenticated to create a project.',
    )
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      description:
        input.description.trim() || null,
      color: input.color,
      emoji: input.emoji,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}