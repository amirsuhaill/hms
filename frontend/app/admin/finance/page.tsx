'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Hardcoded demo data
const revenueStats = {
  today: 45600,
  yesterday: 40750,
  thisWeek: 285400,
  lastWeek: 268900,
  thisMonth: 1245800,
  lastMonth: 1189500,
  outstanding: 156700
}

const revenueByDepartment = [
  { department: 'Cardiology', opd: 125000, ipd: 245000, total: 370000, percentage: 30 },
  { department: 'General Medicine', opd: 98000, ipd: 156000, total: 254000, percentage: 20 },
  { department: 'Orthopedics', opd: 78000, ipd: 198000, total: 276000, percentage: 22 },
  { department: 'Pediatrics', opd: 65000, ipd: 89000, total: 154000, percentage: 12 },
  { department: 'Emergency', opd: 45000, ipd: 67000, total: 112000, percentage: 9 },
  { department: 'Others', opd: 34000, ipd: 45800, total: 79800, percentage: 7 }
]

const revenueByDoctor = [
  { doctor: 'Dr. Sarah Johnson', department: 'Cardiology', consultations: 145, revenue: 125000, avgPerPatient: 862 },
  { doctor: 'Dr. Michael Chen', department: 'General Medicine', consultations: 234, revenue: 98500, avgPerPatient: 421 },
  { doctor: 'Dr. David Kim', department: 'Orthopedics', consultations: 98, revenue: 112000, avgPerPatient: 1143 },
  { doctor: 'Dr. Emily Brown', department: 'Pediatrics', consultations: 178, revenue: 78500, avgPerPatient: 441 },
  { doctor: 'Dr. Lisa Anderson', department: 'Emergency', consultations: 89, revenue: 67000, avgPerPatient: 753 }
]

const invoicesData = [
  { id: 'INV-2026-001', patient: 'John Doe', type: 'OPD', amount: 2500, paid: 2500, outstanding: 0, status: 'Paid', date: '2026-01-29' },
  { id: 'INV-2026-002', patient: 'Maria Garcia', type: 'IPD', amount: 45000, paid: 35000, outstanding: 10000, status: 'Partial', date: '2026-01-29' },
  { id: 'INV-2026-003', patient: 'Robert Taylor', type: 'OPD', amount: 1500, paid: 0, outstanding: 1500, status: 'Unpaid', date: '2026-01-28' },
  { id: 'INV-2026-004', patient: 'Lisa Anderson', type: 'IPD', amount: 78000, paid: 78000, outstanding: 0, status: 'Paid', date: '2026-01-28' },
  { id: 'INV-2026-005', patient: 'James Wilson', type: 'Lab', amount: 3500, paid: 3500, outstanding: 0, status: 'Paid', date: '2026-01-27' },
  { id: 'INV-2026-006', patient: 'Emily Brown', type: 'OPD', amount: 2000, paid: 0, outstanding: 2000, status: 'Unpaid', date: '2026-01-27' },
  { id: 'INV-2026-007', patient: 'Michael Chen', type: 'IPD', amount: 125000, paid: 100000, outstanding: 25000, status: 'Partial', date: '2026-01-26' },
  { id: 'INV-2026-008', patient: 'Sarah Miller', type: 'Procedure', amount: 15000, paid: 15000, outstanding: 0, status: 'Paid', date: '2026-01-26' }
]

const monthlyRevenue = [
  { month: 'Aug', amount: 980000 },
  { month: 'Sep', amount: 1050000 },
  { month: 'Oct', amount: 1120000 },
  { month: 'Nov', amount: 1089000 },
  { month: 'Dec', amount: 1189500 },
  { month: 'Jan', amount: 1245800 }
]

type DateFilter = 'today' | 'week' | 'month' | 'custom'
type InvoiceFilter = 'all' | 'paid' | 'unpaid' | 'partial'

