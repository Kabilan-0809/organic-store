'use client'

import AnimatedPage from '@/components/AnimatedPage'
import { useCart } from '@/components/cart/CartContext'
import type { Product } from '@/types'
import type { ProductReview } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { calculateDiscountedPrice } from '@/lib/pricing'
import { getCinematicImage, getMilletImages } from '@/lib/product-images'
import { hasVariants } from '@/lib/products'

// ─── Star renderer ─────────────────────────────────────────────────────────────
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${sz} ${star <= rating ? 'text-amber-400' : 'text-neutral-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ─── Interactive star picker ───────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <svg
            className={`w-7 h-7 transition-colors ${star <= (hovered || value) ? 'text-amber-400' : 'text-neutral-300'}`}
            fill="currentColor" viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

// ─── Per-product unique benefits copy ─────────────────────────────────────────
const PRODUCT_BENEFITS: Record<string, string> = {
  'tangy tomato': 'Multi Millet Tangy Tomato packs the bold zing of ripe tomatoes into every bite, backed by the wholesome power of multi millets. Rich in dietary fibre and plant-based nutrients, it supports healthy digestion, boosts energy levels, and keeps you feeling full longer — all without a drop of refined oil or artificial flavouring. A guilt-free crunch that loves your body back.',
  'peanut balls': 'Foxtail Peanut Balls bring together the protein-rich goodness of roasted peanuts and the light, digestible fibre of foxtail millet in one satisfying bite. They promote sustained energy, aid in muscle recovery, and provide healthy fats that support brain function. Free from artificial additives and deep-frying, these are the kind of snacks you can feel genuinely good about reaching for.',
  'almond elephant': 'Barnyard Almond Elephant combines the crunch of real almonds with the earthy richness of barnyard millet — a grain traditionally known for its high iron and calcium content. This snack supports bone health, boosts immunity, and provides slow-release energy that keeps mid-day slumps at bay. Each handful is a small step toward smarter, more mindful snacking.',
  'achari masala': 'Multi Millet Achari Masala Stick delivers the bold, tangy punch of traditional pickle spices wrapped around the nutritious core of multi millets. The millet base provides a steady supply of complex carbohydrates and micronutrients, while the achari spice blend — rich in antioxidants — supports gut health and stimulates digestion. Bold flavour, real benefits.',
  'achari stick': 'Multi Millet Achari Masala Stick delivers the bold, tangy punch of traditional pickle spices wrapped around the nutritious core of multi millets. The millet base provides a steady supply of complex carbohydrates and micronutrients, while the achari spice blend — rich in antioxidants — supports gut health and stimulates digestion. Bold flavour, real benefits.',
  'chilli chatag': 'Multi Millet Chilli Chatag turns up the heat with fiery chilli flavours and the wholesome crunch of multi millets. Chilli is naturally rich in capsaicin, known to boost metabolism and support cardiovascular health, while millets provide fibre and essential minerals. This snack satisfies cravings, fuels your metabolism, and keeps afternoon hunger firmly in check.',
  'coconut hearts': 'Finger Millet Coconut Hearts pair the calcium-dense power of ragi with the natural sweetness and healthy fats of coconut. Finger millet is one of the richest plant-based sources of calcium, making this snack excellent for bone and dental health. The coconut adds medium-chain fatty acids that support energy metabolism. A snack that is as nourishing as it is delicious.',
  'choco coated': 'Multi Millet Choco Coated Balls wrap the wholesome goodness of multi millets in a light chocolate coating that satisfies sweet cravings without the guilt. The millet base fuels steady energy and aids digestion, while cocoa brings mood-lifting antioxidants and a rich flavour that feels indulgent. Proof that healthy and delicious can always coexist.',
  'choco monkey': 'Multi Millet Choco Coated Balls wrap the wholesome goodness of multi millets in a light chocolate coating that satisfies sweet cravings without the guilt. The millet base fuels steady energy and aids digestion, while cocoa brings mood-lifting antioxidants and a rich flavour that feels indulgent. Proof that healthy and delicious can always coexist.',
  'red banana malt': 'Red Banana Malt harnesses the unique nutritional profile of red bananas — naturally higher in iron, beta-carotene, and Vitamin C than their yellow counterparts. Mixed as a warm or cold drink, it supports immunity, improves blood health, aids digestion, and provides calm sustained energy without caffeine jitters. A daily ritual your body will thank you for.',
  'abc nutri mix': 'ABC Nutri Mix is a powerhouse blend of Almond, Banana, and Carrot — three ingredients celebrated in both Ayurvedic and modern nutrition. Together they deliver a rich spectrum of Vitamins A, B, C and E, healthy fats, natural sugars, and dietary fibre. Ideal for growing children and active adults, this mix nourishes deeply, supports brain development, and strengthens overall immunity.',
  'mudavaattu': 'Mudavaattu Kizhangu Podi is a time-honoured South Indian ingredient known for its powerful anti-inflammatory and digestive properties. Rich in natural starches, fibre, and trace minerals, it supports joint health, boosts gut flora, and acts as a natural cooling agent for the body. A deeply rooted remedy that modern families can enjoy every day.',
}

function getBenefitsText(product: Product): string {
  const name = product.name.toLowerCase()
  for (const [key, text] of Object.entries(PRODUCT_BENEFITS)) {
    if (name.includes(key)) return text
  }
  return product.description
}

// ─── Benefits tab content ──────────────────────────────────────────────────────
function BenefitsTab({ product }: { product: Product }) {
  return (
    <div className="py-6">
      <p className="text-base leading-relaxed text-neutral-700 sm:text-lg sm:leading-loose">
        {getBenefitsText(product)}
      </p>
    </div>
  )
}

// ─── Reviews tab ───────────────────────────────────────────────────────────────
function ReviewsTab({ productId, productName }: { productId: string; productName: string }) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [formErrors, setFormErrors] = useState<{ name?: string; rating?: string; review?: string }>({})

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      const data = await res.json()
      setReviews(data.reviews ?? [])
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // ── Stats computed from real reviews ──
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0
  const roundedAvg = Math.round(avgRating * 10) / 10

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: totalReviews > 0
      ? Math.round((reviews.filter((r) => r.rating === star).length / totalReviews) * 100)
      : 0,
  }))

  // ── Form submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: typeof formErrors = {}
    if (!name.trim()) errors.name = 'Name is required'
    if (rating === 0) errors.rating = 'Please select a rating'
    if (!reviewText.trim()) errors.review = 'Review text is required'
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }

    setFormErrors({})
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, name: name.trim(), rating, review: reviewText.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')

      // Prepend new review locally for instant feedback
      setReviews((prev) => [data.review, ...prev])
      setSubmitSuccess(true)
      setName('')
      setRating(0)
      setReviewText('')
      setTimeout(() => setSubmitSuccess(false), 4000)
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="py-6 space-y-8">

      {/* Top section: Summary + Form side-by-side on desktop */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">

        {/* ── Rating summary ── */}
        <div className="w-full lg:w-72 flex-shrink-0 rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
          <p className="mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wide">Customer Reviews</p>

          {totalReviews === 0 ? (
            <p className="text-sm text-neutral-400">No reviews yet.</p>
          ) : (
            <>
              <div className="flex items-end gap-3 mb-1">
                <span className="text-5xl font-bold text-neutral-900">{roundedAvg.toFixed(1)}</span>
                <div className="pb-1">
                  <StarRating rating={Math.round(avgRating)} size="lg" />
                  <p className="mt-1 text-xs text-neutral-500">({totalReviews} Review{totalReviews !== 1 ? 's' : ''})</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {starCounts.map(({ star, pct }) => (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-10 text-right text-neutral-600">{star} Stars</span>
                    <div className="flex-1 overflow-hidden rounded-full bg-neutral-200 h-2">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-neutral-400">{pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Add review form ── */}
        <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Add your review</h3>
          <p className="text-xs text-neutral-500 mb-4">Required fields are marked <span className="text-red-500">*</span></p>

          {submitSuccess && (
            <div className="mb-4 rounded-xl bg-primary-50 border border-primary-200 px-4 py-3 text-sm text-primary-700 font-medium">
              ✅ Review submitted successfully. Thank you!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star picker */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Your rating <span className="text-red-500">*</span>
              </label>
              <StarPicker value={rating} onChange={(v) => { setRating(v); setFormErrors(f => ({ ...f, rating: undefined })) }} />
              {formErrors.rating && <p className="mt-1 text-xs text-red-500">{formErrors.rating}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setFormErrors(f => ({ ...f, name: undefined })) }}
                placeholder="Your name"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-200"
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
            </div>

            {/* Review text */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Review <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => { setReviewText(e.target.value); setFormErrors(f => ({ ...f, review: undefined })) }}
                placeholder="Write your review here..."
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-200 resize-none"
              />
              {formErrors.review && <p className="mt-1 text-xs text-red-500">{formErrors.review}</p>}
            </div>

            {submitError && (
              <p className="text-xs text-red-600">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-800 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting…
                </>
              ) : 'Submit'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Individual reviews list ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <svg className="w-6 h-6 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 py-10 text-center">
            <p className="text-sm font-medium text-neutral-500">No reviews yet.</p>
            <p className="mt-1 text-xs text-neutral-400">Be the first to review &ldquo;{productName}&rdquo;!</p>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-neutral-700">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''} for &ldquo;{productName}&rdquo;
            </h3>
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                <div className="flex-shrink-0">
                  <Image
                    src="/dummy-avatar.svg"
                    alt={review.name}
                    width={44}
                    height={44}
                    className="rounded-full bg-neutral-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 mb-1">{review.name}</p>
                  <StarRating rating={review.rating} size="sm" />
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">{review.review}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Tab bar ───────────────────────────────────────────────────────────────────
function ProductTabs({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<'benefits' | 'reviews'>('benefits')

  return (
    <div className="mt-10 sm:mt-14">
      <div className="flex border-b border-neutral-200">
        {(['benefits', 'reviews'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-3 text-sm font-semibold capitalize transition-colors duration-200 focus:outline-none ${activeTab === tab ? 'text-primary-700' : 'text-neutral-500 hover:text-neutral-800'
              }`}
          >
            {tab === 'benefits' ? 'Benefits' : 'Reviews'}
            {activeTab === tab && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'benefits' ? (
          <BenefitsTab product={product} />
        ) : (
          <ReviewsTab productId={product.id} productName={product.name} />
        )}
      </motion.div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
interface ProductDetailPageContentProps {
  product: Product
}

/**
 * We use a dedicated page (instead of a modal) for product detail because:
 * - It works better for deep linking, SEO, and sharing URLs.
 * - It provides a more focused experience on mobile where modals can feel cramped.
 * - It keeps routing simple while still allowing smooth Framer Motion transitions.
 */
export default function ProductDetailPageContent({
  product,
}: ProductDetailPageContentProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const [stockError, setStockError] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const { addItem } = useCart()

  // getCinematicImage prioritizes the local mapping (millet or older cinematic), falling back to product.image
  const mainImage = getCinematicImage(product)

  let images = [mainImage]

  // Check if it's a Millet product with the new dedicated 3 images
  const milletImages = getMilletImages(product.name)
  if (milletImages) {
    // If it's a millet item, completely override the gallery with the 3 dedicated images
    images = milletImages.gallery
  } else {
    // Standard fallback behavior for non-millet items
    const addlImages = product.images ? product.images.filter((img) => img !== product.image && img !== mainImage) : []
    images = [mainImage, ...addlImages]
  }

  const usesVariants = hasVariants(product.category)
  const variants = product.variants || []

  // For variant-based products (Malt, saadha podi), use selected variant stock; otherwise use product stock
  const selectedVariant = usesVariants && selectedVariantId
    ? variants.find(v => v.id === selectedVariantId)
    : null

  const availableStock = selectedVariant
    ? selectedVariant.stock
    : (product.stock ?? 0)

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : product.price

  const isLowStock = availableStock > 0 && availableStock < 20
  const maxQuantity = availableStock > 0 ? Math.min(availableStock, 99) : 0
  const canAddToCart = !usesVariants || (usesVariants && selectedVariantId && availableStock > 0)

  const increment = () => {
    if (quantity < maxQuantity) {
      setQuantity((q) => Math.min(q + 1, maxQuantity))
      setStockError(null)
    } else {
      setStockError(`Only ${availableStock} available in stock`)
    }
  }
  const decrement = () => {
    setQuantity((q) => Math.max(q - 1, 1))
    setStockError(null)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <AnimatedPage>
      <section className="py-10 sm:py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start">
          {/* Image / media Gallery */}
          <div className="space-y-4">
            <motion.div
              className="relative product-detail-image-container group rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200 aspect-square overflow-hidden"
              initial={{ opacity: 0.9, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {!imageError && images[currentImageIndex] ? (
                <Image
                  src={images[currentImageIndex]}
                  alt={`${product.name} - View ${currentImageIndex + 1}`}
                  fill
                  className="product-detail-image object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-white/70 shadow-sm" />
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-neutral-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                    aria-label="Previous image"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-neutral-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                    aria-label="Next image"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-wrap gap-2 px-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${currentImageIndex === idx ? 'border-primary-600 scale-105 shadow-sm' : 'border-neutral-200 opacity-60 hover:opacity-100'
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                {product.category}
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>
            </div>

            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-neutral-700 sm:text-base">
                {product.description}
              </p>
            </div>

            {/* Size selector for variant-based products (Malt, saadha podi) */}
            {usesVariants && variants.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-neutral-900">
                  Select Size <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {variants.map((variant) => {
                    const discountedPrice = calculateDiscountedPrice(variant.price * 100, product.discountPercent) / 100
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id)
                          setQuantity(1)
                          setStockError(null)
                        }}
                        disabled={variant.stock === 0}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${selectedVariantId === variant.id
                          ? 'bg-primary-600 text-white shadow-md'
                          : variant.stock === 0
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-primary-400 hover:text-primary-700'
                          }`}
                      >
                        <div className="flex flex-col items-center">
                          <span>{variant.sizeGrams}g</span>
                          {variant.stock === 0 ? (
                            <span className="text-xs opacity-75">Out of Stock</span>
                          ) : (
                            <span className="text-xs font-normal">
                              {product.discountPercent && product.discountPercent > 0 ? (
                                <>
                                  <span className="line-through opacity-75">₹{variant.price.toFixed(2)}</span>
                                  <span className="ml-1">₹{discountedPrice.toFixed(2)}</span>
                                </>
                              ) : (
                                `₹${variant.price.toFixed(2)}`
                              )}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                {selectedVariant && (
                  <div className="text-sm text-neutral-600">
                    <span className="font-medium">Price:</span> ₹{selectedVariant.price.toFixed(2)}
                    {selectedVariant.stock > 0 && selectedVariant.stock < 20 && (
                      <span className="ml-4">
                        <span className="font-medium">Stock:</span> {selectedVariant.stock} available
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-3">
                {product.discountPercent && product.discountPercent > 0 ? (
                  <>
                    <span className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                      ₹{(
                        calculateDiscountedPrice(displayPrice * 100, product.discountPercent) / 100
                      ).toFixed(2)}
                    </span>
                    <span className="text-lg text-neutral-400 line-through sm:text-xl">
                      ₹{displayPrice.toFixed(2)}
                    </span>
                    <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
                      {product.discountPercent}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-semibold text-neutral-900 sm:text-4xl">
                    ₹{displayPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {availableStock > 0 ? (
                isLowStock ? (
                  <span className="block text-xs font-medium text-primary-700">
                    Only {availableStock} left in stock
                  </span>
                ) : null
              ) : (
                <span className="block text-xs font-medium text-neutral-500">
                  Currently unavailable
                </span>
              )}
            </div>

            {/* Stock error message */}
            {stockError && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                {stockError}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              {/* Quantity selector */}
              <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-1.5">
                <button
                  type="button"
                  onClick={decrement}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center text-sm font-medium text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={increment}
                  disabled={quantity >= maxQuantity}
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button or Unavailable message */}
              {canAddToCart && availableStock > 0 ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (usesVariants && !selectedVariantId) {
                      setStockError('Please select a size')
                      return
                    }
                    if (availableStock > 0 && quantity <= availableStock) {
                      setStockError(null)
                      // Create product with variant info for addItem
                      const productToAdd = usesVariants && selectedVariant
                        ? { ...product, price: selectedVariant.price, stock: selectedVariant.stock, sizeGrams: selectedVariant.sizeGrams }
                        : product
                      await addItem(productToAdd, quantity, selectedVariantId || undefined)
                    } else {
                      setStockError(`Only ${availableStock} available in stock`)
                    }
                  }}
                  disabled={quantity > availableStock || availableStock === 0 || (usesVariants && !selectedVariantId)}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-800 active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed sm:flex-none"
                >
                  {usesVariants && !selectedVariantId ? 'Select Size' : 'Add to Cart'}
                </button>
              ) : (
                <div className="inline-flex flex-1 items-center justify-center rounded-full bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-500 sm:flex-none">
                  {usesVariants && !selectedVariantId ? 'Select Size to Add to Cart' : 'Currently unavailable'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Benefits & Reviews Tabs */}
        <ProductTabs product={product} />
      </section>
    </AnimatedPage>
  )
}
