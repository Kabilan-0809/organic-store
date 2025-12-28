import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'
import { validateString } from '@/lib/auth/validate-input'
import { verifyRazorpaySignature, getRazorpayPayment } from '@/lib/payments/razorpay'

export const runtime = 'nodejs'

/**
 * POST /api/payments/verify
 * 
 * Verify payment after completion.
 * 
 * Flow:
 * 1. Verify Razorpay signature (HMAC SHA256)
 * 2. Verify payment status with Razorpay API
 * 3. Validate stock availability
 * 4. Reduce stock (safely)
 * 5. Update order status: PAYMENT_PENDING → PAYMENT_SUCCESS → ORDER_CONFIRMED
 * 6. Clear cart items
 * 
 * SECURITY: Signature verification is mandatory. Never trust frontend alone.
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
    // Allow verification if status is PAYMENT_PENDING or PAYMENT_SUCCESS
    if (order.status === 'ORDER_CONFIRMED') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: order.status,
        message: 'Payment already verified and order confirmed',
      })
    }

    if (order.status !== 'PAYMENT_PENDING' && order.status !== 'PAYMENT_SUCCESS') {
      return createErrorResponse(
        `Order status is ${order.status}, expected PAYMENT_PENDING or PAYMENT_SUCCESS`,
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

    // Verify payment with Razorpay API
    const razorpayPayment = await getRazorpayPayment(razorpayPaymentId)
    if (!razorpayPayment) {
      console.error('[API Payments Verify] Razorpay payment not found:', razorpayPaymentId)
      // Mark order as failed
      await supabase
        .from('Order')
        .update({ status: 'PAYMENT_FAILED' })
        .eq('id', orderId)
      return createErrorResponse('Payment not found in Razorpay', 400)
    }

    if (razorpayPayment.status !== 'captured') {
      console.error('[API Payments Verify] Payment not captured. Status:', razorpayPayment.status)
      // Mark order as failed
      await supabase
        .from('Order')
        .update({ status: 'PAYMENT_FAILED' })
        .eq('id', orderId)
      return createErrorResponse(`Payment not captured. Status: ${razorpayPayment.status}`, 400)
    }

    // Verify payment amount matches order amount
    if (razorpayPayment.amount !== order.totalAmount) {
      console.error('[API Payments Verify] Amount mismatch:', {
        razorpayAmount: razorpayPayment.amount,
        orderAmount: order.totalAmount,
      })
      // Mark order as failed
      await supabase
        .from('Order')
        .update({ status: 'PAYMENT_FAILED' })
        .eq('id', orderId)
      return createErrorResponse('Payment amount mismatch', 400)
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

    // Step 1: Update order status to PAYMENT_SUCCESS first
    const { error: paymentSuccessError } = await supabase
      .from('Order')
      .update({
        status: 'PAYMENT_SUCCESS',
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (paymentSuccessError) {
      console.error('[API Payments Verify] Failed to update order to PAYMENT_SUCCESS:', paymentSuccessError)
      return createErrorResponse('Failed to update payment status', 500)
    }

    // Step 2: Reduce stock for each item (safely)
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
          // Revert order status to PAYMENT_FAILED
          await supabase
            .from('Order')
            .update({ status: 'PAYMENT_FAILED' })
            .eq('id', orderId)
          return createErrorResponse('Product not found', 404)
        }

        const newStock = product.stock - orderItem.quantity
        if (newStock < 0) {
          // Revert order status to PAYMENT_FAILED
          await supabase
            .from('Order')
            .update({ status: 'PAYMENT_FAILED' })
            .eq('id', orderId)
          return createErrorResponse(
            `Insufficient stock for ${orderItem.productName}. Available: ${product.stock}, Required: ${orderItem.quantity}`,
            400
          )
        }

        const { error: updateStockError } = await supabase
          .from('Product')
          .update({ stock: newStock })
          .eq('id', orderItem.productId)

        if (updateStockError) {
          console.error('[API Payments Verify] Failed to update stock:', updateStockError)
          // Revert order status to PAYMENT_FAILED
          await supabase
            .from('Order')
            .update({ status: 'PAYMENT_FAILED' })
            .eq('id', orderId)
          return createErrorResponse('Failed to update product stock', 500)
        }
      }
    }

    // Step 3: Update order status to ORDER_CONFIRMED (final step)
    const { error: updateError } = await supabase
      .from('Order')
      .update({
        status: 'ORDER_CONFIRMED',
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
