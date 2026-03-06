'use client'

import { useState } from 'react'
import { useCart } from '@/components/cart/CartContext'

interface ComboBuyButtonProps {
    products: any[]
}

export default function ComboBuyButton({ products }: ComboBuyButtonProps) {
    const { addItem, open } = useCart()
    const [isAdding, setIsAdding] = useState(false)

    const handleBuyNow = async () => {
        setIsAdding(true)
        try {
            // Add all products in the combo to the cart
            for (const product of products) {
                await addItem(product, 1)
            }
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
            className="inline-flex w-fit items-center rounded-full bg-primary-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-primary-600 hover:scale-105 active:scale-95 sm:px-6 sm:py-3 sm:text-base disabled:opacity-75 disabled:cursor-not-allowed"
        >
            {isAdding ? 'Adding...' : 'Buy Now'}
        </button>
    )
}
