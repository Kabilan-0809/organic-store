'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getAllBlogPosts, getAllCategories } from '@/lib/blog-data'
import BlogCard from '@/components/blog/BlogCard'

/**
 * Blog Listing Page
 * 
 * Displays all blog posts in a responsive grid layout with attractive category filtering.
 * SEO-optimized with proper metadata and structured content.
 */
export default function BlogPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('All')
    const posts = getAllBlogPosts()
    const categories = getAllCategories()

    // Filter posts by category
    const filteredPosts = selectedCategory === 'All'
        ? posts
        : posts.filter(post => post.category === selectedCategory)

    // Category icons mapping
    const categoryIcons: Record<string, string> = {
        'All': '📚',
        'Health & Nutrition': '💚',
        'Nutrition Science': '🔬',
        'Weight Management': '⚖️',
        'Culture & Tradition': '🏛️',
        'Child Nutrition': '👶',
        'Recipes & Cooking': '👨‍🍳',
        'Diabetes & Health': '🩺',
        'Gluten-Free Living': '🌾'
    }

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

                {/* Enhanced Category Filter */}
                <div className="mb-12">
                    <div className="mb-6 text-center">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                            Browse by Category
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {/* All Articles Button */}
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${selectedCategory === 'All'
                                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200 scale-105'
                                    : 'bg-white text-neutral-700 hover:bg-neutral-50 hover:shadow-md border border-neutral-200 hover:border-primary-200'
                                }`}
                        >
                            <span className="text-lg">{categoryIcons['All']}</span>
                            <span>All Articles</span>
                            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${selectedCategory === 'All'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                {posts.length}
                            </span>
                        </button>

                        {/* Category Buttons */}
                        {categories.map((category) => {
                            const count = posts.filter(p => p.category === category).length
                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${selectedCategory === category
                                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200 scale-105'
                                            : 'bg-white text-neutral-700 hover:bg-neutral-50 hover:shadow-md border border-neutral-200 hover:border-primary-200'
                                        }`}
                                >
                                    <span className="text-lg">{categoryIcons[category] || '📖'}</span>
                                    <span className="whitespace-nowrap">{category}</span>
                                    <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${selectedCategory === category
                                            ? 'bg-white/20 text-white'
                                            : 'bg-neutral-100 text-neutral-600'
                                        }`}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Results Count with Animation */}
                <div className="mb-8 text-center">
                    <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>
                            Showing <strong>{filteredPosts.length}</strong> {filteredPosts.length === 1 ? 'article' : 'articles'}
                            {selectedCategory !== 'All' && <> in <strong>{selectedCategory}</strong></>}
                        </span>
                    </p>
                </div>

                {/* Blog Posts Grid with Animation */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post, index) => (
                        <div
                            key={post.slug}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <BlogCard post={post} />
                        </div>
                    ))}
                </div>

                {/* No Results State */}
                {filteredPosts.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
                            <svg className="h-10 w-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-neutral-900">No articles found</h3>
                        <p className="text-neutral-600">Try selecting a different category</p>
                    </div>
                )}

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
