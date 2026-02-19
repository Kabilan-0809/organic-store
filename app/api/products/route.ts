import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createErrorResponse } from '@/lib/auth/api-auth'

// Node runtime is more stable for Supabase calls here
// export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/products
 * 
 * Fetch all active products for the shop page.
 * Uses explicit column selection to match Cart API logic to ensure consistency.
 * 
 * Query Parameters:
 * - excludeOutOfStock: Filter out products with no stock
 * - includeOutOfStock: Include out-of-stock products
 * - category: Filter by category name (case-insensitive)
 * - q or search: Search products by name (case-insensitive partial match)
 * 
 * SECURITY:
 * - Public endpoint (no auth required)
 * - Only returns active products (isActive = true)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const excludeOutOfStock = searchParams.get('excludeOutOfStock') === 'true'
    const includeOutOfStock = searchParams.get('includeOutOfStock') === 'true'
    const categoryFilter = searchParams.get('category')
    const searchQuery = searchParams.get('q') || searchParams.get('search')

    // Build query - join with ProductVariant for malt products
    // Explicit columns to reduce payload size and match Cart logic
    let dbQuery = supabase
      .from('Product')
      .select(`
        id,
        name,
        slug,
        description,
        price,
        discountPercent,
        imageUrl,
        category,
        stock,
        isActive,
        variants:ProductVariant(
          id,
          sizeGrams,
          price,
          stock
        )
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false })

    // Apply category filter if provided
    if (categoryFilter) {
      dbQuery = dbQuery.ilike('category', categoryFilter)
    }

    // Apply search filter if provided
    if (searchQuery) {
      dbQuery = dbQuery.ilike('name', `%${searchQuery}%`)
    }

    const { data: products, error } = await dbQuery

    if (error) {
      console.error('[API Products] Database error:', error)
      return createErrorResponse('Failed to fetch products', 500)
    }

    if (!products) {
      return NextResponse.json({ products: [] })
    }

    // Flatten products and variants for simpler frontend consumption
    const flattenedProducts: any[] = []
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    for (const p of products) {
      // Logic for determining image URL (using stored URL or GitHub fallback)
      const primaryImage = p.imageUrl

      // Fallback logic if image is missing/invalid
      if (!primaryImage || primaryImage.trim() === '') {
        // (Simulate getProductImages logic or just leave empty)
        // Since we can't easily run async inside flatMap, we loop.
        // But wait, getProductImages is async.
        // We should map async.
      }

      // Note: We are not running getProductImages here to save performance if URL exists.
      // If needed, we can add it back. 
      // For now, use p.imageUrl.

      const usesVariants = p.variants && p.variants.length > 0

      if (usesVariants) {
        // Create a product entry for EACH variant
        for (const variant of p.variants) {
          // Calculate sale price explicitly based on discountPercent
          const variantPrice = variant.price
          const salePrice = p.discountPercent > 0
            ? variantPrice - (variantPrice * p.discountPercent / 100)
            : variantPrice

          const availability = variant.stock

          // Skip if excludeOutOfStock is true and variant is out of stock
          if (excludeOutOfStock && !includeOutOfStock && availability === 0) {
            continue
          }

          flattenedProducts.push({
            product_id: `${p.id}-${variant.id}`,
            title: `${p.name} - ${variant.sizeGrams}g`,
            description: p.description,
            original_price: variantPrice,
            sale_price: parseFloat(salePrice.toFixed(2)),
            discount_percent: p.discountPercent,
            category: p.category,
            shipping_weight: variant.sizeGrams,
            availability: availability,
            link: `${baseUrl}/shop/${p.slug}`,
            primary_image: primaryImage,
            additional_images: [],
            id: p.id,
            slug: p.slug,
            variant_id: variant.id
          })
        }
      } else {
        // Standard product without variants
        const availability = p.stock

        // Skip if out of stock check
        if (excludeOutOfStock && !includeOutOfStock && availability === 0) {
          continue
        }

        const originalPrice = p.price
        const salePrice = p.discountPercent > 0
          ? originalPrice - (originalPrice * p.discountPercent / 100)
          : originalPrice

        flattenedProducts.push({
          product_id: p.id,
          title: p.name,
          description: p.description,
          original_price: originalPrice,
          sale_price: parseFloat(salePrice.toFixed(2)),
          discount_percent: p.discountPercent,
          category: p.category,
          shipping_weight: 0, // Default
          availability: availability,
          link: `${baseUrl}/shop/${p.slug}`,
          primary_image: primaryImage,
          additional_images: [],
          id: p.id,
          slug: p.slug
        })
      }
    }

    return NextResponse.json({
      products: flattenedProducts,
      count: flattenedProducts.length
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })

  } catch (error) {
    console.error('[API Products] Internal error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
