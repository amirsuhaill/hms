'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  ShieldCheckIcon,
  Cog6ToothIcon,
  KeyIcon,
  ClockIcon,
  ServerIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  LockClosedIcon,
  UserGroupIcon,
  BellIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Hardcoded demo data
const hospitalSettings = {
  name: 'City General Hospital',
  email: 'admin@cityhospital.qa',
  phone: '+974-4444-5555',
  address: 'Building 45, Street 12, West Bay, Doha, Qatar',
  logo: '/logo.png',
  website: 'www.cityhospital.qa'
}

const securitySettings = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumbers: true,
  passwordRequireSymbols: true,
  sessionTimeout: 30,
  twoFactorAuth: true,
  loginAttempts: 5,
  lockoutDuration: 15
}

const auditLogs = [
  { id: 1, action: 'User Login', user: 'admin@hms.com', ip: '192.168.1.100', timestamp: '2026-01-29 15:10:25', status: 'Success' },
  { id: 2, action: 'Patient Record Updated', user: 'staff@hms.com', ip: '192.168.1.101', timestamp: '2026-01-29 14:45:12', status: 'Success' },
  { id: 3, action: 'Invoice Generated', user: 'staff@hms.com', ip: '192.168.1.101', timestamp: '2026-01-29 14:30:00', status: 'Success' },
  { id: 4, action: 'Failed Login Attempt', user: 'unknown@test.com', ip: '192.168.1.200', timestamp: '2026-01-29 14:15:45', status: 'Failed' },
  { id: 5, action: 'User Role Modified', user: 'admin@hms.com', ip: '192.168.1.100', timestamp: '2026-01-29 13:50:30', status: 'Success' },
  { id: 6, action: 'System Settings Updated', user: 'admin@hms.com', ip: '192.168.1.100', timestamp: '2026-01-29 12:20:18', status: 'Success' },
  { id: 7, action: 'Database Backup', user: 'System', ip: 'localhost', timestamp: '2026-01-29 06:00:00', status: 'Success' },
  { id: 8, action: 'Failed Login Attempt', user: 'admin@hms.com', ip: '192.168.1.250', timestamp: '2026-01-29 02:45:00', status: 'Failed' }
]

const backupHistory = [
  { id: 1, type: 'Full Backup', size: '2.4 GB', duration: '15 min', status: 'Completed', timestamp: '2026-01-29 06:00:00' },
  { id: 2, type: 'Incremental', size: '450 MB', duration: '3 min', status: 'Completed', timestamp: '2026-01-28 18:00:00' },
  { id: 3, type: 'Full Backup', size: '2.3 GB', duration: '14 min', status: 'Completed', timestamp: '2026-01-28 06:00:00' },
  { id: 4, type: 'Incremental', size: '380 MB', duration: '2 min', status: 'Completed', timestamp: '2026-01-27 18:00:00' }
]

const notificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  appointmentReminders: true,
  systemAlerts: true,
  reportGeneration: true
}

