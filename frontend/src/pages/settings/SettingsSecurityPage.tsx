import { useState } from 'react'
import Layout from '../../components/Layout'
import { Lock, Shield, Key, Save } from 'lucide-react'

export default function SettingsSecurityPage() {
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Change password:', passwordData)
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account security and authentication</p>
        </div>

        {/* Change Password */}
        <form onSubmit={handlePasswordChange} className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Change Password
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, current_password: e.target.value })
                }
                className="input-field"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new_password: e.target.value })
                }
                className="input-field"
                placeholder="Enter new password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirm_password: e.target.value })
                }
                className="input-field"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t">
            <button type="submit" className="btn-primary flex items-center space-x-2">
              <Save className="w-5 h-5" />
              <span>Update Password</span>
            </button>
          </div>
        </form>

        {/* Two-Factor Authentication */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Two-Factor Authentication
          </h3>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-700">
                Add an extra layer of security to your account
              </p>
              <p className="text-sm text-gray-500 mt-1">
                When enabled, you'll need to enter a verification code from your phone in addition to your password
              </p>
            </div>
            <div className="ml-4">
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {twoFactorEnabled && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">Setup Two-Factor Authentication</p>
              <p className="text-sm text-blue-700 mt-1">
                Scan the QR code with your authenticator app or enter the setup key manually
              </p>
              <button className="btn-secondary mt-3">Configure 2FA</button>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Active Sessions
          </h3>

          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Current Session</p>
                <p className="text-sm text-gray-600 mt-1">
                  Chrome on Windows • 192.168.1.100
                </p>
                <p className="text-xs text-gray-500 mt-1">Last active: Just now</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Mobile Device</p>
                <p className="text-sm text-gray-600 mt-1">
                  Safari on iPhone • 192.168.1.105
                </p>
                <p className="text-xs text-gray-500 mt-1">Last active: 2 hours ago</p>
              </div>
              <button className="text-sm text-red-600 hover:text-red-700">Revoke</button>
            </div>
          </div>

          <button className="btn-secondary mt-4 w-full">Revoke All Other Sessions</button>
        </div>
      </div>
    </Layout>
  )
}
