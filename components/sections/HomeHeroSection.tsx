import Image from 'next/image'
import Link from 'next/link'

export default function HomeHeroSection() {
    return (
        <section className="px-1 py-1 sm:px-2 sm:py-2">
            <div className="mx-auto w-full">
                <div className="grid gap-1.5 sm:grid-cols-2">

                    {/* Left Panel — Main hero */}
                    <div
                        className="relative flex flex-col min-h-[550px] sm:min-h-[85vh] lg:min-h-[90vh] overflow-hidden rounded-[2.5rem] sm:rounded-[4rem]"
                        style={{ backgroundColor: '#EBE5DF' }}
                    >
                        <div className="relative z-10 flex flex-col justify-start p-6 sm:p-10 lg:p-16 w-full">
                            <h1 className="mb-8 text-6xl font-black leading-[0.8] tracking-tighter text-neutral-900 sm:text-8xl lg:text-[11rem] uppercase">
                                Real<br />Nutrition<br />Your<br />Family<br />Will<br />Love.
                            </h1>
                            <p className="mb-10 text-xl leading-relaxed text-neutral-600 sm:text-2xl lg:text-3xl font-extrabold max-w-3xl">
                                Premium millet &amp; malt products for everyday wellness
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center gap-4 rounded-full bg-[#4CAF50] px-14 py-6 text-2xl font-black text-white shadow-2xl transition-all duration-300 hover:bg-[#43A047] hover:scale-110 active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image cluster — scaled even more to cover empty space */}
                        <div className="absolute right-0 bottom-0 h-[40%] sm:h-[45%] w-full flex items-end justify-center sm:justify-center pointer-events-none p-4 overflow-visible">
                            <div className="relative h-full w-[140%] sm:w-full">
                                <Image
                                    src="/Common_Images/DSS_8532-removebg-preview.png"
                                    alt="Millet snack products"
                                    fill
                                    className="object-contain object-bottom scale-150 sm:scale-135 translate-y-8"
                                    sizes="100vw"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel — Feature product */}
                    <div
                        className="relative flex flex-col min-h-[550px] sm:min-h-[85vh] lg:min-h-[90vh] overflow-hidden rounded-[2.5rem] sm:rounded-[4rem]"
                        style={{ backgroundColor: '#F3EEE7' }}
                    >
                        <div className="relative z-10 flex flex-col justify-start p-6 sm:p-10 lg:p-16 w-full">
                            <h2 className="mb-8 text-5xl font-black leading-[0.8] tracking-tighter text-neutral-900 sm:text-7xl lg:text-[10rem] uppercase">
                                The<br />Tangy<br />Twist<br />Your<br />Tastebuds<br />Crave.
                            </h2>
                            <p className="mb-10 text-xl text-neutral-600 sm:text-2xl lg:text-3xl font-extrabold max-w-3xl">
                                Achari Masala meets crunchy millet goodness.
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center gap-4 rounded-full bg-[#4CAF50] px-14 py-6 text-2xl font-black text-white shadow-2xl transition-all duration-300 hover:bg-[#43A047] hover:scale-110 active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image — scaled to fill its space */}
                        <div className="absolute right-0 bottom-0 h-[50%] sm:h-[60%] w-full sm:w-[50%] flex items-end justify-end pointer-events-none p-4">
                            <div className="relative h-full w-full">
                                <Image
                                    src="/New_Millet_Images/Achari_Masala_Stick_1-removebg-preview.png"
                                    alt="Achari Masala Stick"
                                    fill
                                    className="object-contain object-bottom object-right scale-[1.75] sm:scale-[1.85] translate-x-12 translate-y-8"
                                    sizes="60vw"
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
