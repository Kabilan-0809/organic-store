import Image from 'next/image'
import Link from 'next/link'

export default function HomeHeroSection() {
    return (
        <section className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-4 sm:grid-cols-2">

                    {/* Left Panel — Main hero */}
                    <div
                        className="relative flex flex-col sm:flex-row min-h-[380px] sm:min-h-[340px] overflow-hidden rounded-2xl sm:rounded-3xl"
                        style={{ backgroundColor: '#EBE5DF' }}
                    >
                        <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 lg:p-10 w-full sm:max-w-[55%]">
                            <h1 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
                                Real Nutrition Your Family Will Love.
                            </h1>
                            <p className="mb-5 text-sm leading-relaxed text-neutral-600 sm:text-base">
                                Premium millet &amp; malt products for everyday wellness
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary-700 hover:shadow-lg active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image cluster */}
                        <div className="relative sm:absolute right-0 bottom-0 h-48 sm:h-full w-full sm:w-[52%] flex items-end justify-center sm:justify-end mt-4 sm:mt-0 pointer-events-none">
                            <Image
                                src="/New_Millet_Images/Chili_Chatag_1.png"
                                alt="Millet snack products"
                                fill
                                className="object-contain object-bottom sm:object-right-bottom scale-110 sm:scale-100"
                                sizes="(max-width: 640px) 90vw, 28vw"
                                priority
                            />
                        </div>
                    </div>

                    {/* Right Panel — Feature product */}
                    <div
                        className="relative flex flex-col sm:flex-row min-h-[380px] sm:min-h-[340px] overflow-hidden rounded-2xl sm:rounded-3xl"
                        style={{ backgroundColor: '#F3EEE7' }}
                    >
                        <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 lg:p-10 w-full sm:max-w-[55%]">
                            <h2 className="mb-2 text-xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-2xl lg:text-3xl">
                                The Tangy Twist Your Tastebuds Crave.
                            </h2>
                            <p className="mb-5 text-sm text-neutral-600 sm:text-base">
                                Achari Masala meets crunchy millet goodness.
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary-700 hover:shadow-lg active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image */}
                        <div className="relative sm:absolute right-0 bottom-0 h-48 sm:h-full w-full sm:w-[52%] flex items-end justify-center sm:justify-end mt-4 sm:mt-0 pointer-events-none">
                            <Image
                                src="/New_Millet_Images/Achari_Masala_Stick_1.png"
                                alt="Achari Masala Stick"
                                fill
                                className="object-contain object-bottom sm:object-right-bottom scale-110 sm:scale-100"
                                sizes="(max-width: 640px) 90vw, 28vw"
                                priority
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
