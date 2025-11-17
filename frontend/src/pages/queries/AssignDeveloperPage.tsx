import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import { Save, X, UserPlus, Search } from 'lucide-react'
import { queriesAPI, developersAPI } from '../../services/apiService'
import { showToast } from '../../utils/toast'

interface Query {
  id: string
  title: string
  client_id: string
  category: string
  priority: string
  status: string
  assigned_developer_id?: string
}

interface Developer {
  id: string
  user_id: string
  skills: string[]
}

export default function AssignDeveloperPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQueryId, setSelectedQueryId] = useState('')
  const [selectedDeveloperId, setSelectedDeveloperId] = useState('')

  // Fetch queries
  const { data: queries = [], isLoading: queriesLoading } = useQuery<Query[]>({
    queryKey: ['queries', { limit: 100 }],
    queryFn: () => queriesAPI.getAll({ limit: 100 }),
  })

  // Fetch developers
  const { data: developers = [], isLoading: developersLoading } = useQuery<Developer[]>({
    queryKey: ['developers', { limit: 100 }],
    queryFn: () => developersAPI.getAll({ limit: 100 }),
  })

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: ({ queryId, developerId }: { queryId: string; developerId: string }) =>
      queriesAPI.update(queryId, { assigned_developer_id: developerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] })
      showToast.success('Developer assigned successfully!')
      setSelectedQueryId('')
      setSelectedDeveloperId('')
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.detail || 'Failed to assign developer')
    },
  })

  const handleAssign = () => {
    if (!selectedQueryId || !selectedDeveloperId) {
      showToast.error('Please select both a query and a developer')
      return
    }

    assignMutation.mutate({ queryId: selectedQueryId, developerId: selectedDeveloperId })
  }

  const filteredQueries = queries.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const isLoading = queriesLoading || developersLoading

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assign Developer to Query</h1>
          <p className="text-gray-600 mt-1">Assign developers to client queries for resolution</p>
        </div>

        {isLoading ? (
          <div className="card">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Queries List */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Query</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 w-64"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredQueries.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No queries found</p>
                ) : (
                  filteredQueries.map((query) => (
                    <div
                      key={query.id}
                      onClick={() => setSelectedQueryId(query.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedQueryId === query.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{query.title}</h4>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(query.priority)}`}>
                            {query.priority}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(query.status)}`}>
                            {query.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Category: {query.category}</p>
                        <p className="text-xs mt-1">ID: {query.id}</p>
                        {query.assigned_developer_id && (
                          <p className="text-xs mt-1 text-green-600">
                            ✓ Already assigned
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Developers List & Assignment */}
            <div className="space-y-6">
              {/* Selected Query Info */}
              {selectedQueryId && (
                <div className="card bg-primary-50 border-2 border-primary-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Selected Query</h3>
                  <p className="text-sm text-gray-700">
                    {queries.find(q => q.id === selectedQueryId)?.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {selectedQueryId}
                  </p>
                </div>
              )}

              {/* Developers Selection */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Select Developer
                </h3>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {developers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No developers available</p>
                  ) : (
                    developers.map((developer) => (
                      <div
                        key={developer.id}
                        onClick={() => setSelectedDeveloperId(developer.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedDeveloperId === developer.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">Developer ID: {developer.user_id}</h4>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {developer.skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {developer.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{developer.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Assignment Actions */}
              <div className="card bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Assignment</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Query Selected:</span>
                    <span className={selectedQueryId ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {selectedQueryId ? '✓ Yes' : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Developer Selected:</span>
                    <span className={selectedDeveloperId ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {selectedDeveloperId ? '✓ Yes' : 'Not selected'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/queries')}
                    className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                    disabled={assignMutation.isPending}
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAssign}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                    disabled={assignMutation.isPending || !selectedQueryId || !selectedDeveloperId}
                  >
                    <Save className="w-5 h-5" />
                    <span>{assignMutation.isPending ? 'Assigning...' : 'Assign Developer'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
