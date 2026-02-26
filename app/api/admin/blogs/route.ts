import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, createErrorResponse, forbiddenResponse } from '@/lib/auth/api-auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/blogs — fetch all blog posts (admin, includes hidden)
export async function GET() {
    try {
        const admin = await requireAdmin()
        if (!admin) return forbiddenResponse()

        const { data, error } = await supabase
            .from('BlogPost')
            .select('*')
            .order('sortOrder', { ascending: true })

        if (error) {
            console.error('[Admin Blogs GET] Error:', error)
            return createErrorResponse('Failed to fetch blog posts', 500)
        }

        return NextResponse.json({ posts: data ?? [] })
    } catch (err) {
        console.error('[Admin Blogs GET] Unexpected:', err)
        return createErrorResponse('Internal Server Error', 500)
    }
}

// POST /api/admin/blogs — create a new blog post
export async function POST(req: NextRequest) {
    try {
        const admin = await requireAdmin()
        if (!admin) return forbiddenResponse()

        const body = await req.json()
        const {
            slug, title, tagline, excerpt, content,
            author, publishedDate, readingTime,
            heroImage, category, keywords, metaDescription,
        } = body

        if (!slug || !title || !content) {
            return createErrorResponse('slug, title, and content are required', 400)
        }

        // Place new post at the end of the sort order
        const { data: maxData } = await supabase
            .from('BlogPost')
            .select('sortOrder')
            .order('sortOrder', { ascending: false })
            .limit(1)
            .maybeSingle()

        const nextOrder = maxData ? (maxData.sortOrder ?? 0) + 1 : 0

        const { data, error } = await supabase
            .from('BlogPost')
            .insert({
                slug: slug.trim(),
                title: title.trim(),
                tagline: tagline?.trim() || '',
                excerpt: excerpt?.trim() || '',
                content,
                author: author?.trim() || 'Millets N Joy',
                publishedDate: publishedDate || new Date().toISOString().split('T')[0],
                readingTime: readingTime || 5,
                heroImage: heroImage || '/blog/default.jpg',
                category: category || 'Health & Nutrition',
                keywords: keywords || [],
                metaDescription: metaDescription?.trim() || '',
                sortOrder: nextOrder,
                isVisible: true,
            })
            .select()
            .single()

        if (error) {
            console.error('[Admin Blogs POST] Error:', error)
            if (error.code === '23505') {
                return createErrorResponse('A blog post with this slug already exists', 409)
            }
            return createErrorResponse('Failed to create blog post', 500)
        }

        return NextResponse.json({ post: data }, { status: 201 })
    } catch (err) {
        console.error('[Admin Blogs POST] Unexpected:', err)
        return createErrorResponse('Internal Server Error', 500)
    }
}