type TabType = 'general' | 'security' | 'audit' | 'backup' | 'notifications'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [settings, setSettings] = useState(hospitalSettings)
  const [security, setSecurity] = useState(securitySettings)
  const [notifications, setNotifications] = useState(notificationSettings)
  const [isSaving, setIsSaving] = useState(false)

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'audit', name: 'Audit Log', icon: ClockIcon },
    { id: 'backup', name: 'Backup', icon: ServerIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon }
  ]

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert('Settings saved successfully! (Demo)')
    }, 1000)
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings & Security</h1>
              <p className="text-gray-600 mt-1">System configuration and security options</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 py-3 px-4 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-white text-slate-700 shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-slate-200">
              <CardTitle className="text-slate-900 flex items-center">
                <Cog6ToothIcon className="w-6 h-6 mr-2" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Hospital Name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                />
                <Input
                  label="Contact Email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
                <Input
                  label="Website"
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Logo</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <GlobeAltIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <Button variant="outline">Upload Logo</Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Demo only - logo upload is simulated</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t flex justify-end">
                <Button onClick={handleSave} loading={isSaving} className="bg-gradient-to-r from-slate-600 to-gray-700">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100">
                <CardTitle className="text-red-900 flex items-center">
                  <KeyIcon className="w-6 h-6 mr-2" />
                  Password Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
                    <input
                      type="number"
                      value={security.passwordMinLength}
                      onChange={(e) => setSecurity({ ...security, passwordMinLength: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={security.loginAttempts}
                      onChange={(e) => setSecurity({ ...security, loginAttempts: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require Uppercase Letter</p>
                      <p className="text-sm text-gray-500">Password must contain at least one uppercase letter</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={security.passwordRequireUppercase}
                      onChange={(e) => setSecurity({ ...security, passwordRequireUppercase: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require Numbers</p>
                      <p className="text-sm text-gray-500">Password must contain at least one number</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={security.passwordRequireNumbers}
                      onChange={(e) => setSecurity({ ...security, passwordRequireNumbers: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require Special Characters</p>
                      <p className="text-sm text-gray-500">Password must contain at least one special character</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={security.passwordRequireSymbols}
                      onChange={(e) => setSecurity({ ...security, passwordRequireSymbols: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="text-purple-900 flex items-center">
                  <LockClosedIcon className="w-6 h-6 mr-2" />
                  Session & Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Lockout Duration (minutes)</label>
                    <input
                      type="number"
                      value={security.lockoutDuration}
                      onChange={(e) => setSecurity({ ...security, lockoutDuration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <DevicePhoneMobileIcon className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={security.twoFactorAuth}
                      onChange={(e) => setSecurity({ ...security, twoFactorAuth: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>
                </div>
                <div className="mt-6 pt-6 border-t flex justify-end">
                  <Button onClick={handleSave} loading={isSaving} className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audit Log */}
        {activeTab === 'audit' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-900 flex items-center">
                  <ClockIcon className="w-6 h-6 mr-2" />
                  Audit Log
                </CardTitle>
                <Button variant="outline" size="sm">
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Export Log
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className={`hover:bg-gray-50 ${log.status === 'Failed' ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {log.status === 'Failed' ? (
                              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                            ) : (
                              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                            )}
                            <span className="font-medium text-gray-900">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{log.user}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{log.ip}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{log.timestamp}</td>
                        <td className="px-6 py-4">
                          <Badge variant={log.status === 'Success' ? 'success' : 'danger'}>{log.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Last Backup</p>
                      <p className="text-lg font-bold text-green-900">6 hours ago</p>
                    </div>
                    <CheckCircleIcon className="w-10 h-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Database Size</p>
                      <p className="text-lg font-bold text-blue-900">2.4 GB</p>
                    </div>
                    <ServerIcon className="w-10 h-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Total Backups</p>
                      <p className="text-lg font-bold text-purple-900">24</p>
                    </div>
                    <DocumentArrowDownIcon className="w-10 h-10 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-teal-900 flex items-center">
                    <ServerIcon className="w-6 h-6 mr-2" />
                    Backup History
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-teal-600 to-cyan-600">
                      <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                      Create Backup
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {backupHistory.map((backup) => (
                        <tr key={backup.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <Badge variant={backup.type === 'Full Backup' ? 'info' : 'default'}>{backup.type}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{backup.size}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{backup.duration}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{backup.timestamp}</td>
                          <td className="px-6 py-4">
                            <Badge variant="success">{backup.status}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm">
                              <DocumentArrowDownIcon className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <CardTitle className="text-amber-900 flex items-center">
                <BellIcon className="w-6 h-6 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DevicePhoneMobileIcon className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsNotifications}
                    onChange={(e) => setNotifications({ ...notifications, smsNotifications: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-gray-900">Appointment Reminders</p>
                      <p className="text-sm text-gray-500">Send reminders to patients</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.appointmentReminders}
                    onChange={(e) => setNotifications({ ...notifications, appointmentReminders: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-gray-900">System Alerts</p>
                      <p className="text-sm text-gray-500">Critical system notifications</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.systemAlerts}
                    onChange={(e) => setNotifications({ ...notifications, systemAlerts: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DocumentArrowDownIcon className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-gray-900">Report Generation</p>
                      <p className="text-sm text-gray-500">Notify when reports are ready</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.reportGeneration}
                    onChange={(e) => setNotifications({ ...notifications, reportGeneration: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                  />
                </label>
              </div>
              <div className="mt-6 pt-6 border-t flex justify-end">
                <Button onClick={handleSave} loading={isSaving} className="bg-gradient-to-r from-amber-600 to-orange-600">
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
