import { useState } from 'react'
import Layout from '../../components/Layout'
import { Shield, Filter, Search, User, FileText, Trash2, Edit } from 'lucide-react'
import { AuditLog, AuditAction } from '../../types'

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('all')

  // Mock data
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      user_id: 'u1',
      action: AuditAction.CREATE,
      resource_type: 'invoice',
      resource_id: 'inv-001',
      changes: { status: 'draft', total: 2950 },
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0',
      created_at: '2025-01-15T10:30:00Z',
    },
    {
      id: '2',
      user_id: 'u2',
      action: AuditAction.UPDATE,
      resource_type: 'client',
      resource_id: 'c-123',
      changes: { status: 'active', previous_status: 'pending' },
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0',
      created_at: '2025-01-15T09:15:00Z',
    },
    {
      id: '3',
      user_id: 'u3',
      action: AuditAction.DELETE,
      resource_type: 'query',
      resource_id: 'q-456',
      changes: {},
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0',
      created_at: '2025-01-14T14:20:00Z',
    },
    {
      id: '4',
      user_id: 'u1',
      action: AuditAction.LOGIN,
      resource_type: 'session',
      resource_id: 's-789',
      changes: {},
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0',
      created_at: '2025-01-15T08:00:00Z',
    },
  ]

  const getActionIcon = (action: AuditAction) => {
    const icons = {
      [AuditAction.CREATE]: { Icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
      [AuditAction.UPDATE]: { Icon: Edit, color: 'text-blue-600', bg: 'bg-blue-100' },
      [AuditAction.DELETE]: { Icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
      [AuditAction.LOGIN]: { Icon: User, color: 'text-purple-600', bg: 'bg-purple-100' },
      [AuditAction.LOGOUT]: { Icon: User, color: 'text-gray-600', bg: 'bg-gray-100' },
    }
    return icons[action]
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">Track all system activities and changes</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn-secondary flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Export Logs</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="input-field"
            >
              <option value="all">All Actions</option>
              <option value={AuditAction.CREATE}>Create</option>
              <option value={AuditAction.UPDATE}>Update</option>
              <option value={AuditAction.DELETE}>Delete</option>
              <option value={AuditAction.LOGIN}>Login</option>
              <option value={AuditAction.LOGOUT}>Logout</option>
            </select>
            <div className="flex space-x-2">
              <input type="date" className="input-field" placeholder="From" />
              <input type="date" className="input-field" placeholder="To" />
            </div>
          </div>
        </div>

        {/* Audit Logs Timeline */}
        <div className="space-y-4">
          {auditLogs.map((log) => {
            const { Icon, color, bg } = getActionIcon(log.action)
            return (
              <div key={log.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {log.action.toUpperCase()} {log.resource_type.toUpperCase()}
                          </h3>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            {log.resource_id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          User #{log.user_id} performed this action
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Changes */}
                    {Object.keys(log.changes || {}).length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">Changes:</p>
                        <div className="space-y-1">
                          {Object.entries(log.changes || {}).map(([key, value]) => (
                            <p key={key} className="text-xs text-gray-600">
                              <span className="font-medium">{key}:</span>{' '}
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                      <span>IP: {log.ip_address}</span>
                      <span className="truncate max-w-xs">User Agent: {log.user_agent}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of{' '}
              <span className="font-medium">{auditLogs.length}</span> results
            </p>
            <div className="flex space-x-2">
              <button className="btn-secondary">Previous</button>
              <button className="btn-secondary">Next</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
