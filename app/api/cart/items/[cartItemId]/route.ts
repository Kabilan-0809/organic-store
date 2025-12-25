import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseUser } from '@/lib/auth/supabase-auth'
import {
  createErrorResponse,
  unauthorizedResponse,
} from '@/lib/auth/api-auth'
import { validateString, validateNumber } from '@/lib/auth/validate-input'

/**
 * PATCH /api/cart/items/[cartItemId]
 * 
 * Update cart item quantity.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { cartItemId: string } }
) {
  try {
    // Get authenticated user from Supabase Auth cookies
    const user = await getSupabaseUser()

    if (!user) {
      return unauthorizedResponse()
    }

    const cartItemId = validateString(params.cartItemId, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })

    if (!cartItemId) {
      return createErrorResponse('Invalid cart item ID', 400)
    }

    // Parse request body
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    const { quantity: rawQuantity } = body as Record<string, unknown>
    const quantity = validateNumber(rawQuantity, {
      min: 1,
      max: 99,
      required: true,
      integer: true,
    })

    if (!quantity) {
      return createErrorResponse('Quantity must be between 1 and 99', 400)
    }

    // Verify cart item belongs to user's cart
    const { data: cartItems, error: itemError } = await supabase
      .from('CartItem')
      .select('*, cart:Cart!inner(userId)')
      .eq('id', cartItemId)
      .single()

    if (itemError || !cartItems || (cartItems.cart as { userId: string }).userId !== user.id) {
      return createErrorResponse('Cart item not found', 404)
    }

    // Check product stock
    const { data: product } = await supabase
      .from('Product')
      .select('stock')
      .eq('id', cartItems.productId)
      .single()

    if (!product || quantity > product.stock) {
      return createErrorResponse(
        `Only ${product?.stock || 0} available in stock`,
        400
      )
    }

    // Update quantity
    const { data: updatedItem, error: updateError } = await supabase
      .from('CartItem')
      .update({ quantity: Math.min(quantity, product.stock) })
      .eq('id', cartItemId)
      .select()
      .single()

    if (updateError || !updatedItem) {
      console.error('[API Cart Item Update] Error:', updateError)
      return createErrorResponse('Failed to update cart item', 500)
    }

    return NextResponse.json({
      success: true,
      cartItemId: updatedItem.id,
      quantity: updatedItem.quantity,
    })
  } catch (error) {
    console.error('[API Cart Item Update] Error:', error)
    return createErrorResponse('Failed to update cart item', 500, error)
  }
}

/**
 * DELETE /api/cart/items/[cartItemId]
 * 
 * Remove item from cart.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { cartItemId: string } }
) {
  try {
    // Get authenticated user from Supabase Auth cookies
    const user = await getSupabaseUser()

    if (!user) {
      return unauthorizedResponse()
    }

    const cartItemId = validateString(params.cartItemId, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })

    if (!cartItemId) {
      return createErrorResponse('Invalid cart item ID', 400)
    }

    // Verify cart item belongs to user's cart
    const { data: cartItems, error: itemError } = await supabase
      .from('CartItem')
      .select('*, cart:Cart!inner(userId)')
      .eq('id', cartItemId)
      .single()

    if (itemError || !cartItems || (cartItems.cart as { userId: string }).userId !== user.id) {
      return createErrorResponse('Cart item not found', 404)
    }

    // Delete cart item
    const { error: deleteError } = await supabase
      .from('CartItem')
      .delete()
      .eq('id', cartItemId)

    if (deleteError) {
      console.error('[API Cart Item Delete] Error:', deleteError)
      return createErrorResponse('Failed to remove cart item', 500)
    }

    return NextResponse.json({
      success: true,
      message: 'Cart item removed',
    })
  } catch (error) {
    console.error('[API Cart Item Delete] Error:', error)
    return createErrorResponse('Failed to remove cart item', 500, error)
  }
}
