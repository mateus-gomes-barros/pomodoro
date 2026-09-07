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
  resolvedUserId?: string,
): Promise<void> {
  const userId =
    resolvedUserId ??
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
        schema_version: 2,
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

interface StoredPeriodRow {
  report_type: FocusMeReportType
  period_start: string
  period_end: string
}

const WEEKLY_BACKFILL_HORIZON = 52
const MONTHLY_BACKFILL_HORIZON = 24

const WEEKLY_BACKFILL_LIMIT = 2
const MONTHLY_BACKFILL_LIMIT = 1

function createPeriodKey(
  type: FocusMeReportType,
  start: string,
  end: string,
): string {
  return `${type}:${start}:${end}`
}

function getPreviousWeekReferences(
  referenceDate: Date,
): Date[] {
  const latestClosedWeek =
    new Date(referenceDate)

  latestClosedWeek.setHours(
    12,
    0,
    0,
    0,
  )

  latestClosedWeek.setDate(
    latestClosedWeek.getDate() - 7,
  )

  return Array.from(
    {
      length:
        WEEKLY_BACKFILL_HORIZON,
    },
    (_, index) => {
      const date =
        new Date(latestClosedWeek)

      date.setDate(
        date.getDate() -
          index * 7,
      )

      return date
    },
  )
}

function getPreviousMonthReferences(
  referenceDate: Date,
): Date[] {
  return Array.from(
    {
      length:
        MONTHLY_BACKFILL_HORIZON,
    },
    (_, index) =>
      new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth() -
          1 -
          index,
        15,
        12,
      ),
  )
}

function asRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >
  }

  return {}
}

function readNumber(
  value: unknown,
): number {
  return typeof value === 'number'
    ? value
    : 0
}

function hasStoredReportActivity(
  report: FocusMeStoredReport,
): boolean {
  const metrics =
    asRecord(report.metrics)

  if (report.type === 'weekly') {
    const focus =
      asRecord(metrics.focus)
    const tasks =
      asRecord(metrics.tasks)
    const projects =
      asRecord(metrics.projects)
    const goals =
      asRecord(metrics.goals)

    return (
      readNumber(
        focus.completedSessions,
      ) > 0 ||
      readNumber(tasks.created) > 0 ||
      readNumber(tasks.completed) > 0 ||
      readNumber(projects.created) > 0 ||
      readNumber(projects.completed) > 0 ||
      readNumber(goals.created) > 0 ||
      readNumber(goals.completed) > 0 ||
      readNumber(
        metrics.activityEvents,
      ) > 0
    )
  }

  const current =
    asRecord(metrics.current)
  const tasks =
    asRecord(current.tasks)
  const projects =
    asRecord(current.projects)
  const goals =
    asRecord(current.goals)
  const coverage =
    asRecord(current.coverage)

  return (
    readNumber(
      current.completedSessions,
    ) > 0 ||
    readNumber(tasks.created) > 0 ||
    readNumber(tasks.completed) > 0 ||
    readNumber(projects.created) > 0 ||
    readNumber(projects.completed) > 0 ||
    readNumber(goals.created) > 0 ||
    readNumber(goals.completed) > 0 ||
    readNumber(
      coverage.activityEvents,
    ) > 0
  )
}

function formatPeriodDate(
  date: Date,
): string {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0')

  const day =
    String(
      date.getDate(),
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getExpectedWeekPeriod(
  referenceDate: Date,
): {
  start: string
  end: string
} {
  const start =
    new Date(referenceDate)

  start.setHours(0, 0, 0, 0)

  const daysSinceMonday =
    (start.getDay() + 6) % 7

  start.setDate(
    start.getDate() -
      daysSinceMonday,
  )

  const end =
    new Date(start)

  end.setDate(
    end.getDate() + 7,
  )

  return {
    start:
      formatPeriodDate(start),
    end:
      formatPeriodDate(end),
  }
}

function getExpectedMonthPeriod(
  referenceDate: Date,
): {
  start: string
  end: string
} {
  const start =
    new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1,
      12,
    )

  const end =
    new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      1,
      12,
    )

  return {
    start:
      formatPeriodDate(start),
    end:
      formatPeriodDate(end),
  }
}

export async function finalizeLatestFocusMeReports(
  referenceDate = new Date(),
): Promise<void> {
  const userId =
    await getCurrentUserId()

  if (!userId) {
    return
  }

  const {
    data: storedPeriods,
    error: storedPeriodsError,
  } = await supabase
    .from('focusme_reports')
    .select(`
      report_type,
      period_start,
      period_end
    `)

  if (storedPeriodsError) {
    throw storedPeriodsError
  }

  const storedKeys =
    new Set(
      (
        storedPeriods as StoredPeriodRow[]
      ).map((period) =>
        createPeriodKey(
          period.report_type,
          period.period_start,
          period.period_end,
        ),
      ),
    )

  let createdWeeklyReports = 0

  for (
    const weekReference of
    getPreviousWeekReferences(
      referenceDate,
    )
  ) {
    if (
      createdWeeklyReports >=
      WEEKLY_BACKFILL_LIMIT
    ) {
      break
    }

    const expectedPeriod =
      getExpectedWeekPeriod(
        weekReference,
      )

    const key =
      createPeriodKey(
        'weekly',
        expectedPeriod.start,
        expectedPeriod.end,
      )

    if (storedKeys.has(key)) {
      continue
    }

    const weeklyReport =
      await getFocusMeWeeklyReport(
        weekReference,
      )

    await saveSnapshot(
      'weekly',
      weeklyReport.period.start,
      weeklyReport.period.end,
      weeklyReport,
      userId,
    )

    storedKeys.add(key)
    createdWeeklyReports += 1
  }

  let createdMonthlyReports = 0

  for (
    const monthReference of
    getPreviousMonthReferences(
      referenceDate,
    )
  ) {
    if (
      createdMonthlyReports >=
      MONTHLY_BACKFILL_LIMIT
    ) {
      break
    }

    const expectedPeriod =
      getExpectedMonthPeriod(
        monthReference,
      )

    const key =
      createPeriodKey(
        'monthly',
        expectedPeriod.start,
        expectedPeriod.end,
      )

    if (storedKeys.has(key)) {
      continue
    }

    const monthlyReport =
      await getFocusMeMonthlyReport(
        monthReference,
      )

    await saveSnapshot(
      'monthly',
      monthlyReport.period.start,
      monthlyReport.period.end,
      monthlyReport,
      userId,
    )

    storedKeys.add(key)
    createdMonthlyReports += 1
  }
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
  )
    .map(mapReport)
    .filter(
      hasStoredReportActivity,
    )
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
