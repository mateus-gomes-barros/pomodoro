import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearAuthDiagnostic,
  getAuthDiagnostic,
  saveAuthDiagnostic,
} from './authDiagnostics'

let storage: Record<string, unknown>

beforeEach(() => {
  storage = {}

  Object.assign(globalThis, {
    chrome: {
      storage: {
        local: {
          get: vi.fn(async (key: string) => ({
            [key]: storage[key],
          })),
          set: vi.fn(async (values: Record<string, unknown>) => {
            Object.assign(storage, values)
          }),
          remove: vi.fn(async (key: string) => {
            delete storage[key]
          }),
        },
      },
    },
  })
})

describe('auth diagnostics', () => {
  it('persists the last OAuth failure so it survives popup closure', async () => {
    await saveAuthDiagnostic({
      stage: 'launch-web-auth-flow',
      message: 'Authorization page could not be loaded.',
      redirectTo: 'https://extension-id.chromiumapp.org/auth',
      createdAt: '2026-09-17T22:00:00.000Z',
    })

    await expect(getAuthDiagnostic()).resolves.toEqual({
      stage: 'launch-web-auth-flow',
      message: 'Authorization page could not be loaded.',
      redirectTo: 'https://extension-id.chromiumapp.org/auth',
      createdAt: '2026-09-17T22:00:00.000Z',
    })
  })

  it('clears an old OAuth diagnostic', async () => {
    storage['focus-extension-auth-diagnostic'] = {
      stage: 'unknown',
      message: 'old error',
      redirectTo: 'https://extension-id.chromiumapp.org/auth',
      createdAt: '2026-09-17T22:00:00.000Z',
    }

    await clearAuthDiagnostic()

    await expect(getAuthDiagnostic()).resolves.toBeNull()
  })
})
