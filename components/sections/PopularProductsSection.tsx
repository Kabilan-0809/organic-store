'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import { useCart } from '@/components/cart/CartContext'
import { calculateDiscountedPrice } from '@/lib/pricing'
import { getCinematicImage } from '@/lib/product-images'

export default function PopularProductsSection() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [addingId, setAddingId] = useState<string | null>(null)
    const { addItem, open } = useCart()

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`/api/products?includeOutOfStock=false&t=${Date.now()}`, {
                    cache: 'no-store',
                })
                if (!response.ok) return
                const data = await response.json()

                type RawProduct = {
                    product_id: string
                    title: string
                    description: string
                    original_price: number
                    sale_price: number
                    discount_percent: number
                    category: string
                    primary_image: string
                    additional_images: string[]
                    availability: number
                }

                const mapped: Product[] = (data.products || []).map((p: RawProduct) => ({
                    id: p.product_id,
                    slug: '',
                    name: p.title.replace(/\s*-\s*\d+g\s*$/i, '').trim(),
                    description: p.description,
                    price: p.original_price,
                    discountPercent: p.discount_percent,
                    category: p.category,
                    image: getCinematicImage({ name: p.title.replace(/\s*-\s*\d+g\s*$/i, '').trim(), image: p.primary_image }),
                    images: p.additional_images,
                    inStock: p.availability > 0,
                    stock: p.availability,
                }))

                // Deduplicate by name, only in-stock, max 4
                const seen = new Set<string>()
                const unique = mapped.filter((p) => {
                    if (seen.has(p.name)) return false
                    seen.add(p.name)
                    return true
                })
                setProducts(unique.slice(0, 4))
            } catch (err) {
                console.error('[Popular Products]', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProducts()
    }, [])

    const handleAddToCart = async (product: Product) => {
        setAddingId(product.id)
        await addItem(product, 1)
        open()
        setAddingId(null)
    }

    if (isLoading) {
        return (
            <section className="px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-neutral-200" />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-72 animate-pulse rounded-2xl bg-neutral-100" />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (products.length === 0) return null

    return (
        <section className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px]">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Popular Products</h2>
                    <Link
                        href="/shop"
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                        View All →
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
                    {products.map((product) => {
                        const discountedPaise = calculateDiscountedPrice(
                            product.price * 100,
                            product.discountPercent
                        )
                        const displayPrice = discountedPaise / 100

                        return (
                            <div
                                key={product.id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:shadow-lg hover:border-primary-200"
                            >
                                {/* Image area */}
                                <div className="relative aspect-square w-full overflow-hidden bg-neutral-50">
                                    {/* Best Sell badge */}
                                    <div className="absolute left-2 top-2 z-10 rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white sm:px-2.5 sm:text-xs">
                                        Best Sell
                                    </div>
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105 sm:p-5"
                                            sizes="(max-width: 640px) 45vw, 25vw"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-primary-50 to-neutral-100" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex flex-1 flex-col p-3 sm:p-4">
                                    <p className="mb-0.5 text-[10px] font-medium text-neutral-400 sm:text-xs">
                                        Millet NJoy
                                    </p>
                                    <p className="mb-1 text-sm font-semibold leading-snug text-neutral-900 line-clamp-2 sm:text-base">
                                        {product.name}
                                    </p>
                                    <p className="mb-3 mt-auto text-base font-bold text-primary-600 sm:text-lg">
                                        ₹{displayPrice.toFixed(2)}
                                    </p>

                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={addingId === product.id || !product.inStock}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-primary-700 active:scale-95 disabled:opacity-60 sm:text-sm"
                                    >
                                        {addingId === product.id ? (
                                            <>
                                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 9m2-9h10m0 0l2 9" />
                                                </svg>
                                                Add To Cart
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
