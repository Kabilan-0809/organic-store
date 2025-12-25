import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  requireAdmin,
  createErrorResponse,
  forbiddenResponse,
} from '@/lib/auth/api-auth'

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

    // 3️⃣ Fetch order (NO invalid joins)
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return createErrorResponse('Order not found', 404)
    }

    // 4️⃣ Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .eq('orderId', orderId)

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
        })),
      },
    })
  } catch (error) {
    console.error('[API Admin Order Detail] Error:', error)
    return createErrorResponse('Failed to fetch order', 500)
  }
}
