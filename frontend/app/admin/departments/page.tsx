'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  BuildingOffice2Icon,
  UserGroupIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MapPinIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Hardcoded demo data
const departmentsData = [
  { id: 1, name: 'Cardiology', code: 'CAR-001', floor: '2nd Floor', doctors: 8, beds: 24, status: 'Active' },
  { id: 2, name: 'General Medicine', code: 'GEN-001', floor: '1st Floor', doctors: 12, beds: 40, status: 'Active' },
  { id: 3, name: 'Pediatrics', code: 'PED-001', floor: '3rd Floor', doctors: 6, beds: 20, status: 'Active' },
  { id: 4, name: 'Orthopedics', code: 'ORT-001', floor: '2nd Floor', doctors: 5, beds: 18, status: 'Active' },
  { id: 5, name: 'Emergency', code: 'EMR-001', floor: 'Ground Floor', doctors: 10, beds: 30, status: 'Active' },
  { id: 6, name: 'Radiology', code: 'RAD-001', floor: '1st Floor', doctors: 4, beds: 0, status: 'Active' },
  { id: 7, name: 'Pathology', code: 'PAT-001', floor: 'Basement', doctors: 3, beds: 0, status: 'Active' },
  { id: 8, name: 'Ophthalmology', code: 'OPH-001', floor: '4th Floor', doctors: 3, beds: 8, status: 'Inactive' }
]

const doctorsData = [
  { id: 1, name: 'Dr. Sarah Johnson', regNo: 'MED-2018-001', specialization: 'Cardiology', fee: 500, email: 'sarah@hms.com', phone: '+974-5551-0001', status: 'Active' },
  { id: 2, name: 'Dr. Michael Chen', regNo: 'MED-2019-002', specialization: 'General Medicine', fee: 350, email: 'mchen@hms.com', phone: '+974-5551-0002', status: 'Active' },
  { id: 3, name: 'Dr. Emily Brown', regNo: 'MED-2020-003', specialization: 'Pediatrics', fee: 400, email: 'ebrown@hms.com', phone: '+974-5551-0003', status: 'Active' },
  { id: 4, name: 'Dr. David Kim', regNo: 'MED-2017-004', specialization: 'Orthopedics', fee: 600, email: 'dkim@hms.com', phone: '+974-5551-0004', status: 'Active' },
  { id: 5, name: 'Dr. Lisa Anderson', regNo: 'MED-2021-005', specialization: 'Emergency', fee: 450, email: 'landerson@hms.com', phone: '+974-5551-0005', status: 'Active' },
  { id: 6, name: 'Dr. Robert Taylor', regNo: 'MED-2016-006', specialization: 'Radiology', fee: 400, email: 'rtaylor@hms.com', phone: '+974-5551-0006', status: 'Inactive' }
]

const staffData = [
  { id: 1, name: 'Maria Garcia', employeeId: 'STF-001', role: 'Receptionist', department: 'Reception', shift: 'Morning', status: 'Active' },
  { id: 2, name: 'James Wilson', employeeId: 'STF-002', role: 'Lab Technician', department: 'Pathology', shift: 'Morning', status: 'Active' },
  { id: 3, name: 'Sarah Miller', employeeId: 'STF-003', role: 'Nurse', department: 'Cardiology', shift: 'Night', status: 'Active' },
  { id: 4, name: 'Robert Brown', employeeId: 'STF-004', role: 'Pharmacist', department: 'Pharmacy', shift: 'Morning', status: 'Active' },
  { id: 5, name: 'Jennifer Lee', employeeId: 'STF-005', role: 'Nurse', department: 'Pediatrics', shift: 'Evening', status: 'Active' },
  { id: 6, name: 'Michael Davis', employeeId: 'STF-006', role: 'Ward Boy', department: 'General Medicine', shift: 'Morning', status: 'Inactive' },
  { id: 7, name: 'Amanda Thompson', employeeId: 'STF-007', role: 'Billing Clerk', department: 'Finance', shift: 'Morning', status: 'Active' }
]

type TabType = 'departments' | 'doctors' | 'staff'

