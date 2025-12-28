import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'
import { validateString } from '@/lib/auth/validate-input'
import { createRazorpayOrder } from '@/lib/payments/razorpay'

export const runtime = 'nodejs'

/**
 * POST /api/payments/create
 * 
 * Create a Razorpay order for payment (retry payment for existing orders).
 * 
 * This endpoint is used when a user wants to retry payment for an existing order
 * that is in PAYMENT_PENDING or PAYMENT_FAILED status.
 */
export async function POST(_req: NextRequest) {
  try {
    const supabase = createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedResponse()
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await _req.json()
    } catch {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    if (typeof body !== 'object' || body === null) {
      return createErrorResponse('Invalid request body', 400)
    }

    const { orderId: rawOrderId } = body as Record<string, unknown>

    const orderId = validateString(rawOrderId, {
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

    // Check if order can be paid
    if (order.status !== 'PAYMENT_PENDING' && order.status !== 'PAYMENT_FAILED') {
      return createErrorResponse(
        `Order status is ${order.status}. Only PAYMENT_PENDING or PAYMENT_FAILED orders can be paid.`,
        400
      )
    }

    // Update status to PAYMENT_PENDING if it was PAYMENT_FAILED
    if (order.status === 'PAYMENT_FAILED') {
      await supabase
        .from('Order')
        .update({ status: 'PAYMENT_PENDING' })
        .eq('id', orderId)
    }

    // Create Razorpay order
    try {
      const razorpayOrder = await createRazorpayOrder(
        order.totalAmount,
        order.currency,
        orderId
      )

      // Update order with Razorpay order ID
      await supabase
        .from('Order')
        .update({ razorpayOrderId: razorpayOrder.id })
        .eq('id', orderId)

      return NextResponse.json({
        success: true,
        razorpayOrderId: razorpayOrder.id,
        orderId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      })
    } catch (razorpayError) {
      console.error('[RAZORPAY] Failed to create Razorpay order:', razorpayError)
      return createErrorResponse(
        'Failed to initialize payment. Please try again later.',
        500
      )
    }
  } catch (error) {
    console.error('[API Payments Create] Error:', error)
    return createErrorResponse('Failed to create payment', 500, error)
  }
}
