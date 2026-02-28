import AnimatedPage from '@/components/AnimatedPage'
import FloatingMillets from '@/components/sections/FloatingMillets'
import MarqueeBanner from '@/components/ui/MarqueeBanner'
import HomeHeroSection from '@/components/sections/HomeHeroSection'
import FeaturedProductsSection from '@/components/sections/FeaturedProductsSection'
import PopularProductsSection from '@/components/sections/PopularProductsSection'
import AncientGrainsSection from '@/components/sections/AncientGrainsSection'
import WhyChooseUsSection from '@/components/sections/WhyChooseUsSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import ComboDealsSection from '@/components/sections/ComboDealsSection'
import TrustSection from '@/components/sections/TrustSection'

export default function Home() {
  return (
    <AnimatedPage>
      {/* Background floating millets */}
      <FloatingMillets />

      <div className="relative space-y-0" style={{ zIndex: 1 }}>
        {/* Marquee flush with header */}
        <div className="relative w-screen left-[50%] right-[50%] -ml-[50vw] mr-[-50vw] mt-0">
          <MarqueeBanner />
        </div>

        {/* 1. Hero — split banner */}
        <HomeHeroSection />

        {/* 2. Featured — Nutritious malt & millet products */}
        <FeaturedProductsSection />

        {/* 3. Popular Products — 4-column grid with Add to Cart */}
        <PopularProductsSection />

        {/* 4. Ancient Grains banner */}
        <AncientGrainsSection />

        {/* Everything below unchanged */}
        <WhyChooseUsSection />
        <ComboDealsSection />
        <TestimonialsSection />
        <TrustSection />
      </div>
    </AnimatedPage>
  )
}
