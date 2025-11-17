import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import { Save, X, Building2, Mail, Phone, MapPin } from 'lucide-react'
import { clientsAPI } from '../../services/apiService'
import { showToast } from '../../utils/toast'

interface ClientData {
  id: string
  company_name: string
  industry: string
  website?: string
  contact_info: {
    name: string
    email: string
    phone: string
    designation: string
  }
  address: {
    street: string
    city: string
    state: string
    country: string
    pincode: string
  }
  billing_email: string
  tax_id?: string
  status: string
}

export default function EditClientPage() {
  const navigate = useNavigate()
  const { clientId } = useParams<{ clientId: string }>()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    website: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_designation: '',
    street: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    billing_email: '',
    tax_id: '',
    status: 'ACTIVE',
  })

  // Fetch client data
  const { data: client, isLoading } = useQuery<ClientData>({
    queryKey: ['client', clientId],
    queryFn: () => clientsAPI.getById(clientId!),
    enabled: !!clientId,
  })

  // Update form when client data is loaded
  useEffect(() => {
    if (client) {
      setFormData({
        company_name: client.company_name,
        industry: client.industry,
        website: client.website || '',
        contact_name: client.contact_info.name,
        contact_email: client.contact_info.email,
        contact_phone: client.contact_info.phone,
        contact_designation: client.contact_info.designation,
        street: client.address.street,
        city: client.address.city,
        state: client.address.state,
        country: client.address.country,
        pincode: client.address.pincode,
        billing_email: client.billing_email,
        tax_id: client.tax_id || '',
        status: client.status,
      })
    }
  }, [client])

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => clientsAPI.update(clientId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', clientId] })
      showToast.success('Client updated successfully!')
      navigate('/clients')
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.detail || 'Failed to update client')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    updateMutation.mutate({
      company_name: formData.company_name,
      industry: formData.industry,
      website: formData.website || undefined,
      contact_info: {
        name: formData.contact_name,
        email: formData.contact_email,
        phone: formData.contact_phone,
        designation: formData.contact_designation,
      },
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
      },
      billing_email: formData.billing_email,
      tax_id: formData.tax_id || undefined,
      status: formData.status,
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!client) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">Client not found</p>
          <button
            onClick={() => navigate('/clients')}
            className="mt-4 btn-primary"
          >
            Back to Clients
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
          <p className="text-gray-600 mt-1">Update client information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Company Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="input-field"
                  placeholder="Tech Innovations Pvt Ltd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <input
                  type="text"
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="input-field"
                  placeholder="FinTech, E-commerce, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Primary Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_designation}
                  onChange={(e) => setFormData({ ...formData, contact_designation: e.target.value })}
                  className="input-field"
                  placeholder="CEO, CTO, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="input-field"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="input-field"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="input-field"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="input-field"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input-field"
                  placeholder="USA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="input-field"
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.billing_email}
                  onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                  className="input-field"
                  placeholder="billing@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax ID / GST Number
                </label>
                <input
                  type="text"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  className="input-field"
                  placeholder="GST123456789"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="btn-secondary flex items-center space-x-2"
              disabled={updateMutation.isPending}
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={updateMutation.isPending}
            >
              <Save className="w-5 h-5" />
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
