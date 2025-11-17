import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Validate API_BASE_URL is set (allow default only in development)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.DEV ? 'http://localhost:8000' : (() => {
    throw new Error('VITE_API_BASE_URL environment variable is required in production')
  })()
)

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          })

          const { access_token } = response.data
          const user = useAuthStore.getState().user

          if (user) {
            useAuthStore.getState().setAuth(user, access_token, refreshToken)
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', { email, password })
    return response.data
  },

  register: async (data: {
    email: string
    password: string
    full_name: string
    phone?: string
  }) => {
    const response = await api.post('/api/v1/auth/register', data)
    return response.data
  },

  logout: async () => {
    // Implement logout endpoint if needed
    useAuthStore.getState().clearAuth()
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/me')
    return response.data
  },
}

// Clients API
export const clientsAPI = {
  getAll: async () => {
    const response = await api.get('/api/v1/clients')
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
    const response = await api.delete(`/api/v1/clients/${id}`)
    return response.data
  },
}

// Queries API
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

  addComment: async (id: string, comment: string) => {
    const response = await api.post(`/api/v1/queries/${id}/comments`, { comment })
    return response.data
  },
}

export default api
