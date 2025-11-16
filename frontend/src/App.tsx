import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ClientsPage from './pages/clients/ClientsPage'
import QueriesPage from './pages/queries/QueriesPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />
        } />
        <Route path="/clients" element={
          isAuthenticated ? <ClientsPage /> : <Navigate to="/login" />
        } />
        <Route path="/queries" element={
          isAuthenticated ? <QueriesPage /> : <Navigate to="/login" />
        } />

        {/* Default Route */}
        <Route path="/" element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
        } />
      </Routes>
    </div>
  )
}

export default App
