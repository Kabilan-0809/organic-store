'use client'

import { useState, FormEvent, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import AnimatedPage from '@/components/AnimatedPage'
import AuthLayout from '@/components/auth/AuthLayout'

/**
 * ResetPasswordFormContent - Core form component
 */
function ResetPasswordFormContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{
    password?: string
    confirmPassword?: string
    general?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase handles the reset token via URL hash fragments (not query params)
    // The token is automatically processed by Supabase when the page loads
    // We need to check if there's a valid session or hash in the URL
    const checkAuthState = async () => {
      // Check for hash in URL (Supabase uses hash fragments for auth tokens)
      const hash = window.location.hash

      // If there's a hash, Supabase will process it automatically
      // If no hash and no session, redirect to forgot password
      if (!hash) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/auth/forgot-password')
        }
      }
    }
    checkAuthState()
  }, [router])

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return 'Password is required'
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters'
    }
    return undefined
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})

    const passwordError = validatePassword(password)
    let confirmPasswordError: string | undefined

    if (!confirmPassword) {
      confirmPasswordError = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      confirmPasswordError = 'Passwords do not match'
    }

    if (passwordError || confirmPasswordError) {
      setErrors({
        password: passwordError,
        confirmPassword: confirmPasswordError,
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Check if we have a valid session first (Supabase creates session when user clicks reset link)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setErrors({
          general: 'Invalid or expired reset link. Please request a new password reset link.',
        })
        setIsSubmitting(false)
        return
      }

      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setErrors({
          general: error.message || 'Failed to reset password. Please try again or request a new reset link.',
        })
        setIsSubmitting(false)
        return
      }

      setIsSuccess(true)

      // Sign out after password reset (security best practice)
      await supabase.auth.signOut()

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error) {
      console.error('[Reset Password] Unexpected error:', error)
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      })
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Password Reset Successful
            </h1>
            <p className="mt-4 text-base text-neutral-600">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md hover:shadow-primary-600/30 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
      brandingTitle="Fresh Start, New Password"
      title="Reset Password"
      subtitle="Choose a strong password to keep your health journey secure."
      imageSrc="/auth-bg-reset.png"
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
        {errors.general && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {errors.general}
          </div>
        )}

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-neutral-700"
          >
            New Password
          </label>
          <div className="mt-1.5">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }))
                }
              }}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:text-base"
              placeholder="Enter your new password"
            />
            {errors.password && (
              <p
                id="password-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {errors.password}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-neutral-700"
          >
            Confirm New Password
          </label>
          <div className="mt-1.5">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                }
              }}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:text-base"
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && (
              <p
                id="confirm-password-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md hover:shadow-primary-600/30 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </div>
      </form>

      <div className="text-center text-sm text-neutral-600 mt-6">
        <Link
          href="/auth/login"
          className="font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
        >
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  )
}

/**
 * Minimal fallback for reset password form during Suspense
 */
function ResetPasswordFormFallback() {
  return (
    <AuthLayout
      brandingTitle="Fresh Start, New Password"
      title="Reset Password"
      subtitle="Choose a strong password to keep your health journey secure."
      imageSrc="/auth-bg-reset.png"
    >
      <div className="mt-8 space-y-4">
        <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-200" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-200" />
      </div>
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <AnimatedPage>
      <Suspense fallback={<ResetPasswordFormFallback />}>
        <ResetPasswordFormContent />
      </Suspense>
    </AnimatedPage>
  )
}

