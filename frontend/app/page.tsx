'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthToken, getStoredUser } from '@/lib/api'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = getAuthToken()
    const user = getStoredUser()

    if (token && user) {
      // Redirect to appropriate dashboard based on user role
      const roleRoutes = {
        ADMIN: '/admin/dashboard',
        DOCTOR: '/doctor/dashboard',
        STAFF: '/staff/dashboard',
        PATIENT: '/patient/dashboard'
      }
      router.push(roleRoutes[user.role as keyof typeof roleRoutes] || '/staff/dashboard')
    } else {
      // Redirect to login if not authenticated
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}
