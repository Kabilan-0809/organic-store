import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAuth } from './api-auth'

/**
 * Get authenticated user from Supabase Auth
 * 
 * This function extracts user info from Bearer token and fetches role from auth.users.app_metadata
 * 
 * @param req - Request object (optional, for compatibility)
 * @returns User info if authenticated, null otherwise
 */
export async function getSupabaseUser(req?: Request): Promise<{
  id: string
  email: string
  role?: string
} | null> {
  try {
    // Get user from Bearer token
    const tokenUser = requireAuth(req || new Request('http://localhost'))
    if (!tokenUser) {
      return null
    }

    // Fetch user from Supabase Auth to get app_metadata.role
    // This is the source of truth for user roles
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(tokenUser.userId)

    if (error || !user) {
      // Fallback to role from token if available
      return {
        id: tokenUser.userId,
        email: tokenUser.email || '',
        role: tokenUser.role || 'USER',
      }
    }

    // Get role from app_metadata (this is the ONLY source of truth)
    const role = (user.app_metadata?.role as string) || tokenUser.role || 'USER'

    return {
      id: user.id,
      email: user.email || tokenUser.email || '',
      role,
    }
  } catch {
    return null
  }
}

/**
 * Require authentication middleware for API routes (Supabase)
 * 
 * @param _req - Request object (optional, for compatibility)
 * @returns User info if authenticated, null otherwise
 */
export async function requireSupabaseAuth(_req?: Request): Promise<{
  id: string
  email: string
  role?: string
} | null> {
  return getSupabaseUser(_req)
}

/**
 * Require admin role middleware for API routes (Supabase)
 * 
 * Checks app_metadata.role === 'ADMIN' from auth.users
 * 
 * @param _req - Request object (optional, for compatibility)
 * @returns User info if admin, null otherwise
 */
export async function requireSupabaseAdmin(_req?: Request): Promise<{
  id: string
  email: string
  role?: string
} | null> {
  const user = await getSupabaseUser(_req)
  if (!user || user.role !== 'ADMIN') {
    return null
  }
  return user
}
