'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  BeakerIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Hardcoded demo data
const labTestsData = [
  { id: 1, name: 'Complete Blood Count (CBC)', code: 'LAB-CBC-001', category: 'Hematology', price: 150, turnaround: '2 hours', status: 'Active' },
  { id: 2, name: 'Lipid Profile', code: 'LAB-LIP-001', category: 'Biochemistry', price: 350, turnaround: '4 hours', status: 'Active' },
  { id: 3, name: 'Liver Function Test (LFT)', code: 'LAB-LFT-001', category: 'Biochemistry', price: 400, turnaround: '4 hours', status: 'Active' },
  { id: 4, name: 'Kidney Function Test (KFT)', code: 'LAB-KFT-001', category: 'Biochemistry', price: 380, turnaround: '4 hours', status: 'Active' },
  { id: 5, name: 'Blood Sugar (Fasting)', code: 'LAB-BSF-001', category: 'Biochemistry', price: 80, turnaround: '1 hour', status: 'Active' },
  { id: 6, name: 'Thyroid Profile (T3, T4, TSH)', code: 'LAB-THY-001', category: 'Endocrinology', price: 600, turnaround: '6 hours', status: 'Active' },
  { id: 7, name: 'Urine Routine', code: 'LAB-URI-001', category: 'Urinalysis', price: 100, turnaround: '2 hours', status: 'Active' },
  { id: 8, name: 'HbA1c', code: 'LAB-HBA-001', category: 'Biochemistry', price: 450, turnaround: '4 hours', status: 'Inactive' }
]

const proceduresData = [
  { id: 1, name: 'ECG', code: 'PROC-ECG-001', department: 'Cardiology', cost: 200, duration: '15 min', status: 'Active' },
  { id: 2, name: 'X-Ray Chest', code: 'PROC-XRC-001', department: 'Radiology', cost: 350, duration: '30 min', status: 'Active' },
  { id: 3, name: 'Ultrasound Abdomen', code: 'PROC-USA-001', department: 'Radiology', cost: 500, duration: '45 min', status: 'Active' },
  { id: 4, name: 'CT Scan', code: 'PROC-CTS-001', department: 'Radiology', cost: 2500, duration: '60 min', status: 'Active' },
  { id: 5, name: 'MRI Brain', code: 'PROC-MRI-001', department: 'Radiology', cost: 4500, duration: '90 min', status: 'Active' },
  { id: 6, name: 'Endoscopy', code: 'PROC-END-001', department: 'Gastroenterology', cost: 3000, duration: '60 min', status: 'Active' },
  { id: 7, name: 'Echo Cardiogram', code: 'PROC-ECH-001', department: 'Cardiology', cost: 1500, duration: '45 min', status: 'Active' },
  { id: 8, name: 'Dialysis Session', code: 'PROC-DIA-001', department: 'Nephrology', cost: 2000, duration: '4 hours', status: 'Active' }
]

const inventoryData = [
  { id: 1, name: 'Paracetamol 500mg', code: 'INV-PAR-001', category: 'Medicines', stockQty: 5000, reorderLevel: 1000, unit: 'Tablets', lastUpdated: '2026-01-28', status: 'In Stock' },
  { id: 2, name: 'Surgical Gloves (Medium)', code: 'INV-GLV-001', category: 'Consumables', stockQty: 800, reorderLevel: 500, unit: 'Pairs', lastUpdated: '2026-01-27', status: 'In Stock' },
  { id: 3, name: 'IV Cannula 20G', code: 'INV-IVC-001', category: 'Consumables', stockQty: 150, reorderLevel: 200, unit: 'Pieces', lastUpdated: '2026-01-28', status: 'Low Stock' },
  { id: 4, name: 'Amoxicillin 500mg', code: 'INV-AMX-001', category: 'Medicines', stockQty: 2500, reorderLevel: 500, unit: 'Capsules', lastUpdated: '2026-01-26', status: 'In Stock' },
  { id: 5, name: 'Syringes 5ml', code: 'INV-SYR-001', category: 'Consumables', stockQty: 300, reorderLevel: 400, unit: 'Pieces', lastUpdated: '2026-01-28', status: 'Low Stock' },
  { id: 6, name: 'N95 Masks', code: 'INV-MSK-001', category: 'PPE', stockQty: 1200, reorderLevel: 300, unit: 'Pieces', lastUpdated: '2026-01-25', status: 'In Stock' },
  { id: 7, name: 'Blood Collection Tubes', code: 'INV-BCT-001', category: 'Lab Supplies', stockQty: 50, reorderLevel: 100, unit: 'Pieces', lastUpdated: '2026-01-28', status: 'Critical' },
  { id: 8, name: 'Bandages (Elastic)', code: 'INV-BND-001', category: 'Consumables', stockQty: 400, reorderLevel: 200, unit: 'Rolls', lastUpdated: '2026-01-24', status: 'In Stock' }
]

