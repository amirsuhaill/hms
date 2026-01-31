'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { patientApi } from '@/lib/api'
import { ArrowLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface PatientFormData {
  first_name: string
  last_name: string
  dob: string
  gender: string
  phone: string
  email: string
  address: string
  blood_group: string
  emergency_name: string
  emergency_phone: string
}

const initialFormData: PatientFormData = {
  first_name: '',
  last_name: '',
  dob: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  blood_group: '',
  emergency_name: '',
  emergency_phone: ''
}

const genderOptions = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'Other', label: 'Other' }
]

const bloodGroupOptions = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
]

export default function RegisterPatientPage() {
  const [formData, setFormData] = useState<PatientFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<PatientFormData>>({})
  const router = useRouter()

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientFormData> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required'
    } else {
      const birthDate = new Date(formData.dob)
      const today = new Date()
      if (birthDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future'
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
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
      const response = await patientApi.create(formData)

      if (response.success) {
        toast.success('Patient registered successfully!')
        router.push('/staff/patients')
      } else {
        toast.error(response.error || 'Failed to register patient')
      }
    } catch (error) {
      console.error('Error registering patient:', error)
      toast.error('An error occurred while registering the patient')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setErrors({})
  }

  return (
    <DashboardLayout requiredRole="STAFF">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/staff/patients">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Patients
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Register New Patient</h1>
              <p className="text-gray-600">Add a new patient to the hospital system</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  error={errors.first_name}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  error={errors.last_name}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  error={errors.dob}
                  required
                />
                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  options={genderOptions}
                  error={errors.gender}
                  required
                />
                <Select
                  label="Blood Group"
                  value={formData.blood_group}
                  onChange={(e) => handleInputChange('blood_group', e.target.value)}
                  options={bloodGroupOptions}
                  error={errors.blood_group}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                  placeholder="+1234567890"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="patient@example.com"
                />
              </div>

              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={errors.address}
                placeholder="Full address including city, state, and postal code"
              />
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Emergency Contact Name"
                  value={formData.emergency_name}
                  onChange={(e) => handleInputChange('emergency_name', e.target.value)}
                  error={errors.emergency_name}
                  placeholder="Full name of emergency contact"
                />
                <Input
                  label="Emergency Contact Phone"
                  value={formData.emergency_phone}
                  onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                  error={errors.emergency_phone}
                  placeholder="+1234567890"
                />
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
                disabled={loading}
              >
                Register Patient
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}