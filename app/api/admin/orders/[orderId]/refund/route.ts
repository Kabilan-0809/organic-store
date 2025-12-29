import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createErrorResponse, forbiddenResponse, requireAdmin } from '@/lib/auth/api-auth'
import { validateString } from '@/lib/auth/validate-input'
import { createRazorpayRefund } from '@/lib/payments/razorpay'

export const runtime = 'nodejs'

/**
 * POST /api/admin/orders/[orderId]/refund
 * 
 * Process refund for an order (admin only).
 * 
 * Flow:
 * 1. Authenticate admin
 * 2. Validate order exists and is refundable
 * 3. Check payment exists
 * 4. Create Razorpay refund
 * 5. Restore product stock (ONLY if stockRestored = false)
 * 6. Update order status to REFUNDED, save refund info, set stockRestored = true
 * 
 * Idempotency: If stockRestored = true, skip stock restoration but still update refund info
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return forbiddenResponse()
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

    // Parse request body for refund reason
    let body: unknown
    try {
      body = await req.json()
    } catch {
      // Body is optional
      body = {}
    }

    const refundReason = typeof body === 'object' && body !== null && 'reason' in body
      ? (typeof body.reason === 'string' ? body.reason : undefined)
      : undefined

    // Step 1: Fetch order
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return createErrorResponse('Order not found', 404)
    }

    // Step 2: Validate order is refundable
    const refundableStatuses = ['ORDER_CONFIRMED', 'SHIPPED', 'DELIVERED']
    if (!refundableStatuses.includes(order.status)) {
      return createErrorResponse(
        `Order cannot be refunded. Current status: ${order.status}. Only orders with status ORDER_CONFIRMED, SHIPPED, or DELIVERED can be refunded.`,
        400
      )
    }

    // Step 3: Check if payment exists
    if (!order.razorpayPaymentId) {
      return createErrorResponse(
        'Order does not have a payment ID. Cannot process refund.',
        400
      )
    }

    // Step 4: Create Razorpay refund (always, even if stock already restored)
    let razorpayRefund: { id: string; amount: number; status: string; payment_id: string }
    try {
      const refundAmount = order.totalAmount // Already in paise
      razorpayRefund = await createRazorpayRefund(
        order.razorpayPaymentId,
        refundAmount, // Full refund
        {
          order_id: order.id,
          reason: refundReason || 'Admin initiated refund',
        }
      )
    } catch (razorpayError) {
      console.error('[API Refund] Razorpay refund failed:', razorpayError)
      const errorMessage = razorpayError instanceof Error ? razorpayError.message : String(razorpayError)
      return createErrorResponse(
        `Failed to process Razorpay refund: ${errorMessage}`,
        500
      )
    }

    // Step 5: Restore stock ONLY if stockRestored = false
    const needsStockRestore = !order.stockRestored
    let stockRestoreSuccess = true

    if (needsStockRestore) {
      // Fetch order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('OrderItem')
        .select('*')
        .eq('orderId', orderId)

      if (itemsError) {
        console.error('[API Refund] Failed to fetch order items:', itemsError)
        return createErrorResponse('Failed to fetch order items', 500)
      }

      if (!orderItems || orderItems.length === 0) {
        return createErrorResponse('Order has no items', 400)
      }

      // Restore stock for each item
      for (const orderItem of orderItems) {
        try {
          if (orderItem.variantId) {
            // Variant item: restore ProductVariant.stock
            const { data: variant, error: fetchVariantError } = await supabase
              .from('ProductVariant')
              .select('stock')
              .eq('id', orderItem.variantId)
              .single()

            if (fetchVariantError || !variant) {
              console.error('[API Refund] Variant not found:', orderItem.variantId)
              stockRestoreSuccess = false
              break
            }

            const newStock = variant.stock + orderItem.quantity
            const { error: updateStockError } = await supabase
              .from('ProductVariant')
              .update({ stock: newStock })
              .eq('id', orderItem.variantId)

            if (updateStockError) {
              console.error('[API Refund] Failed to restore variant stock:', updateStockError)
              stockRestoreSuccess = false
              break
            }
          } else {
            // Non-variant item: restore Product.stock
            const { data: product, error: fetchProductError } = await supabase
              .from('Product')
              .select('stock')
              .eq('id', orderItem.productId)
              .single()

            if (fetchProductError || !product) {
              console.error('[API Refund] Product not found:', orderItem.productId)
              stockRestoreSuccess = false
              break
            }

            const newStock = product.stock + orderItem.quantity
            const { error: updateStockError } = await supabase
              .from('Product')
              .update({ stock: newStock })
              .eq('id', orderItem.productId)

            if (updateStockError) {
              console.error('[API Refund] Failed to restore product stock:', updateStockError)
              stockRestoreSuccess = false
              break
            }
          }
        } catch (itemError) {
          console.error('[API Refund] Error restoring stock for item:', itemError)
          stockRestoreSuccess = false
          break
        }
      }

      // If stock restoration failed, don't mark stockRestored = true
      if (!stockRestoreSuccess) {
        return createErrorResponse(
          'Refund processed but stock restoration failed. Please restore stock manually and contact support.',
          500
        )
      }
    }

    // Step 6: Update order status and refund information
    const updateData: Record<string, unknown> = {
      status: 'REFUNDED',
      razorpayRefundId: razorpayRefund.id,
      refundedAt: new Date().toISOString(),
    }

    // Only set stockRestored = true if we just restored stock
    if (needsStockRestore && stockRestoreSuccess) {
      updateData.stockRestored = true
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('Order')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError || !updatedOrder) {
      console.error('[API Refund] Failed to update order:', updateError)
      // Refund was processed and stock was restored, but order update failed
      // This is a critical error - refund and stock restore succeeded but we can't mark it
      return createErrorResponse(
        'Refund and stock restoration completed but failed to update order status. Please contact support.',
        500
      )
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: razorpayRefund.id,
        amount: razorpayRefund.amount,
        status: razorpayRefund.status,
        payment_id: razorpayRefund.payment_id,
      },
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        stockRestored: updatedOrder.stockRestored,
      },
      message: 'Refund processed successfully',
    })
  } catch (error) {
    console.error('[API Refund] Error:', error)
    return createErrorResponse('Failed to process refund', 500, error)
  }
}
