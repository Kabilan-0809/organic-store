import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createErrorResponse } from '@/lib/auth/api-auth'

export const runtime = 'nodejs'

/**
 * DELETE /api/cart/combo-items/[id]
 * Remove a combo item from the cart by CartComboItem.id
 *
 * PATCH /api/cart/combo-items/[id]
 * Update quantity of a combo item
 * Body: { quantity: number }
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabaseAuth = createSupabaseServer()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verify ownership via cart
        const { data: item } = await supabase
            .from('CartComboItem')
            .select('id, cartId')
            .eq('id', params.id)
            .single()

        if (!item) {
            return createErrorResponse('Combo item not found', 404)
        }

        // Verify the cart belongs to this user
        const { data: cart } = await supabase
            .from('Cart')
            .select('id')
            .eq('id', item.cartId)
            .eq('userId', user.id)
            .single()

        if (!cart) {
            return createErrorResponse('Unauthorized', 403)
        }

        await supabase.from('CartComboItem').delete().eq('id', params.id)

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[Cart Combo Items DELETE] Error:', err)
        return createErrorResponse('Failed to remove combo from cart', 500)
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabaseAuth = createSupabaseServer()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { quantity } = body

        if (!quantity || typeof quantity !== 'number' || quantity < 1) {
            return createErrorResponse('Valid quantity required', 400)
        }

        const { data: item } = await supabase
            .from('CartComboItem')
            .select('id, cartId')
            .eq('id', params.id)
            .single()

        if (!item) return createErrorResponse('Combo item not found', 404)

        const { data: cart } = await supabase
            .from('Cart')
            .select('id')
            .eq('id', item.cartId)
            .eq('userId', user.id)
            .single()

        if (!cart) return createErrorResponse('Unauthorized', 403)

        await supabase.from('CartComboItem').update({ quantity }).eq('id', params.id)

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[Cart Combo Items PATCH] Error:', err)
        return createErrorResponse('Failed to update combo quantity', 500)
    }
}
