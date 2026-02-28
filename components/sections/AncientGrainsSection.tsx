import Image from 'next/image'
import Link from 'next/link'

export default function AncientGrainsSection() {
    return (
        <section className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div
                    className="relative flex min-h-[260px] overflow-hidden rounded-2xl sm:min-h-[300px] sm:rounded-3xl"
                    style={{ backgroundColor: '#EBE5DF' }}
                >
                    {/* Text content */}
                    <div className="relative z-10 flex flex-col justify-center p-7 sm:p-10 lg:p-14 max-w-[50%]">
                        <h2 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                            Ancient Grains.
                            <br />
                            Modern Health.
                        </h2>
                        <p className="mb-6 text-sm leading-relaxed text-neutral-600 sm:text-base">
                            Explore best-selling malt &amp; millet products
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary-700 hover:shadow-lg active:scale-95"
                        >
                            View Products
                        </Link>
                    </div>

                    {/* Product images — positioned to the right, overlapping bottom */}
                    <div className="absolute right-0 bottom-0 top-0 w-[55%] flex items-end justify-end">
                        {/* Use several product images stacked to mimic jar row */}
                        <div className="relative h-full w-full">
                            <Image
                                src="/hero-images/almond-elephant-cinematic.png"
                                alt="Millet products"
                                fill
                                className="object-contain object-right-bottom"
                                sizes="(max-width: 640px) 50vw, 35vw"
                                priority
                            />
                        </div>
                    </div>

                    {/* Scattered nuts decoration — left side */}
                    <div className="absolute left-[42%] top-0 h-16 w-16 opacity-30 pointer-events-none sm:h-24 sm:w-24">
                        <Image
                            src="/hero-images/peanut-balls-cinematic.png"
                            alt=""
                            fill
                            className="object-contain"
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
