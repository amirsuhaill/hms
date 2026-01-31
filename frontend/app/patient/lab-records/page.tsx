'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  BeakerIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

// Hardcoded lab records data
const labRecords = [
  {
    id: 1,
    orderDate: '2026-01-25',
    reportDate: '2026-01-27',
    doctor: 'Dr. Sarah Johnson',
    status: 'Completed',
    tests: [
      {
        name: 'Complete Blood Count (CBC)',
        category: 'Hematology',
        result: 'Normal',
        parameters: [
          { name: 'Hemoglobin', value: '14.5', unit: 'g/dL', range: '12-16', status: 'normal' },
          { name: 'WBC Count', value: '7500', unit: '/μL', range: '4000-11000', status: 'normal' },
          { name: 'Platelet Count', value: '250000', unit: '/μL', range: '150000-450000', status: 'normal' },
          { name: 'RBC Count', value: '4.8', unit: 'million/μL', range: '4.5-5.5', status: 'normal' }
        ]
      }
    ]
  },
  {
    id: 2,
    orderDate: '2026-01-25',
    reportDate: null,
    doctor: 'Dr. Sarah Johnson',
    status: 'In Progress',
    tests: [
      {
        name: 'Lipid Profile',
        category: 'Biochemistry',
        result: 'Pending',
        parameters: []
      }
    ]
  },
  {
    id: 3,
    orderDate: '2025-12-10',
    reportDate: '2025-12-12',
    doctor: 'Dr. Michael Chen',
    status: 'Completed',
    tests: [
      {
        name: 'Fasting Blood Sugar',
        category: 'Biochemistry',
        result: 'Normal',
        parameters: [
          { name: 'Glucose (Fasting)', value: '95', unit: 'mg/dL', range: '70-100', status: 'normal' }
        ]
      },
      {
        name: 'Lipid Profile',
        category: 'Biochemistry',
        result: 'Normal',
        parameters: [
          { name: 'Total Cholesterol', value: '180', unit: 'mg/dL', range: '<200', status: 'normal' },
          { name: 'HDL Cholesterol', value: '55', unit: 'mg/dL', range: '>40', status: 'normal' },
          { name: 'LDL Cholesterol', value: '110', unit: 'mg/dL', range: '<130', status: 'normal' },
          { name: 'Triglycerides', value: '140', unit: 'mg/dL', range: '<150', status: 'normal' }
        ]
      }
    ]
  },
  {
    id: 4,
    orderDate: '2025-11-15',
    reportDate: '2025-11-16',
    doctor: 'Dr. Robert Brown',
    status: 'Completed',
    tests: [
      {
        name: 'X-Ray - Right Knee',
        category: 'Radiology',
        result: 'Mild degenerative changes',
        parameters: [
          { name: 'Findings', value: 'Mild joint space narrowing. No fractures detected.', unit: '', range: '', status: 'normal' }
        ]
      }
    ]
  }
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'Completed', label: 'Completed' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Pending', label: 'Pending' }
]

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Hematology', label: 'Hematology' },
  { value: 'Biochemistry', label: 'Biochemistry' },
  { value: 'Radiology', label: 'Radiology' },
  { value: 'Microbiology', label: 'Microbiology' }
]

export default function PatientLabRecords() {
  const router = useRouter()
  const [filter, setFilter] = useState({ status: '', category: '', search: '' })

  const filteredRecords = labRecords.filter(record => {
    const matchesStatus = !filter.status || record.status === filter.status
    const matchesCategory = !filter.category || record.tests.some(t => t.category === filter.category)
    const matchesSearch = !filter.search ||
      record.tests.some(t => t.name.toLowerCase().includes(filter.search.toLowerCase())) ||
      record.doctor.toLowerCase().includes(filter.search.toLowerCase())
    return matchesStatus && matchesCategory && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
      'Completed': 'success',
      'In Progress': 'info',
      'Pending': 'warning'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getStatusIcon = (status: string) => {
    if (status === 'Completed') return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    if (status === 'In Progress') return <ClockIcon className="w-5 h-5 text-blue-500" />
    return <ExclamationCircleIcon className="w-5 h-5 text-amber-500" />
  }

  const getParameterColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-50 border-green-200 text-green-900'
      case 'high': return 'bg-red-50 border-red-200 text-red-900'
      case 'low': return 'bg-amber-50 border-amber-200 text-amber-900'
      default: return 'bg-gray-50 border-gray-200 text-gray-900'
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Lab Records</h1>
              <p className="text-gray-600 mt-1">View your lab test results and reports</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            Download All Reports
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter({ status: '', category: '', search: '' })}
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search tests or doctor..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Select
                label="Status"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                options={statusOptions}
              />
              <Select
                label="Category"
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                options={categoryOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-amber-50 to-orange-100">
              <div className="text-center">
                <BeakerIcon className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-amber-700">Total Tests</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  {labRecords.reduce((sum, r) => sum + r.tests.length, 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-100">
              <div className="text-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700">Completed</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {labRecords.filter(r => r.status === 'Completed').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100">
              <div className="text-center">
                <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">In Progress</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {labRecords.filter(r => r.status === 'In Progress').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-pink-100">
              <div className="text-center">
                <ExclamationCircleIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-700">Pending</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {labRecords.filter(r => r.status === 'Pending').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lab Records List */}
        <div className="space-y-6">
          {filteredRecords.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <BeakerIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No lab records found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-200">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                        <BeakerIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Lab Order #{record.id}</h3>
                        <p className="text-sm text-gray-600">Ordered by {record.doctor}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(record.status)}
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Order Date:</span> {record.orderDate}
                    </div>
                    {record.reportDate && (
                      <div>
                        <span className="font-medium">Report Date:</span> {record.reportDate}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-6">
                    {record.tests.map((test, idx) => (
                      <div key={idx} className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{test.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">Category: {test.category}</p>
                          </div>
                          <Badge variant={test.result === 'Normal' ? 'success' : test.result === 'Pending' ? 'warning' : 'default'}>
                            {test.result}
                          </Badge>
                        </div>

                        {test.parameters.length > 0 && (
                          <div className="space-y-3 mt-4">
                            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Test Parameters</p>
                            {test.parameters.map((param, pidx) => (
                              <div key={pidx} className={`p-4 rounded-xl border-2 ${getParameterColor(param.status)}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-semibold">{param.name}</p>
                                    {param.range && (
                                      <p className="text-xs mt-1 opacity-75">Normal Range: {param.range}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold">
                                      {param.value} {param.unit}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {record.status === 'Completed' && (
                          <div className="mt-4 flex space-x-3">
                            <Button variant="outline" className="flex-1">
                              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                              Download Report
                            </Button>
                            <Button variant="outline" className="flex-1">
                              Share with Doctor
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
