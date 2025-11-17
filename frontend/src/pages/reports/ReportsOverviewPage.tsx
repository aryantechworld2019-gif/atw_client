import Layout from '../../components/Layout'
import { BarChart3, TrendingUp, Download, Calendar, Users, DollarSign, Clock, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ReportsOverviewPage() {
  const navigate = useNavigate()

  const reportCategories = [
    {
      title: 'Client Reports',
      description: 'Detailed insights on client activities, queries, and engagement',
      icon: Users,
      color: 'bg-blue-500',
      path: '/reports/clients',
      metrics: ['Active Clients', 'New Clients', 'Churn Rate', 'Client Satisfaction'],
    },
    {
      title: 'Developer Reports',
      description: 'Track developer productivity, hours worked, and project completion',
      icon: Clock,
      color: 'bg-green-500',
      path: '/reports/developers',
      metrics: ['Total Hours', 'Projects Completed', 'Avg. Rating', 'Availability'],
    },
    {
      title: 'Financial Reports',
      description: 'Revenue analysis, invoicing, payments, and financial forecasting',
      icon: DollarSign,
      color: 'bg-purple-500',
      path: '/reports/financial',
      metrics: ['Total Revenue', 'Outstanding', 'Monthly Recurring', 'Profit Margin'],
    },
    {
      title: 'Package Reports',
      description: 'Maintenance package usage, renewal rates, and performance',
      icon: Package,
      color: 'bg-orange-500',
      path: '/reports/packages',
      metrics: ['Active Packages', 'Hours Used', 'Renewal Rate', 'Package Revenue'],
    },
  ]

  const quickStats = [
    { label: 'Total Revenue (YTD)', value: '$125,450', change: '+12.5%', trend: 'up' },
    { label: 'Active Projects', value: '34', change: '+5', trend: 'up' },
    { label: 'Hours Logged (MTD)', value: '1,248', change: '+8.2%', trend: 'up' },
    { label: 'Client Satisfaction', value: '4.8/5', change: '+0.2', trend: 'up' },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export All Reports</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Date Range Selector */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Report Period:</span>
            <select className="input-field">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
              <option>Custom Range</option>
            </select>
            <input type="date" className="input-field" />
            <span className="text-gray-500">to</span>
            <input type="date" className="input-field" />
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <div
                key={index}
                className="card hover:shadow-xl transition-all cursor-pointer"
                onClick={() => navigate(category.path)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {category.metrics.map((metric, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>

                    <button className="btn-secondary mt-4 w-full flex items-center justify-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>View {category.title}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Report Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Monthly Financial Report Generated</p>
                <p className="text-xs text-gray-500">2 hours ago by Admin</p>
              </div>
              <button className="text-primary-600 hover:text-primary-700 text-sm">Download</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Client Performance Report</p>
                <p className="text-xs text-gray-500">Yesterday by Manager</p>
              </div>
              <button className="text-primary-600 hover:text-primary-700 text-sm">Download</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
