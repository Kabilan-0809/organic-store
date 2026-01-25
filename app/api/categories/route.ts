import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createErrorResponse } from '@/lib/auth/api-auth'

// Edge runtime for better performance on public read-only endpoint
export const runtime = 'edge'

/**
 * GET /api/categories
 * 
 * Fetch all unique categories from active products.
 * Returns a list of categories with their product counts.
 * 
 * SECURITY:
 * - Public endpoint (no auth required)
 * - Only returns categories from active products (isActive = true)
 */
export async function GET(_req: NextRequest) {
    try {
        // Fetch all active products with their categories
        const { data: products, error } = await supabase
            .from('Product')
            .select('category')
            .eq('isActive', true)

        if (error) {
            console.error('[API Categories] Supabase error:', error)
            throw new Error(`Database query failed: ${error.message}`)
        }

        if (!products || products.length === 0) {
            return NextResponse.json({ categories: [] })
        }

        // Count products per category
        const categoryMap = new Map<string, number>()

        for (const product of products) {
            if (product.category) {
                const category = product.category.trim()
                categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
            }
        }

        // Convert to array and sort by product count (descending)
        const categories = Array.from(categoryMap.entries())
            .map(([name, productCount]) => ({
                name,
                productCount,
                // Generate a slug-like ID from the category name
                id: name.toLowerCase().replace(/\s+/g, '-'),
            }))
            .sort((a, b) => b.productCount - a.productCount)

        // Cache public read-only endpoint for 5 minutes, allow stale for 15 minutes
        return NextResponse.json(
            { categories },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
                },
            }
        )
    } catch (error) {
        console.error('[API Categories] Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories'
        return createErrorResponse(errorMessage, 500, error)
    }
}
