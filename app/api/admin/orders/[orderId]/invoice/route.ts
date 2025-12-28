import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createErrorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/api-auth'
import { validateString } from '@/lib/auth/validate-input'
import { generateInvoicePDF } from '@/lib/invoice/generate-invoice'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Check if user is admin
    const supabase = createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedResponse()
    }

    const role = user.app_metadata?.role as string | undefined
    if (role !== 'ADMIN') {
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

    // Fetch order using admin client (bypasses RLS)
    const { data: orders, error: orderError } = await supabaseAdmin
      .from('Order')
      .select('*')
      .eq('id', orderId)
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

    // Fetch order items using admin client
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('OrderItem')
      .select('*')
      .eq('orderId', orderId)

    if (itemsError) {
      return createErrorResponse('Failed to fetch order items', 500)
    }

    // Fetch user from Supabase Auth (using admin client)
    const { data: authUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.userId)

    if (userError || !authUser?.user) {
      return createErrorResponse('User not found', 404)
    }

    // Create user data object for invoice
    const userData = {
      id: authUser.user.id,
      email: authUser.user.email || 'N/A',
      role: authUser.user.app_metadata?.role || 'USER',
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF({
      order: {
        ...order,
        items: orderItems || [],
        user: userData,
      },
      isAdmin: true,
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
    console.error('[Admin Invoice Generation]', error)
    return createErrorResponse('Failed to generate invoice', 500, error)
  }
}
