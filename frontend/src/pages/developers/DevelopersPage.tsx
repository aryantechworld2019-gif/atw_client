import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { Code, Plus, Search, Star, Clock, CheckCircle } from 'lucide-react'
import { Developer, DeveloperStatus } from '../../types'

export default function DevelopersPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - replace with API call
  const developers: Developer[] = [
    {
      id: '1',
      user_id: 'u1',
      skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
      hourly_rate: 50,
      status: DeveloperStatus.AVAILABLE,
      availability_hours: 40,
      total_hours_worked: 320,
      projects_completed: 12,
      average_rating: 4.8,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
    },
    {
      id: '2',
      user_id: 'u2',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      hourly_rate: 55,
      status: DeveloperStatus.BUSY,
      availability_hours: 10,
      total_hours_worked: 450,
      projects_completed: 18,
      average_rating: 4.9,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
    },
  ]

  const getStatusBadge = (status: DeveloperStatus) => {
    const styles = {
      [DeveloperStatus.AVAILABLE]: 'bg-green-100 text-green-800',
      [DeveloperStatus.BUSY]: 'bg-yellow-100 text-yellow-800',
      [DeveloperStatus.ON_LEAVE]: 'bg-gray-100 text-gray-800',
    }
    return styles[status]
  }

  const filteredDevelopers = developers.filter((dev) =>
    dev.skills.some((skill) =>
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Developers</h1>
            <p className="text-gray-600 mt-1">Manage your development team</p>
          </div>
          <button
            onClick={() => navigate('/developers/add')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Developer</span>
          </button>
        </div>

        {/* Search */}
        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Developers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevelopers.map((developer) => (
            <div key={developer.id} className="card hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Code className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Developer #{developer.id}</h3>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">{developer.average_rating}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                      developer.status
                    )}`}
                  >
                    {developer.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {developer.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="flex items-center text-gray-500 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-xs">Availability</span>
                    </div>
                    <p className="text-sm font-semibold">{developer.availability_hours}h/week</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 mb-1">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-xs">Completed</span>
                    </div>
                    <p className="text-sm font-semibold">{developer.projects_completed} projects</p>
                  </div>
                </div>

                {/* Rate */}
                <div className="pt-4 border-t">
                  <p className="text-lg font-bold text-primary-600">
                    ${developer.hourly_rate}/hour
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="btn-secondary flex-1">View Profile</button>
                  <button className="btn-primary flex-1">Assign Task</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDevelopers.length === 0 && (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No developers found matching your search</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
