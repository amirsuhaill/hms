'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { appointmentApi, getStoredUser } from '@/lib/api'
// import { formatDateTime } from '@/lib/utils' // Removed unused import
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  EyeIcon,
  PlayIcon,
  ClipboardDocumentListIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface DashboardStats {
  todayAppointments: number
  pendingVisits: number
  completedToday: number
  totalPatients: number
}

interface TodayAppointment {
  id: number
  patient_name: string
  scheduled_datetime: string
  status: string
  visit_type: string
  reason: string
}

export default function DoctorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingVisits: 0,
    completedToday: 0,
    totalPatients: 0
  })
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [user] = useState(getStoredUser())

  useEffect(() => {
    fetchDashboardData()
  }, [user?.id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0]
      
      // Fetch appointments for this doctor
      const appointmentsResponse = await appointmentApi.getAll(1, 100, {
        doctor_id: user?.id,
        date_from: today,
        date_to: today
      })
      
      if (appointmentsResponse.success && appointmentsResponse.data) {
        const appointments = appointmentsResponse.data
        setTodayAppointments(appointments.slice(0, 10)) // Show first 10
        
        // Calculate stats
        const scheduled = appointments.filter(apt => apt.status === 'SCHEDULED')
        const completed = appointments.filter(apt => apt.status === 'COMPLETED')
        
        setStats({
          todayAppointments: appointments.length,
          pendingVisits: scheduled.length,
          completedToday: completed.length,
          totalPatients: appointments.length // This would be better from a separate endpoint
        })
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
      <DashboardLayout requiredRole="DOCTOR">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="DOCTOR">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600">Welcome back, Dr. {user?.first_name || 'Doctor'}</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/doctor/visits">
              <Button>
                <PlayIcon className="w-4 h-4 mr-2" />
                Start Visit
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Today&apos;s Appointments</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{stats.todayAppointments}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg">
                  <CalendarDaysIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-amber-50 to-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Pending Visits</p>
                  <p className="text-3xl font-bold text-amber-900 mt-2">{stats.pendingVisits}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg">
                  <ClockIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completed Today</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{stats.completedToday}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Patients</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">{stats.totalPatients}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">Today&apos;s Appointments</CardTitle>
              <Link href="/doctor/appointments">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {todayAppointments.map((appointment, index) => (
                      <tr key={appointment.id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          {new Date(appointment.scheduled_datetime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          {appointment.patient_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getVisitTypeBadge(appointment.visit_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                          {appointment.reason || 'No reason provided'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={`/doctor/appointments/${appointment.id}`}>
                              <Button variant="ghost" size="sm">
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                            </Link>
                            {appointment.status === 'SCHEDULED' && (
                              <Link href={`/doctor/visits/start?appointment_id=${appointment.id}`}>
                                <Button size="sm">
                                  <PlayIcon className="w-4 h-4 mr-1" />
                                  Start Visit
                                </Button>
                              </Link>
                            )}
                          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/doctor/visits">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-lg hover:scale-105 cursor-pointer transition-all duration-200">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg w-fit mb-3 shadow-md">
                    <PlayIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900">Start Patient Visit</h3>
                  <p className="text-sm text-blue-700 mt-1">Begin consultation with patient</p>
                </div>
              </Link>
              
              <Link href="/doctor/treatment-plans">
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-lg hover:scale-105 cursor-pointer transition-all duration-200">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg w-fit mb-3 shadow-md">
                    <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900">Treatment Plans</h3>
                  <p className="text-sm text-green-700 mt-1">Create and manage treatment plans</p>
                </div>
              </Link>

              <Link href="/doctor/lab-orders">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:shadow-lg hover:scale-105 cursor-pointer transition-all duration-200">
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg w-fit mb-3 shadow-md">
                    <BeakerIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900">Lab Orders</h3>
                  <p className="text-sm text-purple-700 mt-1">Order and review lab tests</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}