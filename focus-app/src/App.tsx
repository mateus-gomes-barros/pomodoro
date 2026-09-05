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
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/timer" element={<TimerPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/streaks" element={<StreaksPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App