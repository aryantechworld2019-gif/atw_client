import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import { Save, X, HelpCircle } from 'lucide-react'
import { queriesAPI } from '../../services/apiService'
import { showToast } from '../../utils/toast'

interface Query {
  id: string
  ticket_number: string
  client_id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  estimated_hours?: number
  assigned_developer_id?: string
}

export default function EditQueryPage() {
  const navigate = useNavigate()
  const { queryId } = useParams<{ queryId: string }>()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'BUG',
    priority: 'MEDIUM',
    status: 'OPEN',
    estimated_hours: '',
  })

  // Fetch query data
  const { data: query, isLoading } = useQuery<Query>({
    queryKey: ['query', queryId],
    queryFn: () => queriesAPI.getById(queryId!),
    enabled: !!queryId,
  })

  useEffect(() => {
    if (query) {
      setFormData({
        title: query.title,
        description: query.description,
        category: query.category,
        priority: query.priority,
        status: query.status,
        estimated_hours: query.estimated_hours?.toString() || '',
      })
    }
  }, [query])

  const updateMutation = useMutation({
    mutationFn: (data: any) => queriesAPI.update(queryId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] })
      queryClient.invalidateQueries({ queryKey: ['query', queryId] })
      showToast.success('Query updated successfully!')
      navigate('/queries')
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.detail || 'Failed to update query')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: formData.status,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!query) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">Query not found</p>
          <button onClick={() => navigate('/queries')} className="mt-4 btn-primary">
            Back to Queries
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Query</h1>
          <p className="text-gray-600 mt-1">Update query information</p>
          <p className="text-sm text-gray-500 mt-1">Ticket: {query.ticket_number}</p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="FIXED">Fixed</option>
                <option value="CLOSED">Closed</option>
                <option value="REOPENED">Reopened</option>
              </select>
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
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                placeholder="Detailed description of the issue or request..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/queries')}
              className="btn-secondary flex items-center space-x-2"
              disabled={updateMutation.isPending}
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={updateMutation.isPending}
            >
              <Save className="w-5 h-5" />
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
