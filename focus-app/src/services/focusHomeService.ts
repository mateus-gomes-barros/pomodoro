import type {
  FocusHomeKey,
} from '@/components/focusme/FocusHomeSymbol'
import { supabase } from '@/lib/supabase'
import {
  classifyFocusHome,
  FOCUS_HOME_CLASSIFIER_VERSION,
  type FocusHomeClassification,
  type FocusHomeTemporalExpression,
  type FocusHomeTrait,
} from '@/services/focusHomeClassifier'
import type {
  FocusHomeArchetype,
} from '@/services/focusHomeCatalog'
import {
  evaluateFocusHomeEligibility,
  FOCUSHOME_ELIGIBILITY_VERSION,
} from '@/services/focusMeEligibility'
import type {
  FocusMeMonthlyReport,
} from '@/services/focusMeMonthlyService'
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

  const monthly =
    report.metrics as
      FocusMeMonthlyReport

  const eligibility =
    evaluateFocusHomeEligibility(
      monthly.current,
      true,
    )

  if (!eligibility.eligible) {
    throw new Error(
      'This report is not eligible for a FocushoMe assessment.',
    )
  }

  const classification =
    classifyFocusHome(
      monthly.current,
    )

  const { data, error } =
    await supabase.rpc(
      'award_focushome',
      {
        p_report_id: report.id,
        p_assessment_type:
          assessmentType,
        p_result:
          classification,
        p_classifier_version:
          FOCUS_HOME_CLASSIFIER_VERSION,
        p_eligibility_version:
          FOCUSHOME_ELIGIBILITY_VERSION,
      },
    )

  if (error) {
    throw error
  }

  return {
    assessmentId:
      data as string,
    classification,
  }
}
