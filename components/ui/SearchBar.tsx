'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getCinematicImage } from '@/lib/product-images'
import type { Product } from '@/types'

export default function SearchBar({
    onSelectCallback,
}: {
    onSelectCallback?: () => void
}) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Product[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Handle outside click to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Debounced search
    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([])
                setIsOpen(false)
                return
            }

            setIsLoading(true)
            setIsOpen(true)

            try {
                const res = await fetch(`/api/products?q=${encodeURIComponent(query.trim())}`)
                if (res.ok) {
                    const data = await res.json()

                    // Map backend format to Product type
                    const mappedProducts: Product[] = (data.products || []).map((p: any) => ({
                        id: p.product_id,
                        slug: p.slug,
                        name: p.title.replace(/\s*-\s*\d+g\s*$/i, '').trim(),
                        image: p.primary_image,
                        category: p.category || 'Product',
                        price: p.sale_price || p.original_price,
                    }))

                    // Deduplicate by name (in case API returns multiple variants)
                    const uniqueProducts = Array.from(
                        new Map(mappedProducts.map(item => [item.name, item])).values() // This takes the last variant, fine for search
                    )

                    setResults(uniqueProducts.slice(0, 6)) // Limit to 6 results for UI
                } else {
                    setResults([])
                }
            } catch (error) {
                console.error('Search error:', error)
                setResults([])
            } finally {
                setIsLoading(false)
            }
        }

        const timer = setTimeout(() => {
            fetchResults()
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/shop?q=${encodeURIComponent(query.trim())}`)
            setIsOpen(false)
            if (onSelectCallback) onSelectCallback()
        }
    }

    const handleSelect = (slug: string) => {
        router.push(`/shop/${slug}`)
        setIsOpen(false)
        setQuery('')
        if (onSelectCallback) onSelectCallback()
    }

    return (
        <div ref={wrapperRef} className="relative w-full group">
            <form onSubmit={handleSubmit} className="w-full relative">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => {
                        if (query.trim()) setIsOpen(true)
                    }}
                    className="w-full rounded-full border border-neutral-300 bg-white/60 px-4 py-2 pl-10 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 group-hover:border-neutral-400 backdrop-blur-sm shadow-sm"
                />
                <button
                    type="submit"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary-600 transition-colors"
                    aria-label="Submit search"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </form>

            {/* Dropdown Results */}
            {isOpen && query.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden z-50">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-neutral-500 flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600" />
                            Searching...
                        </div>
                    ) : results.length > 0 ? (
                        <ul className="max-h-[360px] overflow-y-auto divide-y divide-neutral-100">
                            {results.map((product) => {
                                const imageUrl = getCinematicImage(product) || product.image
                                return (
                                    <li key={product.id}>
                                        <button
                                            onClick={() => handleSelect(product.slug || product.id)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors text-left"
                                        >
                                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                                                {imageUrl ? (
                                                    <Image
                                                        src={imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-neutral-200" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-900 truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-neutral-500 truncate">
                                                    {product.category}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span className="text-sm font-semibold text-primary-700">
                                                    ₹{(product.price).toFixed(2)}
                                                </span>
                                            </div>
                                        </button>
                                    </li>
                                )
                            })}
                            <li className="p-2 border-t border-neutral-100 bg-neutral-50/50">
                                <button
                                    onClick={handleSubmit}
                                    className="w-full text-center text-xs font-semibold text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                                >
                                    View all results for &quot;{query}&quot;
                                </button>
                            </li>
                        </ul>
                    ) : (
                        <div className="p-6 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                                <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-neutral-900">No products found</p>
                            <p className="text-xs text-neutral-500 mt-1">Try checking for typos or using different keywords.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
