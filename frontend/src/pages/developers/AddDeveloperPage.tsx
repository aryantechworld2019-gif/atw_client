import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import { Save, X, Code2, DollarSign, Clock } from 'lucide-react'
import { developersAPI } from '../../services/apiService'
import { showToast } from '../../utils/toast'

const COMMON_SKILLS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'FastAPI',
  'MongoDB',
  'PostgreSQL',
  'Docker',
  'AWS',
  'Git',
  'REST API',
  'GraphQL',
  'Next.js',
  'Vue.js',
  'Angular',
  'Express.js',
  'Django',
  'Flask',
  'Java',
  'Spring Boot',
  'Go',
  'Rust',
  'Kubernetes',
  'Redis',
  'Elasticsearch',
]

export default function AddDeveloperPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    user_id: '',
    skills: [] as string[],
    custom_skill: '',
    hourly_rate: '',
    availability_hours: '40',
  })

  const toggleSkill = (skill: string) => {
    if (formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: formData.skills.filter((s) => s !== skill),
      })
    } else {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill],
      })
    }
  }

  const addCustomSkill = () => {
    if (formData.custom_skill.trim() && !formData.skills.includes(formData.custom_skill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.custom_skill.trim()],
        custom_skill: '',
      })
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    })
  }

  const createMutation = useMutation({
    mutationFn: (data: any) => developersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] })
      showToast.success('Developer created successfully!')
      navigate('/developers')
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.detail || 'Failed to create developer')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.skills.length === 0) {
      showToast.error('Please select at least one skill')
      return
    }

    createMutation.mutate({
      user_id: formData.user_id,
      skills: formData.skills,
      hourly_rate: parseFloat(formData.hourly_rate),
      availability_hours: parseFloat(formData.availability_hours),
    })
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Developer</h1>
          <p className="text-gray-600 mt-1">Create a new developer profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Code2 className="w-5 h-5 mr-2" />
              Developer Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="input-field"
                  placeholder="Enter user ID from users list"
                />
                <p className="text-xs text-gray-500 mt-1">
                  User ID can be found in the users management section
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Hourly Rate (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  className="input-field"
                  placeholder="50.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Weekly Availability (Hours) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="168"
                  required
                  value={formData.availability_hours}
                  onChange={(e) => setFormData({ ...formData, availability_hours: e.target.value })}
                  className="input-field"
                  placeholder="40"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills *</h3>

            {/* Common Skills */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select from common skills:
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.skills.includes(skill)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Skill Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add custom skill:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.custom_skill}
                  onChange={(e) => setFormData({ ...formData, custom_skill: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomSkill()
                    }
                  }}
                  className="input-field flex-1"
                  placeholder="Enter skill name"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Selected Skills */}
            {formData.skills.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Skills ({formData.skills.length}):
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary-100 text-primary-800 text-sm font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/developers')}
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
              <span>{createMutation.isPending ? 'Creating...' : 'Create Developer'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
