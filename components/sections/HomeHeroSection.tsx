import Image from 'next/image'
import Link from 'next/link'

export default function HomeHeroSection() {
    return (
        <section className="p-1 sm:p-2">
            <div className="mx-auto w-full">
                <div className="grid gap-1 sm:grid-cols-2">

                    {/* Left Panel — Main hero */}
                    <div
                        className="relative flex flex-col min-h-[500px] sm:min-h-[calc(100vh-100px)] overflow-hidden rounded-[2rem] sm:rounded-[3rem]"
                        style={{ backgroundColor: '#EBE5DF' }}
                    >
                        <div className="relative z-10 flex flex-col p-10 sm:p-14 lg:p-20 w-full sm:max-w-[70%]">
                            <h1 className="mb-6 text-5xl font-black leading-[0.9] tracking-tighter text-neutral-900 sm:text-7xl lg:text-9xl">
                                Real<br />Nutrition<br />Your<br />Family<br />Will<br />Love.
                            </h1>
                            <p className="mb-10 text-lg leading-relaxed text-neutral-600 sm:text-2xl lg:text-3xl font-medium">
                                Premium millet &amp; malt products for everyday wellness
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center gap-3 rounded-full bg-[#4CAF50] px-10 py-5 text-xl font-bold text-white shadow-xl transition-all duration-300 hover:bg-[#43A047] hover:scale-105 active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image cluster — Bottom Center/Right */}
                        <div className="absolute right-0 bottom-0 h-48 sm:h-[40%] w-full flex items-end justify-center sm:justify-center overflow-visible pointer-events-none">
                            <div className="relative h-full w-[120%] sm:w-full">
                                <Image
                                    src="/Common_Images/DSS_8532-removebg-preview.png"
                                    alt="Millet snack products"
                                    fill
                                    className="object-contain object-bottom scale-150 sm:scale-125 translate-y-4"
                                    sizes="100vw"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel — Feature product */}
                    <div
                        className="relative flex flex-col min-h-[500px] sm:min-h-[calc(100vh-100px)] overflow-hidden rounded-[2rem] sm:rounded-[3rem]"
                        style={{ backgroundColor: '#F3EEE7' }}
                    >
                        <div className="relative z-10 flex flex-col p-10 sm:p-14 lg:p-20 w-full">
                            <h2 className="mb-6 text-4xl font-black leading-[0.9] tracking-tighter text-neutral-900 sm:text-6xl lg:text-8xl">
                                The<br />Tangy<br />Twist<br />Your<br />Tastebuds<br />Crave.
                            </h2>
                            <p className="mb-10 text-lg text-neutral-600 sm:text-2xl lg:text-3xl font-medium">
                                Achari Masala meets crunchy millet goodness.
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex w-fit items-center gap-3 rounded-full bg-[#4CAF50] px-10 py-5 text-xl font-bold text-white shadow-xl transition-all duration-300 hover:bg-[#43A047] hover:scale-105 active:scale-95"
                            >
                                Shop Now
                            </Link>
                        </div>
                        {/* Product image — Bottom Right */}
                        <div className="absolute right-0 bottom-0 h-64 sm:h-[50%] w-full sm:w-[50%] flex items-end justify-end pointer-events-none">
                            <div className="relative h-full w-full">
                                <Image
                                    src="/New_Millet_Images/Achari_Masala_Stick_1-removebg-preview.png"
                                    alt="Achari Masala Stick"
                                    fill
                                    className="object-contain object-bottom object-right scale-150 sm:scale-125 translate-x-4 translate-y-4"
                                    sizes="50vw"
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
