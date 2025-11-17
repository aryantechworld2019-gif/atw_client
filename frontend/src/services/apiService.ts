import { api } from './api'
import { Client, Query, Developer, MaintenancePackage, TimeLog, Payment, Invoice } from '../types'

// Client API
export const clientsAPI = {
  getAll: async (params?: { skip?: number; limit?: number; status?: string; search?: string }) => {
    const response = await api.get('/clients', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/clients/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/clients', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/clients/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/clients/${id}`)
  },

  getStats: async (id: string) => {
    const response = await api.get(`/clients/${id}/stats`)
    return response.data
  },
}

// Query API
export const queriesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/queries', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/queries/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/queries', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/queries/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/queries/${id}`)
  },
}

// Developer API
export const developersAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/developers', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/developers/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/developers', data)
    return response.data
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/developers/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/developers/${id}`)
  },
}

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  register: async (data: { email: string; password: string; full_name: string; phone: string }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },
}
