import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { HelpCircle, Plus, Search, AlertCircle, Edit, Trash2, Eye, UserPlus, RefreshCw } from 'lucide-react'
import Layout from '../../components/Layout'
import { queriesAPI } from '../../services/apiService'
import { showToast } from '../../utils/toast'

interface Query {
  id: string
  ticket_number: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  client_id: string
  assigned_developer_id?: string
  estimated_hours?: number
  actual_hours?: number
  created_at: string
  updated_at: string
}

export default function QueriesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Fetch queries with TanStack Query
  const { data: queries = [], isLoading, error } = useQuery<Query[]>({
    queryKey: ['queries', { search: searchTerm, priority: priorityFilter, status: statusFilter }],
    queryFn: async () => {
      const params: any = { limit: 100 }
      if (priorityFilter) params.priority = priorityFilter
      if (statusFilter) params.status = statusFilter
      if (searchTerm) params.search = searchTerm
      return await queriesAPI.getAll(params)
    },
  })

  // Delete query mutation
  const deleteMutation = useMutation({
    mutationFn: (queryId: string) => queriesAPI.delete(queryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] })
      showToast.success('Query deleted successfully')
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.detail || 'Failed to delete query')
    },
  })

  const handleDelete = (queryId: string, queryTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${queryTitle}"?`)) {
      deleteMutation.mutate(queryId)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const formatCategory = (category: string) => {
    return category.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Queries</h1>
            <p className="text-gray-600 mt-1">Manage and track client support queries</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/queries/assign')}
              className="btn-secondary flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Assign Developer</span>
            </button>
            <button
              onClick={() => navigate('/queries/create')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Query</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search queries by title or ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="FIXED">Fixed</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened</option>
            </select>
          </div>
        </div>

        {/* Queries List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="card">
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            </div>
          ) : error ? (
            <div className="card">
              <div className="text-center py-12">
                <p className="text-red-600">Failed to load queries</p>
                <p className="text-sm text-gray-500 mt-2">{(error as Error).message}</p>
              </div>
            </div>
          ) : queries.length === 0 ? (
            <div className="card text-center py-12">
              <AlertCircle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No queries found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first query</p>
              <button
                onClick={() => navigate('/queries/create')}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Query</span>
              </button>
            </div>
          ) : (
            queries.map((query) => (
              <div key={query.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {query.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(query.priority)}`}>
                          {query.priority}
                        </span>
                      </div>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="font-mono">{query.ticket_number}</span>
                        <span>•</span>
                        <span>{formatCategory(query.category)}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(query.created_at)}</span>
                        {query.assigned_developer_id && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 flex items-center">
                              <UserPlus className="w-3 h-3 mr-1" />
                              Assigned
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(query.status)}`}>
                      {formatStatus(query.status)}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/queries/${query.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View query"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/queries/${query.id}/update-status`)}
                        className="text-green-600 hover:text-green-900"
                        title="Update status"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/queries/${query.id}/edit`)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit query"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(query.id, query.title)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete query"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {queries.length > 0 && (
          <div className="text-sm text-gray-600">
            Showing {queries.length} quer{queries.length !== 1 ? 'ies' : 'y'}
          </div>
        )}
      </div>
    </Layout>
  )
}
