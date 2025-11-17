import { useState } from 'react'
import Layout from '../../components/Layout'
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react'
import { Notification, NotificationType } from '../../types'

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all')

  // Mock data
  const notifications: Notification[] = [
    {
      id: '1',
      user_id: 'u1',
      type: NotificationType.SUCCESS,
      title: 'Payment Received',
      message: 'Payment of $2,950 received from Tech Innovations Pvt Ltd for Invoice INV-2025-001',
      is_read: false,
      link: '/payments',
      created_at: '2025-01-15T10:30:00Z',
    },
    {
      id: '2',
      user_id: 'u1',
      type: NotificationType.INFO,
      title: 'New Query Assigned',
      message: 'You have been assigned to Query #Q-12345: Database optimization needed',
      is_read: false,
      link: '/queries/12345',
      created_at: '2025-01-15T09:15:00Z',
    },
    {
      id: '3',
      user_id: 'u1',
      type: NotificationType.WARNING,
      title: 'Invoice Due Soon',
      message: 'Invoice INV-2025-002 is due in 3 days',
      is_read: true,
      link: '/invoices/2',
      created_at: '2025-01-14T14:20:00Z',
    },
    {
      id: '4',
      user_id: 'u1',
      type: NotificationType.ERROR,
      title: 'Payment Failed',
      message: 'Payment attempt for Invoice INV-2025-003 has failed. Please retry.',
      is_read: true,
      link: '/payments',
      created_at: '2025-01-13T16:45:00Z',
    },
  ]

  const getNotificationIcon = (type: NotificationType) => {
    const icons = {
      [NotificationType.INFO]: { Icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
      [NotificationType.SUCCESS]: { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      [NotificationType.WARNING]: { Icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      [NotificationType.ERROR]: { Icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    }
    return icons[type]
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.is_read
    if (filter === 'read') return notification.is_read
    return true
  })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary flex items-center space-x-2">
              <CheckCheck className="w-5 h-5" />
              <span>Mark All as Read</span>
            </button>
            <button className="btn-secondary flex items-center space-x-2">
              <Trash2 className="w-5 h-5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="card">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                filter === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                filter === 'unread'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                filter === 'read'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const { Icon, color, bg } = getNotificationIcon(notification.type)
            return (
              <div
                key={notification.id}
                className={`card hover:shadow-lg transition-all cursor-pointer ${
                  !notification.is_read ? 'border-l-4 border-l-primary-600 bg-primary-50/30' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {notification.title}
                          {!notification.is_read && (
                            <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full inline-block"></span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Actions */}
                    {notification.link && (
                      <div className="mt-3 flex space-x-3">
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          View Details →
                        </button>
                        {!notification.is_read && (
                          <button className="text-sm text-gray-600 hover:text-gray-700">
                            Mark as Read
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 card">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications to display</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
