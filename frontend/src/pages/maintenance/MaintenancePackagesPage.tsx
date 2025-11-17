import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { Package, Plus, Search, TrendingUp, TrendingDown } from 'lucide-react'
import { MaintenancePackage, PackageStatus } from '../../types'

export default function MaintenancePackagesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data
  const packages: MaintenancePackage[] = [
    {
      id: '1',
      client_id: 'c1',
      package_name: 'Premium Support Package',
      description: 'Comprehensive support with 40 hours/month',
      included_hours: 40,
      used_hours: 25,
      remaining_hours: 15,
      monthly_fee: 2000,
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      status: PackageStatus.ACTIVE,
      auto_renew: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
    },
    {
      id: '2',
      client_id: 'c2',
      package_name: 'Standard Support Package',
      description: 'Standard support with 20 hours/month',
      included_hours: 20,
      used_hours: 12,
      remaining_hours: 8,
      monthly_fee: 1000,
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      status: PackageStatus.ACTIVE,
      auto_renew: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
    },
  ]

  const getStatusBadge = (status: PackageStatus) => {
    const styles = {
      [PackageStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [PackageStatus.EXPIRED]: 'bg-gray-100 text-gray-800',
      [PackageStatus.CANCELLED]: 'bg-red-100 text-red-800',
    }
    return styles[status]
  }

  const getUsagePercentage = (pkg: MaintenancePackage) => {
    return (pkg.used_hours / pkg.included_hours) * 100
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Packages</h1>
            <p className="text-gray-600 mt-1">Manage client maintenance packages</p>
          </div>
          <button
            onClick={() => navigate('/maintenance/packages/create')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Package</span>
          </button>
        </div>

        {/* Search */}
        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Packages List */}
        <div className="space-y-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{pkg.package_name}</h3>
                      <p className="text-sm text-gray-600">{pkg.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6 mt-4">
                    {/* Hours Usage */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Hours Usage</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Used:</span>
                          <span className="font-semibold">{pkg.used_hours}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Remaining:</span>
                          <span className="font-semibold text-green-600">{pkg.remaining_hours}h</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              getUsagePercentage(pkg) > 80
                                ? 'bg-red-500'
                                : getUsagePercentage(pkg) > 50
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${getUsagePercentage(pkg)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Billing */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Billing</p>
                      <p className="text-2xl font-bold text-gray-900">${pkg.monthly_fee}</p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>

                    {/* Period */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Period</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">
                          <span className="text-gray-500">Start:</span>{' '}
                          {new Date(pkg.start_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700">
                          <span className="text-gray-500">End:</span>{' '}
                          {new Date(pkg.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          pkg.status
                        )}`}
                      >
                        {pkg.status.toUpperCase()}
                      </span>
                      {pkg.auto_renew && (
                        <p className="text-xs text-green-600 mt-1">Auto-renew enabled</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 mt-4 pt-4 border-t">
                    <button className="btn-secondary">View Details</button>
                    <button className="btn-secondary">Edit Package</button>
                    <button className="btn-secondary">View Usage Log</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
