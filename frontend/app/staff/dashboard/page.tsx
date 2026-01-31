'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { appointmentApi, patientApi } from '@/lib/api'
import { formatDateTime, formatDate } from '@/lib/utils'
import {
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  pendingAppointments: number
  completedAppointments: number
}

interface RecentAppointment {
  id: number
  patient_name: string
  doctor_name: string
  scheduled_datetime: string
  status: string
  visit_type: string
}

export default function StaffDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  })
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all appointments (with a high limit to get all)
      const appointmentsResponse = await appointmentApi.getAll(1, 1000)
      if (appointmentsResponse.success && appointmentsResponse.data) {
        setRecentAppointments(appointmentsResponse.data.slice(0, 5)) // Show only 5 recent
        
        // Calculate stats from all appointments
        const today = new Date().toISOString().split('T')[0]
        const todayAppts = appointmentsResponse.data.filter((apt: any) => 
          apt.scheduled_datetime.startsWith(today)
        )
        const pendingAppts = appointmentsResponse.data.filter((apt: any) => 
          apt.status === 'SCHEDULED'
        )
        const completedAppts = appointmentsResponse.data.filter((apt: unknown) => 
          apt.status === 'COMPLETED'
        )

        setStats(prev => ({
          ...prev,
          todayAppointments: todayAppts.length,
          pendingAppointments: pendingAppts.length,
          completedAppointments: completedAppts.length
        }))
      }

      // Fetch patients count
      const patientsResponse = await patientApi.getAll(1, 1)
      if (patientsResponse.success && patientsResponse.pagination) {
        setStats(prev => ({
          ...prev,
          totalPatients: patientsResponse.pagination.total
        }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { variant: 'info' as const, label: 'Scheduled' },
      COMPLETED: { variant: 'success' as const, label: 'Completed' },
      CANCELLED: { variant: 'danger' as const, label: 'Cancelled' },
      NO_SHOW: { variant: 'warning' as const, label: 'No Show' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { variant: 'default' as const, label: status }
    
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getVisitTypeBadge = (visitType: string) => {
    const typeConfig = {
      OPD: { variant: 'default' as const, label: 'OPD' },
      FOLLOW_UP: { variant: 'info' as const, label: 'Follow-up' },
      EMERGENCY: { variant: 'danger' as const, label: 'Emergency' }
    }
    
    const config = typeConfig[visitType as keyof typeof typeConfig] || 
                  { variant: 'default' as const, label: visitType }
    
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <DashboardLayout requiredRole="STAFF">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="STAFF">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600">Welcome to your staff portal</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/staff/patients/register">
              <Button>Register Patient</Button>
            </Link>
            <Link href="/staff/appointments">
              <Button variant="outline">View Appointments</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Patients</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalPatients}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Today's Appointments</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{stats.todayAppointments}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg">
                  <CalendarDaysIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-amber-50 to-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Pending</p>
                  <p className="text-3xl font-bold text-amber-900 mt-2">{stats.pendingAppointments}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg">
                  <ClockIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Completed</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">{stats.completedAppointments}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">Recent Appointments</CardTitle>
              <Link href="/staff/appointments">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentAppointments.length === 0 ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {recentAppointments.slice(0, 5).map((appointment, index) => (
                      <tr key={appointment.id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          {appointment.patient_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {appointment.doctor_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {formatDateTime(appointment.scheduled_datetime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getVisitTypeBadge(appointment.visit_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(appointment.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <CardTitle className="text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/staff/patients/register">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-lg hover:scale-105 cursor-pointer transition-all duration-200">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg w-fit mb-3 shadow-md">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900">Register New Patient</h3>
                  <p className="text-sm text-blue-700 mt-1">Add a new patient to the system</p>
                </div>
              </Link>
              
              <Link href="/staff/appointments">
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-lg hover:scale-105 cursor-pointer transition-all duration-200">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg w-fit mb-3 shadow-md">
                    <CalendarDaysIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900">Book Appointment</h3>
                  <p className="text-sm text-green-700 mt-1">Schedule patient appointments</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}