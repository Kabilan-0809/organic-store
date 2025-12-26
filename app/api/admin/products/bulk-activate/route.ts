import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, createErrorResponse, forbiddenResponse } from '@/lib/auth/api-auth'
import { validateArray, validateString, validateNumber } from '@/lib/auth/validate-input'

/**
 * POST /api/admin/products/bulk-activate
 * 
 * Bulk activate products and set default stock (admin only).
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return forbiddenResponse()
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

    const { productIds: rawProductIds, defaultStock: rawDefaultStock } = body as Record<string, unknown>

    // Validate productIds
    const productIds = validateArray(rawProductIds, {
      maxLength: 1000,
      required: true,
    })

    if (!productIds || productIds.length === 0) {
      return createErrorResponse('Product IDs array is required', 400)
    }

    // Validate each product ID
    for (const rawId of productIds) {
      const productId = validateString(rawId, {
        minLength: 1,
        maxLength: 100,
        required: true,
        trim: true,
      })
      if (!productId) {
        return createErrorResponse('Invalid product ID in array', 400)
      }
    }

    // Validate defaultStock (optional)
    const defaultStock = validateNumber(rawDefaultStock, {
      min: 0,
      required: false,
      integer: true,
    }) || 100

    // Update products
    const { data: updatedProducts, error } = await supabase
      .from('Product')
      .update({
        isActive: true,
        stock: defaultStock,
      })
      .in('id', productIds)
      .select()

    if (error) {
      console.error('[API Admin Bulk Activate] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to bulk activate products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updated: updatedProducts?.length || 0,
    })
  } catch (error) {
    console.error('[API Admin Bulk Activate] Error:', error)
    return createErrorResponse('Failed to bulk activate products', 500, error)
  }
}
