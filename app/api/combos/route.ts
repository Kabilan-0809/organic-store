import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createErrorResponse } from '@/lib/auth/api-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/combos
 *
 * Public endpoint — fetches all active combos with their products.
 */
export async function GET() {
    try {
        const { data: combos, error } = await supabase
            .from('Combo')
            .select(`
        id,
        name,
        description,
        imageUrl,
        price,
        isActive,
        createdAt,
        items:ComboItem(
          id,
          productId,
          product:Product(id, name, imageUrl, price)
        )
      `)
            .eq('isActive', true)
            .order('createdAt', { ascending: false })

        if (error) {
            console.error('[API Combos] Fetch error:', error)
            return createErrorResponse('Failed to fetch combos', 500)
        }

        // Convert price from paise to rupees
        const formatted = (combos || []).map((c) => ({
            ...c,
            price: c.price / 100,
        }))

        return NextResponse.json({ combos: formatted })
    } catch (err) {
        console.error('[API Combos] Unexpected error:', err)
        return createErrorResponse('Internal Server Error', 500)
    }
}
