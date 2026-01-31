'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  ClockIcon,
  BuildingOffice2Icon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Hardcoded demo data
const appointmentStats = {
  today: 78,
  thisWeek: 423,
  thisMonth: 1845,
  cancelled: 12,
  completed: 1650,
  noShow: 45
}

const dailyAppointments = [
  { day: 'Mon', count: 65, color: 'bg-blue-500' },
  { day: 'Tue', count: 82, color: 'bg-blue-500' },
  { day: 'Wed', count: 74, color: 'bg-blue-500' },
  { day: 'Thu', count: 91, color: 'bg-blue-500' },
  { day: 'Fri', count: 68, color: 'bg-blue-500' },
  { day: 'Sat', count: 43, color: 'bg-blue-400' },
  { day: 'Sun', count: 0, color: 'bg-gray-300' }
]

const departmentWiseAppointments = [
  { department: 'General Medicine', count: 245, percentage: 28 },
  { department: 'Cardiology', count: 189, percentage: 22 },
  { department: 'Pediatrics', count: 156, percentage: 18 },
  { department: 'Orthopedics', count: 134, percentage: 15 },
  { department: 'Emergency', count: 98, percentage: 11 },
  { department: 'Others', count: 52, percentage: 6 }
]

const opdIpdStats = {
  opd: {
    today: 45,
    thisWeek: 312,
    thisMonth: 1350,
    avgWaitTime: '18 min',
    trend: 'up'
  },
  ipd: {
    currentAdmissions: 156,
    admissionsToday: 8,
    dischargesToday: 5,
    avgStay: '4.2 days',
    trend: 'stable'
  },
  bedOccupancy: {
    total: 200,
    occupied: 156,
    available: 34,
    maintenance: 10,
    percentage: 78
  }
}

const recentAppointments = [
  { id: 1, patient: 'John Doe', doctor: 'Dr. Sarah Johnson', department: 'Cardiology', time: '10:00 AM', status: 'Completed' },
  { id: 2, patient: 'Lisa Anderson', doctor: 'Dr. Michael Chen', department: 'General Medicine', time: '10:30 AM', status: 'In Progress' },
  { id: 3, patient: 'Robert Taylor', doctor: 'Dr. Emily Brown', department: 'Pediatrics', time: '11:00 AM', status: 'Waiting' },
  { id: 4, patient: 'Maria Garcia', doctor: 'Dr. David Kim', department: 'Orthopedics', time: '11:30 AM', status: 'Scheduled' },
  { id: 5, patient: 'James Wilson', doctor: 'Dr. Lisa Anderson', department: 'Emergency', time: '12:00 PM', status: 'Scheduled' }
]

type TimeFilter = 'daily' | 'weekly' | 'monthly'

export default function OperationsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('weekly')

  const maxDailyCount = Math.max(...dailyAppointments.map(d => d.count))

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
              <h1 className="text-3xl font-bold text-gray-900">Operations Management</h1>
              <p className="text-gray-600 mt-1">Appointment analytics and OPD/IPD statistics</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {(['daily', 'weekly', 'monthly'] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                  timeFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Appointment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
              <p className="text-sm text-blue-600">Today</p>
              <p className="text-2xl font-bold text-blue-900">{appointmentStats.today}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
              <p className="text-sm text-purple-600">This Week</p>
              <p className="text-2xl font-bold text-purple-900">{appointmentStats.thisWeek}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50">
              <p className="text-sm text-indigo-600">This Month</p>
              <p className="text-2xl font-bold text-indigo-900">{appointmentStats.thisMonth}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
              <p className="text-sm text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900">{appointmentStats.completed}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-amber-50 to-orange-50">
              <p className="text-sm text-amber-600">Cancelled</p>
              <p className="text-2xl font-bold text-amber-900">{appointmentStats.cancelled}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-red-50 to-rose-50">
              <p className="text-sm text-red-600">No Show</p>
              <p className="text-2xl font-bold text-red-900">{appointmentStats.noShow}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Appointments Chart */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="text-blue-900 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2" />
                Weekly Appointment Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-end justify-between h-48 gap-2">
                {dailyAppointments.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center justify-end h-40">
                      <span className="text-sm font-semibold text-gray-700 mb-2">{day.count}</span>
                      <div
                        className={`w-full max-w-12 rounded-t-lg ${day.color} transition-all duration-300`}
                        style={{ height: `${(day.count / maxDailyCount) * 100}%`, minHeight: day.count > 0 ? '20px' : '0' }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 mt-2">{day.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department-wise Distribution */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <CardTitle className="text-purple-900 flex items-center">
                <BuildingOffice2Icon className="w-6 h-6 mr-2" />
                Department-wise Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {departmentWiseAppointments.map((dept) => (
                  <div key={dept.department}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{dept.department}</span>
                      <span className="text-gray-500">{dept.count} ({dept.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OPD vs IPD Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* OPD Stats */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              <CardTitle className="flex items-center">
                <UserGroupIcon className="w-6 h-6 mr-2" />
                OPD Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Today's Visits</span>
                  <span className="text-xl font-bold text-blue-900">{opdIpdStats.opd.today}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">This Week</span>
                  <span className="text-xl font-bold text-blue-900">{opdIpdStats.opd.thisWeek}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">This Month</span>
                  <span className="text-xl font-bold text-blue-900">{opdIpdStats.opd.thisMonth}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Avg Wait Time</span>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1 text-blue-600" />
                    <span className="font-bold text-blue-900">{opdIpdStats.opd.avgWaitTime}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IPD Stats */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardTitle className="flex items-center">
                <BuildingOffice2Icon className="w-6 h-6 mr-2" />
                IPD Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Current Admissions</span>
                  <span className="text-xl font-bold text-purple-900">{opdIpdStats.ipd.currentAdmissions}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Admissions Today</span>
                  <div className="flex items-center">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1 text-green-600" />
                    <span className="font-bold text-green-900">{opdIpdStats.ipd.admissionsToday}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Discharges Today</span>
                  <div className="flex items-center">
                    <ArrowTrendingDownIcon className="w-4 h-4 mr-1 text-blue-600" />
                    <span className="font-bold text-blue-900">{opdIpdStats.ipd.dischargesToday}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-600">Avg Length of Stay</span>
                  <span className="font-bold text-purple-900">{opdIpdStats.ipd.avgStay}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bed Occupancy */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              <CardTitle className="flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2" />
                Bed Occupancy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${opdIpdStats.bedOccupancy.percentage * 3.52} 352`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{opdIpdStats.bedOccupancy.percentage}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-700">{opdIpdStats.bedOccupancy.available}</p>
                  <p className="text-xs text-green-600">Available</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold text-red-700">{opdIpdStats.bedOccupancy.occupied}</p>
                  <p className="text-xs text-red-600">Occupied</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="text-lg font-bold text-amber-700">{opdIpdStats.bedOccupancy.maintenance}</p>
                  <p className="text-xs text-amber-600">Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-slate-200">
            <CardTitle className="text-slate-900 flex items-center">
              <CalendarDaysIcon className="w-6 h-6 mr-2" />
              Recent Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{apt.patient}</td>
                      <td className="px-6 py-4 text-gray-600">{apt.doctor}</td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{apt.department}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{apt.time}</td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          apt.status === 'Completed' ? 'success' :
                          apt.status === 'In Progress' ? 'info' :
                          apt.status === 'Waiting' ? 'warning' : 'default'
                        }>
                          {apt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
