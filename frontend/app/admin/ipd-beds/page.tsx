'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Square3Stack3DIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  BuildingOffice2Icon,
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Hardcoded demo data
const wardsData = [
  { id: 1, name: 'General Ward A', type: 'General', floor: 'Ground Floor', totalBeds: 30, occupied: 22, available: 6, maintenance: 2, status: 'Active' },
  { id: 2, name: 'General Ward B', type: 'General', floor: '1st Floor', totalBeds: 30, occupied: 25, available: 4, maintenance: 1, status: 'Active' },
  { id: 3, name: 'ICU', type: 'Intensive Care', floor: '2nd Floor', totalBeds: 20, occupied: 18, available: 1, maintenance: 1, status: 'Active' },
  { id: 4, name: 'Pediatric Ward', type: 'Pediatric', floor: '3rd Floor', totalBeds: 25, occupied: 15, available: 9, maintenance: 1, status: 'Active' },
  { id: 5, name: 'Maternity Ward', type: 'Maternity', floor: '3rd Floor', totalBeds: 20, occupied: 12, available: 7, maintenance: 1, status: 'Active' },
  { id: 6, name: 'Private Rooms', type: 'Private', floor: '4th Floor', totalBeds: 15, occupied: 10, available: 4, maintenance: 1, status: 'Active' },
  { id: 7, name: 'Cardiac Care', type: 'Cardiac', floor: '2nd Floor', totalBeds: 15, occupied: 12, available: 2, maintenance: 1, status: 'Active' },
  { id: 8, name: 'Isolation Ward', type: 'Isolation', floor: '5th Floor', totalBeds: 10, occupied: 3, available: 6, maintenance: 1, status: 'Inactive' }
]

const bedsData = [
  // General Ward A
  { id: 1, bedNo: 'GWA-001', ward: 'General Ward A', status: 'Occupied', patient: 'John Doe', admissionDate: '2026-01-25' },
  { id: 2, bedNo: 'GWA-002', ward: 'General Ward A', status: 'Available', patient: null, admissionDate: null },
  { id: 3, bedNo: 'GWA-003', ward: 'General Ward A', status: 'Occupied', patient: 'Maria Garcia', admissionDate: '2026-01-27' },
  { id: 4, bedNo: 'GWA-004', ward: 'General Ward A', status: 'Maintenance', patient: null, admissionDate: null },
  { id: 5, bedNo: 'GWA-005', ward: 'General Ward A', status: 'Occupied', patient: 'Robert Taylor', admissionDate: '2026-01-28' },
  { id: 6, bedNo: 'GWA-006', ward: 'General Ward A', status: 'Available', patient: null, admissionDate: null },
  // ICU
  { id: 7, bedNo: 'ICU-001', ward: 'ICU', status: 'Occupied', patient: 'James Wilson', admissionDate: '2026-01-20' },
  { id: 8, bedNo: 'ICU-002', ward: 'ICU', status: 'Occupied', patient: 'Lisa Anderson', admissionDate: '2026-01-22' },
  { id: 9, bedNo: 'ICU-003', ward: 'ICU', status: 'Available', patient: null, admissionDate: null },
  { id: 10, bedNo: 'ICU-004', ward: 'ICU', status: 'Occupied', patient: 'Michael Chen', admissionDate: '2026-01-26' },
  { id: 11, bedNo: 'ICU-005', ward: 'ICU', status: 'Maintenance', patient: null, admissionDate: null },
  { id: 12, bedNo: 'ICU-006', ward: 'ICU', status: 'Occupied', patient: 'Sarah Johnson', admissionDate: '2026-01-28' },
  // Private Rooms
  { id: 13, bedNo: 'PVT-001', ward: 'Private Rooms', status: 'Occupied', patient: 'Emily Brown', admissionDate: '2026-01-24' },
  { id: 14, bedNo: 'PVT-002', ward: 'Private Rooms', status: 'Available', patient: null, admissionDate: null },
  { id: 15, bedNo: 'PVT-003', ward: 'Private Rooms', status: 'Occupied', patient: 'David Kim', admissionDate: '2026-01-27' },
  { id: 16, bedNo: 'PVT-004', ward: 'Private Rooms', status: 'Available', patient: null, admissionDate: null }
]

