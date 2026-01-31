'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { labTestApi } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import {
  ArrowLeftIcon,
  BeakerIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface LabOrder {
  id: number
  patient_id: number
  appointment_id?: number
  notes: string
  status: string
  created_at: string
  patient_name?: string
  items: LabOrderItem[]
}

interface LabOrderItem {
  id: number
  test_id: number
  name: string
  code: string
  status: string
  result_value?: string
  unit?: string
  ref_range?: string
  result_flag?: string
  reported_at?: string
}

export default function LabOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [labOrder, setLabOrder] = useState<LabOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLabOrder()
  }, [orderId])

  const fetchLabOrder = async () => {
    try {
      setLoading(true)
      const response = await labTestApi.getOrderById(parseInt(orderId))
      if (response.success && response.data) {
        setLabOrder(response.data)
      }
    } catch (error) {
      console.error('Error fetching lab order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'warning' as const, label: 'Pending', icon: ClockIcon },
      IN_PROGRESS: { variant: 'info' as const, label: 'In Progress', icon: BeakerIcon },
      COMPLETED: { variant: 'success' as const, label: 'Completed', icon: CheckCircleIcon },
      CANCELLED: { variant: 'danger' as const, label: 'Cancelled', icon: ExclamationTriangleIcon },
      REPORTED: { variant: 'success' as const, label: 'Reported', icon: CheckCircleIcon },
      VERIFIED: { variant: 'success' as const, label: 'Verified', icon: CheckCircleIcon }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { variant: 'default' as const, label: status, icon: ClockIcon }
    
    return (
      <div className="flex items-center space-x-2">
        <Badge variant={config.variant}>{config.label}</Badge>
        <config.icon className="w-4 h-4 text-gray-400" />
      </div>
    )
  }

  const getResultFlag = (flag?: string) => {
    if (!flag) return null
    
    const flagConfig = {
      HIGH: { variant: 'danger' as const, label: 'High' },
      LOW: { variant: 'warning' as const, label: 'Low' },
      NORMAL: { variant: 'success' as const, label: 'Normal' },
      ABNORMAL: { variant: 'danger' as const, label: 'Abnormal' }
    }
    
    const config = flagConfig[flag as keyof typeof flagConfig] || 
                  { variant: 'default' as const, label: flag }
    
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

  if (!labOrder) {
    return (
      <DashboardLayout requiredRole="DOCTOR">
        <div className="text-center py-8">
          <p className="text-gray-500">Lab order not found</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Lab Order #{labOrder.id}</h1>
              <p className="text-gray-600">Laboratory Test Results</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(labOrder.status)}
          </div>
        </div>

        {/* Order Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Patient</p>
                <p className="text-lg font-semibold">
                  {labOrder.patient_name || `Patient ID: ${labOrder.patient_id}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Order Date</p>
                <p className="text-sm">{formatDateTime(labOrder.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-lg font-semibold">{labOrder.items?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Appointment ID</p>
                <p className="text-sm">{labOrder.appointment_id || 'N/A'}</p>
              </div>
            </div>
            {labOrder.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-700 mt-1">{labOrder.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!labOrder.items || labOrder.items.length === 0 ? (
              <div className="text-center py-8">
                <BeakerIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No test items found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {labOrder.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">Code: {item.code}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(item.status)}
                        {item.result_flag && getResultFlag(item.result_flag)}
                      </div>
                    </div>

                    {item.result_value ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Result</p>
                          <p className="text-xl font-bold text-gray-900">
                            {item.result_value} {item.unit && <span className="text-sm font-normal text-gray-500">{item.unit}</span>}
                          </p>
                        </div>
                        {item.ref_range && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">Reference Range</p>
                            <p className="text-sm text-gray-700">{item.ref_range}</p>
                          </div>
                        )}
                        {item.reported_at && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">Reported At</p>
                            <p className="text-sm text-gray-700">{formatDateTime(item.reported_at)}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-5 h-5 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {item.status === 'PENDING' ? 'Test pending - results not yet available' : 
                             item.status === 'IN_PROGRESS' ? 'Test in progress - results coming soon' :
                             'Results not available'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {labOrder.items?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {labOrder.items?.filter(item => item.status === 'PENDING').length || 0}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {labOrder.items?.filter(item => item.status === 'IN_PROGRESS').length || 0}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {labOrder.items?.filter(item => ['REPORTED', 'VERIFIED', 'COMPLETED'].includes(item.status)).length || 0}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-3">
              <Button onClick={() => window.print()}>
                Print Results
              </Button>
              <Button variant="outline" onClick={() => router.push('/doctor/lab-orders')}>
                Back to Lab Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}