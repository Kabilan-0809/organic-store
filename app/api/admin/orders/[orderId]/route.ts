import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  requireAdmin,
  createErrorResponse,
  forbiddenResponse,
} from '@/lib/auth/api-auth'

export const runtime = "nodejs"

/**
 * GET /api/admin/orders/[orderId]
 *
 * Fetch order details (admin only).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // 1️⃣ Ensure admin
    const admin = await requireAdmin()
    if (!admin) {
      return forbiddenResponse()
    }

    // 2️⃣ Validate UUID (Order.id is UUID)
    const orderId = params.orderId
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!orderId || !uuidRegex.test(orderId)) {
      return createErrorResponse('Invalid order ID', 400)
    }

    // 3️⃣ Fetch order and items in parallel with explicit columns
    const [orderResult, itemsResult] = await Promise.all([
      supabase
        .from('Order')
        .select('id, userId, status, totalAmount, currency, addressLine1, addressLine2, city, state, postalCode, country, razorpayPaymentId, paidAt, createdAt')
        .eq('id', orderId)
        .single(),
      supabase
        .from('OrderItem')
        .select('id, productId, productName, quantity, unitPrice, discountPercent, finalPrice, sizeGrams')
        .eq('orderId', orderId),
    ])

    const { data: order, error: orderError } = orderResult
    const { data: orderItems, error: itemsError } = itemsResult

    if (orderError || !order) {
      return createErrorResponse('Order not found', 404)
    }

    if (itemsError) {
      console.error('[API Admin Order Detail] Order items error:', itemsError)
      return createErrorResponse('Failed to fetch order items', 500)
    }

    // 5️⃣ Response (safe, normalized)
    return NextResponse.json({
      order: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: order.totalAmount / 100,
        currency: order.currency,
        addressLine1: order.addressLine1,
        addressLine2: order.addressLine2,
        city: order.city,
        state: order.state,
        postalCode: order.postalCode,
        country: order.country,
        razorpayPaymentId: order.razorpayPaymentId,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
        items: (orderItems || []).map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice / 100,
          discountPercent: item.discountPercent,
          finalPrice: item.finalPrice / 100,
          sizeGrams: item.sizeGrams || null,
        })),
      },
    })
  } catch (error) {
    console.error('[API Admin Order Detail] Error:', error)
    return createErrorResponse('Failed to fetch order', 500)
  }
}

/**
 * PATCH /api/admin/orders/[orderId]
 *
 * Update order status (admin only).
 * 
 * Valid status transitions:
 * - ORDER_CONFIRMED → SHIPPED
 * - SHIPPED → DELIVERED
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // 1️⃣ Ensure admin
    const admin = await requireAdmin()
    if (!admin) {
      return forbiddenResponse()
    }

    // 2️⃣ Validate UUID
    const orderId = params.orderId
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!orderId || !uuidRegex.test(orderId)) {
      return createErrorResponse('Invalid order ID', 400)
    }

    // 3️⃣ Parse request body
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    if (typeof body !== 'object' || body === null) {
      return createErrorResponse('Invalid request body', 400)
    }

    const { status: newStatus } = body as { status?: string }

    if (!newStatus || typeof newStatus !== 'string') {
      return createErrorResponse('Status is required', 400)
    }

    // 4️⃣ Fetch current order
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .select('status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return createErrorResponse('Order not found', 404)
    }

    const currentStatus = order.status

    // 5️⃣ Validate status transition
    const validTransitions: Record<string, string[]> = {
      'ORDER_CONFIRMED': ['SHIPPED'],
      'SHIPPED': ['DELIVERED'],
    }

    const allowedStatuses = validTransitions[currentStatus] || []

    if (!allowedStatuses.includes(newStatus)) {
      return createErrorResponse(
        `Invalid status transition. Cannot change from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedStatuses.join(', ') || 'none'}`,
        400
      )
    }

    // 6️⃣ Update order status
    const { error: updateError } = await supabase
      .from('Order')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (updateError) {
      console.error('[API Admin Order Update] Update error:', updateError)
      return createErrorResponse('Failed to update order status', 500)
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      orderId,
      status: newStatus,
    })
  } catch (error) {
    console.error('[API Admin Order Update] Error:', error)
    return createErrorResponse('Failed to update order status', 500, error)
  }
}
