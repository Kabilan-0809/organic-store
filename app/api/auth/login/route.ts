import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateEmail } from '@/lib/auth/validate-input'
import {
  checkRateLimit,
  getClientIdentifier,
  recordLoginFailure,
  clearLoginFailures,
} from '@/lib/auth/rate-limit'
import { createErrorResponse } from '@/lib/auth/api-auth'

export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    // SECURITY: Rate limit login attempts (5 per minute per IP)
    const clientId = getClientIdentifier(req)
    const rateLimit = checkRateLimit(`login:${clientId}`, 5, 60 * 1000)
    if (!rateLimit.allowed) {
      return createErrorResponse(
        'Too many login attempts. Please try again later.',
        429
      )
    }

    // SECURITY: Parse and validate request body
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    if (typeof body !== 'object' || body === null) {
      return createErrorResponse('Invalid request body', 400)
    }

    const { email: rawEmail, password: rawPassword } = body as Record<string, unknown>

    // SECURITY: Validate and sanitize inputs
    const email = validateEmail(rawEmail)
    const password = typeof rawPassword === 'string' ? rawPassword : null

    if (!email || !password || password.length === 0) {
      // SECURITY: Generic message prevents user enumeration
      return createErrorResponse('Invalid email or password', 401)
    }

    // Sign in with Supabase Auth ONLY
    // Do NOT query any database tables - Supabase Auth handles authentication
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('[Login] Supabase auth error:', authError)
      
      if (authError.message.includes('Invalid API key') || authError.message.includes('URL and Key')) {
        console.error('[Login] Configuration error - check environment variables')
        return createErrorResponse('Server configuration error', 500)
      }

      // Handle email confirmation errors (in dev mode, this may be disabled)
      if (authError.message.includes('email_not_confirmed') || authError.message.includes('Email not confirmed')) {
        // In development, allow login even if email not confirmed
        // In production, you may want to return a specific error
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Login] Email not confirmed, but allowing in dev mode')
          // Continue with login attempt - Supabase may still allow it if confirmation is disabled
        } else {
          return createErrorResponse('Please confirm your email before logging in', 401)
        }
      }
      
      recordLoginFailure(clientId)
      // SECURITY: Generic message prevents user enumeration
      return createErrorResponse('Invalid email or password', 401)
    }

    if (!authData.user) {
      recordLoginFailure(clientId)
      return createErrorResponse('Invalid email or password', 401)
    }

    // Get role from app_metadata (defaults to 'USER' if not set)
    // This is the ONLY source of truth for user roles
    const role = (authData.user.app_metadata?.role as string) || 'USER'

    // SECURITY: Clear login failures on successful login
    clearLoginFailures(clientId)

    const responseTime = Date.now() - startTime
    console.log(`[Login] User ${email} logged in successfully (${responseTime}ms) [Role: ${role}]`)

    // Return in format expected by frontend AuthContext
    // Use Supabase session tokens as accessToken/refreshToken for compatibility
    return NextResponse.json({
      success: true,
      accessToken: authData.session?.access_token || '',
      refreshToken: authData.session?.refresh_token || '',
      userId: authData.user.id,
      email: authData.user.email || email,
      role,
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
        role,
      },
    })
  } catch (error) {
    console.error('[Login] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Login failed'
    return createErrorResponse(errorMessage, 500, error)
  }
}
