import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { CreditCard, Plus, Filter, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Payment, PaymentStatus, PaymentMethod } from '../../types'

export default function PaymentsPage() {
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data
  const payments: Payment[] = [
    {
      id: '1',
      client_id: 'c1',
      invoice_id: 'inv1',
      amount: 2000,
      payment_method: PaymentMethod.BANK_TRANSFER,
      payment_date: '2025-01-15',
      transaction_id: 'TXN123456789',
      status: PaymentStatus.COMPLETED,
      notes: 'Monthly maintenance fee - January 2025',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      client_id: 'c2',
      invoice_id: 'inv2',
      amount: 1500,
      payment_method: PaymentMethod.CREDIT_CARD,
      payment_date: '2025-01-14',
      transaction_id: 'TXN987654321',
      status: PaymentStatus.PENDING,
      notes: 'Additional development hours',
      created_at: '2025-01-14T14:00:00Z',
      updated_at: '2025-01-14T14:00:00Z',
    },
  ]

  const getStatusBadge = (status: PaymentStatus) => {
    const styles = {
      [PaymentStatus.COMPLETED]: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      [PaymentStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      [PaymentStatus.FAILED]: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      [PaymentStatus.REFUNDED]: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
    }
    return styles[status]
  }

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const completedAmount = payments
    .filter((p) => p.status === PaymentStatus.COMPLETED)
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-1">Track and manage payment transactions</p>
          </div>
          <button
            onClick={() => navigate('/payments/record')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Record Payment</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">${totalAmount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  ${completedAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">
                  ${(totalAmount - completedAmount).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Payments</option>
              <option value={PaymentStatus.COMPLETED}>Completed</option>
              <option value={PaymentStatus.PENDING}>Pending</option>
              <option value={PaymentStatus.FAILED}>Failed</option>
              <option value={PaymentStatus.REFUNDED}>Refunded</option>
            </select>
            <input type="date" className="input-field" placeholder="From Date" />
            <input type="date" className="input-field" placeholder="To Date" />
          </div>
        </div>

        {/* Payments Table */}
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => {
                const statusInfo = getStatusBadge(payment.status)
                const StatusIcon = statusInfo.icon
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {payment.transaction_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-primary-600">
                        #{payment.invoice_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {payment.payment_method.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        View
                      </button>
                      <button className="text-primary-600 hover:text-primary-900">
                        Download
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
