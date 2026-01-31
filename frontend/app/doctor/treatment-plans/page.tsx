'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { treatmentPlanApi, getCurrentDoctorId } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface TreatmentPlan {
  id: number
  patient_id: number
  plan_name: string
  status: string
  total_estimated_cost: number
  created_at: string
  patient_name?: string
  hospital_mrn?: string
}

export default function TreatmentPlansPage() {
  const router = useRouter()
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([])
  const [filteredPlans, setFilteredPlans] = useState<TreatmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  // Filter plans based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlans(treatmentPlans)
    } else {
      const filtered = treatmentPlans.filter(plan =>
        plan.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.hospital_mrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPlans(filtered)
    }
  }, [searchTerm, treatmentPlans])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Get current doctor ID
      const doctorId = await getCurrentDoctorId()
      if (!doctorId) {
        console.error('Unable to get doctor ID')
        return
      }

      console.log('Fetching treatment plans for doctor ID:', doctorId)

      // Fetch all treatment plans for this doctor (no filters)
      const plansResponse = await treatmentPlanApi.getByDoctor(doctorId)
      
      console.log('Treatment plans API response:', plansResponse) // Debug log
      
      if (plansResponse.success && plansResponse.data) {
        console.log('Treatment plans data received:', plansResponse.data.length, 'plans')
        setTreatmentPlans(plansResponse.data)
        setFilteredPlans(plansResponse.data)
      } else {
        console.error('Failed to fetch treatment plans:', plansResponse.error)
        setTreatmentPlans([])
        setFilteredPlans([])
      }
      
    } catch (error) {
      console.error('Error fetching treatment plans data:', error)
      setTreatmentPlans([])
      setFilteredPlans([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const clearSearch = () => {
    setSearchTerm('')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'default' as const, label: 'Draft' },
      APPROVED: { variant: 'info' as const, label: 'Approved' },
      IN_PROGRESS: { variant: 'warning' as const, label: 'In Progress' },
      COMPLETED: { variant: 'success' as const, label: 'Completed' },
      CANCELLED: { variant: 'danger' as const, label: 'Cancelled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { variant: 'default' as const, label: status }
    
    return <Badge variant={config.variant}>{config.label}</Badge>
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

  return (
    <DashboardLayout requiredRole="DOCTOR">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Treatment Plans</h1>
            <p className="text-gray-600">Create and manage patient treatment plans</p>
          </div>
          <Link href="/doctor/treatment-plans/create">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Treatment Plan
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              Search Treatment Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by patient name, MRN, or plan name..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                Showing {filteredPlans.length} of {treatmentPlans.length} treatment plans
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Plans</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredPlans.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredPlans.filter(plan => plan.status === 'IN_PROGRESS').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredPlans.filter(plan => plan.status === 'COMPLETED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredPlans.filter(plan => plan.status === 'DRAFT').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Treatment Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Treatment Plans
              {searchTerm && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (filtered by "{searchTerm}")
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPlans.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {searchTerm ? (
                  <div>
                    <p className="text-gray-500 mb-2">No treatment plans found matching "{searchTerm}"</p>
                    <Button variant="outline" onClick={clearSearch}>
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500">No treatment plans found</p>
                    <Button className="mt-4" onClick={() => router.push('/doctor/treatment-plans/create')}>
                      Create First Treatment Plan
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MRN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estimated Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {plan.plan_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {plan.patient_name || `Patient ID: ${plan.patient_id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {plan.hospital_mrn || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(plan.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${(typeof plan.total_estimated_cost === 'number' ? plan.total_estimated_cost : parseFloat(plan.total_estimated_cost || '0')).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(plan.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={`/doctor/treatment-plans/${plan.id}`}>
                              <Button variant="ghost" size="sm">
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/doctor/treatment-plans/${plan.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}