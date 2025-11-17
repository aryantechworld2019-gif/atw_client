import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import { Save, X, Package, DollarSign, Calendar, Clock } from 'lucide-react'
import { maintenanceAPI } from '../../services/apiService'
import { showToast } from '../../utils/toast'

type PackageType = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE' | 'CUSTOM'
type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'

export default function CreateMaintenancePackagePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    client_id: '',
    package_type: 'STANDARD' as PackageType,
    package_name: '',
    total_hours: '',
    price: '',
    currency: 'INR',
    billing_cycle: 'MONTHLY' as BillingCycle,
    start_date: '',
    end_date: '',
    auto_renew: true,
    priority_support: false,
    support_24x7: false,
    dedicated_developer: false,
    response_time_sla: '24 hours',
    max_concurrent_queries: '3',
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => maintenanceAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-packages'] })
      showToast.success('Maintenance package created successfully!')
      navigate('/maintenance/packages')
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.detail || 'Failed to create maintenance package')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    createMutation.mutate({
      client_id: formData.client_id,
      package_type: formData.package_type,
      package_name: formData.package_name,
      total_hours: parseFloat(formData.total_hours),
      price: parseFloat(formData.price),
      currency: formData.currency,
      billing_cycle: formData.billing_cycle,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      auto_renew: formData.auto_renew,
      features: {
        priority_support: formData.priority_support,
        support_24x7: formData.support_24x7,
        dedicated_developer: formData.dedicated_developer,
        response_time_sla: formData.response_time_sla,
        max_concurrent_queries: parseInt(formData.max_concurrent_queries),
      },
    })
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Maintenance Package</h1>
          <p className="text-gray-600 mt-1">Set up a new maintenance package for a client</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Package Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="input-field"
                  placeholder="Enter client ID"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Client ID can be found in the clients list
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Type *
                </label>
                <select
                  required
                  value={formData.package_type}
                  onChange={(e) => setFormData({ ...formData, package_type: e.target.value as PackageType })}
                  className="input-field"
                >
                  <option value="BASIC">Basic</option>
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="ENTERPRISE">Enterprise</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.package_name}
                  onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                  className="input-field"
                  placeholder="Standard Support Package"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Total Hours *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={formData.total_hours}
                  onChange={(e) => setFormData({ ...formData, total_hours: e.target.value })}
                  className="input-field"
                  placeholder="40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  placeholder="50000.00"
                />
              </div>
            </div>
          </div>

          {/* Billing Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Billing & Dates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="input-field"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Cycle *
                </label>
                <select
                  required
                  value={formData.billing_cycle}
                  onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as BillingCycle })}
                  className="input-field"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.auto_renew}
                    onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Auto-renew package at the end of billing cycle
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Package Features */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Features</h3>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.priority_support}
                  onChange={(e) => setFormData({ ...formData, priority_support: e.target.checked })}
                  className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Priority Support</span>
                  <p className="text-xs text-gray-500">Get priority in the support queue</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.support_24x7}
                  onChange={(e) => setFormData({ ...formData, support_24x7: e.target.checked })}
                  className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">24/7 Support</span>
                  <p className="text-xs text-gray-500">Round-the-clock support availability</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.dedicated_developer}
                  onChange={(e) => setFormData({ ...formData, dedicated_developer: e.target.checked })}
                  className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Dedicated Developer</span>
                  <p className="text-xs text-gray-500">Assign a dedicated developer for this package</p>
                </div>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Time SLA
                  </label>
                  <input
                    type="text"
                    value={formData.response_time_sla}
                    onChange={(e) => setFormData({ ...formData, response_time_sla: e.target.value })}
                    className="input-field"
                    placeholder="24 hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Concurrent Queries
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_concurrent_queries}
                    onChange={(e) => setFormData({ ...formData, max_concurrent_queries: e.target.value })}
                    className="input-field"
                    placeholder="3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/maintenance/packages')}
              className="btn-secondary flex items-center space-x-2"
              disabled={createMutation.isPending}
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={createMutation.isPending}
            >
              <Save className="w-5 h-5" />
              <span>{createMutation.isPending ? 'Creating...' : 'Create Package'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
