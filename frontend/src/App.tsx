import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Main Pages
import DashboardPage from './pages/dashboard/DashboardPage'
import ClientsPage from './pages/clients/ClientsPage'
import QueriesPage from './pages/queries/QueriesPage'
import DevelopersPage from './pages/developers/DevelopersPage'
import MaintenancePackagesPage from './pages/maintenance/MaintenancePackagesPage'
import TimeLogsPage from './pages/timelogs/TimeLogsPage'
import PaymentsPage from './pages/payments/PaymentsPage'
import InvoicesPage from './pages/invoices/InvoicesPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import AuditLogsPage from './pages/audit/AuditLogsPage'

// Settings Pages
import SettingsProfilePage from './pages/settings/SettingsProfilePage'
import SettingsSecurityPage from './pages/settings/SettingsSecurityPage'

// Reports Pages
import ReportsOverviewPage from './pages/reports/ReportsOverviewPage'

// Sub Pages (Add/Create forms)
import AddDeveloperPage from './pages/developers/AddDeveloperPage'
import AddClientPage from './pages/clients/AddClientPage'
import CreateQueryPage from './pages/queries/CreateQueryPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  // Protected Route Wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
  }

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />}
        />

        {/* Protected Routes - Main Pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Clients Routes */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <ClientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/add"
          element={
            <ProtectedRoute>
              <AddClientPage />
            </ProtectedRoute>
          }
        />

        {/* Queries Routes */}
        <Route
          path="/queries"
          element={
            <ProtectedRoute>
              <QueriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/queries/create"
          element={
            <ProtectedRoute>
              <CreateQueryPage />
            </ProtectedRoute>
          }
        />

        {/* Developers Routes */}
        <Route
          path="/developers"
          element={
            <ProtectedRoute>
              <DevelopersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/developers/add"
          element={
            <ProtectedRoute>
              <AddDeveloperPage />
            </ProtectedRoute>
          }
        />

        {/* Maintenance Routes */}
        <Route
          path="/maintenance/packages"
          element={
            <ProtectedRoute>
              <MaintenancePackagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/packages/create"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Time Logs Route */}
        <Route
          path="/time-logs"
          element={
            <ProtectedRoute>
              <TimeLogsPage />
            </ProtectedRoute>
          }
        />

        {/* Payments Routes */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/record"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Invoices Routes */}
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/create"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Reports Routes */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Navigate to="/reports/overview" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/overview"
          element={
            <ProtectedRoute>
              <ReportsOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/clients"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/developers"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/financial"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Notifications Route */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Audit Logs Route */}
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />

        {/* Settings Routes */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Navigate to="/settings/profile" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <SettingsProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/account"
          element={
            <ProtectedRoute>
              <SettingsProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/security"
          element={
            <ProtectedRoute>
              <SettingsSecurityPage />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />

        {/* 404 Not Found */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App
