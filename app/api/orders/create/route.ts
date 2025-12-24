import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseUser } from '@/lib/auth/supabase-auth'
import { requireAuth } from '@/lib/auth/api-auth'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'
import { validateString, validateArray, validateCartItemId } from '@/lib/auth/validate-input'
import { checkRateLimit, getClientIdentifier } from '@/lib/auth/rate-limit'
import { calculateDiscountedPrice } from '@/lib/pricing'
import { createRazorpayOrder } from '@/lib/payments/razorpay'

/**
 * POST /api/orders/create
 * 
 * Create a new order from selected cart items.
 * 
 * Supports both Supabase Auth (via cookies) and Bearer token (for compatibility)
 */
export async function POST(req: NextRequest) {
  try {
    // SECURITY: Rate limit order creation (10 orders per minute per IP)
    const clientId = getClientIdentifier(req)
    const rateLimit = checkRateLimit(`order:${clientId}`, 10, 60 * 1000)
    if (!rateLimit.allowed) {
      return createErrorResponse(
        'Too many requests. Please try again later.',
        429
      )
    }

    // Try Supabase Auth first (from cookies)
    let user = await getSupabaseUser(req)
    
    // Fallback to Bearer token for backward compatibility
    if (!user) {
      const tokenUser = requireAuth(req)
      if (tokenUser) {
        user = {
          id: tokenUser.userId,
          email: tokenUser.email || '',
          role: tokenUser.role || 'USER',
        }
      }
    }

    if (!user) {
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

      const unitPrice = product.price
      const discountPercent = product.discountPercent || 0
      const discountedPrice = calculateDiscountedPrice(unitPrice, discountPercent)
      const finalPrice = discountedPrice * cartItem.quantity

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        unitPrice,
        discountPercent,
        finalPrice,
        quantity: cartItem.quantity,
      })

      totalAmount += finalPrice
    }

    if (totalAmount <= 0) {
      return createErrorResponse('Invalid order amount', 400)
    }

    // Create order with PAYMENT_PENDING status
    const orderId = `order_${user.id}_${Date.now()}`
    const { data: newOrder, error: orderError } = await supabase
      .from('Order')
      .insert({
        id: orderId,
        userId: user.id,
        status: 'PAYMENT_PENDING',
        totalAmount,
        currency: 'INR',
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
      })
      .select()
      .single()

    if (orderError || !newOrder) {
      console.error('[API Orders Create] Failed to create order:', orderError)
      return createErrorResponse('Failed to create order', 500)
    }

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
      console.error('[API Orders Create] Failed to create order items:', orderItemsError)
      // Order was created but items failed - this is a problem
      // In production, you might want to delete the order or handle this differently
      return createErrorResponse('Failed to create order items', 500)
    }

    // Create Razorpay order
    let razorpayOrderId: string | null = null
    let razorpayAmount: number | null = null
    let razorpayCurrency: string | null = null
    let paymentGatewayError: string | null = null

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
      await supabase
        .from('Order')
        .update({ razorpayOrderId })
        .eq('id', orderId)
    } catch (razorpayError) {
      console.error('[RAZORPAY] Failed to create Razorpay order:', razorpayError)
      paymentGatewayError = 'Payment gateway initialization failed. You can retry payment from your order history.'
    }

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
      message: paymentGatewayError || undefined,
    })
  } catch (error) {
    console.error('[API Orders Create] Error:', error)
    return createErrorResponse('Failed to create order', 500, error)
  }
}
