import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ComboBuyButton from './ComboBuyButton'
import type { Product } from '@/types'

const MILLET_NAMES = [
    'Barnyard Almond Elephant',
    'Finger Millet Coconut Hearts',
    'Multi Millet Choco Coated Balls',
    'Foxtail Peanut Balls',
    'Multi Millet Achari Masala Stick',
    'Multi Millet Chilli Chatag',
    'Multi Millet Tangy Tomato'
]

const MALT_NAMES = [
    'Nuts Boost',
    'Nutty Beets',
    'Choco Ragi Malt'
]

export default async function HomeHeroSection() {
    const { data: allOfferProducts } = await supabase
        .from('Product')
        .select('id, name, slug, description, price, discountPercent, category, imageUrl, stock, isActive')
        .in('name', [...MILLET_NAMES, ...MALT_NAMES])
        .eq('isActive', true)

    const mapToProduct = (p: any): Product => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price / 100, // Convert from paise to rupees
        discountPercent: p.discountPercent,
        category: p.category,
        image: p.imageUrl,
        inStock: p.stock > 0,
        stock: p.stock,
    })

    const fetchProducts = allOfferProducts || []

    // Millets have no variants, Malt has variants, but we will add the base product for malts.
    // Actually, "Nuts Boost", "Nutty Beets", "Choco Ragi Malt" are base products, users can choose standard variant or we just add base product to cart? 
    // The cart's `addItem` expects the product to be added. If it has variants, we might need a `variantId`.
    // Wait, let's just add the first variant for malts or add the product without variant if that's allowed.
    // Let's refine the fetched products.

    const milletProducts = fetchProducts
        .filter(p => MILLET_NAMES.includes(p.name))
        .map(mapToProduct)

    const maltProducts = fetchProducts
        .filter(p => MALT_NAMES.includes(p.name))
        .map(mapToProduct)

    return (
        <section className="px-2 pt-4 pb-2 sm:px-2 sm:pt-8 sm:pb-2">
            <div className="mx-auto w-full">
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">

                    {/* Left Panel — Millet Offer */}
                    <div
                        className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[3rem] min-h-[250px] sm:min-h-[70vh]"
                    >
                        {/* Background Image */}
                        <Image
                            src="/Common_Images/MilletOffer.jpeg"
                            alt="Millet Products Offer: 7 Snacks for 475"
                            fill
                            className="object-cover object-center"
                            priority
                        />

                        {/* Gradient overlay to ensure button contrasts well against the bottom of the image */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                        {/* Shop Now Button Overlay */}
                        <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-10 lg:p-14">
                            <ComboBuyButton products={milletProducts} />
                        </div>
                    </div>

                    {/* Right Panel — Malt Offer */}
                    <div
                        className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[3rem] min-h-[250px] sm:min-h-[70vh]"
                    >
                        {/* Background Image */}
                        <Image
                            src="/Common_Images/MaltOffer.jpeg"
                            alt="Malt Products Offer: 3 Malts for 300"
                            fill
                            className="object-cover object-center"
                            priority
                        />

                        {/* Gradient overlay to ensure button contrasts well against the bottom of the image */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                        {/* Shop Now Button Overlay */}
                        <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-10 lg:p-14">
                            <ComboBuyButton products={maltProducts} />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
