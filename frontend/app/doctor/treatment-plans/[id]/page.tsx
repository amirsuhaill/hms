'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { treatmentPlanApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface TreatmentPlan {
  id: number
  patient_id: number
  plan_name: string
  status: string
  total_estimated_cost: number
  created_at: string
  procedures: Procedure[]
}

interface Procedure {
  id: number
  procedure_id: number
  name: string
  code: string
  tooth_node_id?: number
  custom_notes: string
  estimated_cost: number
  priority: string
  status: string
  scheduled_datetime?: string
}

interface ProcedureMaster {
  id: number
  code: string
  name: string
  category: string
  default_cost: number
  default_duration_minutes: number
}

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
]

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' }
]

export default function TreatmentPlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string

  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null)
  const [proceduresMaster, setProceduresMaster] = useState<ProcedureMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddProcedure, setShowAddProcedure] = useState(false)
  const [newProcedure, setNewProcedure] = useState({
    procedure_id: '',
    tooth_node_id: '',
    custom_notes: '',
    estimated_cost: 0,
    priority: 'MEDIUM',
    scheduled_datetime: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch treatment plan details
      const planResponse = await treatmentPlanApi.getById(parseInt(planId))
      if (planResponse.success && planResponse.data) {
        setTreatmentPlan(planResponse.data)
      }

      // Fetch procedures master list
      const proceduresResponse = await treatmentPlanApi.getProceduresMaster()
      if (proceduresResponse.success && proceduresResponse.data) {
        setProceduresMaster(proceduresResponse.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load treatment plan')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProcedure = async () => {
    if (!newProcedure.procedure_id) return

    try {
      const procedureData = {
        procedure_id: parseInt(newProcedure.procedure_id),
        tooth_node_id: newProcedure.tooth_node_id ? parseInt(newProcedure.tooth_node_id) : null,
        custom_notes: newProcedure.custom_notes,
        estimated_cost: newProcedure.estimated_cost,
        priority: newProcedure.priority,
        scheduled_datetime: newProcedure.scheduled_datetime || null
      }

      const response = await treatmentPlanApi.addProcedure(parseInt(planId), procedureData)
      if (response.success && response.data) {
        // Refresh the treatment plan data
        fetchData()
        setNewProcedure({
          procedure_id: '',
          tooth_node_id: '',
          custom_notes: '',
          estimated_cost: 0,
          priority: 'MEDIUM',
          scheduled_datetime: ''
        })
        setShowAddProcedure(false)
        toast.success('Procedure added successfully')
      } else {
        toast.error(response.error || 'Failed to add procedure')
      }
    } catch (error) {
      console.error('Error adding procedure:', error)
      toast.error('Failed to add procedure')
    }
  }

  const handleUpdatePlanStatus = async (status: string) => {
    if (!treatmentPlan) return

    try {
      const response = await treatmentPlanApi.update(treatmentPlan.id, { status })
      if (response.success) {
        setTreatmentPlan(prev => prev ? { ...prev, status } : null)
        toast.success('Status updated successfully')
      } else {
        toast.error(response.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'default' as const, label: 'Draft' },
      APPROVED: { variant: 'info' as const, label: 'Approved' },
      IN_PROGRESS: { variant: 'warning' as const, label: 'In Progress' },
      COMPLETED: { variant: 'success' as const, label: 'Completed' },
      CANCELLED: { variant: 'danger' as const, label: 'Cancelled' },
      PLANNED: { variant: 'default' as const, label: 'Planned' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { variant: 'default' as const, label: status }
    
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { variant: 'default' as const, label: 'Low' },
      MEDIUM: { variant: 'info' as const, label: 'Medium' },
      HIGH: { variant: 'warning' as const, label: 'High' },
      URGENT: { variant: 'danger' as const, label: 'Urgent' }
    }
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || 
                  { variant: 'default' as const, label: priority }
    
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const procedureOptions = proceduresMaster.map(proc => ({
    value: proc.id.toString(),
    label: `${proc.name} (${proc.code}) - $${proc.default_cost}`
  }))

  const selectedProcedure = proceduresMaster.find(p => p.id.toString() === newProcedure.procedure_id)

  // Update estimated cost when procedure is selected
  useEffect(() => {
    if (selectedProcedure && newProcedure.estimated_cost === 0) {
      setNewProcedure(prev => ({ ...prev, estimated_cost: selectedProcedure.default_cost }))
    }
  }, [selectedProcedure, newProcedure.estimated_cost])

  if (loading) {
    return (
      <DashboardLayout requiredRole="DOCTOR">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!treatmentPlan) {
    return (
      <DashboardLayout requiredRole="DOCTOR">
        <div className="text-center py-8">
          <p className="text-gray-500">Treatment plan not found</p>
        </div>
      </DashboardLayout>
    )
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
              <h1 className="text-3xl font-bold text-gray-900">{treatmentPlan.plan_name}</h1>
              <p className="text-gray-600">Treatment Plan Details</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setShowAddProcedure(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Procedure
            </Button>
          </div>
        </div>

        {/* Plan Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="mt-1 flex items-center space-x-2">
                  {getStatusBadge(treatmentPlan.status)}
                  <Select
                    value={treatmentPlan.status}
                    onChange={(e) => handleUpdatePlanStatus(e.target.value)}
                    options={statusOptions}
                    className="ml-2"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Estimated Cost</p>
                <p className="text-lg font-semibold text-green-600">
                  ${(typeof treatmentPlan.total_estimated_cost === 'number' ? treatmentPlan.total_estimated_cost : parseFloat(treatmentPlan.total_estimated_cost || '0')).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Procedures</p>
                <p className="text-lg font-semibold">{treatmentPlan.procedures?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm">{formatDate(treatmentPlan.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Procedure Form */}
        {showAddProcedure && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Procedure</CardTitle>
                <Button variant="ghost" onClick={() => setShowAddProcedure(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Procedure"
                value={newProcedure.procedure_id}
                onChange={(e) => setNewProcedure(prev => ({ ...prev, procedure_id: e.target.value }))}
                options={[{ value: '', label: 'Select a procedure' }, ...procedureOptions]}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tooth Number (Optional)"
                  type="number"
                  placeholder="e.g., 14"
                  value={newProcedure.tooth_node_id}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, tooth_node_id: e.target.value }))}
                />
                <Select
                  label="Priority"
                  value={newProcedure.priority}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, priority: e.target.value }))}
                  options={priorityOptions}
                />
              </div>
              <Input
                label="Estimated Cost"
                type="number"
                step="0.01"
                value={newProcedure.estimated_cost}
                onChange={(e) => setNewProcedure(prev => ({ ...prev, estimated_cost: parseFloat(e.target.value) || 0 }))}
              />
              <Input
                label="Scheduled Date (Optional)"
                type="datetime-local"
                value={newProcedure.scheduled_datetime}
                onChange={(e) => setNewProcedure(prev => ({ ...prev, scheduled_datetime: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional notes for this procedure..."
                  value={newProcedure.custom_notes}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, custom_notes: e.target.value }))}
                />
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleAddProcedure} disabled={!newProcedure.procedure_id}>
                  Add Procedure
                </Button>
                <Button variant="outline" onClick={() => setShowAddProcedure(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Procedures List */}
        <Card>
          <CardHeader>
            <CardTitle>Procedures</CardTitle>
          </CardHeader>
          <CardContent>
            {!treatmentPlan.procedures || treatmentPlan.procedures.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No procedures added yet</p>
                <Button className="mt-4" onClick={() => setShowAddProcedure(true)}>
                  Add First Procedure
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {treatmentPlan.procedures.map((procedure) => (
                  <div key={procedure.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{procedure.name}</h3>
                          <Badge variant="default">{procedure.code}</Badge>
                          {getPriorityBadge(procedure.priority)}
                          {getStatusBadge(procedure.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Estimated Cost:</span> ${procedure.estimated_cost?.toFixed(2) || '0.00'}
                          </div>
                          {procedure.tooth_node_id && (
                            <div>
                              <span className="font-medium">Tooth:</span> #{procedure.tooth_node_id}
                            </div>
                          )}
                          {procedure.scheduled_datetime && (
                            <div>
                              <span className="font-medium">Scheduled:</span> {formatDate(procedure.scheduled_datetime)}
                            </div>
                          )}
                        </div>
                        {procedure.custom_notes && (
                          <div className="mt-2">
                            <span className="font-medium text-sm text-gray-600">Notes:</span>
                            <p className="text-sm text-gray-700 mt-1">{procedure.custom_notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}