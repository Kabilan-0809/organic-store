import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, createErrorResponse, forbiddenResponse } from '@/lib/auth/api-auth'

export const dynamic = 'force-dynamic'

// PATCH /api/admin/blogs/[id] — update a blog post (edit fields, visibility, reorder)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await requireAdmin()
        if (!admin) return forbiddenResponse()

        const { id } = params
        const body = await req.json()

        // Only update fields that are provided in the request body
        const updateData: Record<string, any> = { updatedAt: new Date().toISOString() }
        const allowedFields = [
            'slug', 'title', 'tagline', 'excerpt', 'content',
            'author', 'publishedDate', 'readingTime', 'heroImage',
            'category', 'keywords', 'metaDescription', 'sortOrder', 'isVisible',
        ]
        for (const field of allowedFields) {
            if (field in body) {
                updateData[field] = body[field]
            }
        }

        const { data, error } = await supabase
            .from('BlogPost')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('[Admin Blogs PATCH] Error:', error)
            return createErrorResponse('Failed to update blog post', 500)
        }
        if (!data) {
            return createErrorResponse('Blog post not found', 404)
        }

        return NextResponse.json({ post: data })
    } catch (err) {
        console.error('[Admin Blogs PATCH] Unexpected:', err)
        return createErrorResponse('Internal Server Error', 500)
    }
}

// DELETE /api/admin/blogs/[id] — delete a blog post
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await requireAdmin()
        if (!admin) return forbiddenResponse()

        const { id } = params

        const { error } = await supabase
            .from('BlogPost')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('[Admin Blogs DELETE] Error:', error)
            return createErrorResponse('Failed to delete blog post', 500)
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[Admin Blogs DELETE] Unexpected:', err)
        return createErrorResponse('Internal Server Error', 500)
    }
}
