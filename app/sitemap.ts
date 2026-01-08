import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getAllBlogPosts } from '@/lib/blog-data'

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://milletsnjoy.com' // Replace with actual domain

    // 1. Static routes
    const routes = [
        '',
        '/shop',
        '/blog',
        '/about', // Assuming these exist or will exist
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.8,
    }))

    // 2. Fetch all active products
    const { data: products } = await supabase
        .from('Product')
        .select('slug, updatedAt')
        .eq('isActive', true)

    const productRoutes =
        products?.map((product) => ({
            url: `${baseUrl}/shop/${product.slug}`,
            lastModified: new Date(product.updatedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        })) || []

    // 3. Blog posts
    const blogPosts = getAllBlogPosts()
    const blogRoutes = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.publishedDate),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    return [...routes, ...productRoutes, ...blogRoutes]
}
