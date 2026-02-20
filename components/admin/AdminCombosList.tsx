'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminComboForm from './AdminComboForm'

interface ComboProduct {
    id: string
    productId: string
    product: { id: string; name: string }
}

interface Combo {
    id: string
    name: string
    description: string
    imageUrl: string
    price: number
    isActive: boolean
    createdAt: string
    items: ComboProduct[]
}

interface AdminCombosListProps {
    accessToken: string | null
}

export default function AdminCombosList({ accessToken }: AdminCombosListProps) {
    const [combos, setCombos] = useState<Combo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editCombo, setEditCombo] = useState<Combo | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [error, setError] = useState('')

    const fetchCombos = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/combos', {
                credentials: 'include',
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            })
            const data = await res.json()
            setCombos(data.combos || [])
        } catch {
            setError('Failed to load combos')
        } finally {
            setIsLoading(false)
        }
    }, [accessToken])

    useEffect(() => {
        fetchCombos()
    }, [fetchCombos])

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this combo? This cannot be undone.')) return
        setDeletingId(id)
        try {
            await fetch(`/api/admin/combos/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            })
            setCombos((prev) => prev.filter((c) => c.id !== id))
        } catch {
            setError('Failed to delete combo')
        } finally {
            setDeletingId(null)
        }
    }

    const handleToggleActive = async (combo: Combo) => {
        setTogglingId(combo.id)
        try {
            const res = await fetch(`/api/admin/combos/${combo.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({ isActive: !combo.isActive }),
            })
            if (res.ok) {
                setCombos((prev) =>
                    prev.map((c) => (c.id === combo.id ? { ...c, isActive: !c.isActive } : c))
                )
            }
        } catch {
            setError('Failed to update combo')
        } finally {
            setTogglingId(null)
        }
    }

    const handleSaved = () => {
        setShowForm(false)
        setEditCombo(null)
        fetchCombos()
    }

    const startEdit = (combo: Combo) => {
        setEditCombo(combo)
        setShowForm(true)
    }

    if (showForm) {
        return (
            <AdminComboForm
                onSave={handleSaved}
                onCancel={() => { setShowForm(false); setEditCombo(null) }}
                editCombo={editCombo ? {
                    id: editCombo.id,
                    name: editCombo.name,
                    description: editCombo.description,
                    imageUrl: editCombo.imageUrl,
                    price: editCombo.price,
                    productIds: editCombo.items.map((i) => i.productId),
                } : null}
                accessToken={accessToken}
            />
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Combo Deals</h2>
                    <p className="text-sm text-neutral-500">Bundle 2–3 products at a special price</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditCombo(null) }}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                >
                    <span>+</span> New Combo
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600" />
                </div>
            ) : combos.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-16 text-center">
                    <p className="text-neutral-500">No combos yet. Create your first combo deal!</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                        + Create Combo
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {combos.map((combo) => (
                        <div
                            key={combo.id}
                            className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-opacity ${combo.isActive ? 'border-neutral-200' : 'border-neutral-200 opacity-60'
                                }`}
                        >
                            {/* Image */}
                            <div className="relative h-40 bg-neutral-100">
                                <img
                                    src={combo.imageUrl}
                                    alt={combo.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=No+Image'
                                    }}
                                />
                                {/* Active badge */}
                                <span
                                    className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium
                    ${combo.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-600'}`}
                                >
                                    {combo.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="p-4">
                                <h3 className="font-semibold text-neutral-900">{combo.name}</h3>
                                {combo.description && (
                                    <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">{combo.description}</p>
                                )}
                                <p className="mt-2 text-lg font-bold text-primary-600">₹{combo.price.toFixed(2)}</p>

                                {/* Products */}
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {combo.items.map((item) => (
                                        <span
                                            key={item.id}
                                            className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-700"
                                        >
                                            {item.product?.name || 'Unknown'}
                                        </span>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => startEdit(combo)}
                                        className="flex-1 rounded-lg border border-neutral-300 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(combo)}
                                        disabled={togglingId === combo.id}
                                        className="flex-1 rounded-lg border border-neutral-300 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                                    >
                                        {togglingId === combo.id ? '...' : combo.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(combo.id)}
                                        disabled={deletingId === combo.id}
                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        {deletingId === combo.id ? '...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
