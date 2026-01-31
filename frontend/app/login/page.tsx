'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authApi, setAuthToken, setStoredUser, getAuthToken } from '@/lib/api'
import { HeartIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface LoginFormData {
  email: string
  password: string
}

const initialFormData: LoginFormData = {
  email: '',
  password: ''
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken()
    if (token) {
      // Redirect to appropriate dashboard based on stored user role
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const roleRoutes = {
        ADMIN: '/admin/dashboard',
        DOCTOR: '/doctor/dashboard',
        STAFF: '/staff/dashboard',
        PATIENT: '/patient/dashboard'
      }
      router.push(roleRoutes[user.role as keyof typeof roleRoutes] || '/staff/dashboard')
    }
  }, [router])

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setLoading(true)
      const response = await authApi.login(formData.email, formData.password)

      if (response.success && response.data) {
        // Store token and user data
        setAuthToken(response.data.token)
        setStoredUser(response.data.user)

        toast.success('Login successful!')

        // Redirect based on user role
        const roleRoutes = {
          ADMIN: '/admin/dashboard',
          DOCTOR: '/doctor/dashboard',
          STAFF: '/staff/dashboard',
          PATIENT: '/patient/dashboard'
        }

        const redirectPath = roleRoutes[response.data.user.role] || '/staff/dashboard'
        router.push(redirectPath)
      } else {
        toast.error(response.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <HeartIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Management System</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                placeholder="Enter your email"
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={errors.password}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm text-center text-gray-600">Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">Staff Portal</p>
                <p className="text-blue-700">Email: staff@hms.com</p>
                <p className="text-blue-700">Password: staff123</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900">Admin Portal</p>
                <p className="text-green-700">Email: admin@hms.com</p>
                <p className="text-green-700">Password: admin123</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-900">Doctor Portal</p>
                <p className="text-purple-700">Email: doctor@hms.com</p>
                <p className="text-purple-700">Password: doctor123</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="font-medium text-pink-900">Patient Portal</p>
                <p className="text-pink-700">Email: patient@hms.com</p>
                <p className="text-pink-700">Password: patient123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; 2024 Hospital Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}