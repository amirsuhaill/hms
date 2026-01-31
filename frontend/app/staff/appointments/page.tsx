'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { appointmentApi, doctorApi } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import {
  CalendarDaysIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  scheduled_datetime: string
  status: string
  visit_type: string
  reason: string
  patient_name?: string
  doctor_name?: string
  created_at: string
}

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' }
]

const visitTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'OPD', label: 'OPD' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'EMERGENCY', label: 'Emergency' }
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    doctor_id: '',
    visit_type: '',
    date_from: '',
    date_to: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalAppointments, setTotalAppointments] = useState(0)

  const fetchDoctors = async () => {
    try {
      const response = await doctorApi.getAll()
      if (response.success && response.data) {
        setDoctors(response.data)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await appointmentApi.getAll(currentPage, 20, filters)
      
      if (response.success && response.data) {
        setAppointments(response.data)
        if (response.pagination) {
          setTotalPages(Math.ceil(response.pagination.total / response.pagination.limit))
          setTotalAppointments(response.pagination.total)
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }, [currentPage, filters])

  useEffect(() => {
    fetchDoctors()
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      doctor_id: '',
      visit_type: '',
      date_from: '',
      date_to: ''
    })
    setCurrentPage(1)
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const reason = prompt('Please provide a reason for cancellation:')
      if (!reason) return

      const response = await appointmentApi.cancel(appointmentId.toString(), reason)
      
      if (response.success) {
        toast.success('Appointment cancelled successfully')
        fetchAppointments()
      } else {
        toast.error(response.error || 'Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('An error occurred while cancelling the appointment')
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

  const doctorOptions = [
    { value: '', label: 'All Doctors' },
    ...doctors.map(doctor => ({
      value: doctor.id.toString(),
      label: `Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialization}`
    }))
  ]

  if (loading && appointments.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600">Manage patient appointments and scheduling</p>
          </div>
          <Link href="/staff/appointments/book">
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                options={statusOptions}
              />
              <Select
                label="Doctor"
                value={filters.doctor_id}
                onChange={(e) => handleFilterChange('doctor_id', e.target.value)}
                options={doctorOptions}
              />
              <Select
                label="Visit Type"
                value={filters.visit_type}
                onChange={(e) => handleFilterChange('visit_type', e.target.value)}
                options={visitTypeOptions}
              />
              <Input
                label="From Date"
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
              <Input
                label="To Date"
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment List</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments found</p>
                <Link href="/staff/appointments/book">
                  <Button className="mt-4">Book First Appointment</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {appointment.patient_name || `Patient ID: ${appointment.patient_id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.doctor_name || `Doctor ID: ${appointment.doctor_id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(appointment.scheduled_datetime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getVisitTypeBadge(appointment.visit_type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(appointment.status)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {appointment.reason || 'No reason provided'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link href={`/staff/appointments/${appointment.id}`}>
                                <Button variant="ghost" size="sm">
                                  <EyeIcon className="w-4 h-4" />
                                </Button>
                              </Link>
                              {appointment.status === 'SCHEDULED' && (
                                <>
                                  <Link href={`/staff/appointments/${appointment.id}/edit`}>
                                    <Button variant="ghost" size="sm">
                                      <PencilIcon className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Showing page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}