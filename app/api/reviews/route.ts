import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/reviews?productId=xxx
 * Returns all approved reviews for a product, newest first.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const productId = searchParams.get('productId')

        if (!productId) {
            return NextResponse.json({ error: 'productId is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('ProductReview')
            .select('id, name, rating, review, createdAt')
            .eq('productId', productId)
            .order('createdAt', { ascending: false })

        if (error) {
            console.error('[Reviews GET] DB error:', error)
            return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
        }

        return NextResponse.json({ reviews: data ?? [] })
    } catch (err) {
        console.error('[Reviews GET] Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/reviews
 * Body: { productId, name, rating, review }
 * Creates a new product review.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { productId, name, rating, review } = body

        // Validation
        if (!productId || typeof productId !== 'string' || !productId.trim()) {
            return NextResponse.json({ error: 'productId is required' }, { status: 400 })
        }
        if (!name || typeof name !== 'string' || !name.trim()) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }
        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
        }
        if (!review || typeof review !== 'string' || !review.trim()) {
            return NextResponse.json({ error: 'Review text is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('ProductReview')
            .insert({
                productId: productId.trim(),
                name: name.trim(),
                rating,
                review: review.trim(),
            })
            .select('id, name, rating, review, createdAt')
            .single()

        if (error) {
            console.error('[Reviews POST] DB error:', error)
            return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
        }

        return NextResponse.json({ review: data }, { status: 201 })
    } catch (err) {
        console.error('[Reviews POST] Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
