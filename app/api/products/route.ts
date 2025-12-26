import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createErrorResponse } from '@/lib/auth/api-auth'

// Mark route as dynamic to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/products
 * 
 * Fetch all active products for the shop page.
 * Uses the same direct Supabase query pattern as cart routes to ensure consistency.
 * 
 * SECURITY:
 * - Public endpoint (no auth required)
 * - Only returns active products (isActive = true)
 */
export async function GET(_req: NextRequest) {
  try {
    const searchParams = _req.nextUrl.searchParams
    const excludeOutOfStock = searchParams.get('excludeOutOfStock') === 'true'
    const includeOutOfStock = searchParams.get('includeOutOfStock') === 'true'

    // Build query - same pattern as cart routes
    let query = supabase
      .from('Product')
      .select('*')
      .eq('isActive', true)
      .order('createdAt', { ascending: false })

    // Filter out of stock if requested (but allow out of stock if includeOutOfStock is true)
    if (excludeOutOfStock && !includeOutOfStock) {
      query = query.gt('stock', 0)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('[API Products] Supabase error:', error)
      throw new Error(`Database query failed: ${error.message}`)
    }

    if (!products) {
      return NextResponse.json({ products: [] })
    }

    // Map products to API response format - EXACTLY like cart routes do
    // Cart uses: price: product.price / 100, discountPercent: product.discountPercent, stock: product.stock
    const mappedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price / 100, // Convert paise to rupees - SAME as cart
      discountPercent: p.discountPercent, // SAME as cart
      imageUrl: p.imageUrl,
      category: p.category,
      stock: p.stock, // SAME as cart
      inStock: p.isActive && p.stock > 0, // SAME logic as cart
      isActive: p.isActive,
      image: p.imageUrl, // Map imageUrl to image for Product type
    }))

    // Return with no-cache headers to ensure fresh data
    return NextResponse.json(
      { products: mappedProducts },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error) {
    console.error('[API Products] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products'
    return createErrorResponse(errorMessage, 500, error)
  }
}
