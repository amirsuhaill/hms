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
  CreditCardIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

// Hardcoded billing data
const invoices = [
  {
    id: 'INV-2026-001',
    date: '2026-01-20',
    dueDate: '2026-02-04',
    description: 'Dental Treatment - Root Canal',
    doctor: 'Dr. Sarah Johnson',
    items: [
      { name: 'Root Canal Therapy', quantity: 1, rate: 3000, amount: 3000 },
      { name: 'Consultation Fee', quantity: 1, rate: 500, amount: 500 }
    ],
    subtotal: 3500,
    tax: 630,
    total: 4130,
    paidAmount: 3000,
    status: 'Partial',
    paymentHistory: [
      { date: '2026-01-20', amount: 3000, method: 'Credit Card', transactionId: 'TXN123456' }
    ]
  },
  {
    id: 'INV-2026-002',
    date: '2026-01-25',
    dueDate: '2026-02-09',
    description: 'Lab Tests',
    doctor: 'Dr. Sarah Johnson',
    items: [
      { name: 'Complete Blood Count (CBC)', quantity: 1, rate: 500, amount: 500 },
      { name: 'Lipid Profile', quantity: 1, rate: 800, amount: 800 }
    ],
    subtotal: 1300,
    tax: 234,
    total: 1534,
    paidAmount: 0,
    status: 'Unpaid',
    paymentHistory: []
  },
  {
    id: 'INV-2025-098',
    date: '2025-12-10',
    dueDate: '2025-12-25',
    description: 'Annual Health Checkup',
    doctor: 'Dr. Michael Chen',
    items: [
      { name: 'Consultation Fee', quantity: 1, rate: 800, amount: 800 },
      { name: 'Blood Tests Package', quantity: 1, rate: 1200, amount: 1200 }
    ],
    subtotal: 2000,
    tax: 360,
    total: 2360,
    paidAmount: 2360,
    status: 'Paid',
    paymentHistory: [
      { date: '2025-12-10', amount: 2360, method: 'UPI', transactionId: 'UPI987654321' }
    ]
  },
  {
    id: 'INV-2025-089',
    date: '2025-11-15',
    dueDate: '2025-11-30',
    description: 'Orthopedic Consultation',
    doctor: 'Dr. Robert Brown',
    items: [
      { name: 'X-Ray - Knee Joint', quantity: 1, rate: 800, amount: 800 },
      { name: 'Consultation Fee', quantity: 1, rate: 1000, amount: 1000 },
      { name: 'Physical Therapy', quantity: 1, rate: 1500, amount: 1500 }
    ],
    subtotal: 3300,
    tax: 594,
    total: 3894,
    paidAmount: 3894,
    status: 'Paid',
    paymentHistory: [
      { date: '2025-11-15', amount: 3894, method: 'Debit Card', transactionId: 'DC456789' }
    ]
  }
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Partial', label: 'Partially Paid' },
  { value: 'Unpaid', label: 'Unpaid' }
]

interface Invoice {
  id: string
  date: string
  dueDate: string
  description: string
  doctor: string
  items: Array<{ name: string; quantity: number; rate: number; amount: number }>
  subtotal: number
  tax: number
  total: number
  paidAmount: number
  status: string
  paymentHistory: Array<{ date: string; amount: number; method: string; transactionId: string }>
}

