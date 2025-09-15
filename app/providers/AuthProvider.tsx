'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  verifyOTP: (otp: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  demoLogin: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

const PUBLIC_ROUTES = ['/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/otp']

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Redirect based on auth state
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
      
      if (!user && !isPublicRoute && pathname !== '/') {
        // Not authenticated and trying to access protected route
        router.push('/auth/signin')
      } else if (user && isPublicRoute) {
        // Authenticated but on auth page
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, pathname, router])

  const checkAuth = async () => {
    try {
      // Check for stored session
      const storedUser = localStorage.getItem('chickapi_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: email,
        avatar: undefined
      }
      
      setUser(mockUser)
      localStorage.setItem('chickapi_user', JSON.stringify(mockUser))
      router.push('/dashboard')
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful registration - redirect to OTP
      localStorage.setItem('chickapi_pending_user', JSON.stringify({ name, email }))
      router.push('/auth/otp')
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async (otp: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get pending user data
      const pendingUser = localStorage.getItem('chickapi_pending_user')
      if (pendingUser) {
        const userData = JSON.parse(pendingUser)
        const mockUser: User = {
          id: '1',
          name: userData.name,
          email: userData.email,
          avatar: undefined
        }
        
        setUser(mockUser)
        localStorage.setItem('chickapi_user', JSON.stringify(mockUser))
        localStorage.removeItem('chickapi_pending_user')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUser(null)
      localStorage.removeItem('chickapi_user')
      router.push('/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock sending reset email
      console.log('Password reset email sent to:', email)
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const demoLogin = async () => {
    setIsLoading(true)
    try {
      // Create demo user
      const demoUser: User = {
        id: 'demo',
        name: 'Demo User',
        email: 'demo@chickapi.com',
        avatar: undefined
      }
      
      setUser(demoUser)
      localStorage.setItem('chickapi_user', JSON.stringify(demoUser))
      router.push('/dashboard')
    } catch (error) {
      console.error('Demo login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    verifyOTP,
    resetPassword,
    demoLogin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}