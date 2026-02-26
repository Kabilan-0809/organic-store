import Link from 'next/link'
import BlogCard from '@/components/blog/BlogCard'
import { supabase } from '@/lib/supabase'

/**
 * Blog Listing Page — fetches from Supabase (sorted by sortOrder, visible only)
 */
async function getVisibleBlogPosts() {
    const { data, error } = await supabase
        .from('BlogPost')
        .select('id, slug, title, tagline, excerpt, author, publishedDate, readingTime, heroImage, category, keywords, metaDescription')
        .eq('isVisible', true)
        .order('sortOrder', { ascending: true })

    if (error) {
        console.error('Blog page fetch error:', error)
        return []
    }
    return data ?? []
}

export default async function BlogPage() {
    const posts = await getVisibleBlogPosts()

    return (
        <main className="min-h-screen bg-gradient-to-b from-background to-primary-50/30 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-neutral-900 md:text-5xl lg:text-6xl">
                        Millet Health &amp; Nutrition Blog
                    </h1>
                    <p className="mx-auto max-w-3xl text-lg text-neutral-600 md:text-xl">
                        Discover the power of ancient grains for modern wellness. Expert insights on millet nutrition, health benefits, recipes, and lifestyle tips.
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="py-20 text-center text-neutral-500">
                        <p className="text-lg">No blog posts available yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-2 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                )}

                {/* Call to Action */}
                <div className="mt-8 sm:mt-16 rounded-xl bg-green-100 border border-green-200 p-6 text-center shadow-sm md:p-12">
                    <h2 className="mb-3 text-xl sm:text-3xl font-bold text-green-900">Ready to Experience the Benefits?</h2>
                    <p className="mb-5 text-sm sm:text-lg text-green-800 opacity-90">
                        Explore our range of premium organic millet products and start your wellness journey today.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-block rounded-lg bg-green-600 px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-green-700 hover:shadow-md"
                    >
                        Shop Millet Products
                    </Link>
                </div>
            </div>
        </main>
    )
}
