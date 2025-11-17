import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import { Save, X, User, Mail, Phone, Shield } from 'lucide-react'
import { usersAPI } from '../../services/apiService'
import { showToast } from '../../utils/toast'

export default function AddUserPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'client_user',
  })

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => usersAPI.create(data),
    onSuccess: () => {
      showToast.success('User created successfully!')
      navigate('/users')
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.detail || 'Failed to create user')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
          <p className="text-gray-600 mt-1">Create a new user account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              User Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Security & Access */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security & Access
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder="Min. 8 characters"
                />
                <p className="text-xs text-gray-500 mt-1">
                  User will be auto-verified and can login immediately
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="client_user">Client User</option>
                  <option value="client_owner">Client Owner</option>
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Determines user permissions and access level
                </p>
              </div>
            </div>

            {/* Role Descriptions */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Role Descriptions:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li><strong>Client User:</strong> Basic client access, can create queries</li>
                <li><strong>Client Owner:</strong> Full client access, manages company account</li>
                <li><strong>Developer:</strong> Can be assigned to queries, log time</li>
                <li><strong>Admin:</strong> Full system access, manage users and settings</li>
                <li><strong>Super Admin:</strong> Highest level access, system configuration</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="btn-secondary flex items-center space-x-2"
              disabled={createMutation.isPending}
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={createMutation.isPending}
            >
              <Save className="w-5 h-5" />
              <span>{createMutation.isPending ? 'Creating...' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
