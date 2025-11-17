import Layout from '../../components/Layout'
import { HelpCircle, Users, Package, FileText } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Queries',
      value: '24',
      icon: HelpCircle,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Active Clients',
      value: '8',
      icon: Users,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      title: 'Maintenance Packages',
      value: '12',
      icon: Package,
      color: 'bg-purple-500',
      change: '+8%',
    },
    {
      title: 'Pending Invoices',
      value: '3',
      icon: FileText,
      color: 'bg-orange-500',
      change: '-2%',
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Your business at a glance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Queries</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Login page not loading</p>
                  <p className="text-sm text-gray-500">Tech Innovations Pvt Ltd</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                  In Progress
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Database optimization needed</p>
                  <p className="text-sm text-gray-500">FinTech Solutions</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Fixed
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input type="checkbox" className="mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Review client feedback</p>
                  <p className="text-sm text-gray-500">Due: Today</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <input type="checkbox" className="mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Generate monthly invoices</p>
                  <p className="text-sm text-gray-500">Due: Tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
