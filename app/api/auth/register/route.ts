import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateEmail, validateString } from '@/lib/auth/validate-input'
import {
  checkRateLimit,
  getClientIdentifier,
} from '@/lib/auth/rate-limit'
import { createErrorResponse } from '@/lib/auth/api-auth'

export async function POST(req: Request) {
  try {
    // SECURITY: Rate limit registration (3 per hour per IP)
    const clientId = getClientIdentifier(req)
    const rateLimit = checkRateLimit(`register:${clientId}`, 3, 60 * 60 * 1000)
    if (!rateLimit.allowed) {
      return createErrorResponse(
        'Too many registration attempts. Please try again later.',
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
    const password = validateString(rawPassword, {
      minLength: 8,
      maxLength: 128,
      required: true,
      trim: false,
    })

    if (!email || !password) {
      return createErrorResponse(
        'Email and password are required. Password must be at least 8 characters.',
        400
      )
    }

    const supabase = createClient()

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error('[Register] Supabase auth error:', authError)
      
      // Handle specific Supabase errors
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return createErrorResponse('User already exists', 409)
      }
      
      return createErrorResponse('Registration failed', 500)
    }

    if (!authData.user) {
      return createErrorResponse('Registration failed', 500)
    }

    // Create user profile in User table
    const { error: profileError } = await supabase
      .from('User')
      .insert({
        id: authData.user.id,
        email: authData.user.email || email,
        role: 'USER',
      })

    if (profileError) {
      console.error('[Register] Failed to create user profile:', profileError)
      // User was created in auth but not in User table
      // This is not ideal but we'll continue
    }

    // Return in format expected by frontend AuthContext
    // Use Supabase session tokens as accessToken/refreshToken for compatibility
    return NextResponse.json(
      {
        success: true,
        accessToken: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || '',
        userId: authData.user.id,
        email: authData.user.email || email,
        role: 'USER',
        user: {
          id: authData.user.id,
          email: authData.user.email || email,
          role: 'USER',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Register] Error:', error)
    return createErrorResponse('Registration failed', 500, error)
  }
}
