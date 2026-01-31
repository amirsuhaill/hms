'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { patientApi, treatmentPlanApi, getStoredUser, getCurrentDoctorId } from '@/lib/api'
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  UserIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

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

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
]

export default function CreateTreatmentPlanPage() {
  const router = useRouter()
  const [user] = useState(getStoredUser())
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    plan_name: '',
    status: 'DRAFT',
    total_estimated_cost: 0
  })
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await patientApi.getAll(1, 500)
      if (response.success && response.data) {
        setPatients(response.data)
        setFilteredPatients(response.data)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Failed to load patients')
    }
  }

  const handlePatientSearch = useCallback((value: string) => {
    setSearchTerm(value)
    
    if (!value.trim()) {
      setFilteredPatients(patients)
      return
    }

    const filtered = patients.filter(patient =>
      patient.first_name.toLowerCase().includes(value.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(value.toLowerCase()) ||
      patient.hospital_mrn.toLowerCase().includes(value.toLowerCase()) ||
      patient.phone.includes(value)
    )
    
    setFilteredPatients(filtered)
  }, [patients])

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData(prev => ({
      ...prev,
      patient_id: patient.id.toString()
    }))
    setShowPatientDropdown(false)
    setSearchTerm('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_estimated_cost' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patient_id || !formData.plan_name) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      
      // Get the current doctor ID
      const doctorId = await getCurrentDoctorId()
      if (!doctorId) {
        toast.error('Unable to get doctor information. Please try logging in again.')
        return
      }
      
      const planData = {
        patient_id: parseInt(formData.patient_id),
        appointment_id: formData.appointment_id ? parseInt(formData.appointment_id) : null,
        doctor_id: doctorId,
        plan_name: formData.plan_name,
        status: formData.status,
        total_estimated_cost: formData.total_estimated_cost
      }

      const response = await treatmentPlanApi.create(planData)
      
      console.log('Treatment plan API response:', response) // Debug log
      
      if (response.success && response.data) {
        toast.success('Treatment plan created successfully!')
        router.push(`/doctor/treatment-plans/${response.data.id}`)
      } else {
        console.error('Treatment plan creation failed:', response) // Debug log
        toast.error(response.error || 'Failed to create treatment plan')
      }
    } catch (error) {
      console.error('Error creating treatment plan:', error)
      toast.error('Failed to create treatment plan')
    } finally {
      setSubmitting(false)
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Create Treatment Plan</h1>
              <p className="text-gray-600">Create a new treatment plan for a patient</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Select Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {selectedPatient ? (
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {selectedPatient.first_name.charAt(0)}{selectedPatient.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {selectedPatient.first_name} {selectedPatient.last_name}
                          </p>
                          <p className="text-sm text-gray-600">MRN: {selectedPatient.hospital_mrn}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Age</p>
                          <p className="text-sm font-semibold text-gray-900">{calculateAge(selectedPatient.dob)} years</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Gender</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedPatient.gender === 'M' ? 'Male' : selectedPatient.gender === 'F' ? 'Female' : 'Other'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Blood Group</p>
                          <Badge variant="info">{selectedPatient.blood_group || 'N/A'}</Badge>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Phone</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedPatient.phone}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setSelectedPatient(null)
                        setFormData(prev => ({ ...prev, patient_id: '' }))
                        setSearchTerm('')
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by name, MRN, or phone..."
                      value={searchTerm}
                      onChange={(e) => handlePatientSearch(e.target.value)}
                      onFocus={() => setShowPatientDropdown(true)}
                      className="pl-10"
                    />
                  </div>

                  {showPatientDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handleSelectPatient(patient)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {patient.first_name} {patient.last_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  MRN: {patient.hospital_mrn} • Age: {calculateAge(patient.dob)} • {patient.phone}
                                </p>
                              </div>
                              <Badge variant="default">{patient.blood_group || 'N/A'}</Badge>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          No patients found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Details Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                Plan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="plan_name"
                  placeholder="e.g., Comprehensive Dental Treatment"
                  value={formData.plan_name}
                  onChange={handleInputChange}
                  required
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onChange={handleInputChange}
                    name="status"
                    options={statusOptions}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment ID (Optional)
                  </label>
                  <Input
                    type="number"
                    name="appointment_id"
                    placeholder="Enter appointment ID"
                    value={formData.appointment_id}
                    onChange={handleInputChange}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Total Cost
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    name="total_estimated_cost"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.total_estimated_cost}
                    onChange={handleInputChange}
                    className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          {selectedPatient && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Patient</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Plan Name</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formData.plan_name || 'Not specified'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Estimated Cost</p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      ${formData.total_estimated_cost.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6">
            <Button
              type="submit"
              disabled={submitting || !selectedPatient || !formData.plan_name}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              {submitting ? 'Creating...' : 'Create Treatment Plan'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

const ClipboardDocumentListIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)