'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { getStoredUser, getAuthToken } from '@/lib/api'

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT'
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = getAuthToken()
    const userData = getStoredUser()

    if (!token || !userData) {
      router.push('/login')
      return
    }

    if (requiredRole && userData.role !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      const roleRoutes = {
        ADMIN: '/admin/dashboard',
        DOCTOR: '/doctor/dashboard',
        STAFF: '/staff/dashboard',
        PATIENT: '/patient/dashboard'
      }
      router.push(roleRoutes[userData.role] || '/login')
      return
    }

    setUser(userData)
  }, [router, requiredRole])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <Sidebar userRole={user.role} />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 bg-white">
              <Sidebar userRole={user.role} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}