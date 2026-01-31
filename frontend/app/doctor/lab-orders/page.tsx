'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { labTestApi, getCurrentDoctorId } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import {
  PlusIcon,
  EyeIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface LabOrder {
  id: number
  patient_id: number
  appointment_id?: number
  notes: string
  status: string
  created_at: string
  patient_name?: string
  hospital_mrn?: string
  items: LabOrderItem[]
}

interface LabOrderItem {
  id: number
  test_id: number
  name: string
  code: string
  status: string
  result_value?: string
  result_flag?: string
}

export default function LabOrdersPage() {
  const router = useRouter()
  const [labOrders, setLabOrders] = useState<LabOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<LabOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  // Filter orders based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(labOrders)
    } else {
      const filtered = labOrders.filter(order =>
        order.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.hospital_mrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm) ||
        order.items?.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      setFilteredOrders(filtered)
    }
  }, [searchTerm, labOrders])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Get current doctor ID
      const doctorId = await getCurrentDoctorId()
      if (!doctorId) {
        console.error('Unable to get doctor ID')
        return
      }

      console.log('Fetching lab orders for doctor ID:', doctorId)

      // Fetch all lab orders for this doctor (no filters)
      const ordersResponse = await labTestApi.getOrdersByDoctor(doctorId)
      
      console.log('Lab orders API response:', ordersResponse) // Debug log
      
      if (ordersResponse.success && ordersResponse.data) {
        console.log('Lab orders data received:', ordersResponse.data.length, 'orders')
        setLabOrders(ordersResponse.data)
        setFilteredOrders(ordersResponse.data)
      } else {
        console.error('Failed to fetch lab orders:', ordersResponse.error)
        setLabOrders([])
        setFilteredOrders([])
      }
      
    } catch (error) {
      console.error('Error fetching lab orders data:', error)
      setLabOrders([])
      setFilteredOrders([])
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
      PENDING: { variant: 'warning' as const, label: 'Pending' },
      IN_PROGRESS: { variant: 'info' as const, label: 'In Progress' },
      COMPLETED: { variant: 'success' as const, label: 'Completed' },
      CANCELLED: { variant: 'danger' as const, label: 'Cancelled' },
      REPORTED: { variant: 'success' as const, label: 'Reported' },
      VERIFIED: { variant: 'success' as const, label: 'Verified' }
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
            <h1 className="text-3xl font-bold text-gray-900">Lab Orders</h1>
            <p className="text-gray-600">Order and manage laboratory tests</p>
          </div>
          <Link href="/doctor/lab-orders/create">
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Lab Order
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              Search Lab Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by patient name, MRN, order ID, or test name..."
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
                Showing {filteredOrders.length} of {labOrders.length} lab orders
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
                  <BeakerIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredOrders.filter(order => order.status === 'PENDING').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BeakerIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredOrders.filter(order => order.status === 'IN_PROGRESS').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredOrders.filter(order => order.status === 'COMPLETED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lab Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lab Orders
              {searchTerm && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (filtered by "{searchTerm}")
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <BeakerIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {searchTerm ? (
                  <div>
                    <p className="text-gray-500 mb-2">No lab orders found matching "{searchTerm}"</p>
                    <Button variant="outline" onClick={clearSearch}>
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500">No lab orders found</p>
                    <Button className="mt-4" onClick={() => router.push('/doctor/lab-orders/create')}>
                      Create First Lab Order
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
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MRN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.patient_name || `Patient ID: ${order.patient_id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.hospital_mrn || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-xs">
                            {order.items?.length ? (
                              <div>
                                <span className="font-medium">{order.items.length} test(s)</span>
                                <div className="text-xs text-gray-400 mt-1">
                                  {order.items.slice(0, 2).map(item => item.name).join(', ')}
                                  {order.items.length > 2 && ` +${order.items.length - 2} more`}
                                </div>
                              </div>
                            ) : (
                              '0 tests'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={`/doctor/lab-orders/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                <EyeIcon className="w-4 h-4" />
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