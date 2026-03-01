import Image from 'next/image'
import Link from 'next/link'

export default function HomeHeroSection() {
    return (
        <section className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto w-full">
                <div className="grid gap-4 sm:grid-cols-2">

                    {/* Left Panel — Main hero */}
                    <div
                        className="relative flex flex-col min-h-[450px] sm:min-h-[70vh] lg:min-h-[80vh] overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem]"
                        style={{ backgroundColor: '#EBE5DF' }}
                    >
                        <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-20 w-full sm:max-w-[70%]">
                            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                                Real Nutrition<br />Your Family<br />Will Love.
                            </h1>
                            <p className="mb-8 text-base leading-relaxed text-neutral-600 sm:text-lg lg:text-xl font-medium max-w-md">
                                Premium millet &amp; malt products for everyday wellness
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#4CAF50] px-8 py-3.5 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#43A047] hover:scale-105 active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image cluster */}
                        <div className="absolute right-0 bottom-0 h-48 sm:h-[45%] w-full flex items-end justify-center sm:justify-end overflow-visible pointer-events-none p-4 sm:p-8">
                            <div className="relative h-full w-full max-w-[400px]">
                                <Image
                                    src="/Common_Images/DSS_8532-removebg-preview.png"
                                    alt="Millet snack products"
                                    fill
                                    className="object-contain object-bottom scale-110 sm:scale-110"
                                    sizes="(max-width: 640px) 100vw, 40vw"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel — Feature product */}
                    <div
                        className="relative flex flex-col min-h-[450px] sm:min-h-[70vh] lg:min-h-[80vh] overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem]"
                        style={{ backgroundColor: '#F3EEE7' }}
                    >
                        <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-20 w-full sm:max-w-[70%]">
                            <h2 className="mb-6 text-3xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                                The Tangy Twist<br />Your Tastebuds<br />Crave.
                            </h2>
                            <p className="mb-8 text-base text-neutral-600 sm:text-lg lg:text-xl font-medium max-w-md">
                                Achari Masala meets crunchy millet goodness.
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#4CAF50] px-8 py-3.5 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#43A047] hover:scale-105 active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image */}
                        <div className="absolute right-0 bottom-0 h-56 sm:h-[55%] w-full sm:w-[50%] flex items-end justify-end pointer-events-none p-4 sm:p-8">
                            <div className="relative h-full w-full">
                                <Image
                                    src="/New_Millet_Images/Achari_Masala_Stick_1-removebg-preview.png"
                                    alt="Achari Masala Stick"
                                    fill
                                    className="object-contain object-bottom object-right scale-110 sm:scale-110"
                                    sizes="(max-width: 640px) 100vw, 40vw"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
