import { beforeEach, describe, expect, it, vi } from 'vitest'

const { from } = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: { from },
}))

import { getExtensionProjects } from './projects'
import { getExtensionTasks } from './tasks'

function createQuery(result: unknown) {
  const query = {
    select: vi.fn(),
    is: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
  }

  query.select.mockReturnValue(query)
  query.is.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.order.mockResolvedValue(result)

  return query
}

describe('extension account data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads active tasks using the Focus 6.0 fields needed by the popup', async () => {
    const query = createQuery({
      data: [
        {
          id: 'task-1',
          title: 'Ship extension',
          project_id: 'project-1',
          planned_date: '2026-09-17',
          daily_priority: 1,
          task_order: 2,
        },
      ],
      error: null,
    })

    from.mockReturnValue(query)

    await expect(getExtensionTasks()).resolves.toEqual([
      {
        id: 'task-1',
        title: 'Ship extension',
        projectId: 'project-1',
        plannedDate: '2026-09-17',
        dailyPriority: 1,
        order: 2,
      },
    ])

    expect(from).toHaveBeenCalledWith('tasks')
  })

  it('loads active projects for task context', async () => {
    const query = createQuery({
      data: [
        {
          id: 'project-1',
          name: 'Focus 6.0',
          emoji: '🎯',
          color: '#10b981',
          status: 'active',
          created_at: '2026-09-17T00:00:00.000Z',
        },
      ],
      error: null,
    })

    from.mockReturnValue(query)

    await expect(getExtensionProjects()).resolves.toEqual([
      {
        id: 'project-1',
        name: 'Focus 6.0',
        emoji: '🎯',
        color: '#10b981',
      },
    ])

    expect(from).toHaveBeenCalledWith('projects')
  })
})
