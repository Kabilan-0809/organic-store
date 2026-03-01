import Image from 'next/image'

export default function TrustSection() {
  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div
          className="relative flex flex-col items-center overflow-hidden rounded-[2rem] md:flex-row shadow-sm"
          style={{ backgroundColor: '#deefe3' }}
        >
          {/* Text Content */}
          <div className="relative z-10 w-full md:w-3/5 p-8 sm:p-12 lg:p-16">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl lg:text-5xl">
              Quality You Can Trust
            </h2>
            <div className="text-base leading-relaxed text-slate-700 sm:text-lg max-w-2xl">
              <p>
                At Millets N Joy, we believe that what you put into your body
                matters. That&apos;s why we&apos;ve built our entire business around
                crafting the highest quality malt and millet products using authentic methods
                and quality ingredients. Every product is carefully prepared, tested, and
                made to meet our strict quality standards to ensure you get the best taste and
                nutritional value.
              </p>
            </div>
          </div>

          {/* Leaf Image wrapper */}
          <div className="relative h-64 w-full md:absolute md:inset-y-0 md:right-0 md:w-2/5 md:h-full pointer-events-none">
            <Image
              src="/auth-bg-forgot.png"
              alt="Quality leaf background"
              fill
              className="object-cover object-right md:object-left scale-110"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
