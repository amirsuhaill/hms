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
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PlusIcon,
  FunnelIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

// Hardcoded appointments data
const appointmentsData = [
  {
    id: 1,
    doctor: 'Dr. Sarah Johnson',
    specialization: 'Dentistry',
    date: '2026-01-30',
    time: '10:00 AM',
    type: 'Follow-up',
    status: 'Confirmed',
    location: 'Room 201, 2nd Floor',
    reason: 'Dental cleaning and checkup',
    notes: 'Please arrive 15 minutes early'
  },
  {
    id: 2,
    doctor: 'Dr. Michael Chen',
    specialization: 'General Medicine',
    date: '2026-02-05',
    time: '02:30 PM',
    type: 'Consultation',
    status: 'Pending',
    location: 'Room 105, 1st Floor',
    reason: 'Annual health checkup',
    notes: 'Fasting required'
  },
  {
    id: 3,
    doctor: 'Dr. Emily Williams',
    specialization: 'Cardiology',
    date: '2026-02-12',
    time: '11:00 AM',
    type: 'Follow-up',
    status: 'Confirmed',
    location: 'Room 305, 3rd Floor',
    reason: 'Blood pressure monitoring',
    notes: ''
  },
  {
    id: 4,
    doctor: 'Dr. Sarah Johnson',
    specialization: 'Dentistry',
    date: '2026-01-20',
    time: '10:00 AM',
    type: 'Consultation',
    status: 'Completed',
    location: 'Room 201, 2nd Floor',
    reason: 'Tooth pain',
    notes: 'Root canal completed'
  },
  {
    id: 5,
    doctor: 'Dr. Robert Brown',
    specialization: 'Orthopedics',
    date: '2026-01-15',
    time: '03:00 PM',
    type: 'Consultation',
    status: 'Completed',
    location: 'Room 402, 4th Floor',
    reason: 'Knee pain',
    notes: 'X-ray taken'
  }
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' }
]

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'Consultation', label: 'Consultation' },
  { value: 'Follow-up', label: 'Follow-up' },
  { value: 'Emergency', label: 'Emergency' }
]

export default function PatientAppointments() {
  const router = useRouter()
  const [filter, setFilter] = useState({ status: '', type: '', search: '' })

  const filteredAppointments = appointmentsData.filter(apt => {
    const matchesStatus = !filter.status || apt.status === filter.status
    const matchesType = !filter.type || apt.type === filter.type
    const matchesSearch = !filter.search || 
      apt.doctor.toLowerCase().includes(filter.search.toLowerCase()) ||
      apt.specialization.toLowerCase().includes(filter.search.toLowerCase())
    return matchesStatus && matchesType && matchesSearch
  })

  const upcomingAppointments = filteredAppointments.filter(apt => new Date(apt.date) >= new Date())
  const pastAppointments = filteredAppointments.filter(apt => new Date(apt.date) < new Date())

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
      'Confirmed': 'success',
      'Pending': 'warning',
      'Completed': 'info',
      'Cancelled': 'danger'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'info' | 'danger'> = {
      'Consultation': 'default',
      'Follow-up': 'info',
      'Emergency': 'danger'
    }
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>
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
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600 mt-1">Manage and view your appointments</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <PlusIcon className="w-5 h-5 mr-2" />
            Book New Appointment
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
                onClick={() => setFilter({ status: '', type: '', search: '' })}
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Search"
                placeholder="Search by doctor or specialization..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
              <Select
                label="Status"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                options={statusOptions}
              />
              <Select
                label="Type"
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                options={typeOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-700">Total</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{appointmentsData.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-100">
              <div className="text-center">
                <p className="text-sm font-medium text-green-700">Upcoming</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{upcomingAppointments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-pink-100">
              <div className="text-center">
                <p className="text-sm font-medium text-purple-700">Completed</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">{pastAppointments.filter(a => a.status === 'Completed').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 bg-gradient-to-br from-amber-50 to-orange-100">
              <div className="text-center">
                <p className="text-sm font-medium text-amber-700">Pending</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">{appointmentsData.filter(a => a.status === 'Pending').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <CardTitle className="text-indigo-900 flex items-center">
              <CalendarDaysIcon className="w-6 h-6 mr-2" />
              Upcoming Appointments ({upcomingAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingAppointments.map((apt) => (
                  <div 
                    key={apt.id}
                    className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{apt.doctor}</h3>
                          <p className="text-sm text-gray-600">{apt.specialization}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(apt.status)}
                        {getTypeBadge(apt.type)}
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center text-gray-700">
                        <CalendarDaysIcon className="w-5 h-5 mr-3 text-indigo-600" />
                        <span className="font-medium">{apt.date}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <ClockIcon className="w-5 h-5 mr-3 text-indigo-600" />
                        <span className="font-medium">{apt.time}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <MapPinIcon className="w-5 h-5 mr-3 text-indigo-600" />
                        <span className="font-medium">{apt.location}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600"><span className="font-semibold">Reason:</span> {apt.reason}</p>
                      {apt.notes && (
                        <p className="text-sm text-amber-700 mt-2 bg-amber-50 p-2 rounded-lg">
                          <span className="font-semibold">Note:</span> {apt.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex space-x-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        Reschedule
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-slate-200">
            <CardTitle className="text-slate-900 flex items-center">
              <CalendarDaysIcon className="w-6 h-6 mr-2" />
              Past Appointments ({pastAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {pastAppointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No past appointments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastAppointments.map((apt) => (
                  <div 
                    key={apt.id}
                    className="p-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          <UserIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{apt.doctor}</h3>
                          <p className="text-sm text-gray-600">{apt.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">{apt.date}</p>
                        <p className="text-sm text-gray-500">{apt.time}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(apt.status)}
                        {getTypeBadge(apt.type)}
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
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

