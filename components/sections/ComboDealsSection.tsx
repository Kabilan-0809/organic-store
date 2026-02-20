'use client'

import { useEffect, useState } from 'react'

interface ComboProduct {
    id: string
    productId: string
    product: {
        id: string
        name: string
        imageUrl: string
        price: number
    }
}

interface Combo {
    id: string
    name: string
    description: string
    imageUrl: string
    price: number
    items: ComboProduct[]
}

export default function ComboDealsSection() {
    const [combos, setCombos] = useState<Combo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [addingId, setAddingId] = useState<string | null>(null)
    const [addedId, setAddedId] = useState<string | null>(null)

    useEffect(() => {
        const fetchCombos = async () => {
            try {
                const res = await fetch('/api/combos', { cache: 'no-store' })
                if (!res.ok) return
                const data = await res.json()
                setCombos(data.combos || [])
            } catch {
                // Silent fail — section just won't show
            } finally {
                setIsLoading(false)
            }
        }
        fetchCombos()
    }, [])

    const handleAddCombo = async (combo: Combo) => {
        setAddingId(combo.id)
        try {
            const res = await fetch('/api/cart/combo-items', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comboId: combo.id }),
            })

            if (res.ok) {
                setAddedId(combo.id)
                // Trigger cart reload so CartDrawer shows the new combo item
                window.dispatchEvent(new CustomEvent('cart:reload'))
                setTimeout(() => setAddedId(null), 2000)
            }
        } catch {
            console.error('Failed to add combo to cart')
        } finally {
            setAddingId(null)
        }
    }

    // Don't render section if loading or no combos
    if (isLoading || combos.length === 0) return null

    return (
        <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <span className="mb-3 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 border border-amber-200">
                        🎁 Special Bundles
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                        Combo Deals
                    </h2>
                    <p className="mt-3 text-neutral-500">
                        Save more when you bundle your favourites together
                    </p>
                </div>

                {/* Combo Cards */}
                <div className={`grid gap-8 ${combos.length === 1
                    ? 'max-w-md mx-auto'
                    : combos.length === 2
                        ? 'sm:grid-cols-2 max-w-3xl mx-auto'
                        : 'sm:grid-cols-2 lg:grid-cols-3'
                    }`}>
                    {combos.map((combo) => (
                        <div
                            key={combo.id}
                            className="group relative overflow-hidden rounded-3xl bg-white border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                        >
                            {/* Combo Image */}
                            <div className="relative h-56 overflow-hidden bg-neutral-100">
                                <img
                                    src={combo.imageUrl}
                                    alt={combo.name}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Combo'
                                    }}
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                                {/* Combo badge */}
                                <div className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow">
                                    COMBO DEAL
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">
                                    {combo.name}
                                </h3>
                                {combo.description && (
                                    <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{combo.description}</p>
                                )}

                                {/* Included products */}
                                <div className="mt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                        Includes
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {combo.items.map((item) => (
                                            <span
                                                key={item.id}
                                                className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700"
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                                                {item.product?.name || 'Product'}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Price + CTA */}
                                <div className="mt-5 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-2xl font-extrabold text-primary-600">
                                            ₹{combo.price.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-neutral-400">Special bundle price</p>
                                    </div>

                                    <button
                                        onClick={() => handleAddCombo(combo)}
                                        disabled={addingId === combo.id}
                                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 disabled:opacity-60
                      ${addedId === combo.id
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-primary-600 hover:bg-primary-700 hover:shadow-md'
                                            }`}
                                    >
                                        {addingId === combo.id ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Adding...
                                            </>
                                        ) : addedId === combo.id ? (
                                            <>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Added!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 9m2-9h10m0 0l2 9" />
                                                </svg>
                                                Add to Cart
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
