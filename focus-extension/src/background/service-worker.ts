import { performGoogleSignIn } from '../auth/authService'
import {
  showHydrationNotification,
  showTimerCompleteNotification,
} from './notifications'
import { HYDRATION_ALARM_NAME } from '../reminders/reminderStore'
import { completeTimerState } from '../timer/timerStore'
import {
  TIMER_ALARM_NAME,
  readTimerState,
  writeTimerState,
} from '../timer/timerStorage'

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === HYDRATION_ALARM_NAME) {
    await showHydrationNotification()
    return
  }

  if (alarm.name !== TIMER_ALARM_NAME) {
    return
  }

  const state = await readTimerState()

  if (state.status !== 'running') {
    return
  }

  await writeTimerState(completeTimerState(state))
  await showTimerCompleteNotification()
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'focus-auth-google') {
    return false
  }

  void performGoogleSignIn()
    .then(() => {
      sendResponse({ ok: true })
    })
    .catch((error: unknown) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : 'Google sign in failed.',
      })
    })

  return true
})
