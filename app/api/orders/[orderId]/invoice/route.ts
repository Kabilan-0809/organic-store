import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'
import { validateString } from '@/lib/auth/validate-input'
import { generateInvoicePDF } from '@/lib/invoice/generate-invoice'

export const runtime = 'nodejs'

/**
 * GET /api/orders/[orderId]/invoice
 * 
 * Generate invoice PDF for an order.
 * 
 * Uses Supabase Auth cookies for authentication.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
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

    const confirmedStatuses = ['ORDER_CONFIRMED', 'SHIPPED', 'DELIVERED', 'REFUNDED']
    if (!confirmedStatuses.includes(order.status)) {
      return createErrorResponse(
        `Invoice can only be generated for confirmed orders. Current status: ${order.status}`,
        400
      )
    }

    // Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .eq('orderId', orderId)

    if (itemsError) {
      return createErrorResponse('Failed to fetch order items', 500)
    }

    // Use authenticated user's email (from Supabase Auth)
    // No need to query User table - we have the user from auth
    const userData = {
      id: user.id,
      email: user.email || 'N/A',
      role: user.app_metadata?.role || 'USER',
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF({
      order: {
        ...order,
        items: orderItems || [],
        user: userData,
      },
      isAdmin: false,
    })

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.id.substring(0, 8)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('[User Invoice Generation]', error)
    return createErrorResponse('Failed to generate invoice', 500, error)
  }
}