export default function FinancePage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('month')
  const [invoiceFilter, setInvoiceFilter] = useState<InvoiceFilter>('all')

  const filteredInvoices = invoicesData.filter(inv => {
    if (invoiceFilter === 'all') return true
    if (invoiceFilter === 'paid') return inv.status === 'Paid'
    if (invoiceFilter === 'unpaid') return inv.status === 'Unpaid'
    if (invoiceFilter === 'partial') return inv.status === 'Partial'
    return true
  })

  const invoiceStats = {
    total: invoicesData.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoicesData.reduce((sum, inv) => sum + inv.paid, 0),
    outstanding: invoicesData.reduce((sum, inv) => sum + inv.outstanding, 0),
    paidCount: invoicesData.filter(inv => inv.status === 'Paid').length,
    unpaidCount: invoicesData.filter(inv => inv.status === 'Unpaid').length,
    partialCount: invoicesData.filter(inv => inv.status === 'Partial').length
  }

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map(m => m.amount))

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance Reports</h1>
              <p className="text-gray-600 mt-1">Revenue analytics and invoice management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {(['today', 'week', 'month'] as DateFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                    dateFilter === filter ? 'bg-white text-green-700 shadow' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'Today'}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">QAR {revenueStats.today.toLocaleString()}</p>
                  <div className="flex items-center mt-2 text-xs">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+{((revenueStats.today - revenueStats.yesterday) / revenueStats.yesterday * 100).toFixed(1)}% from yesterday</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <BanknotesIcon className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">This Week</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">QAR {revenueStats.thisWeek.toLocaleString()}</p>
                  <div className="flex items-center mt-2 text-xs">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-blue-600">+{((revenueStats.thisWeek - revenueStats.lastWeek) / revenueStats.lastWeek * 100).toFixed(1)}% from last week</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <CalendarDaysIcon className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">This Month</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">QAR {revenueStats.thisMonth.toLocaleString()}</p>
                  <div className="flex items-center mt-2 text-xs">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-purple-600 mr-1" />
                    <span className="text-purple-600">+{((revenueStats.thisMonth - revenueStats.lastMonth) / revenueStats.lastMonth * 100).toFixed(1)}% from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <DocumentTextIcon className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 bg-gradient-to-br from-red-50 to-rose-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Outstanding</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">QAR {revenueStats.outstanding.toLocaleString()}</p>
                  <p className="text-xs text-red-600 mt-2">From {invoiceStats.unpaidCount + invoiceStats.partialCount} invoices</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
                  <ExclamationTriangleIcon className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <CardTitle className="text-green-900 flex items-center">
                <ArrowTrendingUpIcon className="w-6 h-6 mr-2" />
                Monthly Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-end justify-between h-48 gap-4">
                {monthlyRevenue.map((month) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center justify-end h-40">
                      <span className="text-xs font-medium text-gray-600 mb-2">{(month.amount / 1000).toFixed(0)}K</span>
                      <div
                        className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-green-500 to-emerald-400 transition-all duration-300"
                        style={{ height: `${(month.amount / maxMonthlyRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 mt-2">{month.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* OPD vs IPD Revenue */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="text-blue-900 flex items-center">
                <BuildingOffice2Icon className="w-6 h-6 mr-2" />
                OPD vs IPD Revenue by Department
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {revenueByDepartment.slice(0, 5).map((dept) => (
                  <div key={dept.department}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{dept.department}</span>
                      <span className="text-gray-500">QAR {(dept.total / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${(dept.opd / dept.total) * 100}%` }}
                        title={`OPD: QAR ${dept.opd.toLocaleString()}`}
                      />
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${(dept.ipd / dept.total) * 100}%` }}
                        title={`IPD: QAR ${dept.ipd.toLocaleString()}`}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center space-x-6 pt-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-cyan-500 mr-2" />
                    <span className="text-gray-600">OPD</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-pink-500 mr-2" />
                    <span className="text-gray-600">IPD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor-wise Revenue */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
            <CardTitle className="text-purple-900 flex items-center">
              <UserGroupIcon className="w-6 h-6 mr-2" />
              Doctor-wise Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consultations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg per Patient</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {revenueByDoctor.map((doc, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                            {doc.doctor.split(' ')[1]?.charAt(0) || 'D'}
                          </div>
                          <span className="ml-3 font-medium text-gray-900">{doc.doctor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Badge variant="info">{doc.department}</Badge></td>
                      <td className="px-6 py-4 text-sm text-gray-600">{doc.consultations}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-700">QAR {doc.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">QAR {doc.avgPerPatient}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Reports */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-slate-900 flex items-center">
                <DocumentTextIcon className="w-6 h-6 mr-2" />
                Invoice Reports
              </CardTitle>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-4 h-4 text-gray-500" />
                <div className="flex space-x-1">
                  {(['all', 'paid', 'unpaid', 'partial'] as InvoiceFilter[]).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setInvoiceFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium capitalize transition-all ${
                        invoiceFilter === filter
                          ? filter === 'paid' ? 'bg-green-100 text-green-700' :
                            filter === 'unpaid' ? 'bg-red-100 text-red-700' :
                            filter === 'partial' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Invoice Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 border-b">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Total Invoiced</p>
                <p className="text-lg font-bold text-gray-900">QAR {invoiceStats.total.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Paid ({invoiceStats.paidCount})</p>
                <p className="text-lg font-bold text-green-900">QAR {invoiceStats.paid.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">Outstanding</p>
                <p className="text-lg font-bold text-red-900">QAR {invoiceStats.outstanding.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-600">Pending ({invoiceStats.unpaidCount + invoiceStats.partialCount})</p>
                <p className="text-lg font-bold text-amber-900">{invoiceStats.unpaidCount + invoiceStats.partialCount} invoices</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{inv.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{inv.patient}</td>
                      <td className="px-6 py-4"><Badge>{inv.type}</Badge></td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">QAR {inv.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-green-700">QAR {inv.paid.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-red-700">{inv.outstanding > 0 ? `QAR ${inv.outstanding.toLocaleString()}` : '-'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          inv.status === 'Paid' ? 'success' :
                          inv.status === 'Unpaid' ? 'danger' : 'warning'
                        }>
                          {inv.status === 'Paid' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                          {inv.status === 'Unpaid' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                          {inv.status === 'Partial' && <ClockIcon className="w-3 h-3 mr-1" />}
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{inv.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