export default function DepartmentsStaffPage() {
  const [activeTab, setActiveTab] = useState<TabType>('departments')
  const [departments, setDepartments] = useState(departmentsData)
  const [doctors, setDoctors] = useState(doctorsData)
  const [staff, setStaff] = useState(staffData)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  const tabs = [
    { id: 'departments', name: 'Departments', count: departments.length },
    { id: 'doctors', name: 'Doctors', count: doctors.length },
    { id: 'staff', name: 'Staff', count: staff.length }
  ]

  const handleOpenModal = (item?: any) => {
    setEditingItem(item || null)
    if (activeTab === 'departments') {
      setFormData(item ? { ...item } : { name: '', code: '', floor: '', status: 'Active' })
    } else if (activeTab === 'doctors') {
      setFormData(item ? { ...item } : { name: '', regNo: '', specialization: '', fee: '', email: '', phone: '', status: 'Active' })
    } else {
      setFormData(item ? { ...item } : { name: '', employeeId: '', role: '', department: '', shift: 'Morning', status: 'Active' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({})
  }

  const handleSave = () => {
    if (activeTab === 'departments') {
      if (editingItem) {
        setDepartments(departments.map(d => d.id === editingItem.id ? { ...d, ...formData } : d))
      } else {
        setDepartments([...departments, { ...formData, id: departments.length + 1, doctors: 0, beds: 0 }])
      }
    } else if (activeTab === 'doctors') {
      if (editingItem) {
        setDoctors(doctors.map(d => d.id === editingItem.id ? { ...d, ...formData } : d))
      } else {
        setDoctors([...doctors, { ...formData, id: doctors.length + 1 }])
      }
    } else {
      if (editingItem) {
        setStaff(staff.map(s => s.id === editingItem.id ? { ...s, ...formData } : s))
      } else {
        setStaff([...staff, { ...formData, id: staff.length + 1 }])
      }
    }
    handleCloseModal()
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      if (activeTab === 'departments') {
        setDepartments(departments.filter(d => d.id !== id))
      } else if (activeTab === 'doctors') {
        setDoctors(doctors.filter(d => d.id !== id))
      } else {
        setStaff(staff.filter(s => s.id !== id))
      }
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
              <h1 className="text-3xl font-bold text-gray-900">Departments & Staff Setup</h1>
              <p className="text-gray-600 mt-1">Manage departments, doctors, and staff members</p>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add {activeTab === 'departments' ? 'Department' : activeTab === 'doctors' ? 'Doctor' : 'Staff'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Total Departments</p>
                  <p className="text-2xl font-bold text-purple-900">{departments.filter(d => d.status === 'Active').length}</p>
                </div>
                <BuildingOffice2Icon className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Doctors</p>
                  <p className="text-2xl font-bold text-blue-900">{doctors.filter(d => d.status === 'Active').length}</p>
                </div>
                <IdentificationIcon className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Total Staff</p>
                  <p className="text-2xl font-bold text-amber-900">{staff.filter(s => s.status === 'Active').length}</p>
                </div>
                <UserGroupIcon className="w-10 h-10 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-purple-700 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.name} <Badge className="ml-2">{tab.count}</Badge>
            </button>
          ))}
        </div>

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <CardTitle className="text-purple-900 flex items-center">
                <BuildingOffice2Icon className="w-6 h-6 mr-2" />
                Departments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctors</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beds</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                              <BuildingOffice2Icon className="w-5 h-5" />
                            </div>
                            <span className="ml-3 font-medium text-gray-900">{dept.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{dept.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                            {dept.floor}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.doctors}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.beds}</td>
                        <td className="px-6 py-4">
                          <Badge variant={dept.status === 'Active' ? 'success' : 'danger'}>{dept.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => handleOpenModal(dept)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(dept.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
              <CardTitle className="text-blue-900 flex items-center">
                <IdentificationIcon className="w-6 h-6 mr-2" />
                Doctors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg. No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consulting Fee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {doctors.map((doctor) => (
                      <tr key={doctor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
                              {doctor.name.split(' ')[1]?.charAt(0) || doctor.name.charAt(0)}
                            </div>
                            <span className="ml-3 font-medium text-gray-900">{doctor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{doctor.regNo}</td>
                        <td className="px-6 py-4">
                          <Badge variant="info">{doctor.specialization}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm font-medium text-green-700">
                            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                            QAR {doctor.fee}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <p>{doctor.email}</p>
                          <p className="text-xs text-gray-400">{doctor.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={doctor.status === 'Active' ? 'success' : 'danger'}>{doctor.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="Upload Signature">
                              <DocumentArrowUpIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleOpenModal(doctor)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(doctor.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <CardTitle className="text-amber-900 flex items-center">
                <UserGroupIcon className="w-6 h-6 mr-2" />
                Staff Members
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {staff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                              {member.name.charAt(0)}
                            </div>
                            <span className="ml-3 font-medium text-gray-900">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{member.employeeId}</td>
                        <td className="px-6 py-4">
                          <Badge>{member.role}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{member.department}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            member.shift === 'Morning' ? 'bg-yellow-100 text-yellow-800' :
                            member.shift === 'Evening' ? 'bg-orange-100 text-orange-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {member.shift}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={member.status === 'Active' ? 'success' : 'danger'}>{member.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => handleOpenModal(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(member.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingItem ? 'Edit' : 'Add'} {activeTab === 'departments' ? 'Department' : activeTab === 'doctors' ? 'Doctor' : 'Staff'}
                </h2>
                <button onClick={handleCloseModal} className="text-white/80 hover:text-white">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {activeTab === 'departments' && (
                  <>
                    <Input label="Department Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Cardiology" />
                    <Input label="Department Code" value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., CAR-001" />
                    <Input label="Floor Location" value={formData.floor || ''} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} placeholder="e.g., 2nd Floor" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select value={formData.status || 'Active'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </>
                )}
                {activeTab === 'doctors' && (
                  <>
                    <Input label="Doctor Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Dr. John Smith" />
                    <Input label="Registration Number" value={formData.regNo || ''} onChange={(e) => setFormData({ ...formData, regNo: e.target.value })} placeholder="e.g., MED-2024-001" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <select value={formData.specialization || ''} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="">Select Specialization</option>
                        {departmentsData.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <Input label="Consulting Fee (QAR)" type="number" value={formData.fee || ''} onChange={(e) => setFormData({ ...formData, fee: parseInt(e.target.value) })} placeholder="e.g., 500" />
                    <Input label="Email" type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="doctor@hms.com" />
                    <Input label="Phone" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+974-555-0000" />
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-sm text-gray-600 text-center">
                        <DocumentArrowUpIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        Upload Signature (Demo only)
                      </p>
                    </div>
                  </>
                )}
                {activeTab === 'staff' && (
                  <>
                    <Input label="Staff Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., John Smith" />
                    <Input label="Employee ID" value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} placeholder="e.g., STF-001" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="">Select Role</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Lab Technician">Lab Technician</option>
                        <option value="Pharmacist">Pharmacist</option>
                        <option value="Ward Boy">Ward Boy</option>
                        <option value="Billing Clerk">Billing Clerk</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="">Select Department</option>
                        {departmentsData.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        <option value="Reception">Reception</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                      <select value={formData.shift || 'Morning'} onChange={(e) => setFormData({ ...formData, shift: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-pink-600">
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
