import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseUser } from '@/lib/auth/supabase-auth'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'
import { validateString } from '@/lib/auth/validate-input'

/**
 * POST /api/orders/[orderId]/mark-failed
 * 
 * Mark order as payment failed.
 * 
 * Supports both Supabase Auth (via cookies) and Bearer token (for compatibility)
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Get authenticated user from Supabase Auth cookies
    const user = await getSupabaseUser()

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

    // Idempotency check
    if (order.status === 'PAYMENT_FAILED' || order.status === 'ORDER_CONFIRMED') {
      return NextResponse.json({
        success: true,
        message: 'Order status already set',
      })
    }

    // Only allow marking PAYMENT_PENDING orders as failed
    if (order.status !== 'PAYMENT_PENDING') {
      return createErrorResponse(
        `Order status is ${order.status}, expected PAYMENT_PENDING`,
        400
      )
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('Order')
      .update({ status: 'PAYMENT_FAILED' })
      .eq('id', orderId)

    if (updateError) {
      console.error('[API Order Mark Failed] Update error:', updateError)
      return createErrorResponse('Failed to update order status', 500)
    }

    return NextResponse.json({
      success: true,
      message: 'Order marked as payment failed',
    })
  } catch (error) {
    console.error('[API Order Mark Failed] Error:', error)
    return createErrorResponse('Failed to update order status', 500, error)
  }
}
