import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createErrorResponse, forbiddenResponse, requireAdmin } from '@/lib/auth/api-auth'
import { validateString, validateNumber } from '@/lib/auth/validate-input'

export const runtime = 'nodejs'

/**
 * PATCH /api/admin/products/[id]/variants/[variantId]
 * 
 * Update a product variant (admin only).
 * Supports updating: price, stock
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return forbiddenResponse()
    }

    const productId = validateString(params.id, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })
    const variantId = validateString(params.variantId, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })

    if (!productId || !variantId) {
      return createErrorResponse('Invalid product ID or variant ID', 400)
    }

    // Verify variant belongs to product
    const { data: variant, error: variantError } = await supabase
      .from('ProductVariant')
      .select('*, Product!inner(id, category)')
      .eq('id', variantId)
      .eq('productId', productId)
      .single()

    if (variantError || !variant) {
      return createErrorResponse('Variant not found', 404)
    }

    // Parse request body
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return createErrorResponse('Invalid JSON in request body', 400)
    }

    if (typeof body !== 'object' || body === null) {
      return createErrorResponse('Invalid request body', 400)
    }

    const updateData: Record<string, unknown> = {}

    if ('price' in body) {
      const price = validateNumber(body.price, {
        min: 0,
        required: true,
      })
      if (price === null) {
        return createErrorResponse('Invalid price', 400)
      }
      // Convert rupees to paise
      updateData.price = Math.round(price * 100)
    }

    if ('stock' in body) {
      const stock = validateNumber(body.stock, {
        min: 0,
        required: true,
        integer: true,
      })
      if (stock === null) {
        return createErrorResponse('Invalid stock quantity', 400)
      }
      updateData.stock = stock
    }

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse('No valid fields to update', 400)
    }

    // Update variant
    const { data: updatedVariant, error: updateError } = await supabase
      .from('ProductVariant')
      .update(updateData)
      .eq('id', variantId)
      .select()
      .single()

    if (updateError || !updatedVariant) {
      console.error('[API Admin Variant Update] Supabase error:', updateError)
      return createErrorResponse('Failed to update variant', 500)
    }

    return NextResponse.json({
      variant: {
        id: updatedVariant.id,
        sizeGrams: updatedVariant.sizeGrams,
        price: updatedVariant.price / 100,
        stock: updatedVariant.stock,
      },
    })
  } catch (error) {
    console.error('[API Admin Variant Update] Error:', error)
    return createErrorResponse('Failed to update variant', 500, error)
  }
}

