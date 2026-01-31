'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { appointmentApi, patientApi, doctorApi } from '@/lib/api'
import { ArrowLeftIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Patient {
  id: number
  hospital_mrn: string
  first_name: string
  last_name: string
  phone: string
}

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
}

interface AppointmentFormData {
  patient_id: string
  doctor_id: string
  scheduled_datetime: string
  visit_type: string
  reason: string
}

const initialFormData: AppointmentFormData = {
  patient_id: '',
  doctor_id: '',
  scheduled_datetime: '',
  visit_type: '',
  reason: ''
}

const visitTypeOptions = [
  { value: 'OPD', label: 'OPD (Out Patient Department)' },
  { value: 'FOLLOW_UP', label: 'Follow-up Visit' },
  { value: 'EMERGENCY', label: 'Emergency' }
]

export default function BookAppointmentPage() {
  const [formData, setFormData] = useState<AppointmentFormData>(initialFormData)
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [errors, setErrors] = useState<Partial<AppointmentFormData>>({})
  const router = useRouter()

  useEffect(() => {
    fetchDoctors()
    fetchPatients()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await doctorApi.getAll()
      if (response.success && response.data) {
        setDoctors(response.data)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to fetch doctors')
    }
  }

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true)
      const response = await patientApi.getAll(1, 1000)
      if (response.success && response.data) {
        setPatients(response.data)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Failed to fetch patients')
    } finally {
      setLoadingPatients(false)
    }
  }

  const handlePatientSearch = (value: string) => {
    setPatientSearch(value)
    
    if (value.trim().length === 0) {
      setFilteredPatients([])
      setShowSuggestions(false)
      return
    }

    const searchLower = value.toLowerCase()
    const filtered = patients.filter(patient =>
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      patient.hospital_mrn.toLowerCase().includes(searchLower) ||
      patient.phone.includes(value)
    )
    
    setFilteredPatients(filtered)
    setShowSuggestions(true)
  }

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData(prev => ({ ...prev, patient_id: patient.id.toString() }))
    setPatientSearch(`${patient.first_name} ${patient.last_name}`)
    setShowSuggestions(false)
    if (errors.patient_id) {
      setErrors(prev => ({ ...prev, patient_id: '' }))
    }
  }

  const handleInputChange = (field: keyof AppointmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<AppointmentFormData> = {}

    if (!formData.patient_id) {
      newErrors.patient_id = 'Please select a patient'
    }

    if (!formData.doctor_id) {
      newErrors.doctor_id = 'Please select a doctor'
    }

    if (!formData.scheduled_datetime) {
      newErrors.scheduled_datetime = 'Please select appointment date and time'
    } else {
      const appointmentDate = new Date(formData.scheduled_datetime)
      const now = new Date()
      if (appointmentDate <= now) {
        newErrors.scheduled_datetime = 'Appointment must be scheduled for a future date and time'
      }
    }

    if (!formData.visit_type) {
      newErrors.visit_type = 'Please select visit type'
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for the appointment'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setLoading(true)
      const response = await appointmentApi.create({
        patient_id: parseInt(formData.patient_id),
        doctor_id: parseInt(formData.doctor_id),
        scheduled_datetime: formData.scheduled_datetime,
        visit_type: formData.visit_type,
        reason: formData.reason
      })

      if (response.success) {
        toast.success('Appointment booked successfully!')
        router.push('/staff/appointments')
      } else {
        toast.error(response.error || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error('An error occurred while booking the appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setSelectedPatient(null)
    setPatientSearch('')
    setFilteredPatients([])
    setShowSuggestions(false)
    setErrors({})
  }

  const doctorOptions = doctors.map(doctor => ({
    value: doctor.id.toString(),
    label: `Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialization}`
  }))

  // Get minimum datetime (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    return now.toISOString().slice(0, 16)
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
              <h1 className="text-3xl font-bold text-gray-900">Book New Appointment</h1>
              <p className="text-gray-600">Schedule a new patient appointment</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Patient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  label="Search Patient by Name, MRN, or Phone"
                  value={patientSearch}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  onFocus={() => patientSearch && setShowSuggestions(true)}
                  error={errors.patient_id}
                  placeholder="Type patient name, MRN, or phone number..."
                  required
                />
                
                {showSuggestions && filteredPatients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => selectPatient(patient)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          MRN: {patient.hospital_mrn} | Phone: {patient.phone}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showSuggestions && patientSearch && filteredPatients.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4 text-center text-gray-500">
                    No patients found matching your search
                  </div>
                )}
              </div>

              {selectedPatient && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-green-900">
                        Selected Patient: {selectedPatient.first_name} {selectedPatient.last_name}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        MRN: {selectedPatient.hospital_mrn} | Phone: {selectedPatient.phone}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(null)
                        setFormData(prev => ({ ...prev, patient_id: '' }))
                        setPatientSearch('')
                      }}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
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
                <Select
                  label="Doctor"
                  value={formData.doctor_id}
                  onChange={(e) => handleInputChange('doctor_id', e.target.value)}
                  options={doctorOptions}
                  error={errors.doctor_id}
                  required
                />
                <Select
                  label="Visit Type"
                  value={formData.visit_type}
                  onChange={(e) => handleInputChange('visit_type', e.target.value)}
                  options={visitTypeOptions}
                  error={errors.visit_type}
                  required
                />
              </div>

              <Input
                label="Appointment Date & Time"
                type="datetime-local"
                value={formData.scheduled_datetime}
                onChange={(e) => handleInputChange('scheduled_datetime', e.target.value)}
                min={getMinDateTime()}
                error={errors.scheduled_datetime}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="Please describe the reason for this appointment..."
                />
                {errors.reason && (
                  <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardContent className="flex justify-end space-x-4 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={loading}
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading || !formData.patient_id}
              >
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}