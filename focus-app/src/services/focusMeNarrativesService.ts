import {
  supabase,
} from '@/lib/supabase'

export type FocusMeNarrativeLocale =
  | 'pt-BR'
  | 'en-US'

export type FocusMeNarrativeStatus =
  | 'pending'
  | 'ready'
  | 'failed'

interface FocusMeNarrativeRow {
  id: string
  report_id: string
  locale: FocusMeNarrativeLocale
  status: FocusMeNarrativeStatus
  narrative: string | null
  provider: string | null
  model: string | null
  prompt_version: number
  facts_hash: string | null
  error_code: string | null
  generated_at: string | null
  updated_at: string
}

export interface FocusMeStoredNarrative {
  id: string
  reportId: string
  locale: FocusMeNarrativeLocale
  status: FocusMeNarrativeStatus
  narrative?: string
  provider?: string
  model?: string
  promptVersion: number
  factsHash?: string
  errorCode?: string
  generatedAt?: string
  updatedAt: string
}

function mapNarrative(
  row: FocusMeNarrativeRow,
): FocusMeStoredNarrative {
  return {
    id: row.id,
    reportId: row.report_id,
    locale: row.locale,
    status: row.status,
    narrative:
      row.narrative ?? undefined,
    provider:
      row.provider ?? undefined,
    model:
      row.model ?? undefined,
    promptVersion:
      row.prompt_version,
    factsHash:
      row.facts_hash ?? undefined,
    errorCode:
      row.error_code ?? undefined,
    generatedAt:
      row.generated_at ?? undefined,
    updatedAt:
      row.updated_at,
  }
}

export async function getFocusMeReportNarrative(
  reportId: string,
  locale: FocusMeNarrativeLocale,
): Promise<FocusMeStoredNarrative | null> {
  const {
    data,
    error,
  } = await supabase
    .from('focusme_report_narratives')
    .select(`
      id,
      report_id,
      locale,
      status,
      narrative,
      provider,
      model,
      prompt_version,
      facts_hash,
      error_code,
      generated_at,
      updated_at
    `)
    .eq('report_id', reportId)
    .eq('locale', locale)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
    ? mapNarrative(
        data as FocusMeNarrativeRow,
      )
    : null
}

export interface GenerateFocusMeNarrativeResult {
  status: FocusMeNarrativeStatus
  narrative?: string
  cached?: boolean
  retryAfterSeconds?: number
}

export async function generateFocusMeReportNarrative(
  reportId: string,
  locale: FocusMeNarrativeLocale,
): Promise<GenerateFocusMeNarrativeResult> {
  const {
    data,
    error,
  } = await supabase.functions.invoke(
    'generate-focusme-narrative',
    {
      body: {
        reportId,
        locale,
      },
    },
  )

  if (error) {
    throw error
  }

  return data as
    GenerateFocusMeNarrativeResult
}
