import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Layout } from './components/layout/Layout'

import { DashboardPage } from './pages/DashboardPage'
import { TimerPage } from './pages/TimerPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { TasksPage } from './pages/TasksPage'
import { StreaksPage } from './pages/StreaksPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SettingsPage } from './pages/SettingsPage'

import { useTimer } from './hooks/useTimer'

function TimerDriver() {
  useTimer()
  return null
}

function App() {
  return (
    <BrowserRouter>
      <TimerDriver />

      <Routes>
        <Route element={<Layout />}>

          <Route
            index
            element={<DashboardPage />}
          />

          <Route
            path="timer"
            element={<TimerPage />}
          />

          <Route
            path="projects"
            element={<ProjectsPage />}
          />

          <Route
            path="tasks"
            element={<TasksPage />}
          />

          <Route
            path="streaks"
            element={<StreaksPage />}
          />

          <Route
            path="analytics"
            element={<AnalyticsPage />}
          />

          <Route
            path="settings"
            element={<SettingsPage />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App