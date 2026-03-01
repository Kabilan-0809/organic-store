import Image from 'next/image'
import Link from 'next/link'

export default function AncientGrainsSection() {
    return (
        <section id="ancient-grains" className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto w-full">
                <div
                    className="relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] bg-[#E2EEF1] p-8 sm:p-12 lg:p-16"
                >
                    {/* Text content */}
                    <div className="relative z-10 flex flex-col justify-center p-7 sm:p-10 lg:p-14 w-full sm:max-w-[50%]">
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
                    <div className="relative sm:absolute right-0 bottom-0 h-56 sm:h-full w-full sm:w-[55%] flex items-end justify-center sm:justify-end pointer-events-none mt-4 sm:mt-0">
                        <div className="relative h-full w-full">
                            <Image
                                src="/Common_Images/DSS_8534-removebg-preview.png"
                                alt="Millet products"
                                fill
                                className="object-contain object-bottom sm:object-right-bottom scale-110 sm:scale-[1.15] origin-bottom sm:origin-bottom-right"
                                sizes="(max-width: 640px) 90vw, 35vw"
                                priority
                            />
                        </div>
                    </div>


                </div>
            </div>
        </section>
    )
}
