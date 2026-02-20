'use client'

import { useState, useEffect } from 'react'

interface Product {
    id: string
    name: string
}

interface ComboFormProps {
    onSave: () => void
    onCancel: () => void
    editCombo?: {
        id: string
        name: string
        description: string
        imageUrl: string
        price: number
        productIds: string[]
    } | null
    accessToken: string | null
}

export default function AdminComboForm({ onSave, onCancel, editCombo, accessToken }: ComboFormProps) {
    const [name, setName] = useState(editCombo?.name || '')
    const [description, setDescription] = useState(editCombo?.description || '')
    const [imageUrl, setImageUrl] = useState(editCombo?.imageUrl || '')
    const [price, setPrice] = useState(editCombo?.price?.toString() || '')
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>(editCombo?.productIds || [])
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [productsLoading, setProductsLoading] = useState(true)

    // Fetch products for multi-select
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products?includeOutOfStock=true', { cache: 'no-store' })
                const data = await res.json()
                const mapped = (data.products || []).map((p: { product_id: string; title: string }) => ({
                    id: p.product_id,
                    name: p.title,
                }))
                setProducts(mapped)
            } catch {
                console.error('Failed to load products')
            } finally {
                setProductsLoading(false)
            }
        }
        fetchProducts()
    }, [])

    const toggleProduct = (productId: string) => {
        setSelectedProductIds((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId)
            }
            if (prev.length >= 3) {
                setError('You can select a maximum of 3 products')
                return prev
            }
            setError('')
            return [...prev, productId]
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (selectedProductIds.length < 2) {
            setError('Please select at least 2 products')
            return
        }
        if (selectedProductIds.length > 3) {
            setError('Maximum 3 products allowed')
            return
        }
        if (!name.trim() || !imageUrl.trim() || !price) {
            setError('Name, image URL and price are required')
            return
        }

        const priceNum = parseFloat(price)
        if (isNaN(priceNum) || priceNum <= 0) {
            setError('Please enter a valid price')
            return
        }

        setIsLoading(true)
        try {
            const url = editCombo ? `/api/admin/combos/${editCombo.id}` : '/api/admin/combos'
            const method = editCombo ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    imageUrl: imageUrl.trim(),
                    price: priceNum,
                    productIds: selectedProductIds,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'Failed to save combo')
            }

            onSave()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-neutral-900">
                {editCombo ? 'Edit Combo' : 'New Combo Deal'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Combo Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Nano Banana Family Pack"
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Short description of the combo offer..."
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                </div>

                {/* Image URL */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Combo Image URL *</label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://raw.githubusercontent.com/..."
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="Preview"
                            className="mt-2 h-24 w-24 rounded-lg object-cover border border-neutral-200"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                    )}
                </div>

                {/* Price */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Combo Price (₹) *</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">₹</span>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min="1"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full rounded-lg border border-neutral-300 pl-7 pr-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        />
                    </div>
                </div>

                {/* Product Multi-select */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                        Select Products * <span className="text-neutral-400 font-normal">(2 or 3)</span>
                    </label>
                    <p className="mb-2 text-xs text-neutral-500">
                        {selectedProductIds.length}/3 selected
                    </p>

                    {productsLoading ? (
                        <p className="text-sm text-neutral-500">Loading products...</p>
                    ) : (
                        <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200 divide-y divide-neutral-100">
                            {products.map((product) => {
                                const isSelected = selectedProductIds.includes(product.id)
                                const isDisabled = !isSelected && selectedProductIds.length >= 3

                                return (
                                    <label
                                        key={product.id}
                                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                      ${isSelected ? 'bg-primary-50' : isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-50'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={isDisabled}
                                            onChange={() => toggleProduct(product.id)}
                                            className="h-4 w-4 accent-primary-600 rounded"
                                        />
                                        <span className="text-sm text-neutral-800">{product.name}</span>
                                    </label>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : editCombo ? 'Update Combo' : 'Create Combo'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
