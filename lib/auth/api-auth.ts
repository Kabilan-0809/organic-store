import { NextResponse } from 'next/server'
import { requireSupabaseAuth, requireSupabaseAdmin } from './supabase-auth'

/**
 * Require authentication middleware for API routes
 * 
 * Uses Supabase Auth cookies as the ONLY source of truth.
 * No custom JWT tokens or Authorization headers required.
 * 
 * @returns User info if authenticated, null otherwise
 */
export async function requireUser(): Promise<{
  id: string
  email: string
  role?: string
} | null> {
  return requireSupabaseAuth()
}

/**
 * Require admin role middleware for API routes
 * 
 * SECURITY: Rejects non-admin users with 403 Forbidden.
 * Checks role from Supabase Auth app_metadata (source of truth).
 * Only users with app_metadata.role === 'ADMIN' are allowed.
 * 
 * @returns User info if admin, null otherwise
 */
export async function requireAdmin(): Promise<{
  id: string
  email: string
  role?: string
} | null> {
  const admin = await requireSupabaseAdmin()
  
  if (!admin) {
    return null
  }

  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  }
}

/**
 * Create standardized error response
 * 
 * SECURITY: Never leaks stack traces or internal errors to client.
 * Uses generic messages for auth failures to prevent user enumeration.
 */
export function createErrorResponse(
  message: string,
  status: number,
  logDetails?: unknown
): NextResponse {
  // Log detailed error server-side only
  if (logDetails) {
    console.error(`[API ERROR ${status}]`, message, logDetails)
  }

  // Return generic message to client
  return NextResponse.json({ message }, { status })
}

/**
 * Create unauthorized response
 * 
 * SECURITY: Generic message prevents user enumeration attacks.
 */
export function unauthorizedResponse(): NextResponse {
  return createErrorResponse('Unauthorized', 401)
}

/**
 * Create forbidden response (for admin-only routes)
 * 
 * SECURITY: Generic message prevents role enumeration attacks.
 */
export function forbiddenResponse(): NextResponse {
  return createErrorResponse('Forbidden', 403)
}
