'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  CurrencyRupeeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

// Hardcoded medical records data
const medicalRecords = [
  {
    id: 1,
    date: '2026-01-20',
    doctor: 'Dr. Sarah Johnson',
    specialization: 'Dentistry',
    visitType: 'Consultation',
    chiefComplaint: 'Tooth pain in lower right molar',
    diagnosis: 'Dental Caries - Tooth #30',
    treatmentPlan: {
      name: 'Root Canal Treatment Plan',
      status: 'In Progress',
      procedures: [
        { name: 'Root Canal Therapy', status: 'Completed', cost: 3000 },
        { name: 'Crown Placement', status: 'Scheduled', cost: 5000 },
        { name: 'Follow-up Checkup', status: 'Pending', cost: 500 }
      ],
      totalCost: 8500,
      paidAmount: 3000
    },
    prescriptions: [
      { medicine: 'Amoxicillin 500mg', dosage: '1 tablet', frequency: '3 times daily', duration: '5 days' },
      { medicine: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'As needed', duration: '3 days' }
    ],
    labTests: [],
    notes: 'Patient advised to avoid hard foods. Follow-up scheduled in 2 weeks.'
  },
  {
    id: 2,
    date: '2026-01-15',
    doctor: 'Dr. Robert Brown',
    specialization: 'Orthopedics',
    visitType: 'Consultation',
    chiefComplaint: 'Knee pain and stiffness',
    diagnosis: 'Osteoarthritis - Right Knee',
    treatmentPlan: {
      name: 'Knee Pain Management',
      status: 'Completed',
      procedures: [
        { name: 'X-Ray - Knee Joint', status: 'Completed', cost: 800 },
        { name: 'Physical Therapy Session', status: 'Completed', cost: 1500 }
      ],
      totalCost: 2300,
      paidAmount: 2300
    },
    prescriptions: [
      { medicine: 'Diclofenac Gel', dosage: 'Apply', frequency: '2 times daily', duration: '14 days' },
      { medicine: 'Calcium + Vitamin D3', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' }
    ],
    labTests: [
      { name: 'X-Ray - Right Knee', result: 'Mild degenerative changes', status: 'Completed' }
    ],
    notes: 'Continue physical therapy exercises at home. Avoid prolonged standing.'
  },
  {
    id: 3,
    date: '2025-12-10',
    doctor: 'Dr. Michael Chen',
    specialization: 'General Medicine',
    visitType: 'Annual Checkup',
    chiefComplaint: 'Routine health checkup',
    diagnosis: 'Healthy - No significant findings',
    treatmentPlan: {
      name: 'Preventive Care',
      status: 'Completed',
      procedures: [
        { name: 'Complete Blood Count', status: 'Completed', cost: 500 },
        { name: 'Lipid Profile', status: 'Completed', cost: 800 },
        { name: 'Blood Sugar Test', status: 'Completed', cost: 300 }
      ],
      totalCost: 1600,
      paidAmount: 1600
    },
    prescriptions: [
      { medicine: 'Multivitamin', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' }
    ],
    labTests: [
      { name: 'CBC', result: 'Normal', status: 'Completed' },
      { name: 'Lipid Profile', result: 'Within normal limits', status: 'Completed' },
      { name: 'Fasting Blood Sugar', result: '95 mg/dL (Normal)', status: 'Completed' }
    ],
    notes: 'All parameters within normal range. Continue healthy lifestyle.'
  }
]

export default function PatientMedicalRecords() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null)

  const filteredRecords = medicalRecords.filter(record =>
    record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleRecord = (id: number) => {
    setExpandedRecord(expandedRecord === id ? null : id)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
      'Completed': 'success',
      'In Progress': 'info',
      'Scheduled': 'warning',
      'Pending': 'default'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <DashboardLayout requiredRole="PATIENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
              <p className="text-gray-600 mt-1">View your complete medical history</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Download All Records
          </Button>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by doctor, diagnosis, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-pink-100">
              <div className="text-center">
                <DocumentTextIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-700">Total Visits</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{medicalRecords.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100">
              <div className="text-center">
                <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Active Plans</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {medicalRecords.filter(r => r.treatmentPlan.status === 'In Progress').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-emerald-50 to-teal-100">
              <div className="text-center">
                <BeakerIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-emerald-700">Lab Tests</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">
                  {medicalRecords.reduce((sum, r) => sum + r.labTests.length, 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-amber-50 to-orange-100">
              <div className="text-center">
                <CurrencyRupeeIcon className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-amber-700">Total Spent</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  QAR {medicalRecords.reduce((sum, r) => sum + r.treatmentPlan.paidAmount, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No medical records found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-200">
                {/* Record Header */}
                <div 
                  className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 cursor-pointer hover:from-indigo-100 hover:to-purple-100 transition-colors"
                  onClick={() => toggleRecord(record.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                        <DocumentTextIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{record.doctor}</h3>
                        <p className="text-sm text-gray-600">{record.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">{record.date}</p>
                        <p className="text-xs text-gray-500">{record.visitType}</p>
                      </div>
                      {expandedRecord === record.id ? (
                        <ChevronUpIcon className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Record Details */}
                {expandedRecord === record.id && (
                  <CardContent className="p-6 space-y-6">
                    {/* Chief Complaint & Diagnosis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Chief Complaint</p>
                        <p className="text-gray-900 font-medium">{record.chiefComplaint}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Diagnosis</p>
                        <p className="text-gray-900 font-medium">{record.diagnosis}</p>
                      </div>
                    </div>

                    {/* Treatment Plan */}
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-indigo-900 text-lg flex items-center">
                          <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                          {record.treatmentPlan.name}
                        </h4>
                        {getStatusBadge(record.treatmentPlan.status)}
                      </div>

                      <div className="space-y-3">
                        {record.treatmentPlan.procedures.map((proc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-lg border border-indigo-100">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                proc.status === 'Completed' ? 'bg-green-500' :
                                proc.status === 'Scheduled' ? 'bg-amber-500' : 'bg-gray-300'
                              }`} />
                              <div>
                                <p className="font-medium text-gray-900">{proc.name}</p>
                                <p className="text-sm text-gray-600">{getStatusBadge(proc.status)}</p>
                              </div>
                            </div>
                            <p className="font-bold text-indigo-900">QAR {proc.cost}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-indigo-200 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Cost</p>
                          <p className="text-2xl font-bold text-indigo-900">QAR {record.treatmentPlan.totalCost}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Paid Amount</p>
                          <p className="text-2xl font-bold text-green-600">QAR {record.treatmentPlan.paidAmount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Balance</p>
                          <p className="text-2xl font-bold text-red-600">
                            QAR {record.treatmentPlan.totalCost - record.treatmentPlan.paidAmount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Prescriptions */}
                    {record.prescriptions.length > 0 && (
                      <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
                        <h4 className="font-bold text-emerald-900 text-lg mb-4">Prescriptions</h4>
                        <div className="space-y-3">
                          {record.prescriptions.map((rx, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-lg border border-emerald-100">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">{rx.medicine}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {rx.dosage} • {rx.frequency} • {rx.duration}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lab Tests */}
                    {record.labTests.length > 0 && (
                      <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
                        <h4 className="font-bold text-amber-900 text-lg mb-4 flex items-center">
                          <BeakerIcon className="w-5 h-5 mr-2" />
                          Lab Tests
                        </h4>
                        <div className="space-y-3">
                          {record.labTests.map((test, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-lg border border-amber-100">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">{test.name}</p>
                                  <p className="text-sm text-gray-600 mt-1">{test.result}</p>
                                </div>
                                {getStatusBadge(test.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Doctor's Notes */}
                    {record.notes && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Doctor&apos;s Notes</p>
                        <p className="text-gray-900">{record.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Button variant="outline" className="flex-1">
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Share with Doctor
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}


