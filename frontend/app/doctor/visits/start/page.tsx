'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function StartVisitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('appointment_id')

  useEffect(() => {
    if (appointmentId) {
      router.push(`/doctor/visits/${appointmentId}`)
    } else {
      router.push('/doctor/visits')
    }
  }, [appointmentId, router])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}