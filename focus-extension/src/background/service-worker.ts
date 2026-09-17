import {
  TIMER_ALARM_NAME,
  readTimerState,
  writeTimerState,
} from '../timer/timerStorage'

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== TIMER_ALARM_NAME) {
    return
  }

  const state = await readTimerState()

  if (state.status !== 'running') {
    return
  }

  await writeTimerState({
    ...state,
    status: 'idle',
    secondsLeft: 0,
    endsAt: null,
  })
})
