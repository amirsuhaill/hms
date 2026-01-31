'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  BeakerIcon,
  CreditCardIcon,
  HeartIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Hardcoded data for demo
const patientData = {
  name: 'John Doe',
  mrn: 'HMS-001-2025',
  age: 34,
  bloodGroup: 'O+',
  lastVisit: '2026-01-20',
}

const upcomingAppointments = [
  {
    id: 1,
    doctor: 'Dr. Sarah Johnson',
    specialization: 'Dentistry',
    date: '2026-01-30',
    time: '10:00 AM',
    type: 'Follow-up',
    status: 'Confirmed'
  },
  {
    id: 2,
    doctor: 'Dr. Michael Chen',
    specialization: 'General Medicine',
    date: '2026-02-05',
    time: '02:30 PM',
    type: 'Consultation',
    status: 'Pending'
  }
]

const vitals = {
  bloodPressure: { value: '120/80', status: 'normal', unit: 'mmHg', trend: 'stable' },
  heartRate: { value: '72', status: 'normal', unit: 'bpm', trend: 'down' },
  bloodSugar: { value: '95', status: 'normal', unit: 'mg/dL', trend: 'stable' },
  temperature: { value: '98.6', status: 'normal', unit: '°F', trend: 'stable' },
  weight: { value: '75', status: 'normal', unit: 'kg', trend: 'up' },
  height: { value: '175', status: 'normal', unit: 'cm', trend: 'stable' }
}

const pendingLabReports = [
  { id: 1, test: 'Complete Blood Count (CBC)', orderedDate: '2026-01-25', status: 'In Progress' },
  { id: 2, test: 'Lipid Profile', orderedDate: '2026-01-25', status: 'Pending' }
]

const outstandingInvoices = [
  { id: 1, description: 'Dental Consultation', amount: 500, date: '2026-01-20', status: 'Unpaid' },
  { id: 2, description: 'Lab Tests', amount: 1200, date: '2026-01-25', status: 'Partial' }
]

const lastVisitSummary = {
  date: '2026-01-20',
  doctor: 'Dr. Sarah Johnson',
  diagnosis: 'Routine Dental Checkup',
  prescription: 'Fluoride Treatment',
  nextVisit: '2026-01-30'
}

