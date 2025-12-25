import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseUser } from '@/lib/auth/supabase-auth'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'

/**
 * POST /api/cart/merge
 * 
 * Merge guest cart items into user's cart.
 * 
 * Supports both Supabase Auth (via cookies) and Bearer token (for compatibility)
 */
export async function POST(_req: NextRequest) {
  try {
    // Get authenticated user from Supabase Auth cookies
    const user = await getSupabaseUser()

    if (!user) {
      return unauthorizedResponse()
    }

    // Parse request body
    let body: unknown
    try {
      body = await _req.json()
    } catch {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    if (typeof body !== 'object' || body === null) {
      return createErrorResponse('Invalid request body', 400)
    }

    const { items: rawItems } = body as Record<string, unknown>

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ success: true, message: 'No items to merge' })
    }

    // Find or create user's cart
    const { data: carts, error: cartError } = await supabase
      .from('Cart')
      .select('id')
      .eq('userId', user.id)
      .limit(1)

    if (cartError) {
      console.error('[API Cart Merge] Cart error:', cartError)
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
        console.error('[API Cart Merge] Failed to create cart:', createError)
        return createErrorResponse('Failed to create cart', 500)
      }
    } else {
      const firstCart = carts[0]
      if (!firstCart) {
        return createErrorResponse('Failed to access cart', 500)
      }
      cartId = firstCart.id
    }

    // Merge items
    for (const item of rawItems) {
      if (typeof item !== 'object' || item === null) continue
      const { productId, quantity } = item as { productId?: unknown; quantity?: unknown }

      if (typeof productId !== 'string' || typeof quantity !== 'number' || quantity <= 0) {
        continue
      }

      // Check if item already exists
      const { data: existingItems } = await supabase
        .from('CartItem')
        .select('*')
        .eq('cartId', cartId)
        .eq('productId', productId)
        .single()

      if (existingItems) {
        // Update quantity
        await supabase
          .from('CartItem')
          .update({ quantity: existingItems.quantity + quantity })
          .eq('id', existingItems.id)
      } else {
        // Create new item
        await supabase
          .from('CartItem')
          .insert({
            cartId,
            productId,
            quantity,
          })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cart merged successfully',
    })
  } catch (error) {
    console.error('[API Cart Merge] Error:', error)
    return createErrorResponse('Failed to merge cart', 500, error)
  }
}
