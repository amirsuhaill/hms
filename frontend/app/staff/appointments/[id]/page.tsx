'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import * as api from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarDaysIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon
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
  updated_at: string
}

export default function AppointmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  const appointmentId = params.id as string

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true)
        const response = await api.appointmentApi.getById(parseInt(appointmentId))
        
        if (response.success && response.data) {
          setAppointment(response.data)
        } else {
          toast.error('Appointment not found')
          router.push('/staff/appointments')
        }
      } catch (error) {
        console.error('Error fetching appointment:', error)
        toast.error('Failed to load appointment details')
        router.push('/staff/appointments')
      } finally {
        setLoading(false)
      }
    }

    if (appointmentId) {
      fetchAppointment()
    }
  }, [appointmentId, router])

  const handleCancelAppointment = async () => {
    if (!appointment || !confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const reason = prompt('Please provide a reason for cancellation:')
      if (!reason) return

      const response = await api.appointmentApi.cancel(appointmentId, reason)
      
      if (response.success) {
        toast.success('Appointment cancelled successfully')
        setAppointment(prev => prev ? { ...prev, status: 'CANCELLED' } : null)
      } else {
        toast.error(response.error || 'Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('An error occurred while cancelling the appointment')
    }
  }

  const handleCompleteAppointment = async () => {
    if (!appointment || !confirm('Mark this appointment as completed?')) {
      return
    }

    try {
      const response = await api.appointmentApi.update(parseInt(appointmentId), { status: 'COMPLETED' })
      
      if (response.success) {
        toast.success('Appointment marked as completed')
        setAppointment(prev => prev ? { ...prev, status: 'COMPLETED' } : null)
      } else {
        toast.error(response.error || 'Failed to complete appointment')
      }
    } catch (error) {
      console.error('Error completing appointment:', error)
      toast.error('An error occurred while completing the appointment')
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

  if (!appointment) {
    return (
      <DashboardLayout requiredRole="STAFF">
        <div className="text-center py-8">
          <p className="text-gray-500">Appointment not found</p>
          <Link href="/staff/appointments">
            <Button className="mt-4">Back to Appointments</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="STAFF">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/staff/appointments">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Appointments
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Appointment Details
              </h1>
              <p className="text-gray-600">Appointment ID: {appointment.id}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {appointment.status === 'SCHEDULED' && (
              <>
                <Link href={`/staff/appointments/${appointment.id}/edit`}>
                  <Button>
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Appointment
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleCompleteAppointment}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelAppointment}
                  className="text-red-600 hover:text-red-700"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Appointment Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                Appointment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Date & Time</label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDateTime(appointment.scheduled_datetime)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  {getStatusBadge(appointment.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Visit Type</label>
                <div className="mt-1">
                  {getVisitTypeBadge(appointment.visit_type)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Reason for Visit</label>
                <p className="text-gray-900">
                  {appointment.reason || 'No reason provided'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Patient & Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Patient & Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Patient</label>
                <div className="flex items-center justify-between">
                  <p className="text-gray-900">
                    {appointment.patient_name || `Patient ID: ${appointment.patient_id}`}
                  </p>
                  <Link href={`/staff/patients/${appointment.patient_id}`}>
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Doctor</label>
                <p className="text-gray-900">
                  {appointment.doctor_name || `Doctor ID: ${appointment.doctor_id}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href={`/staff/vitals?appointment_id=${appointment.id}`}>
                <Button variant="outline" className="w-full">
                  Record Vitals
                </Button>
              </Link>
              <Link href={`/staff/appointments/book?patient_id=${appointment.patient_id}`}>
                <Button variant="outline" className="w-full">
                  Book Follow-up
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                View Medical History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Record Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Record Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{formatDateTime(appointment.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{formatDateTime(appointment.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}