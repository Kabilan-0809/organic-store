'use client'

import Image from 'next/image'

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Priya S.',
        city: 'Coimbatore',
        text: 'The millet malt is actually really good! My kids usually picky but they finish their glass every morning without complaining. It feels very fresh compared to the shop-bought ones.',
        rating: 5,
    },
    {
        id: 2,
        name: 'Ramesh K.',
        city: 'Chennai',
        text: 'The Saadha Podi tastes exactly like how my mother makes it. It’s a lifesaver for quick dinners after work. Highly recommend to anyone looking for real traditional taste.',
        rating: 5,
    },
    {
        id: 3,
        name: 'Anitha R.',
        city: 'Madurai',
        text: 'I’ve tried many organic brands, but Millets N Joy is different. The packaging is neat and the quality of the ABC nutri mix is top-notch. You can tell they use genuine ingredients.',
        rating: 5,
    },
    {
        id: 4,
        name: 'Suresh V.',
        city: 'Trichy',
        text: 'Love the health mix. It’s not too sweet and has a very rich, roasted aroma. Delivery was fast and arrived in perfect condition. Will definitely be a regular customer.',
        rating: 5,
    },
    {
        id: 5,
        name: 'Lakshmi P.',
        city: 'Salem',
        text: 'The coconut hearts are my absolute favorite snack now. It’s hard to find healthy treats that actually taste this delicious. My whole family is hooked!',
        rating: 5,
    },
    {
        id: 6,
        name: 'Vijay M.',
        city: 'Erode',
        text: 'Ordering was easy and the products are excellent value for money. The Red Banana Malt is a new favorite in our house. Tastes natural and very satisfying.',
        rating: 5,
    }
]

export default function TestimonialsSection() {
    return (
        <section id="feedback" className="relative py-20 sm:py-28 overflow-hidden bg-neutral-50/50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                        Loved by Families
                    </h2>
                    <p className="mt-4 text-base sm:text-lg text-neutral-600">
                        Don&apos;t just take our word for it. Here&apos;s what our community says about bringing tradition back to their tables.
                    </p>
                </div>
            </div>

            {/* Infinite Marquee Container */}
            <div className="relative flex overflow-hidden">
                <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap py-4">
                    {/* First set of testimonials */}
                    {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, index) => (
                        <div
                            key={`${testimonial.id}-${index}`}
                            className="inline-block w-[300px] sm:w-[400px] mx-4 sm:mx-6 whitespace-normal"
                        >
                            <div className="h-full flex flex-col justify-between rounded-3xl bg-white p-8 sm:p-10 shadow-sm ring-1 ring-neutral-200/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary-600/5 hover:ring-primary-100">
                                <div>
                                    <div className="flex gap-x-1 text-amber-400 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="h-5 w-5 flex-none" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.453 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                                            </svg>
                                        ))}
                                    </div>
                                    <div className="text-base sm:text-lg text-neutral-700 leading-relaxed italic">
                                        &ldquo;{testimonial.text}&rdquo;
                                    </div>
                                </div>
                                <div className="mt-10 pt-6 border-t border-neutral-100">
                                    <div className="flex items-center gap-x-4">
                                        <div className="h-12 w-12 flex-none rounded-2xl bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-base shadow-inner">
                                            {testimonial.name?.charAt(0) || 'U'}
                                            {testimonial.name?.split(' ')?.[1]?.charAt(0) || ''}
                                        </div>
                                        <div>
                                            <div className="font-bold text-neutral-900 text-base">{testimonial.name}</div>
                                            <div className="text-sm font-medium text-primary-600/80">{testimonial.city}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Video Testimonials Placeholder - More integrated styling */}
            <div className="mt-20 sm:mt-32 mx-auto max-w-7xl px-6 lg:px-8">
                <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-neutral-900 shadow-2xl lg:aspect-video aspect-[16/10] group">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 ring-1 ring-white/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary-600 group-hover:ring-primary-400 cursor-pointer">
                            <svg className="h-10 w-10 text-white ml-1.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-bold text-2xl sm:text-3xl mb-4">Customer Video Stories</h3>
                        <p className="text-neutral-400 text-base sm:text-lg max-w-lg leading-relaxed">
                            Authentic moments from our community bringing tradition back to their modern tables. Coming soon!
                        </p>
                    </div>
                    {/* Abstract design elements */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent"></div>
                    <Image
                        src="/millet.png"
                        alt="Background pattern"
                        fill
                        className="object-cover opacity-20 scale-110 group-hover:scale-100 transition-transform duration-[2s]"
                    />
                </div>
            </div>
        </section>
    )
}
