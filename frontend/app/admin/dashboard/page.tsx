'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  UserGroupIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ServerIcon,
  CircleStackIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Hardcoded demo data
const stats = {
  totalUsers: 1247,
  activeUsers: 892,
  doctors: 45,
  patients: 1150,
  staff: 52,
  todayAppointments: 78,
  revenueToday: 45600,
  pendingApprovals: 12
}

const systemHealth = {
  server: { status: 'healthy', uptime: '99.9%', lastCheck: '2 min ago' },
  database: { status: 'healthy', connections: 45, lastBackup: '6 hours ago' },
  api: { status: 'healthy', responseTime: '45ms', requests: '12.4K/hr' },
  storage: { status: 'warning', used: '78%', total: '500GB' }
}

const recentActivities = [
  { id: 1, action: 'New patient registered', user: 'Staff - Maria G.', time: '5 min ago', type: 'success' },
  { id: 2, action: 'Appointment scheduled', user: 'Dr. Sarah Johnson', time: '12 min ago', type: 'info' },
  { id: 3, action: 'Invoice generated', user: 'System', time: '25 min ago', type: 'info' },
  { id: 4, action: 'Lab test completed', user: 'Lab Tech - John D.', time: '32 min ago', type: 'success' },
  { id: 5, action: 'User role updated', user: 'Admin', time: '1 hour ago', type: 'warning' },
  { id: 6, action: 'Database backup completed', user: 'System', time: '2 hours ago', type: 'success' }
]

const todayOverview = {
  opdVisits: 45,
  ipdAdmissions: 8,
  discharges: 5,
  emergencies: 3,
  labTests: 67,
  procedures: 12
}

const quickActions = [
  { name: 'Add User', href: '/admin/users', icon: UserPlusIcon, color: 'from-blue-500 to-cyan-500' },
  { name: 'Add Department', href: '/admin/departments', icon: BuildingOffice2Icon, color: 'from-purple-500 to-pink-500' },
  { name: 'View Reports', href: '/admin/finance', icon: DocumentPlusIcon, color: 'from-amber-500 to-orange-500' },
  { name: 'System Settings', href: '/admin/settings', icon: ServerIcon, color: 'from-emerald-500 to-teal-500' }
]

export default function AdminDashboard() {
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-amber-600 bg-amber-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
      default: return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
    }
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-slate-300 text-lg">Hospital Management System Control Center</p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <CalendarDaysIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300">Today</p>
                    <p className="font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <ClockIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300">Active Sessions</p>
                    <p className="font-semibold">{stats.activeUsers}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <ServerIcon className="w-20 h-20 text-white/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">{stats.activeUsers} active now</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Doctors</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">{stats.doctors}</p>
                  <p className="text-xs text-purple-600 mt-1">{stats.staff} staff members</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <HeartIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Today's Appointments</p>
                  <p className="text-3xl font-bold text-amber-900 mt-2">{stats.todayAppointments}</p>
                  <p className="text-xs text-amber-600 mt-1">{stats.pendingApprovals} pending</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                  <CalendarDaysIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Revenue Today</p>
                  <p className="text-3xl font-bold text-emerald-900 mt-2">QAR {stats.revenueToday.toLocaleString()}</p>
                  <div className="flex items-center text-xs text-emerald-600 mt-1">
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                    +12% from yesterday
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <CurrencyDollarIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Overview */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <CardTitle className="text-indigo-900 flex items-center">
              <CalendarDaysIcon className="w-6 h-6 mr-2" />
              Today's Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-900">{todayOverview.opdVisits}</p>
                <p className="text-sm text-blue-600">OPD Visits</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-purple-900">{todayOverview.ipdAdmissions}</p>
                <p className="text-sm text-purple-600">IPD Admissions</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-900">{todayOverview.discharges}</p>
                <p className="text-sm text-green-600">Discharges</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-red-900">{todayOverview.emergencies}</p>
                <p className="text-sm text-red-600">Emergencies</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-amber-900">{todayOverview.labTests}</p>
                <p className="text-sm text-amber-600">Lab Tests</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-teal-900">{todayOverview.procedures}</p>
                <p className="text-sm text-teal-600">Procedures</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-slate-200">
              <CardTitle className="text-slate-900 flex items-center">
                <ServerIcon className="w-6 h-6 mr-2" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-200 rounded-lg">
                      <ServerIcon className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Server</p>
                      <p className="text-sm text-gray-600">Uptime: {systemHealth.server.uptime}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getHealthIcon(systemHealth.server.status)}
                    <Badge variant="success">Healthy</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-200 rounded-lg">
                      <CircleStackIcon className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Database</p>
                      <p className="text-sm text-gray-600">{systemHealth.database.connections} connections</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getHealthIcon(systemHealth.database.status)}
                    <Badge variant="success">Healthy</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-200 rounded-lg">
                      <BoltIcon className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">API Response</p>
                      <p className="text-sm text-gray-600">{systemHealth.api.responseTime} avg</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getHealthIcon(systemHealth.api.status)}
                    <Badge variant="success">Healthy</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-200 rounded-lg">
                      <CircleStackIcon className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Storage</p>
                      <p className="text-sm text-gray-600">{systemHealth.storage.used} of {systemHealth.storage.total}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getHealthIcon(systemHealth.storage.status)}
                    <Badge variant="warning">Warning</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="text-blue-900 flex items-center">
                <ClockIcon className="w-6 h-6 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <div className={`p-1.5 rounded-full ${
                      activity.type === 'success' ? 'bg-green-100' :
                      activity.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      <CheckCircleIcon className={`w-4 h-4 ${
                        activity.type === 'success' ? 'text-green-600' :
                        activity.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-slate-200">
            <CardTitle className="text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.name} href={action.href}>
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl hover:shadow-xl hover:scale-105 cursor-pointer transition-all duration-200">
                    <div className={`p-3 bg-gradient-to-br ${action.color} rounded-xl w-fit mb-3 shadow-lg`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900">{action.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
