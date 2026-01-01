'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HERO_IMAGES = [
  {
    src: '/image0.png',
    alt: 'Millet products showcase - Traditional millets and grains',
  },
  {
    src: '/image1.png',
    alt: 'Millet products showcase - Premium quality millet foods',
  },
  {
    src: '/image2.png',
    alt: 'Millet products showcase - Nutritious and healthy options',
  },
  {
    src: '/image3.png',
    alt: 'Millet products showcase - Authentic millet collection',
  },
  {
    src: '/image4.png',
    alt: 'Millet products showcase - Trusted millet products',
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
      className="relative mx-auto mb-0 mt-8 w-full px-0 sm:mt-12"
      aria-label="Hero image carousel"
    >
      {/* Text above the carousel */}
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
          Tradition You Can Taste
        </h2>
      </div>
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
                  filter: 'brightness(0.98) contrast(1.02) saturate(1.02)',
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

