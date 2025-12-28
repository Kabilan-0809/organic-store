import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'
import { validateArray, validateString, validateCartItemId } from '@/lib/auth/validate-input'
import { createRazorpayOrder } from '@/lib/payments/razorpay'
import { calculateDiscountedPrice } from '@/lib/pricing'

export const runtime = 'nodejs'

/**
 * POST /api/payments/create-order
 * 
 * Create a Razorpay order from cart items.
 * This endpoint:
 * 1. Validates cart items
 * 2. Calculates final payable amount (applies discounts)
 * 3. Creates internal Order record with PAYMENT_PENDING status
 * 4. Creates Razorpay Order
 * 5. Stores razorpayOrderId in Order
 * 6. Returns Razorpay order details for frontend
 * 
 * SECURITY: Only authenticated users can create orders.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedResponse()
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    if (typeof body !== 'object' || body === null) {
      return createErrorResponse('Invalid request body', 400)
    }

    const {
      selectedCartItemIds: rawSelectedCartItemIds,
      addressLine1: rawAddressLine1,
      addressLine2: rawAddressLine2,
      city: rawCity,
      state: rawState,
      postalCode: rawPostalCode,
      country: rawCountry,
    } = body as Record<string, unknown>

    // Validate selectedCartItemIds
    const selectedCartItemIds = validateArray(rawSelectedCartItemIds, {
      maxLength: 50,
      required: true,
    })

    if (!selectedCartItemIds || selectedCartItemIds.length === 0) {
      return createErrorResponse('No items selected for checkout', 400)
    }

    // Validate each cart item ID
    for (const rawId of selectedCartItemIds) {
      const cartItemId = validateCartItemId(rawId)
      if (!cartItemId) {
        return createErrorResponse('Invalid cart item ID', 400)
      }
    }

    // Validate address
    const addressLine1 = validateString(rawAddressLine1, {
      minLength: 1,
      maxLength: 200,
      required: true,
      trim: true,
    })
    const city = validateString(rawCity, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })
    const state = validateString(rawState, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })
    const postalCode = validateString(rawPostalCode, {
      minLength: 1,
      maxLength: 20,
      required: true,
      trim: true,
    })
    const country = validateString(rawCountry, {
      minLength: 1,
      maxLength: 100,
      required: false,
      trim: true,
    }) || 'IN'
    const addressLine2 = rawAddressLine2
      ? validateString(rawAddressLine2, {
          minLength: 1,
          maxLength: 200,
          required: false,
          trim: true,
        })
      : null

    if (!addressLine1 || !city || !state || !postalCode) {
      return createErrorResponse('Invalid address', 400)
    }

    // Find user's cart
    const { data: carts, error: cartError } = await supabase
      .from('Cart')
      .select('id')
      .eq('userId', user.id)
      .limit(1)

    if (cartError || !carts || carts.length === 0) {
      return createErrorResponse('Cart not found', 404)
    }

    const firstCart = carts[0]
    if (!firstCart) {
      return createErrorResponse('Cart not found', 404)
    }
    const cartId = firstCart.id

    // Fetch selected cart items
    const { data: cartItems, error: itemsError } = await supabase
      .from('CartItem')
      .select('*')
      .eq('cartId', cartId)
      .in('id', selectedCartItemIds)

    if (itemsError || !cartItems || cartItems.length === 0) {
      return createErrorResponse('Selected cart items not found', 404)
    }

    // Fetch products for selected items
    const productIds = cartItems.map((item) => item.productId)
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('*')
      .in('id', productIds)

    if (productsError || !products) {
      return createErrorResponse('Failed to fetch products', 500)
    }

    // Validate stock and calculate totals
    let totalAmount = 0
    const orderItemsData: Array<{
      productId: string
      productName: string
      unitPrice: number
      discountPercent: number | null
      finalPrice: number
      quantity: number
    }> = []

    for (const cartItem of cartItems) {
      const product = products.find((p) => p.id === cartItem.productId)
      if (!product) {
        return createErrorResponse(`Product not found: ${cartItem.productId}`, 404)
      }

      if (!product.isActive) {
        return createErrorResponse(`Product ${product.name} is no longer available`, 400)
      }

      if (product.stock < cartItem.quantity) {
        return createErrorResponse(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`,
          400
        )
      }

      // Use the same calculation logic as cart
      // product.price is already in paise from database
      // Apply discount using the same logic as cart
      const unitPriceInPaise = product.price
      const discountedPriceInPaise = calculateDiscountedPrice(
        unitPriceInPaise,
        product.discountPercent
      )
      // Calculate final price for the quantity (in paise)
      const finalPriceInPaise = discountedPriceInPaise * cartItem.quantity

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        unitPrice: unitPriceInPaise,
        discountPercent: product.discountPercent,
        finalPrice: finalPriceInPaise,
        quantity: cartItem.quantity,
      })

      totalAmount += finalPriceInPaise
    }

    if (totalAmount <= 0) {
      return createErrorResponse('Invalid order amount', 400)
    }

    // Create order with PAYMENT_PENDING status
    const { data: newOrder, error: orderError } = await supabase
      .from('Order')
      .insert({
        userId: user.id,
        status: 'PAYMENT_PENDING',
        totalAmount,
        currency: 'INR',
        addressLine1,
        addressLine2: addressLine2 ?? undefined,
        city,
        state,
        postalCode,
        country,
      })
      .select()
      .single()

    if (orderError) {
      console.error('[API Payments Create Order] Failed to create order:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    if (!newOrder) {
      return createErrorResponse('Failed to create order', 500)
    }

    const orderId = newOrder.id

    // Create order items
    const orderItemsInsert = orderItemsData.map((item) => ({
      orderId,
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      finalPrice: item.finalPrice,
      quantity: item.quantity,
    }))

    const { error: orderItemsError } = await supabase
      .from('OrderItem')
      .insert(orderItemsInsert)

    if (orderItemsError) {
      console.error('[API Payments Create Order] Failed to create order items:', orderItemsError)
      // Order was created but items failed - mark as failed
      await supabase
        .from('Order')
        .update({ status: 'PAYMENT_FAILED' })
        .eq('id', orderId)
      return createErrorResponse('Failed to create order items', 500)
    }

    // Create Razorpay order
    let razorpayOrderId: string | null = null
    let razorpayAmount: number | null = null
    let razorpayCurrency: string | null = null

    try {
      const razorpayOrder = await createRazorpayOrder(
        totalAmount,
        'INR',
        orderId
      )
      razorpayOrderId = razorpayOrder.id
      razorpayAmount = razorpayOrder.amount
      razorpayCurrency = razorpayOrder.currency

      // Update order with Razorpay order ID
      const { error: updateError } = await supabase
        .from('Order')
        .update({ razorpayOrderId })
        .eq('id', orderId)

      if (updateError) {
        console.error('[API Payments Create Order] Failed to update order with Razorpay ID:', updateError)
        // Don't fail the request, but log the error
      }
    } catch (razorpayError) {
      console.error('[RAZORPAY] Failed to create Razorpay order:', razorpayError)
      
      // Check if it's a missing environment variable error
      const errorMessage = razorpayError instanceof Error ? razorpayError.message : String(razorpayError)
      if (errorMessage.includes('RAZORPAY_KEY_ID') || errorMessage.includes('RAZORPAY_KEY_SECRET')) {
        console.error('[RAZORPAY] Missing environment variables. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local')
        // Mark order as failed
        await supabase
          .from('Order')
          .update({ status: 'PAYMENT_FAILED' })
          .eq('id', orderId)
        return createErrorResponse(
          'Payment gateway configuration error. Please contact support.',
          500
        )
      }
      
      // Mark order as failed if Razorpay order creation fails
      await supabase
        .from('Order')
        .update({ status: 'PAYMENT_FAILED' })
        .eq('id', orderId)
      return createErrorResponse(
        'Failed to initialize payment gateway. Please try again later.',
        500
      )
    }

    // Return Razorpay order details
    return NextResponse.json({
      success: true,
      razorpayOrderId,
      orderId,
      amount: razorpayAmount,
      currency: razorpayCurrency,
      order: {
        id: orderId,
        status: newOrder.status,
        totalAmount: newOrder.totalAmount,
        currency: newOrder.currency,
        createdAt: newOrder.createdAt,
      },
    })
  } catch (error) {
    console.error('[API Payments Create Order] Error:', error)
    return createErrorResponse('Failed to create payment order', 500, error)
  }
}

