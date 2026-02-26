import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/blogs — fetch all VISIBLE blog posts for public blog page
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('BlogPost')
            .select('id, slug, title, tagline, excerpt, author, publishedDate, readingTime, heroImage, category, keywords, metaDescription, sortOrder')
            .eq('isVisible', true)
            .order('sortOrder', { ascending: true })

        if (error) throw error

        return NextResponse.json({ posts: data ?? [] })
    } catch (err) {
        console.error('GET /api/blogs error:', err)
        return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
    }
}
