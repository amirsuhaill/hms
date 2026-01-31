'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlayIcon,
  BeakerIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  Square3Stack3DIcon,
  BanknotesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  userRole: 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT'
}

const staffNavigation = [
  { name: 'Dashboard', href: '/staff/dashboard', icon: HomeIcon },
  { name: 'Patients', href: '/staff/patients', icon: UserGroupIcon },
  { name: 'Appointments', href: '/staff/appointments', icon: CalendarDaysIcon },
  { name: 'Registration', href: '/staff/patients/register', icon: ClipboardDocumentListIcon },
]

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'User Management', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Departments & Staff', href: '/admin/departments', icon: BuildingOffice2Icon },
  { name: 'Operations', href: '/admin/operations', icon: ChartBarIcon },
  { name: 'IPD & Beds', href: '/admin/ipd-beds', icon: Square3Stack3DIcon },
  { name: 'Lab & Procedures', href: '/admin/lab-procedures', icon: BeakerIcon },
  { name: 'Finance', href: '/admin/finance', icon: BanknotesIcon },
  { name: 'Settings & Security', href: '/admin/settings', icon: ShieldCheckIcon },
]

const doctorNavigation = [
  { name: 'Dashboard', href: '/doctor/dashboard', icon: HomeIcon },
  { name: 'Visits', href: '/doctor/visits', icon: PlayIcon },
  { name: 'Treatment Plans', href: '/doctor/treatment-plans', icon: ClipboardDocumentListIcon },
  { name: 'Lab Orders', href: '/doctor/lab-orders', icon: BeakerIcon },
  { name: 'Appointments', href: '/doctor/appointments', icon: CalendarDaysIcon },
]

const patientNavigation = [
  { name: 'Dashboard', href: '/patient/dashboard', icon: HomeIcon },
  { name: 'Appointments', href: '/patient/appointments', icon: CalendarDaysIcon },
  { name: 'Medical Records', href: '/patient/medical-records', icon: DocumentTextIcon },
  { name: 'Lab Records', href: '/patient/lab-records', icon: BeakerIcon },
  { name: 'Billing', href: '/patient/billing', icon: CreditCardIcon },
]

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const getNavigation = () => {
    switch (userRole) {
      case 'ADMIN':
        return adminNavigation
      case 'DOCTOR':
        return doctorNavigation
      case 'PATIENT':
        return patientNavigation
      default:
        return staffNavigation
    }
  }

  const navigation = getNavigation()

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
            <HeartIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">HMS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-cyan-300'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-300 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  )
}