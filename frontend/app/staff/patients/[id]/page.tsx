'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { patientApi } from '@/lib/api'
import { formatDate, formatDateTime } from '@/lib/utils'
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarDaysIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
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
  address: string
  emergency_name: string
  emergency_phone: string
  created_at: string
  updated_at: string
}

export default function PatientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  const patientId = params.id as string

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true)
        const response = await patientApi.getById(parseInt(patientId))
        
        if (response.success && response.data) {
          setPatient(response.data)
        } else {
          toast.error('Patient not found')
          router.push('/staff/patients')
        }
      } catch (error) {
        console.error('Error fetching patient:', error)
        toast.error('Failed to load patient details')
        router.push('/staff/patients')
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      fetchPatient()
    }
  }, [patientId, router])

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

  const getGenderBadge = (gender: string) => {
    const genderConfig = {
      M: { variant: 'info' as const, label: 'Male' },
      F: { variant: 'warning' as const, label: 'Female' },
      Other: { variant: 'default' as const, label: 'Other' }
    }
    
    const config = genderConfig[gender as keyof typeof genderConfig] || 
                  { variant: 'default' as const, label: gender }
    
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

  if (!patient) {
    return (
      <DashboardLayout requiredRole="STAFF">
        <div className="text-center py-8">
          <p className="text-gray-500">Patient not found</p>
          <Link href="/staff/patients">
            <Button className="mt-4">Back to Patients</Button>
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
            <Link href="/staff/patients">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Patients
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {patient.first_name} {patient.last_name}
              </h1>
              <p className="text-gray-600">MRN: {patient.hospital_mrn}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/staff/patients/${patient.id}/edit`}>
              <Button>
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Patient
              </Button>
            </Link>
            <Link href={`/staff/appointments/book?patient_id=${patient.id}`}>
              <Button variant="outline">
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Patient Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg font-semibold text-gray-900">
                  {patient.first_name} {patient.last_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Age & Gender</label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-gray-900">{calculateAge(patient.dob)} years old</span>
                  {getGenderBadge(patient.gender)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">{formatDate(patient.dob)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Blood Group</label>
                {patient.blood_group ? (
                  <Badge variant="info" className="mt-1">{patient.blood_group}</Badge>
                ) : (
                  <p className="text-gray-400">Not specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-1" />
                  Phone Number
                </label>
                <p className="text-gray-900">{patient.phone}</p>
              </div>
              {patient.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-1" />
                    Email Address
                  </label>
                  <p className="text-gray-900">{patient.email}</p>
                </div>
              )}
              {patient.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    Address
                  </label>
                  <p className="text-gray-900">{patient.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HeartIcon className="w-5 h-5 mr-2" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.emergency_name ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Name</label>
                    <p className="text-gray-900">{patient.emergency_name}</p>
                  </div>
                  {patient.emergency_phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                      <p className="text-gray-900">{patient.emergency_phone}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400">No emergency contact specified</p>
              )}
            </CardContent>
          </Card>
        </div>

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
                <p className="text-gray-900">{formatDateTime(patient.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{formatDateTime(patient.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}