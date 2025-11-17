import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { FileText, Plus, Download, Send, Eye } from 'lucide-react'
import { Invoice, InvoiceStatus } from '../../types'

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data
  const invoices: Invoice[] = [
    {
      id: '1',
      invoice_number: 'INV-2025-001',
      client_id: 'c1',
      issue_date: '2025-01-01',
      due_date: '2025-01-31',
      line_items: [
        { description: 'Monthly Maintenance Package', quantity: 1, unit_price: 2000, total: 2000 },
        { description: 'Additional Development Hours (10h)', quantity: 10, unit_price: 50, total: 500 },
      ],
      subtotal: 2500,
      tax_percentage: 18,
      tax_amount: 450,
      total_amount: 2950,
      amount_paid: 2950,
      amount_due: 0,
      status: InvoiceStatus.PAID,
      notes: 'Thank you for your business!',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
    },
    {
      id: '2',
      invoice_number: 'INV-2025-002',
      client_id: 'c2',
      issue_date: '2025-01-10',
      due_date: '2025-02-10',
      line_items: [
        { description: 'Standard Support Package', quantity: 1, unit_price: 1000, total: 1000 },
      ],
      subtotal: 1000,
      tax_percentage: 18,
      tax_amount: 180,
      total_amount: 1180,
      amount_paid: 0,
      amount_due: 1180,
      status: InvoiceStatus.SENT,
      created_at: '2025-01-10T00:00:00Z',
      updated_at: '2025-01-10T00:00:00Z',
    },
  ]

  const getStatusBadge = (status: InvoiceStatus) => {
    const styles = {
      [InvoiceStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [InvoiceStatus.SENT]: 'bg-blue-100 text-blue-800',
      [InvoiceStatus.PAID]: 'bg-green-100 text-green-800',
      [InvoiceStatus.OVERDUE]: 'bg-red-100 text-red-800',
      [InvoiceStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
    }
    return styles[status]
  }

  const totalRevenue = invoices
    .filter((inv) => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + inv.total_amount, 0)

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.CANCELLED)
    .reduce((sum, inv) => sum + inv.amount_due, 0)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">Manage client invoices and billing</p>
          </div>
          <button
            onClick={() => navigate('/invoices/create')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Invoice</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{invoices.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">
                  ${totalOutstanding.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Invoices</option>
              <option value={InvoiceStatus.DRAFT}>Draft</option>
              <option value={InvoiceStatus.SENT}>Sent</option>
              <option value={InvoiceStatus.PAID}>Paid</option>
              <option value={InvoiceStatus.OVERDUE}>Overdue</option>
              <option value={InvoiceStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Due
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
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-primary-600">
                      {invoice.invoice_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      ${invoice.total_amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      ${invoice.amount_due.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        invoice.status
                      )}`}
                    >
                      {invoice.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="p-1 text-gray-600 hover:text-primary-600" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-primary-600" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-primary-600" title="Send">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
