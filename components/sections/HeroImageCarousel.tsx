'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HERO_IMAGES = [
  {
    src: '/hero_nano_banana_1_1767888234224.png',
    alt: 'Vibrant organic nano bananas with premium millet products',
  },
  {
    src: '/hero_nano_banana_2_1767888303312.png',
    alt: 'Healthy millet malt bowl garnished with fresh nano bananas',
  },
  {
    src: '/hero_nano_banana_3_1767888330454.png',
    alt: 'Traditional South Indian millet snacks and sweet nano bananas',
  },
]

const TRANSITION_DURATION = 5000 // 5 seconds

export default function HeroImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Auto-transition logic
  useEffect(() => {
    if (isReducedMotion) {
      // Don't auto-transition if user prefers reduced motion
      return
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, TRANSITION_DURATION)

    return () => clearInterval(interval)
  }, [isReducedMotion])

  return (
    <section
      className="relative mx-auto mb-0 mt-6 w-full px-0 sm:mt-8"
      aria-label="Hero image carousel"
    >
      <div
        className="relative"
        style={{
          height: 'clamp(50vh, 65vh, 75vh)',
          minHeight: '250px',
          overflow: 'hidden',
        }}
      >
        {HERO_IMAGES.map((image, index) => {
          const isActive = index === currentIndex

          return (
            <Link
              key={image.src}
              href="/shop"
              className="absolute inset-0 transition-all duration-[3000ms] ease-in-out cursor-pointer"
              style={{
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 1 : 0,
                filter: isActive ? 'blur(0px)' : 'blur(4px)',
                transform: isActive ? 'scale(1)' : 'scale(1.05)',
              }}
              aria-hidden={!isActive}
              aria-label="Browse our malt and traditional products"
            >
              <div
                className="absolute inset-0"
                style={{
                  filter: 'brightness(1.05) contrast(1.1) saturate(1.2)',
                }}
              >
                <Image
                  src={image.src}
                  alt={isActive ? image.alt : ''}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                />
              </div>
              {/* Green gradient overlay at top edge - fades outward */}
              <div
                className="absolute inset-x-0 top-0 pointer-events-none"
                style={{
                  height: '10%',
                  background: 'linear-gradient(to bottom, rgba(246,251,247,1) 0%, rgba(246,251,247,0.8) 30%, rgba(246,251,247,0.4) 70%, transparent 100%)',
                }}
              />
              {/* White gradient overlay at bottom edge - fades outward */}
              <div
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{
                  height: '10%',
                  background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.4) 70%, transparent 100%)',
                }}
              />
              {/* White gradient overlay at left edge - fades outward */}
              <div
                className="absolute inset-y-0 left-0 pointer-events-none"
                style={{
                  width: '6%',
                  background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                }}
              />
              {/* White gradient overlay at right edge - fades outward */}
              <div
                className="absolute inset-y-0 right-0 pointer-events-none"
                style={{
                  width: '6%',
                  background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                }}
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

