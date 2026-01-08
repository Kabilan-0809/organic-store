import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogPost, getAllBlogPosts } from '@/lib/blog-data'
import BlogContent from '@/components/blog/BlogContent'

interface BlogPostPageProps {
    params: {
        slug: string
    }
}

/**
 * Generate static params for all blog posts (SSG)
 */
export async function generateStaticParams() {
    const posts = getAllBlogPosts()
    return posts.map((post) => ({
        slug: post.slug,
    }))
}

/**
 * Generate metadata for each blog post (SEO)
 */
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const post = getBlogPost(params.slug)

    if (!post) {
        return {
            title: 'Blog Post Not Found',
        }
    }

    return {
        title: post.title,
        description: post.metaDescription,
        keywords: post.keywords,
        authors: [{ name: post.author }],
        openGraph: {
            title: post.title,
            description: post.metaDescription,
            type: 'article',
            publishedTime: post.publishedDate,
            authors: [post.author],
            url: `https://milletsnjoy.com/blog/${post.slug}`,
            images: [
                {
                    url: post.heroImage,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.metaDescription,
            images: [post.heroImage],
        },
    }
}

/**
 * Individual Blog Post Page
 * 
 * Displays full blog post content with hero image, metadata, and navigation.
 * SEO-optimized with structured data and proper metadata.
 */
export default function BlogPostPage({ params }: BlogPostPageProps) {
    const post = getBlogPost(params.slug)

    if (!post) {
        notFound()
    }

    const formattedDate = new Date(post.publishedDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    // Structured data for SEO (JSON-LD)
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.metaDescription,
        image: `https://milletsnjoy.com${post.heroImage}`,
        datePublished: post.publishedDate,
        author: {
            '@type': 'Organization',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Millets N Joy',
            logo: {
                '@type': 'ImageObject',
                url: 'https://milletsnjoy.com/Logo.jpeg',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://milletsnjoy.com/blog/${post.slug}`,
        },
        keywords: post.keywords.join(', '),
        articleSection: post.category,
        wordCount: post.content.split(' ').length,
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <main className="min-h-screen bg-gradient-to-b from-background to-primary-50/30 py-12">
                <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Back to Blog Link */}
                    <Link
                        href="/blog"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors duration-200 hover:text-primary-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Blog
                    </Link>

                    {/* Hero Image */}
                    <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-lg">
                        <Image
                            src={post.heroImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 1024px) 100vw, 1024px"
                        />
                        {/* Category Badge */}
                        <div className="absolute top-6 left-6 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                            {post.category}
                        </div>
                    </div>

                    {/* Post Header */}
                    <header className="mb-8">
                        <h1 className="mb-4 text-4xl font-bold text-neutral-900 md:text-5xl lg:text-6xl">
                            {post.title}
                        </h1>
                        <p className="mb-6 text-xl font-medium text-primary-600 md:text-2xl">
                            {post.tagline}
                        </p>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 border-b border-neutral-200 pb-6 text-sm text-neutral-600">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <time dateTime={post.publishedDate}>{formattedDate}</time>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{post.readingTime} min read</span>
                            </div>
                        </div>
                    </header>

                    {/* Post Content */}
                    <div className="mb-12">
                        <BlogContent content={post.content} />
                    </div>

                    {/* Call to Action */}
                    <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-center text-white shadow-lg">
                        <h2 className="mb-4 text-2xl font-bold md:text-3xl">Ready to Try Our Millet Products?</h2>
                        <p className="mb-6 text-lg opacity-90">
                            Experience the health benefits of premium organic millets with our carefully crafted products.
                        </p>
                        <Link
                            href="/shop"
                            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary-600 transition-all duration-200 hover:bg-neutral-100 hover:shadow-md"
                        >
                            Shop Now
                        </Link>
                    </div>

                    {/* Back to Blog Link (Bottom) */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors duration-200 hover:text-primary-700"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to All Articles
                        </Link>
                    </div>
                </article>
            </main>
        </>
    )
}
