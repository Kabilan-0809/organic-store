import { createSupabaseServer } from '@/lib/supabase/server'

export async function getSupabaseUser(): Promise<{
  id: string
  email: string
  role?: string
} | null> {
  try {
    const supabase = createSupabaseServer()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    const role = user.app_metadata?.role as string | undefined

    return {
      id: user.id,
      email: user.email ?? '',
      role,
    }
  } catch {
    return null
  }
}

export async function requireSupabaseAuth() {
  return getSupabaseUser()
}

export async function requireSupabaseAdmin() {
  const user = await getSupabaseUser()
  if (!user || user.role !== 'ADMIN') {
    return null
  }
  return user
}
