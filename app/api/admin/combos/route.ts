import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, createErrorResponse, forbiddenResponse } from '@/lib/auth/api-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/combos
 * Admin — fetch all combos (active + inactive).
 */
export async function GET() {
    try {
        const admin = await requireAdmin()
        if (!admin) return forbiddenResponse()

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
          product:Product(id, name)
        )
      `)
            .order('createdAt', { ascending: false })

        if (error) {
            console.error('[Admin Combos GET] Error:', error)
            return createErrorResponse('Failed to fetch combos', 500)
        }

        const formatted = (combos || []).map((c) => ({
            ...c,
            price: c.price / 100,
        }))

        return NextResponse.json({ combos: formatted })
    } catch (err) {
        console.error('[Admin Combos GET] Unexpected:', err)
        return createErrorResponse('Internal Server Error', 500)
    }
}

/**
 * POST /api/admin/combos
 * Admin — create a new combo.
 * Body: { name, description?, imageUrl, price (in ₹), productIds: string[] }
 */
export async function POST(req: NextRequest) {
    try {
        const admin = await requireAdmin()
        if (!admin) return forbiddenResponse()

        const body = await req.json()
        const { name, description, imageUrl, price, productIds } = body

        // Validate
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return createErrorResponse('Combo name is required', 400)
        }
        if (!imageUrl || typeof imageUrl !== 'string') {
            return createErrorResponse('Image URL is required', 400)
        }
        if (!price || typeof price !== 'number' || price <= 0) {
            return createErrorResponse('Valid price is required', 400)
        }
        if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 3) {
            return createErrorResponse('A combo must contain 2 or 3 products', 400)
        }

        // Create combo (price stored in paise)
        const { data: combo, error: comboError } = await supabase
            .from('Combo')
            .insert({
                name: name.trim(),
                description: description?.trim() || null,
                imageUrl,
                price: Math.round(price * 100), // rupees → paise
                isActive: true,
            })
            .select()
            .single()

        if (comboError || !combo) {
            console.error('[Admin Combos POST] Create error:', comboError)
            return createErrorResponse('Failed to create combo', 500)
        }

        // Insert ComboItems
        const comboItems = productIds.map((productId: string) => ({
            comboId: combo.id,
            productId,
        }))

        const { error: itemsError } = await supabase
            .from('ComboItem')
            .insert(comboItems)

        if (itemsError) {
            // Rollback combo if items fail
            await supabase.from('Combo').delete().eq('id', combo.id)
            console.error('[Admin Combos POST] Items insert error:', itemsError)
            return createErrorResponse('Failed to add products to combo', 500)
        }

        return NextResponse.json({ combo: { ...combo, price: combo.price / 100 } }, { status: 201 })
    } catch (err) {
        console.error('[Admin Combos POST] Unexpected:', err)
        return createErrorResponse('Internal Server Error', 500)
    }
}
