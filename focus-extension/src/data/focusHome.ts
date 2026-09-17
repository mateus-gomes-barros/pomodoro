import { supabase } from '../lib/supabase'

export const FOCUS_HOME_KEYS = [
  'aster',
  'atlas',
  'forge',
  'pulse',
  'loom',
  'orbit',
  'tide',
  'ember',
  'nova',
  'prism',
  'vanguard',
  'verdant',
] as const

export type FocusHomeKey = (typeof FOCUS_HOME_KEYS)[number]

export async function getExtensionFocusHome(): Promise<FocusHomeKey | null> {
  const { data, error } = await supabase
    .from('focushome_profiles')
    .select('focushome_key')
    .maybeSingle()

  if (error) {
    throw error
  }

  const key = data?.focushome_key

  return FOCUS_HOME_KEYS.includes(key as FocusHomeKey)
    ? (key as FocusHomeKey)
    : null
}
