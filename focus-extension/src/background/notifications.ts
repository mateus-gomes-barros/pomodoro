export async function showTimerCompleteNotification() {
  await chrome.notifications.create('focus-timer-complete', {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icon-128.svg'),
    title: 'Focus session complete',
    message: 'Your focus session is complete. Time for a break.',
    priority: 2,
  })
}
