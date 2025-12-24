import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseUser } from '@/lib/auth/supabase-auth'
import { requireAuth } from '@/lib/auth/api-auth'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'
import { validateString } from '@/lib/auth/validate-input'

/**
 * POST /api/orders/[orderId]/cancel
 * 
 * Cancel an order.
 * 
 * Supports both Supabase Auth (via cookies) and Bearer token (for compatibility)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Try Supabase Auth first (from cookies)
    let user = await getSupabaseUser(req)
    
    // Fallback to Bearer token for backward compatibility
    if (!user) {
      const tokenUser = requireAuth(req)
      if (tokenUser) {
        user = {
          id: tokenUser.userId,
          email: tokenUser.email || '',
          role: tokenUser.role || 'USER',
        }
      }
    }

    if (!user) {
      return unauthorizedResponse()
    }

    const orderId = validateString(params.orderId, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })

    if (!orderId) {
      return createErrorResponse('Invalid order ID', 400)
    }

    // Fetch order
    const { data: orders, error: orderError } = await supabase
      .from('Order')
      .select('*')
      .eq('id', orderId)
      .eq('userId', user.id)
      .limit(1)

    if (orderError || !orders || orders.length === 0) {
      return createErrorResponse('Order not found', 404)
    }

    const order = orders[0]

    // Only allow cancellation of pending/failed orders
    if (order.status !== 'PAYMENT_PENDING' && order.status !== 'PAYMENT_FAILED') {
      return createErrorResponse(
        `Order cannot be cancelled. Current status: ${order.status}`,
        400
      )
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('Order')
      .update({ status: 'CANCELLED' })
      .eq('id', orderId)

    if (updateError) {
      console.error('[API Order Cancel] Update error:', updateError)
      return createErrorResponse('Failed to cancel order', 500)
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
    })
  } catch (error) {
    console.error('[API Order Cancel] Error:', error)
    return createErrorResponse('Failed to cancel order', 500, error)
  }
}
