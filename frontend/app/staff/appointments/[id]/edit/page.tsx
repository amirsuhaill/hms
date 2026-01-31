'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import * as api from '@/lib/api'
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  UserIcon
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
}

interface Patient {
  id: number
  first_name: string
  last_name: string
  hospital_mrn: string
}

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
}

const statusOptions = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' }
]

const visitTypeOptions = [
  { value: 'OPD', label: 'OPD' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'EMERGENCY', label: 'Emergency' }
]

export default function EditAppointmentPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Appointment>>({})
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])

  const appointmentId = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch appointment details
        const appointmentResponse = await api.appointmentApi.getById(parseInt(appointmentId))
        if (appointmentResponse.success && appointmentResponse.data) {
          setFormData(appointmentResponse.data)
        } else {
          toast.error('Appointment not found')
          router.push('/staff/appointments')
          return
        }

        // Fetch patients and doctors
        const [patientsResponse, doctorsResponse] = await Promise.all([
          api.patientApi.getAll(1, 100),
          api.doctorApi.getAll()
        ])

        if (patientsResponse.success && patientsResponse.data) {
          setPatients(patientsResponse.data)
        }

        if (doctorsResponse.success && doctorsResponse.data) {
          setDoctors(doctorsResponse.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load appointment details')
        router.push('/staff/appointments')
      } finally {
        setLoading(false)
      }
    }

    if (appointmentId) {
      fetchData()
    }
  }, [appointmentId, router])

  const handleInputChange = (field: keyof Appointment, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patient_id || !formData.doctor_id || !formData.scheduled_datetime) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const response = await api.appointmentApi.update(parseInt(appointmentId), formData)
      
      if (response.success) {
        toast.success('Appointment updated successfully')
        router.push(`/staff/appointments/${appointmentId}`)
      } else {
        toast.error(response.error || 'Failed to update appointment')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('An error occurred while updating the appointment')
    } finally {
      setSaving(false)
    }
  }

  const patientOptions = [
    { value: '', label: 'Select Patient' },
    ...patients.map(patient => ({
      value: patient.id.toString(),
      label: `${patient.first_name} ${patient.last_name} (${patient.hospital_mrn})`
    }))
  ]

  const doctorOptions = [
    { value: '', label: 'Select Doctor' },
    ...doctors.map(doctor => ({
      value: doctor.id.toString(),
      label: `Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialization}`
    }))
  ]

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
          <div className="flex items-center space-x-4">
            <Link href={`/staff/appointments/${appointmentId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Appointment
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Appointment</h1>
              <p className="text-gray-600">Appointment ID: {appointmentId}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient & Doctor Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Patient & Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Patient *"
                  value={formData.patient_id?.toString() || ''}
                  onChange={(e) => handleInputChange('patient_id', parseInt(e.target.value))}
                  options={patientOptions}
                  required
                />
                <Select
                  label="Doctor *"
                  value={formData.doctor_id?.toString() || ''}
                  onChange={(e) => handleInputChange('doctor_id', parseInt(e.target.value))}
                  options={doctorOptions}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date & Time *"
                  type="datetime-local"
                  value={formData.scheduled_datetime ? 
                    new Date(formData.scheduled_datetime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('scheduled_datetime', e.target.value)}
                  required
                />
                <Select
                  label="Visit Type"
                  value={formData.visit_type || ''}
                  onChange={(e) => handleInputChange('visit_type', e.target.value)}
                  options={visitTypeOptions}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={formData.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  options={statusOptions}
                />
                <div></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={formData.reason || ''}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="Enter reason for the appointment..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Link href={`/staff/appointments/${appointmentId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}