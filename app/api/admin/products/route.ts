import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, createErrorResponse, forbiddenResponse } from '@/lib/auth/api-auth'
import { validateString, validateNumber } from '@/lib/auth/validate-input'

/**
 * POST /api/admin/products
 * 
 * Create a new product (admin only).
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

    const bodyData = body as Record<string, unknown>

    // Validate required fields
    const name = validateString(bodyData.name, {
      minLength: 1,
      maxLength: 200,
      required: true,
      trim: true,
    })
    const slug = validateString(bodyData.slug, {
      minLength: 1,
      maxLength: 200,
      required: true,
      trim: true,
    })
    const description = validateString(bodyData.description, {
      minLength: 1,
      maxLength: 5000,
      required: true,
      trim: true,
    })
    const category = validateString(bodyData.category, {
      minLength: 1,
      maxLength: 100,
      required: true,
      trim: true,
    })
    const imageUrl = validateString(bodyData.imageUrl, {
      minLength: 1,
      maxLength: 500,
      required: true,
      trim: true,
    })

    if (!name || !slug || !description || !category || !imageUrl) {
      return createErrorResponse('Missing required fields', 400)
    }

    // Validate price
    const price = validateNumber(bodyData.price, {
      min: 0,
      required: true,
    })
    if (price === null) {
      return createErrorResponse('Invalid price', 400)
    }

    // Validate discountPercent (optional)
    let discountPercent: number | null = null
    if ('discountPercent' in bodyData) {
      if (bodyData.discountPercent !== null && bodyData.discountPercent !== undefined) {
        const discount = validateNumber(bodyData.discountPercent, {
          min: 0,
          max: 100,
          required: true,
          integer: true,
        })
        if (discount === null) {
          return createErrorResponse('Invalid discount percent (must be 0-100)', 400)
        }
        discountPercent = discount
      }
    }

    // Validate stock (optional, defaults to 0)
    const stock = validateNumber(bodyData.stock, {
      min: 0,
      required: false,
      integer: true,
    }) || 0

    // Validate isActive (optional, defaults to true)
    const isActive = typeof bodyData.isActive === 'boolean' ? bodyData.isActive : true

    // Check if slug already exists
    const { data: existingProduct } = await supabase
      .from('Product')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingProduct) {
      return createErrorResponse('Product with this slug already exists', 409)
    }

    // Create product
    const { data: newProduct, error } = await supabase
      .from('Product')
      .insert({
        name,
        slug,
        description,
        price: Math.round(price * 100), // Convert rupees to paise
        discountPercent,
        imageUrl,
        category,
        stock,
        isActive,
      })
      .select()
      .single()

    if (error) {
      console.error('[API Admin Products Create] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    if (!newProduct) {
      return createErrorResponse('Failed to create product', 500)
    }

    return NextResponse.json({
      product: {
        id: newProduct.id,
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        price: newProduct.price / 100,
        discountPercent: newProduct.discountPercent,
        imageUrl: newProduct.imageUrl,
        category: newProduct.category,
        stock: newProduct.stock,
        isActive: newProduct.isActive,
        createdAt: newProduct.createdAt,
        updatedAt: newProduct.updatedAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('[API Admin Products Create] Error:', error)
    return createErrorResponse('Failed to create product', 500, error)
  }
}

/**
 * GET /api/admin/products
 * 
 * Fetch all products (admin only).
 */
export async function GET(_req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return forbiddenResponse()
    }

    const searchParams = _req.nextUrl.searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'

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
        createdAt,
        updatedAt,
        ProductVariant (
          id,
          sizeGrams,
          price,
          stock
        )
      `)
      .order('createdAt', { ascending: false })

    if (!includeInactive) {
      query = query.eq('isActive', true)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('[API Admin Products] Supabase error:', error)
      return createErrorResponse('Failed to fetch products', 500)
    }

    return NextResponse.json({
      products: (products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price / 100, // Convert to rupees
        discountPercent: p.discountPercent,
        imageUrl: p.imageUrl,
        category: p.category,
        stock: p.stock,
        isActive: p.isActive,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        variants: p.ProductVariant ? p.ProductVariant.map((v: any) => ({
          id: v.id,
          sizeGrams: v.sizeGrams,
          price: v.price / 100, // Convert to rupees
          stock: v.stock,
        })) : [],
      })),
    })
  } catch (error) {
    console.error('[API Admin Products] Error:', error)
    return createErrorResponse('Failed to fetch products', 500, error)
  }
}
