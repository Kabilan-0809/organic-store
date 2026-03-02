
// Map of product names/slugs to cinematic images
export const productImageMap: Record<string, string> = {
    // Existing Hero Images
    'abc nutri mix': '/hero-images/abc-mix-v2.webp',
    'red banana malt': '/hero-images/red-banana-v2.webp',
    'chilli chatag': '/hero-images/chilli-chatag-v2.webp',
    'choco ragi': '/hero-images/choco-ragi-v2.webp',
    'masala stick': '/hero-images/masala-stick-v2.webp',
    'tangy tomato': '/hero-images/tangy-tomato-v2.webp',

    // New Cinematic Images
    'nuts boost': '/hero-images/nuts-boost-cinematic.webp',
    'nutty beets': '/hero-images/nutty-beets-cinematic.webp',
    'mudavaattu kizhangu saadha podi': '/hero-images/mudavaattu-kizhangu-cinematic.webp',
    'almond elephant': '/hero-images/almond-elephant-cinematic.webp',
    'choco coated monkey': '/hero-images/choco-monkey-cinematic.webp',
    'multi millet choco coated balls': '/hero-images/choco-monkey-cinematic.webp', // Added specific mapping
    'monkey': '/hero-images/choco-monkey-cinematic.webp', // Fallback for shortened name
    'choco monkey': '/hero-images/choco-monkey-cinematic.webp', // Fallback for user-style name
    'coconut hearts': '/hero-images/coconut-hearts-cinematic.webp', // This will be the new bottle version
    'premium peanut balls': '/hero-images/peanut-balls-cinematic.webp',
    'peanut balls': '/hero-images/peanut-balls-cinematic.webp', // Fallback
}

// Map of millet product names to their new dedicated image folders
type MilletImageData = { basePath: string, primaryExt: string }
const milletImagesMap: Record<string, MilletImageData> = {
    'achari masala stick': { basePath: '/BG_Removed/Achari_Masala_Stick', primaryExt: 'png' },
    'masala stick': { basePath: '/BG_Removed/Achari_Masala_Stick', primaryExt: 'png' },
    'almond elephant': { basePath: '/BG_Removed/Almond_Elaphant', primaryExt: 'png' },
    'chilli chatag': { basePath: '/BG_Removed/Chili_Chatag', primaryExt: 'png' },
    'choco coated monkey': { basePath: '/BG_Removed/Choco_Coated_Monkey', primaryExt: 'png' },
    'multi millet choco coated balls': { basePath: '/BG_Removed/Choco_Coated_Monkey', primaryExt: 'png' },
    'monkey': { basePath: '/BG_Removed/Choco_Coated_Monkey', primaryExt: 'png' },
    'choco monkey': { basePath: '/BG_Removed/Choco_Coated_Monkey', primaryExt: 'png' },
    'coconut hearts': { basePath: '/BG_Removed/Coconut_Hearts', primaryExt: 'png' },
    'premium peanut balls': { basePath: '/BG_Removed/Peanut_Balls', primaryExt: 'png' },
    'peanut balls': { basePath: '/BG_Removed/Peanut_Balls', primaryExt: 'png' },
    'tangy tomato': { basePath: '/BG_Removed/Tangy_Tomato', primaryExt: 'png' }
}

/**
 * Returns the primary and gallery images for Millet products, or null if not a millet product.
 */
export function getMilletImages(productName: string): { primary: string; gallery: string[] } | null {
    if (!productName) return null

    const normalizedName = productName.toLowerCase().trim()

    for (const [key, data] of Object.entries(milletImagesMap)) {
        if (normalizedName.includes(key)) {
            return {
                primary: `${data.basePath}_1.webp`,
                gallery: [
                    `${data.basePath}_1.webp`,
                    `${data.basePath}_2.webp`,
                    `${data.basePath}_3.webp`
                ]
            }
        }
    }
    return null
}

/**
 * Helper to get the cinematic image for a product if available,
 * otherwise returns the original product image.
 */
export function getCinematicImage(product: { name: string; image: string } | undefined | null): string {
    if (!product) return ''

    const normalizedName = product.name.toLowerCase().trim()

    // 1. Prioritize New Millet Images first
    const milletImages = getMilletImages(normalizedName)
    if (milletImages) {
        return milletImages.primary
    }

    // 2. Fallback to older Cinematic Images
    for (const [key, value] of Object.entries(productImageMap)) {
        if (normalizedName.includes(key)) {
            // Check if value already has a full URL
            if (value.startsWith('http')) return value
            // Ensure leading slash for local relative paths
            return value.startsWith('/') ? value : '/' + value
        }
    }

    const fallback = product.image || ''
    const domainPrefix = 'https://milletsnjoy.com'
    if (fallback.startsWith(domainPrefix)) {
        return fallback.substring(domainPrefix.length)
    }
    return fallback
}
