import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseUser } from '@/lib/auth/supabase-auth'
import { requireAuth } from '@/lib/auth/api-auth'
import { createErrorResponse, unauthorizedResponse } from '@/lib/auth/api-auth'

/**
 * GET /api/cart
 * 
 * Fetch cart and cart items for the authenticated user.
 * Returns empty cart if none exists.
 * 
 * Supports both Supabase Auth (via cookies) and Bearer token (for compatibility)
 */
export async function GET(req: NextRequest) {
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

    // Find or create cart for user
    const { data: carts, error: cartError } = await supabase
      .from('Cart')
      .select('id')
      .eq('userId', user.id)
      .limit(1)

    if (cartError) {
      console.error('[API Cart] Supabase error:', cartError)
      return createErrorResponse('Failed to fetch cart', 500)
    }

    let cartId: string | null = null

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
        console.error('[API Cart] Failed to create cart:', createError)
        return createErrorResponse('Failed to create cart', 500)
      }
    } else {
      const firstCart = carts[0]
      if (!firstCart) {
        return createErrorResponse('Failed to access cart', 500)
      }
      cartId = firstCart.id
    }

    // Fetch cart items with product details
    const { data: cartItems, error: itemsError } = await supabase
      .from('CartItem')
      .select('*')
      .eq('cartId', cartId)

    if (itemsError) {
      console.error('[API Cart] Failed to fetch items:', itemsError)
      return createErrorResponse('Failed to fetch cart items', 500)
    }

    // Fetch product details for each item
    const itemsWithProducts = await Promise.all(
      (cartItems || []).map(async (item) => {
        const { data: product } = await supabase
          .from('Product')
          .select('*')
          .eq('id', item.productId)
          .single()

        if (!product) return null

        return {
          cartItemId: item.id,
          product: {
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: product.description,
            price: product.price / 100, // Convert to rupees
            discountPercent: product.discountPercent,
            category: product.category,
            image: product.imageUrl,
            inStock: product.isActive && product.stock > 0,
            stock: product.stock,
          },
          quantity: item.quantity,
        }
      })
    )

    const validItems = itemsWithProducts.filter((item): item is NonNullable<typeof item> => item !== null)

    return NextResponse.json({
      cartId,
      items: validItems,
    })
  } catch (error) {
    console.error('[API Cart] Error:', error)
    return createErrorResponse('Failed to fetch cart', 500, error)
  }
}
