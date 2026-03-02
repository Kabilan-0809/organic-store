import Image from 'next/image'
import Link from 'next/link'

export default function FeaturedProductsSection() {
  return (
    <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-12 lg:gap-16">

          {/* Left — text content */}
          <div className="flex-1">
            <span className="mb-4 inline-block rounded-full border border-neutral-300 bg-neutral-900 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
              Premium Malt &amp; Traditional Foods
            </span>
            <h2 className="mb-4 font-quicksand text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              Nutritious malt and millet products
            </h2>
            <p className="mb-6 font-lato max-w-md text-base leading-relaxed text-neutral-600">
              Carefully crafted malt, saadha podi, and other traditional millet
              products. Quality ingredients, authentic preparation, and delivered with
              complete transparency. Food you can trust.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary-700 hover:shadow-lg active:scale-95"
            >
              Shop All Products
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right — two product images side by side */}
          <div
            className="relative flex-shrink-0 w-full sm:w-[360px] lg:w-[460px] rounded-2xl sm:rounded-3xl overflow-hidden flex items-end justify-center gap-3 px-4 pt-6 pb-0"
            style={{ backgroundColor: '#F5EFE6', minHeight: '260px' }}
          >
            {/* Left image — slightly lower (sits at bottom) */}
            <div className="relative w-[47%] flex-shrink-0 self-end">
              <Image
                src="/New_Millet_Images/IMG_1543.webp"
                alt="Nuts Boost millet product"
                width={220}
                height={280}
                className="w-full h-auto object-contain drop-shadow-md"
                sizes="(max-width: 640px) 44vw, 220px"
              />
            </div>
            {/* Right image — slightly higher (sits a bit above bottom) */}
            <div className="relative w-[47%] flex-shrink-0 self-end mb-4">
              <Image
                src="/New_Millet_Images/IMG_1548.webp"
                alt="Choco Ragi Millet product"
                width={220}
                height={280}
                className="w-full h-auto object-contain drop-shadow-md"
                sizes="(max-width: 640px) 44vw, 220px"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
