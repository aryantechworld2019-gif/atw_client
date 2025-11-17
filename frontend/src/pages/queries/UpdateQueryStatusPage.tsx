import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { Save, X, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { queriesAPI } from '../../services/apiService'

type QueryStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

interface Query {
  id: string
  title: string
  description: string
  type: string
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
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<Query | null>(null)
  const [formData, setFormData] = useState({
    status: 'OPEN' as QueryStatus,
    resolution: '',
    actual_hours: '',
  })

  useEffect(() => {
    if (queryId) {
      loadQuery()
    }
  }, [queryId])

  const loadQuery = async () => {
    try {
      const data = await queriesAPI.getById(queryId!)
      setQuery(data)
      setFormData({
        status: data.status,
        resolution: data.resolution || '',
        actual_hours: data.actual_hours?.toString() || '',
      })
    } catch (error) {
      console.error('Failed to load query:', error)
      alert('Failed to load query details')
      navigate('/queries')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData: any = {
        status: formData.status,
      }

      if (formData.resolution) {
        updateData.resolution = formData.resolution
      }

      if (formData.actual_hours) {
        updateData.actual_hours = parseFloat(formData.actual_hours)
      }

      await queriesAPI.update(queryId!, updateData)

      alert('Query status updated successfully!')
      navigate('/queries')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update query status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!query) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading query details...</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <p className="text-gray-900">{query.type}</p>
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
                  {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as QueryStatus[]).map((status) => (
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
                        {status === 'RESOLVED' && 'Query has been resolved'}
                        {status === 'CLOSED' && 'Query is closed and completed'}
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
          {(formData.status === 'RESOLVED' || formData.status === 'CLOSED') && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes {formData.status === 'RESOLVED' ? '*' : ''}
                </label>
                <textarea
                  required={formData.status === 'RESOLVED'}
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
              disabled={loading}
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Updating...' : 'Update Query'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
