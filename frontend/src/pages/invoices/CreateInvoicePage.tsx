import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { Save, X, FileText, Plus, Trash2 } from 'lucide-react'
import { invoicesAPI } from '../../services/apiService'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
}

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    package_id: '',
    billing_period_start: '',
    billing_period_end: '',
    tax_rate: '18',
    currency: 'INR',
    due_date: '',
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0 },
  ])

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (parseFloat(formData.tax_rate) / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate line items
      const hasEmptyItems = lineItems.some(item => !item.description || item.unit_price <= 0)
      if (hasEmptyItems) {
        alert('Please fill in all line items with valid data')
        setLoading(false)
        return
      }

      await invoicesAPI.create({
        client_id: formData.client_id,
        package_id: formData.package_id || undefined,
        billing_period: {
          start_date: new Date(formData.billing_period_start).toISOString(),
          end_date: new Date(formData.billing_period_end).toISOString(),
        },
        line_items: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        tax_rate: parseFloat(formData.tax_rate),
        currency: formData.currency,
        due_date: new Date(formData.due_date).toISOString(),
      })

      alert('Invoice created successfully!')
      navigate('/invoices')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600 mt-1">Generate a new invoice for a client</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Invoice Details
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.package_id}
                  onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                  className="input-field"
                  placeholder="Link to maintenance package (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Period Start *
                </label>
                <input
                  type="date"
                  required
                  value={formData.billing_period_start}
                  onChange={(e) => setFormData({ ...formData, billing_period_start: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Period End *
                </label>
                <input
                  type="date"
                  required
                  value={formData.billing_period_end}
                  onChange={(e) => setFormData({ ...formData, billing_period_end: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                  className="input-field"
                  placeholder="18"
                />
              </div>

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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Line Items *</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="btn-secondary flex items-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      className="input-field"
                      placeholder="Service or product description"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value))}
                      className="input-field"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value))}
                      className="input-field"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total
                    </label>
                    <div className="input-field bg-gray-100">
                      {(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                  </div>

                  <div className="col-span-1 pt-8">
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Invoice Summary */}
            <div className="mt-6 pt-6 border-t">
              <div className="max-w-sm ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formData.currency} {calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({formData.tax_rate}%):</span>
                  <span className="font-medium">{formData.currency} {calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary-600">{formData.currency} {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="btn-secondary flex items-center space-x-2"
              disabled={loading}
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Creating...' : 'Create Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
