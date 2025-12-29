'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  const slugOrId = product.slug ?? product.id
  const isOutOfStock = (product.stock ?? 0) === 0

  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 ease-smooth ${
      isOutOfStock 
        ? 'opacity-50' 
        : 'hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-900/5'
    }`}>
      <Link
        href={`/shop/${slugOrId}`}
        aria-label={`View details for ${product.name}`}
        className="flex flex-1 flex-col"
        draggable="false"
      >
        {/* Product Image */}
        <div className="relative flex min-h-[200px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50/30 via-neutral-50 to-primary-100/20 sm:min-h-[240px] select-none">
          {!imageError && product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={600}
              className={`product-image h-auto w-full max-w-full object-contain transition-transform duration-300 ${
                isOutOfStock 
                  ? 'grayscale' 
                  : 'group-hover:scale-[1.02]'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              onError={() => setImageError(true)}
            />
          ) : (
            // Fallback placeholder if image fails to load
            <div className="flex h-full min-h-[200px] items-center justify-center sm:min-h-[240px]">
              <div className="h-16 w-16 rounded-full bg-white/80 shadow-sm backdrop-blur-sm" />
            </div>
          )}
          {/* Out of Stock badge on image */}
          {isOutOfStock && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center rounded-full bg-neutral-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-neutral-600/30 sm:px-3.5 sm:py-2 sm:text-sm">
                Out of Stock
              </span>
            </div>
          )}
          {/* Discount badge on image (only if not out of stock) */}
          {!isOutOfStock && product.discountPercent != null && product.discountPercent > 0 && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 sm:px-3.5 sm:py-2 sm:text-sm">
                {product.discountPercent}% OFF
              </span>
            </div>
          )}
          {/* Subtle overlay on hover (only if in stock) */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-primary-600/0 transition-colors duration-300 group-hover:bg-primary-600/5" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {/* Category badge */}
          <div className="mb-3">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
              isOutOfStock 
                ? 'bg-neutral-100 text-neutral-400' 
                : 'bg-primary-50 text-primary-700'
            }`}>
              {product.category}
            </span>
          </div>

          {/* Product name */}
          <h3 className={`mb-2 text-xl font-semibold leading-tight transition-colors duration-200 ${
            isOutOfStock 
              ? 'text-neutral-400' 
              : 'text-neutral-900 group-hover:text-primary-700'
          }`}>
            {product.name}
          </h3>

          {/* Description */}
          <p className={`mb-5 flex-1 text-sm leading-relaxed line-clamp-3 ${
            isOutOfStock ? 'text-neutral-400' : 'text-neutral-600'
          }`}>
            {product.description}
          </p>
          
          {/* Low stock indicator */}
          {product.inStock && product.stock !== undefined && product.stock > 0 && product.stock < 20 && (
            <div className="mt-auto">
              <p className="text-xs font-medium text-amber-600">
                Only {product.stock} left in stock
              </p>
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

