import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom'

import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './components/layout/Layout'

import { useTimer } from './hooks/useTimer'

import { AnalyticsPage } from './pages/AnalyticsPage'
import { DashboardPage } from './pages/DashboardPage'
import { GoalsPage } from './pages/GoalsPage'
import { LoginPage } from './pages/LoginPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { SettingsPage } from './pages/SettingsPage'
import { StreaksPage } from './pages/StreaksPage'
import { TasksPage } from './pages/TasksPage'
import { TimerPage } from './pages/TimerPage'

function TimerDriver() {
  useTimer()

  return null
}

function App() {
  return (
    <BrowserRouter>
      <TimerDriver />

      <Routes>
        <Route
          path="login"
          element={<LoginPage />}
        />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
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
            path="goals"
            element={<GoalsPage />}
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