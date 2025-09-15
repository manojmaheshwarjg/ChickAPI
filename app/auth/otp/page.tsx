'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PrismBackground from '@/components/ui/shadcn-io/prism-background/index'
import { ChickAPILogo } from '@/components/ui/logo'

export default function OTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    // Countdown timer for resend
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
  }, [resendTimer, canResend])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedCode.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit
        }
      })
      setOtp(newOtp)
      
      // Focus last filled input or last input
      const lastFilledIndex = Math.min(index + pastedCode.length - 1, 5)
      inputRefs.current[lastFilledIndex]?.focus()
      
      // Auto submit if all filled
      if (newOtp.every(digit => digit !== '')) {
        handleVerify(newOtp.join(''))
      }
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto submit when all fields are filled
    if (newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (code?: string) => {
    const verificationCode = code || otp.join('')
    if (verificationCode.length !== 6) return

    setIsLoading(true)
    
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false)
      setIsVerified(true)
      
      // Redirect after success animation
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }, 1500)
  }

  const handleResend = () => {
    setCanResend(false)
    setResendTimer(30)
    // Implement resend logic
    console.log('Resending OTP...')
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
              Verify your email
            </h1>
            <p className="text-sm text-muted-foreground">
              We've sent a 6-digit code to john.doe@example.com
            </p>
          </div>

      {!isVerified ? (
        <>
          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-medium"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Resend Timer/Button */}
          <div className="text-center mb-6">
            {canResend ? (
              <Button
                variant="ghost"
                onClick={handleResend}
                className="text-sm font-medium p-0 h-auto"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Resend code
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend code in {resendTimer}s
              </p>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerify()}
            disabled={isLoading || otp.some(digit => !digit)}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>
        </>
      ) : (
        /* Success State */
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Email Verified
          </h2>
          <p className="text-sm text-muted-foreground">
            Redirecting to dashboard...
          </p>
        </div>
      )}

      {/* Back Link */}
      {!isVerified && (
        <div className="mt-8 text-center">
          <Link 
            href="/auth/signup" 
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign up
          </Link>
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