import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { Save, X, CreditCard, DollarSign } from 'lucide-react'
import { paymentsAPI } from '../../services/apiService'

type PaymentMethod = 'RAZORPAY' | 'STRIPE' | 'BANK_TRANSFER' | 'PAYPAL'

export default function RecordPaymentPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    invoice_id: '',
    client_id: '',
    amount: '',
    currency: 'INR',
    payment_method: 'BANK_TRANSFER' as PaymentMethod,
    gateway_payment_id: '',
    gateway_order_id: '',
    gateway_signature: '',
    card_network: '',
    card_last4: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const paymentData: any = {
        invoice_id: formData.invoice_id,
        client_id: formData.client_id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        payment_method: formData.payment_method,
      }

      // Add gateway details if provided
      if (formData.gateway_payment_id) {
        paymentData.gateway_payment_id = formData.gateway_payment_id
      }
      if (formData.gateway_order_id) {
        paymentData.gateway_order_id = formData.gateway_order_id
      }
      if (formData.gateway_signature) {
        paymentData.gateway_signature = formData.gateway_signature
      }

      // Add gateway response if card details provided
      if (formData.card_network || formData.card_last4) {
        paymentData.gateway_response = {
          status: 'SUCCESS',
          method: formData.payment_method,
          card_network: formData.card_network || undefined,
          card_last4: formData.card_last4 || undefined,
        }
      }

      await paymentsAPI.create(paymentData)

      alert('Payment recorded successfully!')
      navigate('/payments')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-gray-600 mt-1">Record a new payment received from a client</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.invoice_id}
                  onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
                  className="input-field"
                  placeholder="Enter invoice ID"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Invoice ID can be found in the invoices list
                </p>
              </div>

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
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="50000.00"
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
                  Payment Method *
                </label>
                <select
                  required
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                  className="input-field"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="PAYPAL">PayPal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gateway Details (Optional) */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Gateway Details (Optional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gateway Payment ID
                </label>
                <input
                  type="text"
                  value={formData.gateway_payment_id}
                  onChange={(e) => setFormData({ ...formData, gateway_payment_id: e.target.value })}
                  className="input-field"
                  placeholder="pay_xxxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gateway Order ID
                </label>
                <input
                  type="text"
                  value={formData.gateway_order_id}
                  onChange={(e) => setFormData({ ...formData, gateway_order_id: e.target.value })}
                  className="input-field"
                  placeholder="order_xxxxxxxxxxxxx"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gateway Signature
                </label>
                <input
                  type="text"
                  value={formData.gateway_signature}
                  onChange={(e) => setFormData({ ...formData, gateway_signature: e.target.value })}
                  className="input-field"
                  placeholder="Signature from payment gateway"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Network
                </label>
                <input
                  type="text"
                  value={formData.card_network}
                  onChange={(e) => setFormData({ ...formData, card_network: e.target.value })}
                  className="input-field"
                  placeholder="Visa, Mastercard, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Last 4 Digits
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.card_last4}
                  onChange={(e) => setFormData({ ...formData, card_last4: e.target.value })}
                  className="input-field"
                  placeholder="1234"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/payments')}
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
              <span>{loading ? 'Recording...' : 'Record Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