export default function PatientDashboard() {
  const getVitalStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-amber-600 bg-amber-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />
    if (trend === 'down') return <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />
    return <div className="w-4 h-4 bg-gray-300 rounded-full" />
  }

  return (
    <DashboardLayout requiredRole="PATIENT">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {patientData.name}!</h1>
              <p className="text-indigo-100 text-lg">Here's your health overview</p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <DocumentTextIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-100">MRN</p>
                    <p className="font-semibold">{patientData.mrn}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <HeartIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-100">Blood Group</p>
                    <p className="font-semibold">{patientData.bloodGroup}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <CalendarDaysIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-100">Last Visit</p>
                    <p className="font-semibold">{patientData.lastVisit}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <HeartIcon className="w-20 h-20 text-white/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Upcoming</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{upcomingAppointments.length}</p>
                  <p className="text-xs text-blue-600 mt-1">Appointments</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                  <CalendarDaysIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Pending</p>
                  <p className="text-3xl font-bold text-amber-900 mt-2">{pendingLabReports.length}</p>
                  <p className="text-xs text-amber-600 mt-1">Lab Reports</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                  <BeakerIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-rose-50 via-rose-100 to-pink-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-700">Outstanding</p>
                  <p className="text-3xl font-bold text-rose-900 mt-2">QAR {outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0)}</p>
                  <p className="text-xs text-rose-600 mt-1">Invoices</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg">
                  <CreditCardIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Health</p>
                  <p className="text-3xl font-bold text-emerald-900 mt-2">Good</p>
                  <p className="text-xs text-emerald-600 mt-1">Status</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <HeartIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-indigo-900 flex items-center">
                    <CalendarDaysIcon className="w-6 h-6 mr-2" />
                    Upcoming Appointments
                  </CardTitle>
                  <Link href="/patient/appointments">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-indigo-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{apt.doctor}</h3>
                            <Badge variant="info" className="text-xs">{apt.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{apt.specialization}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center text-gray-700">
                              <CalendarDaysIcon className="w-4 h-4 mr-1.5 text-indigo-600" />
                              {apt.date}
                            </div>
                            <div className="flex items-center text-gray-700">
                              <ClockIcon className="w-4 h-4 mr-1.5 text-indigo-600" />
                              {apt.time}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Badge variant={apt.status === 'Confirmed' ? 'success' : 'warning'}>
                            {apt.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Visit Summary */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <CardTitle className="text-purple-900 flex items-center">
                <DocumentTextIcon className="w-6 h-6 mr-2" />
                Last Visit
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{lastVisitSummary.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Doctor</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{lastVisitSummary.doctor}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Diagnosis</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{lastVisitSummary.diagnosis}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Treatment</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{lastVisitSummary.prescription}</p>
                </div>
                <Link href="/patient/medical-records">
                  <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    View Full History
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vitals */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="text-emerald-900 flex items-center">
              <HeartIcon className="w-6 h-6 mr-2" />
              Your Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(vitals).map(([key, vital]) => (
                <div key={key} className={`p-5 rounded-xl border-2 ${getVitalStatusColor(vital.status)} transition-all duration-200 hover:shadow-lg`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    {getTrendIcon(vital.trend)}
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold">{vital.value}</p>
                    <p className="text-sm text-gray-600">{vital.unit}</p>
                  </div>
                  <p className="text-xs mt-2 capitalize font-medium">{vital.status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Lab Reports */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-900 flex items-center">
                  <BeakerIcon className="w-6 h-6 mr-2" />
                  Pending Lab Reports
                </CardTitle>
                <Link href="/patient/lab-records">
                  <Button size="sm" variant="outline">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {pendingLabReports.map((report) => (
                  <div key={report.id} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{report.test}</p>
                        <p className="text-sm text-gray-600 mt-1">Ordered: {report.orderedDate}</p>
                      </div>
                      <Badge variant={report.status === 'In Progress' ? 'info' : 'warning'}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Invoices */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-rose-900 flex items-center">
                  <CreditCardIcon className="w-6 h-6 mr-2" />
                  Outstanding Invoices
                </CardTitle>
                <Link href="/patient/billing">
                  <Button size="sm" variant="outline">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {outstandingInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{invoice.description}</p>
                        <p className="text-sm text-gray-600 mt-1">{invoice.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-rose-900">QAR {invoice.amount}</p>
                        <Badge variant={invoice.status === 'Unpaid' ? 'danger' : 'warning'} className="mt-1">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-slate-200">
            <CardTitle className="text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/patient/appointments">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-200 rounded-xl hover:shadow-xl hover:scale-105 cursor-pointer transition-all duration-200">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl w-fit mb-3 shadow-lg">
                    <CalendarDaysIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-blue-900">Book Appointment</h3>
                  <p className="text-sm text-blue-700 mt-1">Schedule a visit</p>
                </div>
              </Link>

              <Link href="/patient/medical-records">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-xl hover:shadow-xl hover:scale-105 cursor-pointer transition-all duration-200">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl w-fit mb-3 shadow-lg">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-purple-900">Medical Records</h3>
                  <p className="text-sm text-purple-700 mt-1">View history</p>
                </div>
              </Link>

              <Link href="/patient/lab-records">
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 rounded-xl hover:shadow-xl hover:scale-105 cursor-pointer transition-all duration-200">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl w-fit mb-3 shadow-lg">
                    <BeakerIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-amber-900">Lab Reports</h3>
                  <p className="text-sm text-amber-700 mt-1">View results</p>
                </div>
              </Link>

              <Link href="/patient/billing">
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-100 border-2 border-emerald-200 rounded-xl hover:shadow-xl hover:scale-105 cursor-pointer transition-all duration-200">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl w-fit mb-3 shadow-lg">
                    <CreditCardIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-emerald-900">Pay Bills</h3>
                  <p className="text-sm text-emerald-700 mt-1">Make payment</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

