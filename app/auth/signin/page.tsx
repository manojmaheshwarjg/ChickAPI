'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PrismBackground from '@/components/ui/shadcn-io/prism-background/index'
import { ChickAPILogo } from '@/components/ui/logo'
import { useAuth } from '@/app/providers/AuthProvider'


export default function SignInPage() {
  const router = useRouter()
  const { demoLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false)
      router.push('/dashboard')
    }, 1500)
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`)
    // For demo purposes, redirect to dashboard
    // In production, integrate with actual OAuth providers
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md bg-white border border-gray-300 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-lg">
                API
              </div>
            </div>
            <h1 className="text-3xl font-light text-gray-900 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600 font-medium">
              Sign in to your account to continue
            </p>
          </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="border-gray-300"
            required
          />
        </div>

        {/* Password Field */}
        <div className="grid w-full items-center gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <Link href="/auth/forgot-password" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="border-gray-300 pr-12"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 border border-gray-300"
          />
          <Label htmlFor="remember" className="text-sm text-gray-600 font-medium">
            Remember me
          </Label>
        </div>

        {/* Sign In Button */}
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full mt-6 px-4 py-3 bg-black text-white font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 inline-block" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

        {/* Social Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Google
            </button>
            <button
              onClick={() => handleSocialLogin('github')}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              GitHub
            </button>
          </div>
        </div>

        {/* Try Demo Button */}
        <div className="mt-4">
          <button 
            onClick={() => demoLogin()}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Try the Demo
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 font-medium">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-gray-900 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
        </div>
      </div>
      
      {/* Right side - Enterprise Background */}
      <div className="hidden lg:block flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-700 mx-auto mb-8 flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-300">API</span>
          </div>
          <h2 className="text-3xl font-light text-gray-100 mb-4 tracking-tight">Enterprise API Platform</h2>
          <p className="text-gray-400 font-medium max-w-md">
            Professional API management and workflow automation for enterprise teams
          </p>
        </div>
      </div>
    </div>
  )
}
