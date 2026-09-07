import { supabase } from '@/lib/supabase'
import {
  getFocusMeMonthlyReport,
} from '@/services/focusMeMonthlyService'
import {
  getFocusMeWeeklyReport,
} from '@/services/focusMeService'

export type FocusMeReportType =
  | 'weekly'
  | 'monthly'

interface FocusMeReportRow {
  id: string
  report_type: FocusMeReportType
  period_start: string
  period_end: string
  metrics: unknown
  schema_version: number
  narrative: string | null
  narrative_locale: string | null
  focushome_key: string | null
  focushome_traits: string[]
  generated_at: string
  updated_at: string
}

export interface FocusMeStoredReport {
  id: string
  type: FocusMeReportType
  periodStart: string
  periodEnd: string
  metrics: unknown
  schemaVersion: number
  narrative?: string
  narrativeLocale?: string
  focusHomeKey?: string
  focusHomeTraits: string[]
  generatedAt: string
  updatedAt: string
}

function mapReport(
  row: FocusMeReportRow,
): FocusMeStoredReport {
  return {
    id: row.id,
    type: row.report_type,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    metrics: row.metrics,
    schemaVersion:
      row.schema_version,
    narrative:
      row.narrative ?? undefined,
    narrativeLocale:
      row.narrative_locale ??
      undefined,
    focusHomeKey:
      row.focushome_key ??
      undefined,
    focusHomeTraits:
      row.focushome_traits ?? [],
    generatedAt:
      row.generated_at,
    updatedAt:
      row.updated_at,
  }
}

async function getCurrentUserId():
  Promise<string | null> {
  const {
    data: {
      session,
    },
    error,
  } =
    await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session?.user.id ?? null
}

async function saveSnapshot(
  type: FocusMeReportType,
  periodStart: string,
  periodEnd: string,
  metrics: unknown,
): Promise<void> {
  const userId =
    await getCurrentUserId()

  if (!userId) {
    return
  }

  const { error } = await supabase
    .from('focusme_reports')
    .upsert(
      {
        user_id: userId,
        report_type: type,
        period_start:
          periodStart,
        period_end:
          periodEnd,
        metrics,
        schema_version: 1,
      },
      {
        onConflict:
          'user_id,report_type,period_start,period_end',
        ignoreDuplicates: true,
      },
    )

  if (error) {
    throw error
  }
}

function hasWeeklyActivity(
  report: Awaited<
    ReturnType<
      typeof getFocusMeWeeklyReport
    >
  >,
): boolean {
  return (
    report.focus.completedSessions > 0 ||
    report.tasks.created > 0 ||
    report.tasks.completed > 0 ||
    report.projects.created > 0 ||
    report.projects.completed > 0 ||
    report.goals.created > 0 ||
    report.goals.completed > 0 ||
    report.activityEvents > 0
  )
}

function hasMonthlyActivity(
  report: Awaited<
    ReturnType<
      typeof getFocusMeMonthlyReport
    >
  >,
): boolean {
  const month = report.current

  return (
    month.completedSessions > 0 ||
    month.tasks.created > 0 ||
    month.tasks.completed > 0 ||
    month.projects.created > 0 ||
    month.projects.completed > 0 ||
    month.goals.created > 0 ||
    month.goals.completed > 0 ||
    month.coverage.activityEvents > 0
  )
}

export async function finalizeLatestFocusMeReports(
  referenceDate = new Date(),
): Promise<void> {
  const previousWeekReference =
    new Date(referenceDate)

  previousWeekReference.setDate(
    previousWeekReference.getDate() -
      7,
  )

  const previousMonthReference =
    new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - 1,
      15,
    )

  const [
    weeklyReport,
    monthlyReport,
  ] = await Promise.all([
    getFocusMeWeeklyReport(
      previousWeekReference,
    ),
    getFocusMeMonthlyReport(
      previousMonthReference,
    ),
  ])

  const operations:
    Promise<void>[] = []

  if (
    hasWeeklyActivity(
      weeklyReport,
    )
  ) {
    operations.push(
      saveSnapshot(
        'weekly',
        weeklyReport.period.start,
        weeklyReport.period.end,
        weeklyReport,
      ),
    )
  }

  if (
    hasMonthlyActivity(
      monthlyReport,
    )
  ) {
    operations.push(
      saveSnapshot(
        'monthly',
        monthlyReport.period.start,
        monthlyReport.period.end,
        monthlyReport,
      ),
    )
  }

  await Promise.all(operations)
}

export async function getFocusMeReports(
  type?: FocusMeReportType,
): Promise<FocusMeStoredReport[]> {
  let query = supabase
    .from('focusme_reports')
    .select(`
      id,
      report_type,
      period_start,
      period_end,
      metrics,
      schema_version,
      narrative,
      narrative_locale,
      focushome_key,
      focushome_traits,
      generated_at,
      updated_at
    `)
    .order('period_start', {
      ascending: false,
    })

  if (type) {
    query = query.eq(
      'report_type',
      type,
    )
  }

  const { data, error } =
    await query

  if (error) {
    throw error
  }

  return (
    data as FocusMeReportRow[]
  ).map(mapReport)
}

export async function getFocusMeReport(
  reportId: string,
): Promise<FocusMeStoredReport> {
  const { data, error } =
    await supabase
      .from('focusme_reports')
      .select(`
        id,
        report_type,
        period_start,
        period_end,
        metrics,
        schema_version,
        narrative,
        narrative_locale,
        focushome_key,
        focushome_traits,
        generated_at,
        updated_at
      `)
      .eq('id', reportId)
      .single()

  if (error) {
    throw error
  }

  return mapReport(
    data as FocusMeReportRow,
  )
}
