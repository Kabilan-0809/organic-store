import Image from 'next/image'
import Link from 'next/link'

export default function HomeHeroSection() {
    return (
        <section className="px-1 pt-6 pb-2 sm:px-2 sm:pt-8 sm:pb-2">
            <div className="mx-auto w-full">
                <div className="grid gap-1.5 grid-cols-1 sm:grid-cols-[3fr_2fr]">

                    {/* Left Panel — Main hero */}
                    <div
                        className="relative flex flex-col min-h-[500px] sm:min-h-[85vh] overflow-hidden rounded-[2rem] sm:rounded-[3rem]"
                        style={{ backgroundColor: '#EBE5DF' }}
                    >
                        {/* Text top-left */}
                        <div className="relative z-10 flex flex-col justify-start p-6 sm:p-10 lg:p-14 w-full">
                            <h1 className="mb-4 text-4xl font-black leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-7xl xl:text-8xl">
                                Real Nutrition Your Family Will Love.
                            </h1>
                            <p className="mb-6 text-sm leading-snug text-neutral-600 sm:text-base lg:text-lg font-semibold">
                                Premium millet &amp; malt products<br />for everyday wellness
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center rounded-full bg-[#4CAF50] px-6 py-3 text-base font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#43A047] hover:scale-105 active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image cluster — bottom-right */}
                        <div className="absolute right-0 bottom-0 h-[75%] w-[60%] pointer-events-none">
                            <Image
                                src="/Common_Images/DSS_8532-removebg-preview.png"
                                alt="Millet snack products"
                                fill
                                className="object-contain object-bottom object-right"
                                sizes="55vw"
                                priority
                            />
                        </div>
                    </div>

                    {/* Right Panel — Feature product */}
                    <div
                        className="relative flex flex-col min-h-[500px] sm:min-h-[85vh] overflow-hidden rounded-[2rem] sm:rounded-[3rem]"
                        style={{ backgroundColor: '#F3EEE7' }}
                    >
                        {/* Text top-left */}
                        <div className="relative z-10 flex flex-col justify-start p-6 sm:p-10 lg:p-14 w-full">
                            <h2 className="mb-4 text-4xl font-black leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl xl:text-7xl">
                                The Tangy Twist Your Tastebuds Crave.
                            </h2>
                            <p className="mb-6 text-sm text-neutral-600 sm:text-base lg:text-lg font-semibold">
                                Achari Masala meets crunchy<br />millet goodness.
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center rounded-full bg-[#4CAF50] px-6 py-3 text-base font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#43A047] hover:scale-105 active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image — bottom-right */}
                        <div className="absolute right-0 bottom-0 h-[75%] w-[55%] pointer-events-none">
                            <Image
                                src="/New_Millet_Images/Achari_Masala_Stick_1-removebg-preview.png"
                                alt="Achari Masala Stick"
                                fill
                                className="object-contain object-bottom object-right"
                                sizes="55vw"
                                priority
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
