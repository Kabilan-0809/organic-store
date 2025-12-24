import { createClient } from '@/lib/supabase/server'

/**
 * Get authenticated user from Supabase session
 * 
 * @param _req - Request object (optional, for compatibility)
 * @returns User info if authenticated, null otherwise
 */
export async function getSupabaseUser(_req?: Request): Promise<{
  id: string
  email: string
  role?: string
} | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Fetch user role from User table
    const { data: userProfile, error: profileError } = await supabase
      .from('User')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      // User exists in auth but not in User table - default to USER
      return {
        id: user.id,
        email: user.email || '',
        role: 'USER',
      }
    }

    return {
      id: user.id,
      email: user.email || '',
      role: userProfile.role || 'USER',
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

