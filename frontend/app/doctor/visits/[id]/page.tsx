'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { appointmentApi, patientApi, visitApi, diagnosisApi, clinicalFindingApi, getStoredUser } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import {
  UserIcon,
  HeartIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon
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

interface Appointment {
  id: number
  patient_id: number
  scheduled_datetime: string
  status: string
  visit_type: string
  reason: string
  patient_name: string
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

interface Visit {
  id: number
  appointment_id: number
  patient_id: number
  doctor_id: number
  visit_type: string
  chief_complaint: string
  notes_soap: string
  status: string
  visit_started_at: string
}

export default function VisitPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.id as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [precheck, setPrecheck] = useState<Precheck | null>(null)
  const [visit, setVisit] = useState<Visit | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('vitals')
  const [user] = useState(getStoredUser())
  
  // Form states
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [soapNotes, setSoapNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState({ code: '', description: '', is_primary: true })
  const [clinicalFindings, setClinicalFindings] = useState({ summary: '', detailed_notes: '' })

  useEffect(() => {
    fetchData()
  }, [])

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

        // Check if precheck exists
        if (appointmentResponse.data.precheck) {
          setPrecheck(appointmentResponse.data.precheck)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load appointment data')
    } finally {
      setLoading(false)
    }
  }

  const startVisit = async () => {
    if (!appointment || !patient) return

    try {
      const visitData = {
        appointment_id: appointment.id,
        patient_id: patient.id,
        doctor_id: user?.id,
        visit_type: appointment.visit_type,
        chief_complaint: chiefComplaint
      }

      const response = await visitApi.create(visitData)
      if (response.success && response.data) {
        setVisit(response.data)
        toast.success('Visit started successfully')
      } else {
        toast.error(response.error || 'Failed to start visit')
      }
    } catch (error) {
      console.error('Error starting visit:', error)
      toast.error('Failed to start visit')
    }
  }

  const saveFindings = async () => {
    if (!appointment || !clinicalFindings.summary) return

    try {
      const findingsData = {
        appointment_id: appointment.id,
        doctor_id: user?.id,
        summary: clinicalFindings.summary,
        detailed_notes: clinicalFindings.detailed_notes
      }

      const response = await clinicalFindingApi.create(findingsData)
      if (response.success) {
        toast.success('Clinical findings saved')
      } else {
        toast.error(response.error || 'Failed to save findings')
      }
    } catch (error) {
      console.error('Error saving findings:', error)
      toast.error('Failed to save findings')
    }
  }

  const saveDiagnosis = async () => {
    if (!visit || !diagnosis.code || !diagnosis.description) return

    try {
      const diagnosisData = {
        visit_id: visit.id,
        code: diagnosis.code,
        description: diagnosis.description,
        is_primary: diagnosis.is_primary
      }

      const response = await diagnosisApi.create(diagnosisData)
      if (response.success) {
        toast.success('Diagnosis saved')
        setDiagnosis({ code: '', description: '', is_primary: true })
      } else {
        toast.error(response.error || 'Failed to save diagnosis')
      }
    } catch (error) {
      console.error('Error saving diagnosis:', error)
      toast.error('Failed to save diagnosis')
    }
  }

  const completeVisit = async () => {
    if (!visit) return

    try {
      const response = await visitApi.complete(visit.id, { notes_soap: soapNotes })
      if (response.success) {
        toast.success('Visit completed successfully')
        router.push('/doctor/visits')
      } else {
        toast.error(response.error || 'Failed to complete visit')
      }
    } catch (error) {
      console.error('Error completing visit:', error)
      toast.error('Failed to complete visit')
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Visit</h1>
            <p className="text-gray-600">
              {patient.first_name} {patient.last_name} - {formatDateTime(appointment.scheduled_datetime)}
            </p>
          </div>
          <div className="flex space-x-3">
            {!visit && (
              <Button onClick={startVisit} disabled={!chiefComplaint}>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Start Visit
              </Button>
            )}
            {visit && (
              <Button onClick={completeVisit}>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Complete Visit
              </Button>
            )}
            <Button variant="outline" onClick={() => router.back()}>
              <XMarkIcon className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Patient Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Info */}
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
              </CardContent>
            </Card>

            {/* Vitals */}
            {precheck && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HeartIcon className="w-5 h-5 mr-2" />
                    Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Height</p>
                      <p>{precheck.height_cm} cm</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Weight</p>
                      <p>{precheck.weight_kg} kg</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">BMI</p>
                    <p>{calculateBMI(precheck.weight_kg, precheck.height_cm)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Temperature</p>
                      <p>{precheck.temperature_c}°C</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pulse</p>
                      <p>{precheck.pulse_rate} bpm</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Blood Pressure</p>
                    <p>{precheck.systolic_bp}/{precheck.diastolic_bp} mmHg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">SpO2</p>
                    <p>{precheck.spo2}%</p>
                  </div>
                  {precheck.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Notes</p>
                      <p className="text-sm">{precheck.notes}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Recorded: {formatDateTime(precheck.created_at)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Visit Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chief Complaint */}
            <Card>
              <CardHeader>
                <CardTitle>Chief Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Enter chief complaint..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  disabled={!!visit}
                />
              </CardContent>
            </Card>

            {/* Tabs */}
            {visit && (
              <>
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'findings', label: 'Clinical Findings' },
                      { id: 'diagnosis', label: 'Diagnosis' },
                      { id: 'soap', label: 'SOAP Notes' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Clinical Findings Tab */}
                {activeTab === 'findings' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Clinical Findings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        label="Summary"
                        placeholder="Brief summary of findings..."
                        value={clinicalFindings.summary}
                        onChange={(e) => setClinicalFindings(prev => ({ ...prev, summary: e.target.value }))}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Detailed Notes
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={6}
                          placeholder="Detailed clinical findings and observations..."
                          value={clinicalFindings.detailed_notes}
                          onChange={(e) => setClinicalFindings(prev => ({ ...prev, detailed_notes: e.target.value }))}
                        />
                      </div>
                      <Button onClick={saveFindings} disabled={!clinicalFindings.summary}>
                        Save Findings
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Diagnosis Tab */}
                {activeTab === 'diagnosis' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Diagnosis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="ICD Code"
                          placeholder="e.g., K02.9"
                          value={diagnosis.code}
                          onChange={(e) => setDiagnosis(prev => ({ ...prev, code: e.target.value }))}
                        />
                        <div className="flex items-center space-x-2 pt-6">
                          <input
                            type="checkbox"
                            id="primary"
                            checked={diagnosis.is_primary}
                            onChange={(e) => setDiagnosis(prev => ({ ...prev, is_primary: e.target.checked }))}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor="primary" className="text-sm font-medium text-gray-700">
                            Primary Diagnosis
                          </label>
                        </div>
                      </div>
                      <Input
                        label="Description"
                        placeholder="Diagnosis description..."
                        value={diagnosis.description}
                        onChange={(e) => setDiagnosis(prev => ({ ...prev, description: e.target.value }))}
                      />
                      <Button onClick={saveDiagnosis} disabled={!diagnosis.code || !diagnosis.description}>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Diagnosis
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* SOAP Notes Tab */}
                {activeTab === 'soap' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>SOAP Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SOAP Notes
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={10}
                          placeholder="Subjective, Objective, Assessment, Plan..."
                          value={soapNotes}
                          onChange={(e) => setSoapNotes(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}