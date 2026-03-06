'use client'

import { useState } from 'react'
import { useCart } from '@/components/cart/CartContext'

interface ComboBuyButtonProps {
    products: any[]
    children: React.ReactNode
}

export default function ComboBuyButton({ products, children }: ComboBuyButtonProps) {
    const { addItem, open } = useCart()
    const [isAdding, setIsAdding] = useState(false)

    const handleBuyNow = async () => {
        setIsAdding(true)
        try {
            // Blast the server with parallel requests instead of sequential loops
            // This drops the Cart Add lag by an order of magnitude (from ~30s to ~2s)
            await Promise.all(products.map(product => addItem(product, 1)))

            // Open the cart to show the newly added items
            open()
        } catch (error) {
            console.error('Failed to add combo products to cart:', error)
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <button
            onClick={handleBuyNow}
            disabled={isAdding || products.length === 0}
            className="group relative block w-full text-left focus:outline-none disabled:opacity-80 disabled:cursor-wait transition-transform duration-300 hover:scale-[1.01] hover:brightness-105 hover:shadow-2xl rounded-[1.5rem] sm:rounded-[3rem]"
            aria-label="Click image to Add Combo to Cart"
        >
            {children}

            {/* Loading Overlay */}
            {isAdding && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-[1.5rem] sm:rounded-[3rem]">
                    <div className="flex flex-col items-center justify-center space-y-3 px-6 py-4 bg-white/90 rounded-2xl shadow-xl">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
                        <p className="text-sm sm:text-base font-bold text-primary-800">Adding Combo...</p>
                    </div>
                </div>
            )}
        </button>
    )
}
