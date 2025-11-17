import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
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

// User Pages
import UsersPage from './pages/users/UsersPage'
import AddUserPage from './pages/users/AddUserPage'

// Sub Pages (Add/Create forms)
import AddDeveloperPage from './pages/developers/AddDeveloperPage'
import AddClientPage from './pages/clients/AddClientPage'
import CreateQueryPage from './pages/queries/CreateQueryPage'
import CreateMaintenancePackagePage from './pages/maintenance/CreateMaintenancePackagePage'
import RecordPaymentPage from './pages/payments/RecordPaymentPage'
import CreateInvoicePage from './pages/invoices/CreateInvoicePage'
import AssignDeveloperPage from './pages/queries/AssignDeveloperPage'
import UpdateQueryStatusPage from './pages/queries/UpdateQueryStatusPage'

// Edit Pages
import EditClientPage from './pages/clients/EditClientPage'
import EditDeveloperPage from './pages/developers/EditDeveloperPage'
import EditQueryPage from './pages/queries/EditQueryPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  // Protected Route Wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
  }

  return (
    <div className="min-h-screen">
      <Toaster />
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
        <Route
          path="/clients/:clientId/edit"
          element={
            <ProtectedRoute>
              <EditClientPage />
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
        <Route
          path="/queries/assign"
          element={
            <ProtectedRoute>
              <AssignDeveloperPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/queries/:queryId/update-status"
          element={
            <ProtectedRoute>
              <UpdateQueryStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/queries/:queryId/edit"
          element={
            <ProtectedRoute>
              <EditQueryPage />
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
        <Route
          path="/developers/:developerId/edit"
          element={
            <ProtectedRoute>
              <EditDeveloperPage />
            </ProtectedRoute>
          }
        />

        {/* Users Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/add"
          element={
            <ProtectedRoute>
              <AddUserPage />
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
              <CreateMaintenancePackagePage />
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
              <RecordPaymentPage />
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
              <CreateInvoicePage />
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
