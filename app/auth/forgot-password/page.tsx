'use client'

import { useState, FormEvent, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AnimatedPage from '@/components/AnimatedPage'
import AuthLayout from '@/components/auth/AuthLayout'

/**
 * ForgotPasswordFormContent - Core form component
 */
function ForgotPasswordFormContent() {
  const router = useRouter()
  // Step 1: Email, Step 2: OTP + New Password
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [errors, setErrors] = useState<{
    email?: string
    otp?: string
    password?: string
    general?: string
  }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Please enter a valid email address'
    return undefined
  }

  const handleRequestOTP = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    const emailError = validateEmail(email)
    if (emailError) {
      setErrors({ email: emailError })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      // Move to next step
      setStep(2)
    } catch (error) {
      console.error('[Forgot Password] Error:', error)
      setErrors({ general: 'Failed to send OTP. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!otp.trim() || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' })
      return
    }

    if (newPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' })
      return
    }

    if (newPassword !== confirmPassword) {
      setErrors({ password: 'Passwords do not match' })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setIsSuccess(true)
      // Optional: redirect after a delay
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error) {
      console.error('[Reset Password] Error:', error)
      setErrors({ general: error instanceof Error ? error.message : 'Failed to reset password' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Password Reset Successful!
            </h1>
            <p className="mt-4 text-base text-neutral-600">
              Your password has been updated. You can now log in with your new password.
            </p>
            <div className="mt-8">
              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthLayout
      brandingTitle="Breathe. We've Got You."
      title={step === 1 ? "Forgot Password?" : "Reset Password"}
      subtitle={step === 1 ? "Don't worry, we'll help you get back to your favorites." : "Enter the code sent to your email and your new password."}
      imageSrc="/auth-bg-forgot.png"
    >
      <form onSubmit={step === 1 ? handleRequestOTP : handleResetPassword} className="mt-8 space-y-6" noValidate>
        {errors.general && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {errors.general}
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Email */
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Email address
            </label>
            <div className="mt-1.5">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>
        ) : (
          /* Step 2: OTP and Password */
          <div className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-neutral-700">
                Enter OTP Code
              </label>
              <div className="mt-1.5">
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-center text-lg tracking-[0.5em] text-neutral-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="000000"
                />
                {errors.otp && <p className="mt-1.5 text-sm text-red-600">{errors.otp}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700">
                New Password
              </label>
              <div className="mt-1.5">
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
                Confirm New Password
              </label>
              <div className="mt-1.5">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Re-enter password"
                />
                {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {isSubmitting ? 'Processing...' : step === 1 ? 'Send OTP Code' : 'Reset Password'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-600">
        <button
          onClick={() => step === 2 ? setStep(1) : router.push('/auth/login')}
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          {step === 2 ? 'Change Email' : 'Back to Sign In'}
        </button>
      </div>
    </AuthLayout>
  )
}

/**
 * Minimal fallback for forgot password form during Suspense
 */
function ForgotPasswordFormFallback() {
  return (
    <AuthLayout
      brandingTitle="Breathe. We've Got You."
      title="Forgot Password?"
      subtitle="Don't worry, we'll help you get back to your favorites."
      imageSrc="/auth-bg-forgot.png"
    >
      <div className="mt-8">
        <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-200" />
      </div>
    </AuthLayout>
  )
}

export default function ForgotPasswordPage() {
  return (
    <AnimatedPage>
      <Suspense fallback={<ForgotPasswordFormFallback />}>
        <ForgotPasswordFormContent />
      </Suspense>
    </AnimatedPage>
  )
}

