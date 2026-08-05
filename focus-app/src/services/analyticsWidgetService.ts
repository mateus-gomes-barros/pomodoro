import {
    Capacitor,
    registerPlugin,
  } from '@capacitor/core'
  
  import {
    buildAnalyticsTrends,
    buildMonthlyFocusHistory,
  } from '@/hooks/analytics/useAnalytics'
  
  import type {
    MonthlyFocusHistoryItem,
    MonthlyProjectSummary,
    ProjectTrend,
  } from '@/hooks/analytics/useAnalytics'
  
  import type {
    PomodoroSession,
    Project,
  } from '@/types'
  
  interface AnalyticsWidgetPlugin {
    saveSnapshot(
      options: {
        payload: string
      },
    ): Promise<{
      saved: boolean
    }>
  }
  
  interface AnalyticsWidgetProjectSnapshot {
    id: string
    name: string
    emoji: string
    color: string
    focusMinutes: number
    sharePercentage: number
  }
  
  interface AnalyticsWidgetMonthlyProjectSnapshot {
    id: string
    name: string
    emoji: string
    color: string
    focusMinutes: number
  }
  
  interface AnalyticsWidgetPeriodSnapshot {
    totalFocusMinutes: number
    activeDays: number
    topProject:
      | AnalyticsWidgetProjectSnapshot
      | null
    topProjects:
      AnalyticsWidgetProjectSnapshot[]
  }
  
  interface AnalyticsWidgetMonthSnapshot {
    key: string
    label: string
    fullLabel: string
    focusMinutes: number
    sessionsCompleted: number
    activeDays: number
    topProject:
      | AnalyticsWidgetMonthlyProjectSnapshot
      | null
  }
  
  interface AnalyticsWidgetHistorySnapshot {
    totalFocusMinutes: number
    averageMonthlyFocusMinutes: number
    latestMonthChangePercentage:
      | number
      | null
    bestMonth:
      | AnalyticsWidgetMonthSnapshot
      | null
    topProject:
      | AnalyticsWidgetMonthlyProjectSnapshot
      | null
    months: AnalyticsWidgetMonthSnapshot[]
  }
  
  interface AnalyticsWidgetSnapshot {
    schemaVersion: number
    week: AnalyticsWidgetPeriodSnapshot
    month: AnalyticsWidgetPeriodSnapshot
    sixMonthHistory: AnalyticsWidgetHistorySnapshot
    updatedAt: string
  }
  
  const analyticsWidgetPlugin =
    registerPlugin<AnalyticsWidgetPlugin>(
      'AnalyticsWidgetBridge',
    )
  
  function isAvailable(): boolean {
    return (
      Capacitor.isNativePlatform() &&
      Capacitor.getPlatform() === 'ios'
    )
  }
  
  function mapTrendProject(
    project: ProjectTrend,
  ): AnalyticsWidgetProjectSnapshot {
    return {
      id: project.id,
      name: project.name,
      emoji: project.emoji,
      color: project.color,
      focusMinutes:
        project.currentFocusMinutes,
      sharePercentage:
        project.sharePercentage,
    }
  }
  
  function mapMonthlyProject(
    project:
      | MonthlyProjectSummary
      | null,
  ): AnalyticsWidgetMonthlyProjectSnapshot | null {
    if (!project) {
      return null
    }
  
    return {
      id: project.id,
      name: project.name,
      emoji: project.emoji,
      color: project.color,
      focusMinutes:
        project.focusMinutes,
    }
  }
  
  function mapHistoryMonth(
    month: MonthlyFocusHistoryItem,
  ): AnalyticsWidgetMonthSnapshot {
    return {
      key: month.key,
      label: month.label,
      fullLabel: month.fullLabel,
      focusMinutes:
        month.focusMinutes,
      sessionsCompleted:
        month.sessionsCompleted,
      activeDays: month.activeDays,
      topProject:
        mapMonthlyProject(
          month.topProject,
        ),
    }
  }
  
  export async function saveAnalyticsWidgetSnapshot(
    sessions: PomodoroSession[],
    projects: Project[],
  ): Promise<void> {
    if (!isAvailable()) {
      return
    }
  
    const workSessions =
      sessions.filter(
        (session) =>
          session.type === 'work',
      )
  
    const weeklyTrends =
      buildAnalyticsTrends(
        projects,
        workSessions,
        'week',
      )
  
    const monthlyTrends =
      buildAnalyticsTrends(
        projects,
        workSessions,
        'month',
      )
  
    const monthlyHistory =
      buildMonthlyFocusHistory(
        projects,
        workSessions,
      )
  
    const mappedHistoryMonths =
      monthlyHistory.months.map(
        mapHistoryMonth,
      )
  
    const mappedBestMonth =
      monthlyHistory.bestMonth
        ? mapHistoryMonth(
            monthlyHistory.bestMonth,
          )
        : null
  
    const snapshot:
      AnalyticsWidgetSnapshot = {
        schemaVersion: 1,
  
        week: {
          totalFocusMinutes:
            weeklyTrends.totalFocusMinutes,
  
          activeDays:
            weeklyTrends.activeDays,
  
          topProject:
            weeklyTrends.topProjects[0]
              ? mapTrendProject(
                  weeklyTrends.topProjects[0],
                )
              : null,
  
          topProjects:
            weeklyTrends.topProjects
              .slice(0, 3)
              .map(mapTrendProject),
        },
  
        month: {
          totalFocusMinutes:
            monthlyTrends.totalFocusMinutes,
  
          activeDays:
            monthlyTrends.activeDays,
  
          topProject:
            monthlyTrends.topProjects[0]
              ? mapTrendProject(
                  monthlyTrends.topProjects[0],
                )
              : null,
  
          topProjects:
            monthlyTrends.topProjects
              .slice(0, 3)
              .map(mapTrendProject),
        },
  
        sixMonthHistory: {
          totalFocusMinutes:
            monthlyHistory.totalFocusMinutes,
  
          averageMonthlyFocusMinutes:
            monthlyHistory
              .averageMonthlyFocusMinutes,
  
          latestMonthChangePercentage:
            monthlyHistory
              .latestMonthChangePercentage,
  
          bestMonth:
            mappedBestMonth,
  
          topProject:
            mapMonthlyProject(
              monthlyHistory.topProject,
            ),
  
          months:
            mappedHistoryMonths,
        },
  
        updatedAt:
          new Date().toISOString(),
      }
  
    try {
      await analyticsWidgetPlugin
        .saveSnapshot({
          payload: JSON.stringify(
            snapshot,
          ),
        })
    } catch (error) {
      console.error(
        'Failed to update the Analytics widgets:',
        error,
      )
    }
  }