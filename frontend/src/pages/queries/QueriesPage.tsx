import { useNavigate } from 'react-router-dom'
import { HelpCircle, Plus, Search, AlertCircle } from 'lucide-react'

export default function QueriesPage() {
  const navigate = useNavigate()

  const queries = [
    {
      id: 1,
      ticket_number: 'QRY-2025-001234',
      title: 'Login page not loading on Safari browser',
      client: 'Tech Innovations Pvt Ltd',
      priority: 'High',
      status: 'In Progress',
      created_at: '2 hours ago',
    },
    {
      id: 2,
      ticket_number: 'QRY-2025-001233',
      title: 'Database optimization needed',
      client: 'FinTech Solutions',
      priority: 'Medium',
      status: 'Fixed',
      created_at: '1 day ago',
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fixed':
        return 'bg-green-100 text-green-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-gray-100 text-gray-800'
      case 'Closed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Queries</h1>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Query</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="py-4 px-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/clients')}
              className="py-4 px-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium"
            >
              Clients
            </button>
            <button
              onClick={() => navigate('/queries')}
              className="py-4 px-3 border-b-2 border-primary-600 text-primary-600 font-medium"
            >
              Queries
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search queries..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Queries List */}
        <div className="space-y-4">
          {queries.map((query) => (
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
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="font-mono">{query.ticket_number}</span>
                      <span>•</span>
                      <span>{query.client}</span>
                      <span>•</span>
                      <span>{query.created_at}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(query.status)}`}>
                    {query.status}
                  </span>
                  <button className="text-primary-600 hover:text-primary-900 font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no queries) */}
        {queries.length === 0 && (
          <div className="card text-center py-12">
            <AlertCircle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No queries found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first query</p>
            <button className="btn-primary">
              Create Query
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
