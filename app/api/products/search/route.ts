import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createErrorResponse } from '@/lib/auth/api-auth'
import { getProductImages } from '@/lib/products-server'

// Node runtime for server-side image discovery
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/products/search
 * 
 * Search products by name with optional category filtering.
 * 
 * Query Parameters:
 * - q or search: Search query for product name (required)
 * - category: Optional category filter
 * - excludeOutOfStock: Filter out products with no stock
 * 
 * SECURITY:
 * - Public endpoint (no auth required)
 * - Only returns active products (isActive = true)
 */
export async function GET(_req: NextRequest) {
    try {
        const searchParams = _req.nextUrl.searchParams
        const searchQuery = searchParams.get('q') || searchParams.get('search')
        const categoryFilter = searchParams.get('category')
        const excludeOutOfStock = searchParams.get('excludeOutOfStock') === 'true'

        if (!searchQuery || searchQuery.trim().length === 0) {
            return createErrorResponse('Search query is required', 400)
        }

        // Build query
        let query = supabase
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
        ProductVariant (
          id,
          sizeGrams,
          price,
          stock
        )
      `)
            .eq('isActive', true)
            .ilike('name', `%${searchQuery.trim()}%`)
            .order('name', { ascending: true })
            .limit(50) // Limit search results

        // Apply category filter if provided
        if (categoryFilter) {
            query = query.ilike('category', categoryFilter)
        }

        const { data: products, error } = await query

        if (error) {
            console.error('[API Products Search] Supabase error:', error)
            throw new Error(`Database query failed: ${error.message}`)
        }

        if (!products || products.length === 0) {
            return NextResponse.json({
                products: [],
                query: searchQuery,
                count: 0
            })
        }

        // Helper function for variant categories
        const hasVariants = (category: string) => {
            if (!category) return false
            const normalized = category.trim().toLowerCase()
            return normalized === 'malt' || normalized === 'saadha podi'
        }

        // Map products to API response format
        const mappedProducts = products
            .map((p: any) => {
                const usesVariants = hasVariants(p.category)
                const variants = p.ProductVariant || []

                // Determine stock
                let inStock: boolean
                let stock: number

                if (usesVariants) {
                    const hasStock = variants.some((v: any) => v.stock > 0)
                    const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
                    inStock = p.isActive && hasStock
                    stock = totalStock
                } else {
                    inStock = p.isActive && p.stock > 0
                    stock = p.stock
                }

                // Apply excludeOutOfStock filter
                if (excludeOutOfStock && !inStock) {
                    return null
                }

                // Discover images
                let allImages: string[] = []
                try {
                    allImages = getProductImages(p.category, p.name, p.imageUrl)
                } catch (e) {
                    console.error('Error discovering images for', p.name, e)
                }

                const finalImage = allImages.length > 0 ? allImages[0] : p.imageUrl

                return {
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    description: p.description,
                    price: p.price / 100,
                    discountPercent: p.discountPercent,
                    imageUrl: finalImage,
                    category: p.category,
                    stock: stock,
                    inStock: inStock,
                    isActive: p.isActive,
                    image: finalImage,
                    images: allImages,
                    ...(usesVariants && {
                        variants: variants.map((v: any) => ({
                            id: v.id,
                            sizeGrams: v.sizeGrams,
                            price: v.price / 100,
                            stock: v.stock,
                            inStock: v.stock > 0,
                        })),
                    }),
                }
            })
            .filter((p: any): p is NonNullable<typeof p> => p !== null)

        // Cache search results for 2 minutes
        return NextResponse.json(
            {
                products: mappedProducts,
                query: searchQuery,
                count: mappedProducts.length
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
                },
            }
        )
    } catch (error) {
        console.error('[API Products Search] Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to search products'
        return createErrorResponse(errorMessage, 500, error)
    }
}
