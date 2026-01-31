'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { patientApi } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import {
  HeartIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  ScaleIcon,
  ThermometerIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Patient {
  id: number
  hospital_mrn: string
  first_name: string
  last_name: string
  phone: string
  dob: string
}

interface VitalSigns {
  temperature: string
  blood_pressure_systolic: string
  blood_pressure_diastolic: string
  heart_rate: string
  respiratory_rate: string
  oxygen_saturation: string
  weight: string
  height: string
  bmi: string
  notes: string
}

const initialVitals: VitalSigns = {
  temperature: '',
  blood_pressure_systolic: '',
  blood_pressure_diastolic: '',
  heart_rate: '',
  respiratory_rate: '',
  oxygen_saturation: '',
  weight: '',
  height: '',
  bmi: '',
  notes: ''
}

export default function VitalsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientSearch, setPatientSearch] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [vitals, setVitals] = useState<VitalSigns>(initialVitals)
  const [searchingPatients, setSearchingPatients] = useState(false)
  const [savingVitals, setSavingVitals] = useState(false)
  const [errors, setErrors] = useState<Partial<VitalSigns>>({})

  const searchPatients = async () => {
    if (!patientSearch.trim()) {
      toast.error('Please enter a search term')
      return
    }

    try {
      setSearchingPatients(true)
      const response = await patientApi.getAll(1, 100)
      
      if (response.success && response.data) {
        const filtered = response.data.filter((patient: Patient) =>
          patient.first_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
          patient.last_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
          patient.hospital_mrn.toLowerCase().includes(patientSearch.toLowerCase()) ||
          patient.phone.includes(patientSearch)
        )
        setPatients(filtered)
        
        if (filtered.length === 0) {
          toast.error('No patients found matching your search')
        }
      }
    } catch (error) {
      console.error('Error searching patients:', error)
      toast.error('Failed to search patients')
    } finally {
      setSearchingPatients(false)
    }
  }

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatients([])
    setPatientSearch('')
    setVitals(initialVitals)
    setErrors({})
  }

  const handleVitalChange = (field: keyof VitalSigns, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }))
    
    // Auto-calculate BMI when weight and height are provided
    if (field === 'weight' || field === 'height') {
      const weight = field === 'weight' ? parseFloat(value) : parseFloat(vitals.weight)
      const height = field === 'height' ? parseFloat(value) : parseFloat(vitals.height)
      
      if (weight > 0 && height > 0) {
        const heightInMeters = height / 100 // Convert cm to meters
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1)
        setVitals(prev => ({ ...prev, bmi }))
      }
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateVitals = (): boolean => {
    const newErrors: Partial<VitalSigns> = {}

    // Basic validation for numeric fields
    const numericFields = [
      'temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic',
      'heart_rate', 'respiratory_rate', 'oxygen_saturation', 'weight', 'height'
    ]

    numericFields.forEach(field => {
      const value = vitals[field as keyof VitalSigns]
      if (value && isNaN(parseFloat(value))) {
        newErrors[field as keyof VitalSigns] = 'Please enter a valid number'
      }
    })

    // Specific validations
    if (vitals.temperature && (parseFloat(vitals.temperature) < 30 || parseFloat(vitals.temperature) > 45)) {
      newErrors.temperature = 'Temperature should be between 30-45°C'
    }

    if (vitals.blood_pressure_systolic && (parseFloat(vitals.blood_pressure_systolic) < 60 || parseFloat(vitals.blood_pressure_systolic) > 250)) {
      newErrors.blood_pressure_systolic = 'Systolic BP should be between 60-250 mmHg'
    }

    if (vitals.blood_pressure_diastolic && (parseFloat(vitals.blood_pressure_diastolic) < 30 || parseFloat(vitals.blood_pressure_diastolic) > 150)) {
      newErrors.blood_pressure_diastolic = 'Diastolic BP should be between 30-150 mmHg'
    }

    if (vitals.heart_rate && (parseFloat(vitals.heart_rate) < 30 || parseFloat(vitals.heart_rate) > 200)) {
      newErrors.heart_rate = 'Heart rate should be between 30-200 bpm'
    }

    if (vitals.oxygen_saturation && (parseFloat(vitals.oxygen_saturation) < 70 || parseFloat(vitals.oxygen_saturation) > 100)) {
      newErrors.oxygen_saturation = 'Oxygen saturation should be between 70-100%'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveVitals = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient first')
      return
    }

    if (!validateVitals()) {
      toast.error('Please fix the errors in the form')
      return
    }

    // Check if at least one vital sign is provided
    const hasVitals = Object.entries(vitals).some(([key, value]) => 
      key !== 'notes' && key !== 'bmi' && value.trim() !== ''
    )

    if (!hasVitals) {
      toast.error('Please enter at least one vital sign')
      return
    }

    try {
      setSavingVitals(true)
      
      // In a real application, you would call an API to save vitals
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Vital signs recorded successfully!')
      
      // Reset form
      setVitals(initialVitals)
      setSelectedPatient(null)
      setErrors({})
      
    } catch (error) {
      console.error('Error saving vitals:', error)
      toast.error('Failed to save vital signs')
    } finally {
      setSavingVitals(false)
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

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' }
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' }
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' }
    return { category: 'Obese', color: 'text-red-600' }
  }

  return (
    <DashboardLayout requiredRole="STAFF">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Vitals</h1>
            <p className="text-gray-600">Record and manage patient vital signs</p>
          </div>
        </div>

        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Select Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedPatient ? (
              <>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name, MRN, or phone number..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchPatients())}
                    />
                  </div>
                  <Button
                    onClick={searchPatients}
                    loading={searchingPatients}
                    disabled={searchingPatients}
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {patients.length > 0 && (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => selectPatient(patient)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {patient.first_name} {patient.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              MRN: {patient.hospital_mrn} | Age: {calculateAge(patient.dob)} years | Phone: {patient.phone}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Select
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-green-900">
                      Selected Patient: {selectedPatient.first_name} {selectedPatient.last_name}
                    </p>
                    <p className="text-sm text-green-700">
                      MRN: {selectedPatient.hospital_mrn} | Age: {calculateAge(selectedPatient.dob)} years | Phone: {selectedPatient.phone}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPatient(null)
                      setVitals(initialVitals)
                      setErrors({})
                    }}
                  >
                    Change Patient
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vital Signs Form */}
        {selectedPatient && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Primary Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Temperature (°C)"
                    type="number"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalChange('temperature', e.target.value)}
                    error={errors.temperature}
                    placeholder="36.5"
                  />
                  <Input
                    label="Heart Rate (bpm)"
                    type="number"
                    value={vitals.heart_rate}
                    onChange={(e) => handleVitalChange('heart_rate', e.target.value)}
                    error={errors.heart_rate}
                    placeholder="72"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Systolic BP (mmHg)"
                    type="number"
                    value={vitals.blood_pressure_systolic}
                    onChange={(e) => handleVitalChange('blood_pressure_systolic', e.target.value)}
                    error={errors.blood_pressure_systolic}
                    placeholder="120"
                  />
                  <Input
                    label="Diastolic BP (mmHg)"
                    type="number"
                    value={vitals.blood_pressure_diastolic}
                    onChange={(e) => handleVitalChange('blood_pressure_diastolic', e.target.value)}
                    error={errors.blood_pressure_diastolic}
                    placeholder="80"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Respiratory Rate (breaths/min)"
                    type="number"
                    value={vitals.respiratory_rate}
                    onChange={(e) => handleVitalChange('respiratory_rate', e.target.value)}
                    error={errors.respiratory_rate}
                    placeholder="16"
                  />
                  <Input
                    label="Oxygen Saturation (%)"
                    type="number"
                    value={vitals.oxygen_saturation}
                    onChange={(e) => handleVitalChange('oxygen_saturation', e.target.value)}
                    error={errors.oxygen_saturation}
                    placeholder="98"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Physical Measurements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ScaleIcon className="w-5 h-5 mr-2" />
                  Physical Measurements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Weight (kg)"
                    type="number"
                    step="0.1"
                    value={vitals.weight}
                    onChange={(e) => handleVitalChange('weight', e.target.value)}
                    error={errors.weight}
                    placeholder="70.0"
                  />
                  <Input
                    label="Height (cm)"
                    type="number"
                    value={vitals.height}
                    onChange={(e) => handleVitalChange('height', e.target.value)}
                    error={errors.height}
                    placeholder="170"
                  />
                </div>

                {vitals.bmi && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">BMI:</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{vitals.bmi}</span>
                        <span className={`block text-sm ${getBMICategory(parseFloat(vitals.bmi)).color}`}>
                          {getBMICategory(parseFloat(vitals.bmi)).category}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={4}
                    value={vitals.notes}
                    onChange={(e) => handleVitalChange('notes', e.target.value)}
                    placeholder="Additional notes about the patient's condition or vital signs..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Save Button */}
        {selectedPatient && (
          <Card>
            <CardContent className="flex justify-end space-x-4 py-4">
              <Button
                variant="outline"
                onClick={() => {
                  setVitals(initialVitals)
                  setErrors({})
                }}
                disabled={savingVitals}
              >
                Clear Form
              </Button>
              <Button
                onClick={handleSaveVitals}
                loading={savingVitals}
                disabled={savingVitals}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Save Vital Signs
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}