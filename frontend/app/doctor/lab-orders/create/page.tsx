'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { patientApi, labTestApi, getStoredUser, getCurrentDoctorId } from '@/lib/api'
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  UserIcon,
  BeakerIcon
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

interface LabTest {
  id: number
  code: string
  name: string
  category: string
  default_price: number
}

export default function CreateLabOrderPage() {
  const router = useRouter()
  const [user] = useState(getStoredUser())
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [labTests, setLabTests] = useState<LabTest[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    notes: ''
  })
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTests, setSelectedTests] = useState<number[]>([])
  const [testSearch, setTestSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch patients
      const patientsResponse = await patientApi.getAll(1, 500)
      if (patientsResponse.success && patientsResponse.data) {
        setPatients(patientsResponse.data)
        setFilteredPatients(patientsResponse.data)
      }

      // Fetch lab tests
      const testsResponse = await labTestApi.getMaster()
      if (testsResponse.success && testsResponse.data) {
        setLabTests(testsResponse.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
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

  const handleTestToggle = (testId: number) => {
    setSelectedTests(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patient_id || selectedTests.length === 0) {
      toast.error('Please select a patient and at least one test')
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
      
      const orderData = {
        patient_id: parseInt(formData.patient_id),
        appointment_id: formData.appointment_id ? parseInt(formData.appointment_id) : null,
        doctor_id: doctorId,
        notes: formData.notes,
        test_ids: selectedTests
      }

      const response = await labTestApi.createOrder(orderData)
      
      console.log('Lab order API response:', response) // Debug log
      
      if (response.success && response.data) {
        toast.success('Lab order created successfully!')
        router.push(`/doctor/lab-orders/${response.data.id}`)
      } else {
        console.error('Lab order creation failed:', response) // Debug log
        toast.error(response.error || 'Failed to create lab order')
      }
    } catch (error) {
      console.error('Error creating lab order:', error)
      toast.error('Failed to create lab order')
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

  const groupedTests = labTests.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = []
    }
    acc[test.category].push(test)
    return acc
  }, {} as Record<string, LabTest[]>)

  const totalTestCost = selectedTests.reduce((sum, testId) => {
    const test = labTests.find(t => t.id === testId)
    return sum + (test?.default_price || 0)
  }, 0)

  // Ensure totalTestCost is always a number
  const safeTotalTestCost = typeof totalTestCost === 'number' ? totalTestCost : 0

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
              <h1 className="text-3xl font-bold text-gray-900">Create Lab Order</h1>
              <p className="text-gray-600">Order laboratory tests for a patient</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100">
            <CardHeader className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Select Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {selectedPatient ? (
                <div className="bg-white rounded-lg p-4 border-2 border-cyan-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
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
                            className="w-full text-left px-4 py-3 hover:bg-cyan-50 border-b border-gray-100 last:border-b-0 transition-colors"
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

          {/* Lab Tests Selection Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
            <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <BeakerIcon className="w-5 h-5 mr-2" />
                Select Lab Tests ({selectedTests.length} selected)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search tests..."
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {Object.entries(groupedTests).map(([category, tests]) => (
                  <div key={category} className="border border-amber-200 rounded-lg p-4 bg-white">
                    <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {tests
                        .filter(test =>
                          test.name.toLowerCase().includes(testSearch.toLowerCase()) ||
                          test.code.toLowerCase().includes(testSearch.toLowerCase())
                        )
                        .map(test => (
                          <label
                            key={test.id}
                            className="flex items-center p-3 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors border border-transparent hover:border-amber-200"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTests.includes(test.id)}
                              onChange={() => handleTestToggle(test.id)}
                              className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                            />
                            <div className="ml-3 flex-1">
                              <p className="font-medium text-gray-900">{test.name}</p>
                              <p className="text-sm text-gray-600">{test.code}</p>
                            </div>
                            <Badge variant="warning" className="ml-2">
                              ${test.default_price}
                            </Badge>
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
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
                  className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  placeholder="Add any special instructions or notes for the lab..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          {selectedPatient && selectedTests.length > 0 && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Patient</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Tests Selected</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {selectedTests.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Total Cost</p>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        ${safeTotalTestCost.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">Selected Tests:</p>
                    <div className="space-y-2">
                      {selectedTests.map(testId => {
                        const test = labTests.find(t => t.id === testId)
                        return (
                          <div key={testId} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{test?.name}</span>
                            <span className="font-semibold text-gray-900">${test?.default_price}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6">
            <Button
              type="submit"
              disabled={submitting || !selectedPatient || selectedTests.length === 0}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              {submitting ? 'Creating...' : 'Create Lab Order'}
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