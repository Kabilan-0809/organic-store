import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createErrorResponse } from '@/lib/auth/api-auth'

export const runtime = 'nodejs'

/**
 * POST /api/cart/combo-items
 * Add a combo as a single item to the cart.
 * Body: { comboId: string }
 */
export async function POST(req: NextRequest) {
    const supabaseAuth = createSupabaseServer()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { comboId } = body

        if (!comboId || typeof comboId !== 'string') {
            return createErrorResponse('comboId is required', 400)
        }

        // Verify combo exists and is active
        const { data: combo, error: comboError } = await supabase
            .from('Combo')
            .select('id, name, price, imageUrl')
            .eq('id', comboId)
            .eq('isActive', true)
            .single()

        if (comboError || !combo) {
            return createErrorResponse('Combo not found or inactive', 404)
        }

        // Find or create cart for user
        let cartId: string
        const { data: carts } = await supabase
            .from('Cart')
            .select('id')
            .eq('userId', user.id)
            .limit(1)

        if (!carts || carts.length === 0) {
            cartId = `cart_${user.id}_${Date.now()}`
            await supabase.from('Cart').insert({ id: cartId, userId: user.id })
        } else {
            cartId = carts[0]!.id
        }

        // Check if this combo is already in the cart — just bump quantity
        const { data: existing } = await supabase
            .from('CartComboItem')
            .select('id, quantity')
            .eq('cartId', cartId)
            .eq('comboId', comboId)
            .single()

        if (existing) {
            await supabase
                .from('CartComboItem')
                .update({ quantity: existing.quantity + 1 })
                .eq('id', existing.id)
        } else {
            await supabase.from('CartComboItem').insert({
                cartId,
                comboId,
                quantity: 1,
                price: combo.price, // stored in paise
            })
        }

        return NextResponse.json({ success: true, comboId })
    } catch (err) {
        console.error('[Cart Combo Items POST] Error:', err)
        return createErrorResponse('Failed to add combo to cart', 500)
    }
}
