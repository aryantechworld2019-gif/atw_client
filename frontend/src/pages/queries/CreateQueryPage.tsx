import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import { Save, X } from 'lucide-react'
import { queriesAPI } from '../../services/apiService'
import { showToast } from '../../utils/toast'

export default function CreateQueryPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    category: 'BUG',
    priority: 'MEDIUM',
    estimated_hours: '',
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => queriesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] })
      showToast.success('Query created successfully!')
      navigate('/queries')
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.detail || 'Failed to create query')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    createMutation.mutate({
      client_id: formData.client_id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
    })
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Query</h1>
          <p className="text-gray-600 mt-1">Submit a new bug report or feature request</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option value="BUG">Bug</option>
                <option value="FEATURE_REQUEST">Feature Request</option>
                <option value="SUPPORT">Support</option>
                <option value="ENHANCEMENT">Enhancement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input-field"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={6}
                placeholder="Detailed description of the issue, steps to reproduce, expected behavior, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="input-field"
                placeholder="5.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID *
              </label>
              <input
                type="text"
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="input-field"
                placeholder="Enter client ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Client ID can be found in the clients list
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/queries')}
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
              <span>{createMutation.isPending ? 'Creating...' : 'Create Query'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
