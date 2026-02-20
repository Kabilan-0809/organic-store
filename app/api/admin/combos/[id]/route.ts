import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, createErrorResponse, forbiddenResponse } from '@/lib/auth/api-auth'

/**
 * PUT /api/admin/combos/[id]
 * Admin — update combo details and products.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdmin()
        if (!admin) return forbiddenResponse()

        const { id } = params
        const body = await req.json()
        const { name, description, imageUrl, price, isActive, productIds } = body

        // Validate productIds if provided
        if (productIds !== undefined) {
            if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 3) {
                return createErrorResponse('A combo must contain 2 or 3 products', 400)
            }
        }

        // Build update object
        const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }
        if (name !== undefined) updateData.name = name.trim()
        if (description !== undefined) updateData.description = description?.trim() || null
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl
        if (price !== undefined) updateData.price = Math.round(price * 100)
        if (isActive !== undefined) updateData.isActive = isActive

        const { data: combo, error: updateError } = await supabase
            .from('Combo')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (updateError || !combo) {
            console.error('[Admin Combos PUT] Update error:', updateError)
            return createErrorResponse('Failed to update combo', 500)
        }

        // Replace ComboItems if productIds provided
        if (productIds) {
            await supabase.from('ComboItem').delete().eq('comboId', id)

            const comboItems = productIds.map((productId: string) => ({
                comboId: id,
                productId,
            }))

            const { error: itemsError } = await supabase.from('ComboItem').insert(comboItems)
            if (itemsError) {
                console.error('[Admin Combos PUT] Items error:', itemsError)
                return createErrorResponse('Failed to update combo products', 500)
            }
        }

        return NextResponse.json({ combo: { ...combo, price: combo.price / 100 } })
    } catch (err) {
        console.error('[Admin Combos PUT] Unexpected:', err)
        return createErrorResponse('Internal Server Error', 500)
    }
}

/**
 * DELETE /api/admin/combos/[id]
 * Admin — delete a combo (ComboItems cascade automatically).
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const admin = await requireAdmin()
        if (!admin) return forbiddenResponse()

        const { id } = params

        const { error } = await supabase.from('Combo').delete().eq('id', id)

        if (error) {
            console.error('[Admin Combos DELETE] Error:', error)
            return createErrorResponse('Failed to delete combo', 500)
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[Admin Combos DELETE] Unexpected:', err)
        return createErrorResponse('Internal Server Error', 500)
    }
}
