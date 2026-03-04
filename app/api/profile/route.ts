import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { supabase as supabaseAdmin } from '@/lib/supabase'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'

const ALLOWED_GENDERS = ['male', 'female', 'other', 'prefer_not_to_say']

export const runtime = 'nodejs'

/**
 * GET /api/profile
 * Returns the current user's email + gender from Supabase auth user_metadata.
 */
export async function GET() {
    try {
        const supabase = createSupabaseServer()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) return unauthorizedResponse()

        return NextResponse.json({
            success: true,
            profile: {
                id: user.id,
                email: user.email,
                gender: user.user_metadata?.gender ?? null,
            },
        })
    } catch (error) {
        return createErrorResponse('Failed to fetch profile', 500, error)
    }
}

/**
 * PATCH /api/profile
 * Updates gender in Supabase auth user_metadata via the Admin API.
 */
export async function PATCH(req: NextRequest) {
    try {
        const supabase = createSupabaseServer()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) return unauthorizedResponse()

        const body = await req.json()
        const { gender } = body as { gender: string }

        if (!gender || !ALLOWED_GENDERS.includes(gender)) {
            return createErrorResponse('Invalid gender value', 400)
        }

        // Store gender in user_metadata using the admin API
        const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
                ...user.user_metadata,
                gender,
            },
        })

        if (error) {
            console.error('[Profile PATCH] Failed to update user metadata:', error)
            return createErrorResponse('Failed to update profile', 500)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return createErrorResponse('Failed to update profile', 500, error)
    }
}
