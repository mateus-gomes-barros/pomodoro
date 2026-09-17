export async function showTimerCompleteNotification() {
  await chrome.notifications.create('focus-timer-complete', {
    type: 'basic',
    iconUrl: 'icon-128.png',
    title: 'Focus session complete',
    message: 'Your focus session is complete. Time for a break.',
    priority: 2,
  })
}
