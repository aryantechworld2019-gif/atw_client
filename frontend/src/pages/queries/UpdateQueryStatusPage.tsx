import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import { Save, X, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { queriesAPI } from '../../services/apiService'
import { showToast } from '../../utils/toast'

type QueryStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'FIXED' | 'CLOSED' | 'REOPENED'

interface Query {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: QueryStatus
  estimated_hours?: number
  actual_hours?: number
  resolution?: string
  client_id: string
  assigned_developer_id?: string
  created_at: string
}

export default function UpdateQueryStatusPage() {
  const navigate = useNavigate()
  const { queryId } = useParams<{ queryId: string }>()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    status: 'OPEN' as QueryStatus,
    resolution: '',
    actual_hours: '',
  })

  // Fetch query details
  const { data: query, isLoading } = useQuery<Query>({
    queryKey: ['query', queryId],
    queryFn: () => queriesAPI.getById(queryId!),
    enabled: !!queryId,
  })

  // Update form when query data loads
  useEffect(() => {
    if (query) {
      setFormData({
        status: query.status,
        resolution: query.resolution || '',
        actual_hours: query.actual_hours?.toString() || '',
      })
    }
  }, [query])

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => queriesAPI.update(queryId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] })
      queryClient.invalidateQueries({ queryKey: ['query', queryId] })
      showToast.success('Query status updated successfully!')
      navigate('/queries')
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.detail || 'Failed to update query status')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const updateData: any = {
      status: formData.status,
    }

    if (formData.resolution) {
      updateData.resolution = formData.resolution
    }

    if (formData.actual_hours) {
      updateData.actual_hours = parseFloat(formData.actual_hours)
    }

    updateMutation.mutate(updateData)
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'ON_HOLD': return 'bg-orange-100 text-orange-800'
      case 'FIXED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      case 'REOPENED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Update Query Status</h1>
          <p className="text-gray-600 mt-1">Update the status and resolution of the assigned query</p>
        </div>

        {/* Query Details Card */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Query Details</h3>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getPriorityColor(query.priority)}`}>
                {query.priority}
              </span>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(query.status)}`}>
                {query.status}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-xl font-semibold text-gray-900">{query.title}</h4>
              <p className="text-sm text-gray-500 mt-1">ID: {query.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{query.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-900">{query.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                <p className="text-gray-900 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {query.estimated_hours || 'Not specified'}
                </p>
              </div>
            </div>

            {query.actual_hours && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Actual Hours</label>
                <p className="text-gray-900">{query.actual_hours} hours</p>
              </div>
            )}
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Update */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Update Status
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query Status *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'FIXED', 'CLOSED', 'REOPENED'] as QueryStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, status })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.status === status
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{status.replace('_', ' ')}</span>
                        {formData.status === status && (
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {status === 'OPEN' && 'Query is open and awaiting action'}
                        {status === 'IN_PROGRESS' && 'Currently working on this query'}
                        {status === 'ON_HOLD' && 'Query is on hold temporarily'}
                        {status === 'FIXED' && 'Query has been fixed'}
                        {status === 'CLOSED' && 'Query is closed and completed'}
                        {status === 'REOPENED' && 'Query was reopened'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Hours Worked
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.actual_hours}
                  onChange={(e) => setFormData({ ...formData, actual_hours: e.target.value })}
                  className="input-field"
                  placeholder="Enter actual hours worked"
                />
                {query.estimated_hours && formData.actual_hours && (
                  <p className="text-xs text-gray-500 mt-1">
                    {parseFloat(formData.actual_hours) > query.estimated_hours ? (
                      <span className="text-orange-600">
                        ⚠️ {(parseFloat(formData.actual_hours) - query.estimated_hours).toFixed(1)} hours over estimate
                      </span>
                    ) : (
                      <span className="text-green-600">
                        ✓ Within estimated hours
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Resolution Notes */}
          {(formData.status === 'FIXED' || formData.status === 'CLOSED') && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes {formData.status === 'FIXED' ? '*' : ''}
                </label>
                <textarea
                  required={formData.status === 'FIXED'}
                  value={formData.resolution}
                  onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                  className="input-field"
                  rows={5}
                  placeholder="Describe how the query was resolved..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide details about the fix, changes made, or solution implemented
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
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
              <span>{updateMutation.isPending ? 'Updating...' : 'Update Query'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
