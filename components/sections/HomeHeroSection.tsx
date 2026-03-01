import Image from 'next/image'
import Link from 'next/link'

export default function HomeHeroSection() {
    return (
        <section className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6">
            <div className="mx-auto max-w-[1600px]">
                <div className="grid gap-2 sm:grid-cols-2">

                    {/* Left Panel — Main hero */}
                    <div
                        className="relative flex flex-col sm:flex-row min-h-[450px] sm:min-h-[calc(100vh-120px)] overflow-hidden rounded-3xl sm:rounded-[3rem]"
                        style={{ backgroundColor: '#EBE5DF' }}
                    >
                        <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-16 w-full sm:max-w-[60%]">
                            <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-5xl lg:text-7xl">
                                Real Nutrition Your Family Will Love.
                            </h1>
                            <p className="mb-8 text-base leading-relaxed text-neutral-600 sm:text-xl lg:text-2xl">
                                Premium millet &amp; malt products for everyday wellness
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center gap-3 rounded-full bg-primary-600 px-8 py-4 text-base font-bold text-white shadow-xl transition-all duration-300 hover:bg-primary-700 hover:scale-105 active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image cluster */}
                        <div className="relative sm:absolute right-0 bottom-0 h-64 sm:h-full w-full sm:w-[55%] flex items-end justify-center sm:justify-end mt-4 sm:mt-0 pointer-events-none">
                            <Image
                                src="/Common_Images/DSS_8532-removebg-preview.png"
                                alt="Millet snack products"
                                fill
                                className="object-contain object-bottom sm:object-right-bottom scale-125 sm:scale-110"
                                sizes="(max-width: 640px) 95vw, 45vw"
                                priority
                            />
                        </div>
                    </div>

                    {/* Right Panel — Feature product */}
                    <div
                        className="relative flex flex-col sm:flex-row min-h-[450px] sm:min-h-[calc(100vh-120px)] overflow-hidden rounded-3xl sm:rounded-[3rem]"
                        style={{ backgroundColor: '#F3EEE7' }}
                    >
                        <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-16 w-full sm:max-w-[60%]">
                            <h2 className="mb-4 text-2xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-6xl">
                                The Tangy Twist Your Tastebuds Crave.
                            </h2>
                            <p className="mb-8 text-base text-neutral-600 sm:text-xl lg:text-2xl">
                                Achari Masala meets crunchy millet goodness.
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center gap-3 rounded-full bg-primary-600 px-8 py-4 text-base font-bold text-white shadow-xl transition-all duration-300 hover:bg-primary-700 hover:scale-105 active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image */}
                        <div className="relative sm:absolute right-0 bottom-0 h-64 sm:h-full w-full sm:w-[55%] flex items-end justify-center sm:justify-end mt-4 sm:mt-0 pointer-events-none">
                            <Image
                                src="/New_Millet_Images/Achari_Masala_Stick_1-removebg-preview.png"
                                alt="Achari Masala Stick"
                                fill
                                className="object-contain object-bottom sm:object-right-bottom scale-125 sm:scale-110"
                                sizes="(max-width: 640px) 95vw, 45vw"
                                priority
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
