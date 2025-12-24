import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseUser } from '@/lib/auth/supabase-auth'
import { requireAuth } from '@/lib/auth/api-auth'
import {
  createErrorResponse,
  unauthorizedResponse,
} from '@/lib/auth/api-auth'
import { validateString, validateNumber } from '@/lib/auth/validate-input'

/**
 * POST /api/cart/items
 * 
 * Add an item to the authenticated user's cart.
 * 
 * Supports both Supabase Auth (via cookies) and Bearer token (for compatibility)
 */
export async function POST(req: NextRequest) {
  try {
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

    const { productId: rawProductId, quantity: rawQuantity } = body as Record<
      string,
      unknown
    >

    // Validate productId
    const productId = validateString(rawProductId, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })

    if (!productId) {
      return createErrorResponse('Product ID is required', 400)
    }

    // Validate quantity
    const quantity = validateNumber(rawQuantity, {
      min: 1,
      max: 99,
      required: false,
      integer: true,
    }) || 1

    // Verify product exists and is available
    const { data: products, error: productError } = await supabase
      .from('Product')
      .select('*')
      .eq('id', productId)
      .eq('isActive', true)
      .gt('stock', 0)
      .single()

    if (productError || !products) {
      return createErrorResponse('Product not found or unavailable', 400)
    }

    // Find or create cart
    const { data: carts, error: cartError } = await supabase
      .from('Cart')
      .select('id')
      .eq('userId', user.id)
      .limit(1)

    if (cartError) {
      console.error('[API Cart Items] Cart error:', cartError)
      return createErrorResponse('Failed to access cart', 500)
    }

    let cartId: string

    if (!carts || carts.length === 0) {
      // Create new cart
      cartId = `cart_${user.id}_${Date.now()}`
      const { error: createError } = await supabase
        .from('Cart')
        .insert({
          id: cartId,
          userId: user.id,
        })

      if (createError) {
        console.error('[API Cart Items] Failed to create cart:', createError)
        return createErrorResponse('Failed to create cart', 500)
      }
    } else {
      const firstCart = carts[0]
      if (!firstCart) {
        return createErrorResponse('Failed to access cart', 500)
      }
      cartId = firstCart.id
    }

    // Check if item already exists in cart
    const { data: existingItems, error: existingError } = await supabase
      .from('CartItem')
      .select('*')
      .eq('cartId', cartId)
      .eq('productId', productId)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      // PGRST116 = not found, which is fine
      console.error('[API Cart Items] Error checking existing item:', existingError)
      return createErrorResponse('Failed to check cart', 500)
    }

    if (existingItems) {
      // Update quantity
      const requestedQuantity = existingItems.quantity + quantity
      if (requestedQuantity > products.stock) {
        return createErrorResponse(
          `Only ${products.stock} available in stock. You already have ${existingItems.quantity} in your cart.`,
          400
        )
      }

      const newQuantity = Math.min(requestedQuantity, 99, products.stock)
      const { data: updatedItem, error: updateError } = await supabase
        .from('CartItem')
        .update({ quantity: newQuantity })
        .eq('id', existingItems.id)
        .select()
        .single()

      if (updateError || !updatedItem) {
        console.error('[API Cart Items] Update error:', updateError)
        return createErrorResponse('Failed to update cart item', 500)
      }

      return NextResponse.json({
        success: true,
        cartItemId: updatedItem.id,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price / 100,
          discountPercent: products.discountPercent,
          imageUrl: products.imageUrl,
          category: products.category,
          stock: products.stock,
        },
        quantity: updatedItem.quantity,
      })
    } else {
      // Create new cart item
      if (quantity > products.stock) {
        return createErrorResponse(
          `Only ${products.stock} available in stock`,
          400
        )
      }

      const { data: newItem, error: createItemError } = await supabase
        .from('CartItem')
        .insert({
          cartId,
          productId,
          quantity: Math.min(quantity, products.stock),
        })
        .select()
        .single()

      if (createItemError || !newItem) {
        console.error('[API Cart Items] Create error:', createItemError)
        return createErrorResponse('Failed to add item to cart', 500)
      }

      return NextResponse.json({
        success: true,
        cartItemId: newItem.id,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price / 100,
          discountPercent: products.discountPercent,
          imageUrl: products.imageUrl,
          category: products.category,
          stock: products.stock,
        },
        quantity: newItem.quantity,
      })
    }
  } catch (error) {
    console.error('[API Cart Items] Error:', error)
    return createErrorResponse('Failed to add item to cart', 500, error)
  }
}
