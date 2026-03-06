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
        .select('id, name, slug, description, price, discountPercent, category, imageUrl, stock, isActive, ProductVariant(id, sizeGrams)')
        .in('name', [...MILLET_NAMES, ...MALT_NAMES])
        .eq('isActive', true)

    const mapToProduct = (p: any): Product & { selectedVariantId?: string } => {
        let selectedVariantId = undefined
        if (p.ProductVariant && p.ProductVariant.length > 0) {
            // Find 80g variant, or default to the first one available
            const variant80g = p.ProductVariant.find((v: any) => v.sizeGrams === 80)
            if (variant80g) {
                selectedVariantId = variant80g.id
            } else {
                selectedVariantId = p.ProductVariant[0].id
            }
        }

        return {
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
            selectedVariantId
        }
    }

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
        <section className="px-4 pt-4 pb-4 sm:px-6 sm:pt-8 sm:pb-8">
            <div className="mx-auto w-full">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-[1.24fr_1fr]">

                    {/* Left Panel — Millet Offer */}
                    <div className="relative w-full">
                        <ComboBuyButton products={milletProducts}>
                            <Image
                                src="/Common_Images/MilletOffer.jpeg"
                                alt="Millet Products Offer: 7 Snacks for 475"
                                width={1024}
                                height={1024}
                                className="w-full h-auto object-contain rounded-[1.5rem] sm:rounded-[3rem] shadow-sm"
                                priority
                            />
                        </ComboBuyButton>
                    </div>

                    {/* Right Panel — Malt Offer */}
                    <div className="relative w-full">
                        <ComboBuyButton products={maltProducts}>
                            <Image
                                src="/Common_Images/MaltOffer.jpeg"
                                alt="Malt Products Offer: 3 Malts for 300"
                                width={928}
                                height={1152}
                                className="w-full h-auto object-contain rounded-[1.5rem] sm:rounded-[3rem] shadow-sm"
                                priority
                            />
                        </ComboBuyButton>
                    </div>

                </div>
            </div>
        </section>
    )
}
