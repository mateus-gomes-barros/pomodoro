import { ExternalLink, Play } from 'lucide-react'

export function App() {
  return (
    <main className="popup-shell">
      <header className="popup-header">
        <div>
          <p className="eyebrow">Focus — Horizon</p>
          <h1>Focus</h1>
        </div>

        <button
          className="icon-button"
          type="button"
          aria-label="Open Focus Horizon"
          title="Open Focus Horizon"
        >
          <ExternalLink size={17} />
        </button>
      </header>

      <section className="timer-card" aria-label="Focus timer">
        <p className="session-label">Focus session</p>
        <strong className="timer-value">25:00</strong>

        <button
          className="primary-button"
          type="button"
          aria-label="Start focus"
        >
          <Play size={18} fill="currentColor" />
          Start focus
        </button>
      </section>

      <section className="status-card">
        <div>
          <p className="status-label">Active task</p>
          <p className="status-value">No task selected</p>
        </div>

        <span className="status-pill">Local mode</span>
      </section>

      <footer className="popup-footer">
        Timer and reminders work even without signing in.
      </footer>
    </main>
  )
}