export default function PatientBilling() {
  const router = useRouter()
  const [filter, setFilter] = useState({ status: '', search: '' })
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = !filter.status || inv.status === filter.status
    const matchesSearch = !filter.search ||
      inv.id.toLowerCase().includes(filter.search.toLowerCase()) ||
      inv.description.toLowerCase().includes(filter.search.toLowerCase()) ||
      inv.doctor.toLowerCase().includes(filter.search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      'Paid': 'success',
      'Partial': 'warning',
      'Unpaid': 'danger'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getStatusIcon = (status: string) => {
    if (status === 'Paid') return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    if (status === 'Partial') return <ClockIcon className="w-5 h-5 text-amber-500" />
    return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
  }

  const handlePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setPaymentAmount((invoice.total - invoice.paidAmount).toString())
    setShowPaymentModal(true)
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
              <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
              <p className="text-gray-600 mt-1">Manage your invoices and payments</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            Download Statement
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Invoices</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{invoices.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                  <DocumentTextIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-red-50 via-red-100 to-rose-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Outstanding</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">QAR {totalOutstanding}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg">
                  <ExclamationCircleIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Paid</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">QAR {totalPaid}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Unpaid</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    {invoices.filter(i => i.status === 'Unpaid').length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <ClockIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by invoice ID, description, or doctor..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Select
                label="Status"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                options={statusOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <div className="space-y-6">
          {filteredInvoices.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No invoices found</p>
              </CardContent>
            </Card>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-200">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                        <DocumentTextIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{invoice.id}</h3>
                        <p className="text-sm text-gray-600">{invoice.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(invoice.status)}
                      {getStatusBadge(invoice.status)}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Invoice Date</p>
                      <p className="font-semibold text-gray-900">{invoice.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Due Date</p>
                      <p className="font-semibold text-gray-900">{invoice.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Doctor</p>
                      <p className="font-semibold text-gray-900">{invoice.doctor}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Invoice Items */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Invoice Items</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Qty</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Rate</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {invoice.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">QAR {item.rate}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">QAR {item.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="space-y-2 max-w-md ml-auto">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold text-gray-900">QAR {invoice.subtotal}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tax (18%)</span>
                        <span className="font-semibold text-gray-900">QAR {invoice.tax}</span>
                      </div>
                      <div className="flex items-center justify-between text-lg font-bold border-t-2 border-gray-300 pt-2">
                        <span className="text-gray-900">Total Amount</span>
                        <span className="text-indigo-900">QAR {invoice.total}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Paid Amount</span>
                        <span className="font-semibold text-green-600">QAR {invoice.paidAmount}</span>
                      </div>
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span className="text-gray-900">Balance Due</span>
                        <span className="text-red-600">QAR {invoice.total - invoice.paidAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment History */}
                  {invoice.paymentHistory.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Payment History
                      </h4>
                      <div className="space-y-2">
                        {invoice.paymentHistory.map((payment, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium text-gray-900">{payment.date}</p>
                              <p className="text-xs text-gray-600">{payment.method} • {payment.transactionId}</p>
                            </div>
                            <p className="font-bold text-green-600">QAR {payment.amount}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 flex space-x-3">
                    <Button variant="outline" className="flex-1">
                      <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                    {invoice.status !== 'Paid' && (
                      <Button 
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        onClick={() => handlePayment(invoice)}
                      >
                        <CreditCardIcon className="w-4 h-4 mr-2" />
                        Pay Now (QAR {invoice.total - invoice.paidAmount})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full border-0 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle className="flex items-center text-emerald-900">
                  <CreditCardIcon className="w-6 h-6 mr-2" />
                  Make Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Invoice ID</p>
                  <p className="font-bold text-gray-900">{selectedInvoice.id}</p>
                  <p className="text-sm text-gray-600 mt-2">Amount Due</p>
                  <p className="text-2xl font-bold text-red-600">QAR {selectedInvoice.total - selectedInvoice.paidAmount}</p>
                </div>

                <Input
                  label="Payment Amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />

                <Select
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  options={[
                    { value: 'credit_card', label: 'Credit Card' },
                    { value: 'debit_card', label: 'Debit Card' },
                    { value: 'upi', label: 'UPI' },
                    { value: 'net_banking', label: 'Net Banking' },
                    { value: 'cash', label: 'Cash' }
                  ]}
                />

                <div className="flex space-x-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    onClick={() => {
                      alert(`Payment of QAR ${paymentAmount} processed successfully!`)
                      setShowPaymentModal(false)
                    }}
                  >
                    Proceed to Pay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}



