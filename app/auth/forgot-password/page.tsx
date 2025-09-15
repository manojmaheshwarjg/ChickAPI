'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PrismBackground from '@/components/ui/shadcn-io/prism-background/index'
import { ChickAPILogo } from '@/components/ui/logo'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate sending reset email
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6">
              <ChickAPILogo size={28} />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {!isSubmitted ? 'Reset password' : 'Check your email'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {!isSubmitted 
                ? "Enter your email to reset your password"
                : `We've sent a password reset link to ${email}`
              }
            </p>
          </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>

          {/* Back to Sign In */}
          <div className="text-center mt-6">
            <Link 
              href="/auth/signin" 
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </form>
      ) : (
        /* Success State */
        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            Check your inbox for the password reset link.
          </p>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false)
                setEmail('')
              }}
              className="w-full"
            >
              Try another email
            </Button>
          </div>

          <div className="mt-8">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => handleSubmit(new Event('submit') as any)}
                className="text-foreground hover:underline font-medium"
              >
                resend it
              </button>
            </p>
          </div>
        </div>
      )}
        </div>
      </div>
      
      {/* Right side - Prism Background */}
      <div className="hidden lg:block flex-1 relative bg-black overflow-hidden">
        <PrismBackground />
      </div>
    </div>
  )
}