const wardTypes = ['General', 'Intensive Care', 'Pediatric', 'Maternity', 'Private', 'Cardiac', 'Isolation', 'Emergency']

type ViewType = 'wards' | 'beds'

export default function IPDBedManagementPage() {
  const [activeView, setActiveView] = useState<ViewType>('wards')
  const [wards, setWards] = useState(wardsData)
  const [beds, setBeds] = useState(bedsData)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [selectedWard, setSelectedWard] = useState<string>('All')

  const totalStats = {
    totalBeds: wards.reduce((sum, w) => sum + w.totalBeds, 0),
    occupied: wards.reduce((sum, w) => sum + w.occupied, 0),
    available: wards.reduce((sum, w) => sum + w.available, 0),
    maintenance: wards.reduce((sum, w) => sum + w.maintenance, 0)
  }

  const filteredBeds = selectedWard === 'All' ? beds : beds.filter(b => b.ward === selectedWard)

  const handleOpenModal = (item?: any) => {
    setEditingItem(item || null)
    if (activeView === 'wards') {
      setFormData(item ? { ...item } : { name: '', type: 'General', floor: '', totalBeds: 0, status: 'Active' })
    } else {
      setFormData(item ? { ...item } : { bedNo: '', ward: '', status: 'Available' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({})
  }

  const handleSave = () => {
    if (activeView === 'wards') {
      if (editingItem) {
        setWards(wards.map(w => w.id === editingItem.id ? { ...w, ...formData } : w))
      } else {
        setWards([...wards, { ...formData, id: wards.length + 1, occupied: 0, available: formData.totalBeds || 0, maintenance: 0 }])
      }
    } else {
      if (editingItem) {
        setBeds(beds.map(b => b.id === editingItem.id ? { ...b, ...formData } : b))
      } else {
        setBeds([...beds, { ...formData, id: beds.length + 1, patient: null, admissionDate: null }])
      }
    }
    handleCloseModal()
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete?')) {
      if (activeView === 'wards') {
        setWards(wards.filter(w => w.id !== id))
      } else {
        setBeds(beds.filter(b => b.id !== id))
      }
    }
  }

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 border-green-500 text-green-700'
      case 'Occupied': return 'bg-red-100 border-red-500 text-red-700'
      case 'Maintenance': return 'bg-amber-100 border-amber-500 text-amber-700'
      default: return 'bg-gray-100 border-gray-500 text-gray-700'
    }
  }

  const getBedIcon = (status: string) => {
    switch (status) {
      case 'Available': return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'Occupied': return <UserIcon className="w-5 h-5 text-red-600" />
      case 'Maintenance': return <WrenchScrewdriverIcon className="w-5 h-5 text-amber-600" />
      default: return null
    }
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IPD & Bed Management</h1>
              <p className="text-gray-600 mt-1">Manage wards and bed allocations</p>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add {activeView === 'wards' ? 'Ward' : 'Bed'}
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Beds</p>
                  <p className="text-2xl font-bold text-blue-900">{totalStats.totalBeds}</p>
                </div>
                <Square3Stack3DIcon className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-red-50 to-rose-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Occupied</p>
                  <p className="text-2xl font-bold text-red-900">{totalStats.occupied}</p>
                </div>
                <UserIcon className="w-10 h-10 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Available</p>
                  <p className="text-2xl font-bold text-green-900">{totalStats.available}</p>
                </div>
                <CheckCircleIcon className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Maintenance</p>
                  <p className="text-2xl font-bold text-amber-900">{totalStats.maintenance}</p>
                </div>
                <WrenchScrewdriverIcon className="w-10 h-10 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl max-w-md">
          <button
            onClick={() => setActiveView('wards')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeView === 'wards' ? 'bg-white text-teal-700 shadow-md' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ward Management
          </button>
          <button
            onClick={() => setActiveView('beds')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeView === 'beds' ? 'bg-white text-teal-700 shadow-md' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bed Status Board
          </button>
        </div>

        {/* Ward Management */}
        {activeView === 'wards' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
              <CardTitle className="text-teal-900 flex items-center">
                <BuildingOffice2Icon className="w-6 h-6 mr-2" />
                Ward Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ward</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Beds</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {wards.map((ward) => {
                      const occupancyRate = Math.round((ward.occupied / ward.totalBeds) * 100)
                      return (
                        <tr key={ward.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white">
                                <BuildingOffice2Icon className="w-5 h-5" />
                              </div>
                              <span className="ml-3 font-medium text-gray-900">{ward.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="info">{ward.type}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{ward.floor}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{ward.totalBeds}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 max-w-24">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      occupancyRate > 90 ? 'bg-red-500' :
                                      occupancyRate > 70 ? 'bg-amber-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${occupancyRate}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{occupancyRate}%</span>
                            </div>
                            <div className="flex space-x-2 mt-1 text-xs text-gray-500">
                              <span className="text-green-600">{ward.available} free</span>
                              <span className="text-red-600">{ward.occupied} used</span>
                              <span className="text-amber-600">{ward.maintenance} maint</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={ward.status === 'Active' ? 'success' : 'danger'}>{ward.status}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button onClick={() => handleOpenModal(ward)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <PencilSquareIcon className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDelete(ward.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bed Status Board */}
        {activeView === 'beds' && (
          <>
            {/* Ward Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedWard('All')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedWard === 'All' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Wards
              </button>
              {wards.filter(w => w.status === 'Active').map((ward) => (
                <button
                  key={ward.id}
                  onClick={() => setSelectedWard(ward.name)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedWard === ward.name ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {ward.name}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-sm text-gray-600">Occupied</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-amber-500" />
                <span className="text-sm text-gray-600">Maintenance</span>
              </div>
            </div>

            {/* Beds Grid */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-slate-200">
                <CardTitle className="text-slate-900 flex items-center">
                  <Square3Stack3DIcon className="w-6 h-6 mr-2" />
                  Bed Status Board - {selectedWard === 'All' ? 'All Wards' : selectedWard}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredBeds.map((bed) => (
                    <div
                      key={bed.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${getBedStatusColor(bed.status)}`}
                      onClick={() => handleOpenModal(bed)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm">{bed.bedNo}</span>
                        {getBedIcon(bed.status)}
                      </div>
                      {bed.patient && (
                        <div className="mt-2 pt-2 border-t border-current/20">
                          <p className="text-xs font-medium truncate">{bed.patient}</p>
                          <p className="text-xs opacity-75">{bed.admissionDate}</p>
                        </div>
                      )}
                      {!bed.patient && (
                        <p className="text-xs mt-2 opacity-75">{bed.status}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingItem ? 'Edit' : 'Add'} {activeView === 'wards' ? 'Ward' : 'Bed'}
                </h2>
                <button onClick={handleCloseModal} className="text-white/80 hover:text-white">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {activeView === 'wards' ? (
                  <>
                    <Input label="Ward Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., General Ward A" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ward Type</label>
                      <select value={formData.type || 'General'} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                        {wardTypes.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <Input label="Floor" value={formData.floor || ''} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} placeholder="e.g., 2nd Floor" />
                    <Input label="Total Beds" type="number" value={formData.totalBeds || ''} onChange={(e) => setFormData({ ...formData, totalBeds: parseInt(e.target.value) })} placeholder="e.g., 30" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select value={formData.status || 'Active'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <Input label="Bed Number" value={formData.bedNo || ''} onChange={(e) => setFormData({ ...formData, bedNo: e.target.value })} placeholder="e.g., GWA-001" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                      <select value={formData.ward || ''} onChange={(e) => setFormData({ ...formData, ward: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                        <option value="">Select Ward</option>
                        {wards.filter(w => w.status === 'Active').map(ward => (
                          <option key={ward.id} value={ward.name}>{ward.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select value={formData.status || 'Available'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button onClick={handleSave} className="bg-gradient-to-r from-teal-600 to-cyan-600">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
