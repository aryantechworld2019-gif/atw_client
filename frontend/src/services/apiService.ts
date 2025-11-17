import { api } from './api'
import { Client, Query, Developer, MaintenancePackage, TimeLog, Payment, Invoice } from '../types'

// Client API
export const clientsAPI = {
  getAll: async (params?: { skip?: number; limit?: number; status?: string; search?: string }) => {
    const response = await api.get('/api/v1/clients', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/clients/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/api/v1/clients', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/clients/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/v1/clients/${id}`)
  },

  getStats: async (id: string) => {
    const response = await api.get(`/api/v1/clients/${id}/stats`)
    return response.data
  },
}

// Query API
export const queriesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/v1/queries', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/queries/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/api/v1/queries', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/queries/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/v1/queries/${id}`)
  },
}

// Developer API
export const developersAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/v1/developers', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/developers/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/api/v1/developers', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/developers/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/v1/developers/${id}`)
  },
}

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/v1/auth/login', credentials)
    return response.data
  },

  register: async (data: { email: string; password: string; full_name: string; phone: string }) => {
    const response = await api.post('/api/v1/auth/register', data)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/me')
    return response.data
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/api/v1/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },
}

// Maintenance Packages API
export const maintenanceAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/v1/maintenance', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/maintenance/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/api/v1/maintenance', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/maintenance/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/v1/maintenance/${id}`)
  },

  adjustHours: async (id: string, data: { hours_changed: number; adjustment_type: 'ADDED' | 'DEDUCTED'; reason: string }) => {
    const response = await api.post(`/api/v1/maintenance/${id}/adjust-hours`, data)
    return response.data
  },
}

// Payments API
export const paymentsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/v1/payments', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/payments/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/api/v1/payments', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/payments/${id}`, data)
    return response.data
  },

  refund: async (id: string, data: { refund_amount: number; refund_reason: string }) => {
    const response = await api.post(`/api/v1/payments/${id}/refund`, data)
    return response.data
  },
}

// Invoices API
export const invoicesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/v1/invoices', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/invoices/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/api/v1/invoices', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/invoices/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/v1/invoices/${id}`)
  },
}

// Time Logs API
export const timeLogsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/v1/time-logs', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/time-logs/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/api/v1/time-logs', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/time-logs/${id}`, data)
    return response.data
  },

  approve: async (id: string, data: any) => {
    const response = await api.post(`/api/v1/time-logs/${id}/approve`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/api/v1/time-logs/${id}`)
  },
}

// Notifications API
export const notificationsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/v1/notifications', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/notifications/${id}`)
    return response.data
  },

  getUnreadCount: async () => {
    const response = await api.get('/api/v1/notifications/unread-count')
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/api/v1/notifications', data)
    return response.data
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/api/v1/notifications/${id}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    await api.put('/api/v1/notifications/mark-all-read')
  },

  delete: async (id: string) => {
    await api.delete(`/api/v1/notifications/${id}`)
  },
}

// Audit Logs API
export const auditLogsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/v1/audit-logs', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/audit-logs/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/api/v1/audit-logs', data)
    return response.data
  },

  getEntityAuditTrail: async (entityType: string, entityId: string, params?: any) => {
    const response = await api.get(`/api/v1/audit-logs/entity/${entityType}/${entityId}`, { params })
    return response.data
  },

  getUserActivity: async (userId: string, params?: any) => {
    const response = await api.get(`/api/v1/audit-logs/user/${userId}/activity`, { params })
    return response.data
  },
}
