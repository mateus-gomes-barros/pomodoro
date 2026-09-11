import {
  lazy,
} from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom'

import {
  ProtectedRoute,
} from './components/auth/ProtectedRoute'
import {
  Layout,
} from './components/layout/Layout'
import {
  OnboardingGate,
} from './components/onboarding/OnboardingGate'

import {
  useTimer,
} from './hooks/useTimer'

import {
  LoginPage,
} from './pages/LoginPage'
import {
  OnboardingPage,
} from './pages/OnboardingPage'

const DashboardPage = lazy(
  () =>
    import(
      './pages/DashboardPage'
    ).then((module) => ({
      default:
        module.DashboardPage,
    })),
)

const TimerPage = lazy(
  () =>
    import(
      './pages/TimerPage'
    ).then((module) => ({
      default:
        module.TimerPage,
    })),
)

const TasksPage = lazy(
  () =>
    import(
      './pages/TasksPage'
    ).then((module) => ({
      default:
        module.TasksPage,
    })),
)

const TasksTrashPage = lazy(
  () =>
    import(
      './pages/TasksTrashPage'
    ).then((module) => ({
      default:
        module.TasksTrashPage,
    })),
)

const ProjectsPage = lazy(
  () =>
    import(
      './pages/ProjectsPage'
    ).then((module) => ({
      default:
        module.ProjectsPage,
    })),
)

const GoalsPage = lazy(
  () =>
    import(
      './pages/GoalsPage'
    ).then((module) => ({
      default:
        module.GoalsPage,
    })),
)

const StreaksPage = lazy(
  () =>
    import(
      './pages/StreaksPage'
    ).then((module) => ({
      default:
        module.StreaksPage,
    })),
)

const AnalyticsPage = lazy(
  () =>
    import(
      './pages/AnalyticsPage'
    ).then((module) => ({
      default:
        module.AnalyticsPage,
    })),
)

const SettingsPage = lazy(
  () =>
    import(
      './pages/SettingsPage'
    ).then((module) => ({
      default:
        module.SettingsPage,
    })),
)

const FocusMePage = lazy(
  () =>
    import(
      './pages/FocusMePage'
    ).then((module) => ({
      default:
        module.FocusMePage,
    })),
)

const FocusMeHistoryPage = lazy(
  () =>
    import(
      './pages/FocusMeHistoryPage'
    ).then((module) => ({
      default:
        module.FocusMeHistoryPage,
    })),
)

const FocusHomeDiagnosticsPage =
  lazy(
    () =>
      import(
        './pages/FocusHomeDiagnosticsPage'
      ).then((module) => ({
        default:
          module.FocusHomeDiagnosticsPage,
      })),
  )

const FocusHomeRevealPage = lazy(
  () =>
    import(
      './pages/FocusHomeRevealPage'
    ).then((module) => ({
      default:
        module.FocusHomeRevealPage,
    })),
)

const FocusHomeRetestPage = lazy(
  () =>
    import(
      './pages/FocusHomeRetestPage'
    ).then((module) => ({
      default:
        module.FocusHomeRetestPage,
    })),
)

const FocusMeReportPage = lazy(
  () =>
    import(
      './pages/FocusMeReportPage'
    ).then((module) => ({
      default:
        module.FocusMeReportPage,
    })),
)

const AboutFocusMePage = lazy(
  () =>
    import(
      './pages/AboutFocusMePage'
    ).then((module) => ({
      default:
        module.AboutFocusMePage,
    })),
)

const ChangesPage = lazy(
  () =>
    import(
      './pages/ChangesPage'
    ).then((module) => ({
      default:
        module.ChangesPage,
    })),
)

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
          path="/login"
          element={<LoginPage />}
        />

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            path="/onboarding"
            element={<OnboardingPage />}
          />

          <Route
            element={<OnboardingGate />}
          >
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <DashboardPage />
                }
              />

              <Route
                path="/dashboard"
                element={
                  <DashboardPage />
                }
              />

              <Route
                path="/timer"
                element={<TimerPage />}
              />

              <Route
                path="/tasks"
                element={<TasksPage />}
              />

              <Route
                path="/tasks/trash"
                element={
                  <TasksTrashPage />
                }
              />

              <Route
                path="/projects"
                element={<ProjectsPage />}
              />

              <Route
                path="/goals"
                element={<GoalsPage />}
              />

              <Route
                path="/streaks"
                element={<StreaksPage />}
              />

              <Route
                path="/analytics"
                element={
                  <AnalyticsPage />
                }
              />

              <Route
                path="/settings"
                element={
                  <SettingsPage />
                }
              />

              <Route
                path="/focusme"
                element={<FocusMePage />}
              />

              <Route
                path="/focusme/history"
                element={
                  <FocusMeHistoryPage />
                }
              />

              {import.meta.env.DEV && (
                <Route
                  path="/focusme/diagnostics"
                  element={
                    <FocusHomeDiagnosticsPage />
                  }
                />
              )}

              <Route
                path="/focusme/reveal/:reportId"
                element={
                  <FocusHomeRevealPage />
                }
              />

              <Route
                path="/focusme/retest/:reportId"
                element={
                  <FocusHomeRetestPage />
                }
              />

              <Route
                path="/focusme/reports/:reportId"
                element={
                  <FocusMeReportPage />
                }
              />

              <Route
                path="/settings/focusme"
                element={
                  <AboutFocusMePage />
                }
              />

              <Route
                path="/settings/changes"
                element={<ChangesPage />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
