/**
 * Authentication utilities
 * 
 * This module provides Supabase Auth integration.
 * 
 * NOTE: Legacy JWT token functions have been removed.
 * All authentication now uses Supabase Auth cookies.
 * 
 * @example
 * ```ts
 * import { getSupabaseUser, requireSupabaseAdmin } from '@/lib/auth/supabase-auth'
 * 
 * const user = await getSupabaseUser()
 * if (!user) {
 *   // User not authenticated
 * }
 * ```
 */

// Re-export Supabase Auth helpers
export { getSupabaseUser, requireSupabaseAuth, requireSupabaseAdmin } from './supabase-auth'

// Re-export API auth helpers
export { requireUser, requireAdmin, createErrorResponse, unauthorizedResponse, forbiddenResponse } from './api-auth'

// Re-export password utilities (still used for legacy compatibility if needed)
export { hashPassword, verifyPassword } from './password'

// NOTE: JWT token functions (createAccessToken, verifyAccessToken) have been removed.
// Use Supabase Auth instead.
