import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, createErrorResponse, forbiddenResponse } from '@/lib/auth/api-auth'

/**
 * GET /api/admin/orders
 * 
 * Fetch all orders (admin only).
 */
export async function GET(_req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return forbiddenResponse()
    }

    const searchParams = _req.nextUrl.searchParams
    const status = searchParams.get('status')

    let query = supabase
      .from('Order')
      .select('id, userId, status, totalAmount, currency, createdAt')
      .order('createdAt', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('[API Admin Orders] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orders: (orders || []).map((order) => ({
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: order.totalAmount / 100,
        currency: order.currency,
        createdAt: order.createdAt,
      })),
    })
  } catch (error) {
    console.error('[API Admin Orders] Error:', error)
    return createErrorResponse('Failed to fetch orders', 500, error)
  }
}
