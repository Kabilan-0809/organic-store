'use client'

import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/blog-data'
import BlogCard from '@/components/blog/BlogCard'

/**
 * Blog Listing Page
 * 
 * Displays all blog posts in a responsive grid layout with attractive category filtering.
 * SEO-optimized with proper metadata and structured content.
 */
export default function BlogPage() {
    const posts = getAllBlogPosts()

    return (
        <main className="min-h-screen bg-gradient-to-b from-background to-primary-50/30 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-neutral-900 md:text-5xl lg:text-6xl">
                        Millet Health & Nutrition Blog
                    </h1>
                    <p className="mx-auto max-w-3xl text-lg text-neutral-600 md:text-xl">
                        Discover the power of ancient grains for modern wellness. Expert insights on millet nutrition, health benefits, recipes, and lifestyle tips.
                    </p>
                </div>

                {/* Blog Posts Grid with Animation */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post, index) => (
                        <div
                            key={post.slug}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <BlogCard post={post} />
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-center text-white shadow-lg md:p-12">
                    <h2 className="mb-4 text-3xl font-bold">Ready to Experience the Benefits?</h2>
                    <p className="mb-6 text-lg opacity-90">
                        Explore our range of premium organic millet products and start your wellness journey today.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary-600 transition-all duration-200 hover:bg-neutral-100 hover:shadow-md"
                    >
                        Shop Millet Products
                    </Link>
                </div>
            </div>
        </main>
    )
}
