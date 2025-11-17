import { useState } from 'react'
import Layout from '../../components/Layout'
import { Clock, Calendar, Filter } from 'lucide-react'
import { TimeLog } from '../../types'

export default function TimeLogsPage() {
  const [filterBy, setFilterBy] = useState('all')

  // Mock data
  const timeLogs: TimeLog[] = [
    {
      id: '1',
      query_id: 'q1',
      developer_id: 'd1',
      hours_logged: 4,
      description: 'Fixed authentication bug and implemented JWT refresh tokens',
      date: '2025-01-15',
      is_billable: true,
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      query_id: 'q2',
      developer_id: 'd2',
      hours_logged: 2.5,
      description: 'Database optimization and index creation',
      date: '2025-01-15',
      is_billable: true,
      created_at: '2025-01-15T14:00:00Z',
      updated_at: '2025-01-15T14:00:00Z',
    },
    {
      id: '3',
      query_id: 'q3',
      developer_id: 'd1',
      hours_logged: 1,
      description: 'Code review and documentation',
      date: '2025-01-14',
      is_billable: false,
      created_at: '2025-01-14T16:00:00Z',
      updated_at: '2025-01-14T16:00:00Z',
    },
  ]

  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours_logged, 0)
  const billableHours = timeLogs
    .filter((log) => log.is_billable)
    .reduce((sum, log) => sum + log.hours_logged, 0)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Logs</h1>
            <p className="text-gray-600 mt-1">Track time spent on client queries</p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Log Time</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalHours}h</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Billable Hours</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{billableHours}h</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Non-Billable Hours</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {totalHours - billableHours}h
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="input-field"
            >
              <option value="all">All Logs</option>
              <option value="billable">Billable Only</option>
              <option value="non-billable">Non-Billable Only</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <input type="date" className="input-field" />
            <input type="date" className="input-field" />
          </div>
        </div>

        {/* Time Logs Table */}
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Query ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Developer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Billable
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-primary-600">#{log.query_id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">Developer #{log.developer_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{log.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm font-semibold text-gray-900">
                        {log.hours_logged}h
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.is_billable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {log.is_billable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
