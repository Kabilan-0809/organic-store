import Image from 'next/image'
import Link from 'next/link'

export default function HomeHeroSection() {
    return (
        <section className="px-2 pt-4 pb-2 sm:px-2 sm:pt-8 sm:pb-2">
            <div className="mx-auto w-full">
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-[3fr_2fr]">

                    {/* Left Panel — Main hero */}
                    <div
                        className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[3rem]"
                        style={{ backgroundColor: '#EBE5DF' }}
                    >
                        <div className="relative flex flex-row sm:block min-h-[220px] sm:min-h-[85vh]">
                            {/* Text — left 55% */}
                            <div className="relative z-10 flex flex-col justify-center p-5 sm:p-10 lg:p-14 w-[55%] sm:w-full">
                                <h1 className="mb-3 font-quicksand text-2xl font-black leading-[1.05] tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl xl:text-6xl">
                                    Real Nutrition Your Family Will Love
                                </h1>
                                <p className="mb-4 font-lato text-xs leading-snug text-neutral-600 sm:text-base lg:text-lg font-semibold">
                                    Premium millet &amp; malt products<br />for everyday wellness
                                </p>
                                <Link
                                    href="/shop"
                                    className="inline-flex w-fit items-center rounded-full bg-[#4CAF50] px-4 py-2 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#43A047] hover:scale-105 active:scale-95 sm:px-6 sm:py-3 sm:text-base"
                                >
                                    Shop Now
                                </Link>
                            </div>
                            {/* Image — fills full height of right 45% on mobile */}
                            <div className="absolute right-0 top-0 bottom-0 w-[45%] sm:hidden pointer-events-none">
                                <Image
                                    src="/Common_Images/DSS_8532-removebg-preview.webp"
                                    alt="Millet snack products"
                                    fill
                                    className="object-contain object-bottom"
                                    sizes="45vw"
                                    priority
                                />
                            </div>
                        </div>
                        {/* Desktop-only image */}
                        <div className="hidden sm:block absolute right-0 bottom-0 h-[75%] w-[60%] pointer-events-none">
                            <Image
                                src="/Common_Images/DSS_8532-removebg-preview.webp"
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
                        className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[3rem]"
                        style={{ backgroundColor: '#F3EEE7' }}
                    >
                        <div className="relative flex flex-row sm:block min-h-[220px] sm:min-h-[85vh]">
                            {/* Text — left 55% */}
                            <div className="relative z-10 flex flex-col justify-center p-5 sm:p-10 lg:p-14 w-[55%] sm:w-full">
                                <h2 className="mb-3 font-quicksand text-2xl font-black leading-[1.05] tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl xl:text-6xl">
                                    The Tangy Twist Your Tastebuds Crave
                                </h2>
                                <p className="mb-4 font-lato text-xs text-neutral-600 sm:text-base lg:text-lg font-semibold">
                                    Achari Masala meets crunchy<br />millet goodness.
                                </p>
                                <Link
                                    href="/shop"
                                    className="inline-flex w-fit items-center rounded-full bg-[#4CAF50] px-4 py-2 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#43A047] hover:scale-105 active:scale-95 sm:px-6 sm:py-3 sm:text-base"
                                >
                                    Shop Now
                                </Link>
                            </div>
                            {/* Image — fills full height of right 45% on mobile */}
                            <div className="absolute right-0 top-0 bottom-0 w-[45%] sm:hidden pointer-events-none">
                                <Image
                                    src="/New_Millet_Images/Achari_Masala_Stick_1-removebg-preview.webp"
                                    alt="Achari Masala Stick"
                                    fill
                                    className="object-contain object-bottom"
                                    sizes="45vw"
                                    priority
                                />
                            </div>
                        </div>
                        {/* Desktop-only image */}
                        <div className="hidden sm:block absolute right-0 bottom-0 h-[75%] w-[55%] pointer-events-none">
                            <Image
                                src="/New_Millet_Images/Achari_Masala_Stick_1-removebg-preview.webp"
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

