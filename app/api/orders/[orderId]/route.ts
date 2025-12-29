import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseUser } from '@/lib/auth/supabase-auth'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'
import { validateString } from '@/lib/auth/validate-input'

/**
 * GET /api/orders/[orderId]
 * 
 * Fetch a single order by ID for the authenticated user.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
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

    // Fetch order and items in parallel with explicit columns
    const [orderResult, itemsResult] = await Promise.all([
      supabase
        .from('Order')
        .select('id, status, totalAmount, currency, addressLine1, addressLine2, city, state, postalCode, country, razorpayPaymentId, paidAt, createdAt')
        .eq('id', orderId)
        .eq('userId', user.id)
        .limit(1)
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
      console.error('[API Order Detail] Items error:', itemsError)
      return createErrorResponse('Failed to fetch order items', 500)
    }

    // Map response
    const mappedItems = (orderItems || []).map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice / 100,
      discountPercent: item.discountPercent,
      finalPrice: item.finalPrice / 100,
      sizeGrams: item.sizeGrams || null,
    }))

    return NextResponse.json({
      order: {
        id: order.id,
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
        items: mappedItems,
        paymentStatus: getPaymentStatus(order.status),
      },
    })
  } catch (error) {
    console.error('[API Order Detail] Error:', error)
    return createErrorResponse('Failed to fetch order', 500, error)
  }
}

function getPaymentStatus(status: string): string {
  switch (status) {
    case 'PAYMENT_SUCCESS':
    case 'ORDER_CONFIRMED':
    case 'SHIPPED':
    case 'DELIVERED':
      return 'paid'
    case 'PAYMENT_PENDING':
    case 'ORDER_CREATED':
      return 'pending'
    case 'PAYMENT_FAILED':
      return 'failed'
    case 'CANCELLED':
      return 'cancelled'
    case 'REFUNDED':
      return 'refunded'
    default:
      return 'unknown'
  }
}
