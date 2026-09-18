const NOTIFICATION_ICON = 'focus-clock-approved-128.png'

export async function showTimerCompleteNotification() {
  await chrome.notifications.create('focus-timer-complete', {
    type: 'basic',
    iconUrl: chrome.runtime.getURL(NOTIFICATION_ICON),
    title: 'Focus session complete',
    message: 'Your focus session is complete. Time for a break.',
    priority: 2,
  })
}

export async function showHydrationNotification() {
  await chrome.notifications.create('focus-hydration-reminder', {
    type: 'basic',
    iconUrl: chrome.runtime.getURL(NOTIFICATION_ICON),
    title: 'Time to hydrate',
    message: 'Take a moment to drink some water.',
    priority: 1,
  })
}
