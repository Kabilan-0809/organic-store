import Image from 'next/image'
import Link from 'next/link'

export default function AncientGrainsSection() {
    return (
        <section id="ancient-grains" className="px-2 py-2 sm:px-4 sm:py-6 lg:px-8">
            <div className="mx-auto w-full">
                <div
                    className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[3rem] bg-[#E2EEF1]"
                >
                    {/* Mobile: row layout; Desktop: absolute-positioned image */}
                    <div className="relative flex flex-row sm:block min-h-[180px] sm:min-h-[380px] lg:min-h-[480px]">
                        {/* Text */}
                        <div className="relative z-10 flex flex-col justify-center p-5 sm:p-12 lg:p-16 w-[55%] sm:w-[50%]">
                            <h2 className="mb-2 font-quicksand text-2xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                                Ancient Grains.<br />Modern Health.
                            </h2>
                            <p className="mb-4 font-lato text-xs leading-relaxed text-neutral-600 sm:text-base">
                                Explore best-selling malt &amp; millet products
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary-700 hover:shadow-lg active:scale-95 sm:px-5 sm:py-2.5 sm:text-sm"
                            >
                                View Products
                            </Link>
                        </div>

                        {/* Image — fills full height of right 45% on mobile */}
                        <div className="absolute right-0 top-0 bottom-0 w-[45%] sm:hidden pointer-events-none">
                            <Image
                                src="/Common_Images/DSS_8534-removebg-preview.png"
                                alt="Millet products"
                                fill
                                className="object-contain object-bottom"
                                sizes="45vw"
                                priority
                            />
                        </div>
                    </div>

                    {/* Desktop-only image */}
                    <div className="hidden sm:block absolute right-0 bottom-0 h-full w-[55%] pointer-events-none">
                        <Image
                            src="/Common_Images/DSS_8534-removebg-preview.png"
                            alt="Millet products"
                            fill
                            className="object-contain object-bottom object-right scale-[1.15] origin-bottom-right"
                            sizes="35vw"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

