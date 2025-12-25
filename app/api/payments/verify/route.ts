import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseUser } from '@/lib/auth/supabase-auth'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'
import { validateString } from '@/lib/auth/validate-input'
import { verifyRazorpaySignature, getRazorpayPayment } from '@/lib/payments/razorpay'

/**
 * POST /api/payments/verify
 * 
 * Verify payment after completion.
 * 
 * Supports both Supabase Auth (via cookies) and Bearer token (for compatibility)
 */
export async function POST(_req: NextRequest) {
  try {
    // Get authenticated user from Supabase Auth cookies
    const user = await getSupabaseUser()

    if (!user) {
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

    const {
      razorpay_order_id: rawRazorpayOrderId,
      razorpay_payment_id: rawRazorpayPaymentId,
      razorpay_signature: rawRazorpaySignature,
      orderId: rawOrderId,
    } = body as Record<string, unknown>

    const razorpayOrderId = validateString(rawRazorpayOrderId, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })
    const razorpayPaymentId = validateString(rawRazorpayPaymentId, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })
    const razorpaySignature = validateString(rawRazorpaySignature, {
      minLength: 1,
      maxLength: 200,
      required: true,
      trim: true,
    })
    const orderId = validateString(rawOrderId, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return createErrorResponse('Invalid payment data', 400)
    }

    // Fetch order
    const { data: orders, error: orderError } = await supabase
      .from('Order')
      .select('*')
      .eq('id', orderId)
      .eq('userId', user.id)
      .eq('razorpayOrderId', razorpayOrderId)
      .limit(1)

    if (orderError || !orders || orders.length === 0) {
      return createErrorResponse('Order not found', 404)
    }

    const order = orders[0]

    // Check order status (idempotency)
    if (order.status === 'ORDER_CONFIRMED' || order.status === 'PAYMENT_SUCCESS') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: order.status,
        message: 'Payment already verified',
      })
    }

    if (order.status !== 'PAYMENT_PENDING') {
      return createErrorResponse(
        `Order status is ${order.status}, expected PAYMENT_PENDING`,
        400
      )
    }

    // Verify Razorpay signature
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )

    if (!isValidSignature) {
      return createErrorResponse('Invalid payment signature', 400)
    }

    // Verify payment with Razorpay
    const razorpayPayment = await getRazorpayPayment(razorpayPaymentId)
    if (!razorpayPayment || razorpayPayment.status !== 'captured') {
      return createErrorResponse('Payment not captured', 400)
    }

    // Fetch order items for stock update
    const { data: orderItems, error: itemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .eq('orderId', orderId)

    if (itemsError || !orderItems) {
      return createErrorResponse('Failed to fetch order items', 500)
    }

    // Update order and reduce stock atomically
    // Note: Supabase doesn't support transactions like Prisma, so we'll do it sequentially
    // In production, consider using Supabase functions or stored procedures for atomicity

    // First, validate stock availability
    for (const orderItem of orderItems) {
      const { data: product } = await supabase
        .from('Product')
        .select('stock')
        .eq('id', orderItem.productId)
        .single()

      if (!product || product.stock < orderItem.quantity) {
        // Update order status to PAYMENT_FAILED
        await supabase
          .from('Order')
          .update({ status: 'PAYMENT_FAILED' })
          .eq('id', orderId)

        return createErrorResponse(
          `Insufficient stock for ${orderItem.productName}. Available: ${product?.stock || 0}, Required: ${orderItem.quantity}`,
          400
        )
      }
    }

    // Reduce stock for each item
    for (const orderItem of orderItems) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        product_id: orderItem.productId,
        quantity: orderItem.quantity,
      })

      // If RPC doesn't exist, use update with decrement
      if (stockError) {
        const { data: product } = await supabase
          .from('Product')
          .select('stock')
          .eq('id', orderItem.productId)
          .single()

        if (!product) {
          await supabase
            .from('Order')
            .update({ status: 'PAYMENT_FAILED' })
            .eq('id', orderId)
          return createErrorResponse('Product not found', 404)
        }

        const newStock = product.stock - orderItem.quantity
        if (newStock < 0) {
          await supabase
            .from('Order')
            .update({ status: 'PAYMENT_FAILED' })
            .eq('id', orderId)
          return createErrorResponse(
            `Insufficient stock for ${orderItem.productName}`,
            400
          )
        }

        await supabase
          .from('Product')
          .update({ stock: newStock })
          .eq('id', orderItem.productId)
      }
    }

    // Update order status to ORDER_CONFIRMED
    const { error: updateError } = await supabase
      .from('Order')
      .update({
        status: 'ORDER_CONFIRMED',
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[API Payments Verify] Failed to update order:', updateError)
      return createErrorResponse('Failed to confirm order', 500)
    }

    // Remove purchased items from cart
    const { data: userCart } = await supabase
      .from('Cart')
      .select('id')
      .eq('userId', user.id)
      .limit(1)

    if (userCart && userCart.length > 0) {
      const firstCart = userCart[0]
      if (firstCart) {
        const productIds = orderItems.map((item) => item.productId)
        await supabase
          .from('CartItem')
          .delete()
          .eq('cartId', firstCart.id)
          .in('productId', productIds)
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: 'ORDER_CONFIRMED',
      message: 'Payment verified successfully. Order confirmed.',
    })
  } catch (error) {
    console.error('[API Payments Verify] Error:', error)
    return createErrorResponse('Failed to verify payment', 500, error)
  }
}
