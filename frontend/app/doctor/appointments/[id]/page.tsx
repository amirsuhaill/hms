'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { appointmentApi, patientApi } from '@/lib/api'
import { formatDateTime, formatDate } from '@/lib/utils'
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarDaysIcon,
  PlayIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Appointment {
  id: number
  patient_id: number
  scheduled_datetime: string
  status: string
  visit_type: string
  reason: string
  patient_name: string
  precheck?: Precheck
}

interface Patient {
  id: number
  hospital_mrn: string
  first_name: string
  last_name: string
  dob: string
  gender: string
  phone: string
  email: string
  blood_group: string
}

interface Precheck {
  id: number
  height_cm: number
  weight_kg: number
  temperature_c: number
  pulse_rate: number
  systolic_bp: number
  diastolic_bp: number
  spo2: number
  notes: string
  created_at: string
}

export default function DoctorAppointmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.id as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [appointmentId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch appointment details
      const appointmentResponse = await appointmentApi.getById(parseInt(appointmentId))
      if (appointmentResponse.success && appointmentResponse.data) {
        setAppointment(appointmentResponse.data)
        
        // Fetch patient details
        const patientResponse = await patientApi.getById(appointmentResponse.data.patient_id)
        if (patientResponse.success && patientResponse.data) {
          setPatient(patientResponse.data)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const calculateBMI = (weight: number, height: number) => {
    const heightInM = height / 100
    return (weight / (heightInM * heightInM)).toFixed(1)
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

  if (!appointment || !patient) {
    return (
      <DashboardLayout requiredRole="DOCTOR">
        <div className="text-center py-8">
          <p className="text-gray-500">Appointment not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="DOCTOR">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
              <p className="text-gray-600">
                {patient.first_name} {patient.last_name} - {formatDateTime(appointment.scheduled_datetime)}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            {appointment.status === 'SCHEDULED' && (
              <Link href={`/doctor/visits/${appointment.id}`}>
                <Button>
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Start Visit
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                Appointment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Date & Time</p>
                <p className="text-lg font-semibold">{formatDateTime(appointment.scheduled_datetime)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  {getStatusBadge(appointment.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Visit Type</p>
                  {getVisitTypeBadge(appointment.visit_type)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Reason for Visit</p>
                <p className="text-sm text-gray-700 mt-1">
                  {appointment.reason || 'No reason provided'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-lg font-semibold">{patient.first_name} {patient.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">MRN</p>
                <p className="font-mono text-blue-600">{patient.hospital_mrn}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Age</p>
                  <p>{calculateAge(patient.dob)} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Gender</p>
                  <p>{patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Blood Group</p>
                <Badge variant="info">{patient.blood_group || 'Not specified'}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Contact</p>
                <p>{patient.phone}</p>
                {patient.email && <p className="text-sm text-gray-500">{patient.email}</p>}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                <p>{formatDate(patient.dob)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vital Signs */}
        {appointment.precheck && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HeartIcon className="w-5 h-5 mr-2" />
                Vital Signs (Pre-check)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Height</p>
                  <p className="text-xl font-bold text-blue-600">{appointment.precheck.height_cm}</p>
                  <p className="text-xs text-gray-500">cm</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Weight</p>
                  <p className="text-xl font-bold text-green-600">{appointment.precheck.weight_kg}</p>
                  <p className="text-xs text-gray-500">kg</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">BMI</p>
                  <p className="text-xl font-bold text-purple-600">
                    {calculateBMI(appointment.precheck.weight_kg, appointment.precheck.height_cm)}
                  </p>
                  <p className="text-xs text-gray-500">kg/m²</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Temperature</p>
                  <p className="text-xl font-bold text-red-600">{appointment.precheck.temperature_c}</p>
                  <p className="text-xs text-gray-500">°C</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Pulse</p>
                  <p className="text-xl font-bold text-pink-600">{appointment.precheck.pulse_rate}</p>
                  <p className="text-xs text-gray-500">bpm</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">SpO2</p>
                  <p className="text-xl font-bold text-indigo-600">{appointment.precheck.spo2}</p>
                  <p className="text-xs text-gray-500">%</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blood Pressure</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {appointment.precheck.systolic_bp}/{appointment.precheck.diastolic_bp} mmHg
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Recorded At</p>
                  <p className="text-sm text-gray-700">{formatDateTime(appointment.precheck.created_at)}</p>
                </div>
              </div>
              {appointment.precheck.notes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">Notes</p>
                  <p className="text-sm text-gray-700 mt-1">{appointment.precheck.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-3">
              {appointment.status === 'SCHEDULED' && (
                <Link href={`/doctor/visits/${appointment.id}`}>
                  <Button>
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Start Visit
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={() => router.push('/doctor/appointments')}>
                Back to Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}