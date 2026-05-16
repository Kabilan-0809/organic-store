'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartContext'
import { motion } from 'framer-motion'

interface CartSlugPageProps {
  params: {
    slug: string
  }
}

export default function AddToCartPage({ params }: CartSlugPageProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const hasAdded = useRef(false)

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasAdded.current) return
    hasAdded.current = true

    const processAddToCart = async () => {
      try {
        // Decode the slug to handle encoded characters (like : or %3A)
        const decodedSlug = decodeURIComponent(params.slug)
        
        // 1. Parse slug (format: PRODUCT_ID:QUANTITY or PRODUCT_ID-VARIANT_ID:QUANTITY)
        const parts = decodedSlug.split(':')
        const fullId = parts[0]
        const quantity = parseInt(parts[1] || '1', 10) || 1

        if (!fullId) {
          throw new Error('Invalid product ID')
        }

        // Handle composite IDs (cuid-uuid)
        let variantId: string | undefined = undefined

        if (fullId.includes('-') && fullId.length > 25) {
          const idParts = fullId.split('-')
          if (idParts.length >= 2) {
            variantId = idParts.slice(1).join('-')
          }
        }

        // 2. Fetch product details
        const response = await fetch(`/api/products/${fullId}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Product not found')
        }

        const { product } = await response.json()

        if (!product) {
          throw new Error('Product not found')
        }

        // 3. Add to cart
        // addItem handles both guest and authenticated carts
        await addItem(product, quantity, variantId)

        // 4. Success - Redirect to checkout
        setStatus('success')
        
        // Small delay to show success state (premium feel)
        setTimeout(() => {
          router.push('/checkout')
        }, 800)

      } catch (err: any) {
        console.error('[Add To Cart Page] Error:', err)
        setStatus('error')
        setError(err.message || 'Failed to add item to cart')
      }
    }

    processAddToCart()
  }, [params.slug, addItem, router])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative mx-auto h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary-600 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Preparing your order</h1>
              <p className="mt-2 text-neutral-500">Adding selected items to your cart...</p>
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Added to Cart!</h1>
              <p className="mt-2 text-neutral-500">Redirecting you to checkout...</p>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Oops!</h1>
              <p className="mt-2 text-neutral-500">{error || 'Something went wrong'}</p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => router.push('/shop')}
                className="inline-flex items-center justify-center rounded-full bg-primary-700 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-800"
              >
                Back to Shop
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
