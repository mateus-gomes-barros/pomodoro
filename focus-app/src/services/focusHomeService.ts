import type {
  FocusHomeKey,
} from '@/components/focusme/FocusHomeSymbol'
import { supabase } from '@/lib/supabase'
import type {
  FocusHomeClassification,
  FocusHomeTemporalExpression,
  FocusHomeTrait,
} from '@/services/focusHomeClassifier'
import type {
  FocusHomeArchetype,
} from '@/services/focusHomeCatalog'
import type {
  FocusMeStoredReport,
} from '@/services/focusMeReportsService'

export type FocusHomeAssessmentType =
  | 'initial'
  | 'retest'

interface FocusHomeProfileRow {
  user_id: string
  current_assessment_id: string
  focushome_key: FocusHomeKey
  archetype: FocusHomeArchetype
  secondary_archetype:
    FocusHomeArchetype
  temporal_expression:
    FocusHomeTemporalExpression
  traits: FocusHomeTrait[]
  confidence: number
  first_awarded_at: string
  last_assessed_at: string
  updated_at: string
}

export interface FocusHomeProfile {
  userId: string
  currentAssessmentId: string
  focusHome: FocusHomeKey
  archetype:
    FocusHomeArchetype
  secondaryArchetype:
    FocusHomeArchetype
  temporalExpression:
    FocusHomeTemporalExpression
  traits: FocusHomeTrait[]
  confidence: number
  firstAwardedAt: string
  lastAssessedAt: string
  updatedAt: string
}

function mapProfile(
  row: FocusHomeProfileRow,
): FocusHomeProfile {
  return {
    userId: row.user_id,
    currentAssessmentId:
      row.current_assessment_id,
    focusHome:
      row.focushome_key,
    archetype: row.archetype,
    secondaryArchetype:
      row.secondary_archetype,
    temporalExpression:
      row.temporal_expression,
    traits: row.traits ?? [],
    confidence: row.confidence,
    firstAwardedAt:
      row.first_awarded_at,
    lastAssessedAt:
      row.last_assessed_at,
    updatedAt: row.updated_at,
  }
}

export async function getFocusHomeProfile():
  Promise<FocusHomeProfile | null> {
  const { data, error } =
    await supabase
      .from('focushome_profiles')
      .select(`
        user_id,
        current_assessment_id,
        focushome_key,
        archetype,
        secondary_archetype,
        temporal_expression,
        traits,
        confidence,
        first_awarded_at,
        last_assessed_at,
        updated_at
      `)
      .maybeSingle()

  if (error) {
    throw error
  }

  return data
    ? mapProfile(
        data as FocusHomeProfileRow,
      )
    : null
}

interface FocusHomeAssessmentRow {
  id: string
  report_id: string
  assessment_type:
    FocusHomeAssessmentType
  focushome_key: FocusHomeKey
  archetype: FocusHomeArchetype
  secondary_archetype:
    FocusHomeArchetype
  temporal_expression:
    FocusHomeTemporalExpression
  traits: FocusHomeTrait[]
  confidence: number
  created_at: string
}

interface FocusHomeAssessmentPeriodRow {
  id: string
  period_start: string
  period_end: string
}

export interface FocusHomeAssessment {
  id: string
  reportId: string
  assessmentType:
    FocusHomeAssessmentType
  focusHome: FocusHomeKey
  archetype: FocusHomeArchetype
  secondaryArchetype:
    FocusHomeArchetype
  temporalExpression:
    FocusHomeTemporalExpression
  traits: FocusHomeTrait[]
  confidence: number
  periodStart?: string
  periodEnd?: string
  createdAt: string
}

export async function getFocusHomeAssessments():
  Promise<FocusHomeAssessment[]> {
  const {
    data: assessments,
    error: assessmentsError,
  } = await supabase
    .from('focushome_assessments')
    .select(`
      id,
      report_id,
      assessment_type,
      focushome_key,
      archetype,
      secondary_archetype,
      temporal_expression,
      traits,
      confidence,
      created_at
    `)
    .order('created_at', {
      ascending: false,
    })

  if (assessmentsError) {
    throw assessmentsError
  }

  const rows =
    (assessments ??
      []) as FocusHomeAssessmentRow[]

  if (rows.length === 0) {
    return []
  }

  const reportIds =
    [...new Set(
      rows.map(
        (assessment) =>
          assessment.report_id,
      ),
    )]

  const {
    data: reportPeriods,
    error: reportsError,
  } = await supabase
    .from('focusme_reports')
    .select(`
      id,
      period_start,
      period_end
    `)
    .in('id', reportIds)

  if (reportsError) {
    throw reportsError
  }

  const periodsByReport =
    new Map(
      (
        (reportPeriods ??
          []) as
          FocusHomeAssessmentPeriodRow[]
      ).map((report) => [
        report.id,
        report,
      ]),
    )

  return rows.map(
    (assessment) => {
      const period =
        periodsByReport.get(
          assessment.report_id,
        )

      return {
        id: assessment.id,
        reportId:
          assessment.report_id,
        assessmentType:
          assessment.assessment_type,
        focusHome:
          assessment.focushome_key,
        archetype:
          assessment.archetype,
        secondaryArchetype:
          assessment.secondary_archetype,
        temporalExpression:
          assessment.temporal_expression,
        traits:
          assessment.traits ?? [],
        confidence:
          assessment.confidence,
        periodStart:
          period?.period_start,
        periodEnd:
          period?.period_end,
        createdAt:
          assessment.created_at,
      }
    },
  )
}

export async function getFocusHomeAssessmentReportId(
  assessmentId: string,
): Promise<string | null> {
  const { data, error } =
    await supabase
      .from('focushome_assessments')
      .select('report_id')
      .eq('id', assessmentId)
      .maybeSingle()

  if (error) {
    throw error
  }

  return data?.report_id ?? null
}

export async function assessFocusHome(
  report: FocusMeStoredReport,
  assessmentType:
    FocusHomeAssessmentType,
): Promise<{
  assessmentId: string
  classification:
    FocusHomeClassification
}> {
  if (report.type !== 'monthly') {
    throw new Error(
      'FocushoMe requires a monthly report.',
    )
  }

  if (report.schemaVersion < 2) {
    throw new Error(
      'This report predates behavioral analysis.',
    )
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    'assess-focushome',
    {
      body: {
        reportId: report.id,
        assessmentType,
      },
    },
  )

  if (error) {
    throw error
  }

  const result = data as {
    assessmentId?: unknown
    classification?: unknown
  }

  if (
    typeof result.assessmentId !==
      'string' ||
    !result.classification ||
    typeof result.classification !==
      'object'
  ) {
    throw new Error(
      'FocushoMe assessment returned an invalid response.',
    )
  }

  return {
    assessmentId:
      result.assessmentId,
    classification:
      result.classification as
        FocusHomeClassification,
  }
}