const categories = {
  lab: ['Hematology', 'Biochemistry', 'Microbiology', 'Urinalysis', 'Endocrinology', 'Immunology'],
  procedures: ['Cardiology', 'Radiology', 'Gastroenterology', 'Nephrology', 'Neurology', 'Orthopedics'],
  inventory: ['Medicines', 'Consumables', 'PPE', 'Lab Supplies', 'Equipment', 'Surgical']
}

type TabType = 'lab' | 'procedures' | 'inventory'

export default function LabProceduresPage() {
  const [activeTab, setActiveTab] = useState<TabType>('lab')
  const [labTests, setLabTests] = useState(labTestsData)
  const [procedures, setProcedures] = useState(proceduresData)
  const [inventory, setInventory] = useState(inventoryData)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState('')

  const tabs = [
    { id: 'lab', name: 'Lab Tests', count: labTests.length, icon: BeakerIcon },
    { id: 'procedures', name: 'Procedures', count: procedures.length, icon: ClipboardDocumentListIcon },
    { id: 'inventory', name: 'Inventory', count: inventory.length, icon: CubeIcon }
  ]

  const lowStockItems = inventory.filter(item => item.status === 'Low Stock' || item.status === 'Critical')

  const handleOpenModal = (item?: any) => {
    setEditingItem(item || null)
    if (activeTab === 'lab') {
      setFormData(item ? { ...item } : { name: '', code: '', category: '', price: '', turnaround: '', status: 'Active' })
    } else if (activeTab === 'procedures') {
      setFormData(item ? { ...item } : { name: '', code: '', department: '', cost: '', duration: '', status: 'Active' })
    } else {
      setFormData(item ? { ...item } : { name: '', code: '', category: '', stockQty: '', reorderLevel: '', unit: '', status: 'In Stock' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({})
  }

  const handleSave = () => {
    if (activeTab === 'lab') {
      if (editingItem) {
        setLabTests(labTests.map(t => t.id === editingItem.id ? { ...t, ...formData } : t))
      } else {
        setLabTests([...labTests, { ...formData, id: labTests.length + 1 }])
      }
    } else if (activeTab === 'procedures') {
      if (editingItem) {
        setProcedures(procedures.map(p => p.id === editingItem.id ? { ...p, ...formData } : p))
      } else {
        setProcedures([...procedures, { ...formData, id: procedures.length + 1 }])
      }
    } else {
      if (editingItem) {
        setInventory(inventory.map(i => i.id === editingItem.id ? { ...i, ...formData, lastUpdated: new Date().toISOString().split('T')[0] } : i))
      } else {
        setInventory([...inventory, { ...formData, id: inventory.length + 1, lastUpdated: new Date().toISOString().split('T')[0] }])
      }
    }
    handleCloseModal()
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete?')) {
      if (activeTab === 'lab') {
        setLabTests(labTests.filter(t => t.id !== id))
      } else if (activeTab === 'procedures') {
        setProcedures(procedures.filter(p => p.id !== id))
      } else {
        setInventory(inventory.filter(i => i.id !== id))
      }
    }
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'success'
      case 'Low Stock': return 'warning'
      case 'Critical': return 'danger'
      default: return 'default'
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
              <h1 className="text-3xl font-bold text-gray-900">Lab & Procedure Data</h1>
              <p className="text-gray-600 mt-1">Manage lab tests, procedures, and inventory</p>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add {activeTab === 'lab' ? 'Lab Test' : activeTab === 'procedures' ? 'Procedure' : 'Inventory Item'}
          </Button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-0 shadow-lg border-l-4 border-l-amber-500 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">Low Stock Alert!</p>
                  <p className="text-sm text-amber-700">
                    {lowStockItems.length} item(s) need attention: {lowStockItems.map(i => i.name).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                activeTab === tab.id ? 'bg-white text-amber-700 shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
              <Badge className="ml-2">{tab.count}</Badge>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'lab' ? 'lab tests' : activeTab === 'procedures' ? 'procedures' : 'inventory'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Lab Tests Tab */}
        {activeTab === 'lab' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <CardTitle className="text-amber-900 flex items-center">
                <BeakerIcon className="w-6 h-6 mr-2" />
                Lab Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turnaround</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {labTests.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{test.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{test.code}</td>
                        <td className="px-6 py-4"><Badge variant="info">{test.category}</Badge></td>
                        <td className="px-6 py-4 text-sm font-medium text-green-700">QAR {test.price}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{test.turnaround}</td>
                        <td className="px-6 py-4"><Badge variant={test.status === 'Active' ? 'success' : 'danger'}>{test.status}</Badge></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => handleOpenModal(test)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(test.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Procedures Tab */}
        {activeTab === 'procedures' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <CardTitle className="text-purple-900 flex items-center">
                <ClipboardDocumentListIcon className="w-6 h-6 mr-2" />
                Procedures
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procedure</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {procedures.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((proc) => (
                      <tr key={proc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{proc.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{proc.code}</td>
                        <td className="px-6 py-4"><Badge variant="info">{proc.department}</Badge></td>
                        <td className="px-6 py-4 text-sm font-medium text-green-700">QAR {proc.cost}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{proc.duration}</td>
                        <td className="px-6 py-4"><Badge variant={proc.status === 'Active' ? 'success' : 'danger'}>{proc.status}</Badge></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => handleOpenModal(proc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(proc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
              <CardTitle className="text-teal-900 flex items-center">
                <CubeIcon className="w-6 h-6 mr-2" />
                Inventory Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                      <tr key={item.id} className={`hover:bg-gray-50 ${item.status === 'Critical' ? 'bg-red-50' : item.status === 'Low Stock' ? 'bg-amber-50' : ''}`}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">Last updated: {item.lastUpdated}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.code}</td>
                        <td className="px-6 py-4"><Badge>{item.category}</Badge></td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${item.stockQty <= item.reorderLevel ? 'text-red-700' : 'text-gray-900'}`}>
                            {item.stockQty} {item.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.reorderLevel} {item.unit}</td>
                        <td className="px-6 py-4">
                          <Badge variant={getStockStatusColor(item.status) as any}>
                            {item.status === 'Critical' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingItem ? 'Edit' : 'Add'} {activeTab === 'lab' ? 'Lab Test' : activeTab === 'procedures' ? 'Procedure' : 'Inventory Item'}
                </h2>
                <button onClick={handleCloseModal} className="text-white/80 hover:text-white">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {activeTab === 'lab' && (
                  <>
                    <Input label="Test Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Complete Blood Count" />
                    <Input label="Test Code" value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., LAB-CBC-001" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                        <option value="">Select Category</option>
                        {categories.lab.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <Input label="Price (QAR)" type="number" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })} placeholder="e.g., 150" />
                    <Input label="Turnaround Time" value={formData.turnaround || ''} onChange={(e) => setFormData({ ...formData, turnaround: e.target.value })} placeholder="e.g., 2 hours" />
                  </>
                )}
                {activeTab === 'procedures' && (
                  <>
                    <Input label="Procedure Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., ECG" />
                    <Input label="Procedure Code" value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., PROC-ECG-001" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                        <option value="">Select Department</option>
                        {categories.procedures.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                    </div>
                    <Input label="Cost (QAR)" type="number" value={formData.cost || ''} onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })} placeholder="e.g., 200" />
                    <Input label="Duration" value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g., 15 min" />
                  </>
                )}
                {activeTab === 'inventory' && (
                  <>
                    <Input label="Item Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Paracetamol 500mg" />
                    <Input label="Item Code" value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., INV-PAR-001" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                        <option value="">Select Category</option>
                        {categories.inventory.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <Input label="Stock Quantity" type="number" value={formData.stockQty || ''} onChange={(e) => setFormData({ ...formData, stockQty: parseInt(e.target.value) })} placeholder="e.g., 5000" />
                    <Input label="Reorder Level" type="number" value={formData.reorderLevel || ''} onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })} placeholder="e.g., 1000" />
                    <Input label="Unit" value={formData.unit || ''} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="e.g., Tablets, Pieces" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select value={formData.status || 'In Stock'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button onClick={handleSave} className="bg-gradient-to-r from-amber-600 to-orange-600">
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
