
// Map of product names/slugs to cinematic images
export const productImageMap: Record<string, string> = {
    // Existing Hero Images
    'abc nutri mix': '/hero-images/abc-mix-v2.png',
    'red banana malt': '/hero-images/red-banana-v2.png',
    'chilli chatag': '/hero-images/chilli-chatag-v2.png',
    'choco ragi': '/hero-images/choco-ragi-v2.png',
    'masala stick': '/hero-images/masala-stick-v2.png',
    'tangy tomato': '/hero-images/tangy-tomato-v2.png',

    // New Cinematic Images
    'nuts boost': '/hero-images/nuts-boost-cinematic.png',
    'nutty beets': '/hero-images/nutty-beets-cinematic.png',
    'mudavaattu kizhangu saadha podi': '/hero-images/mudavaattu-kizhangu-cinematic.png',
    'almond elephant': '/hero-images/almond-elephant-cinematic.png',
    'choco coated monkey': '/hero-images/choco-monkey-cinematic.png',
    'multi millet choco coated balls': '/hero-images/choco-monkey-cinematic.png', // Added specific mapping
    'monkey': '/hero-images/choco-monkey-cinematic.png', // Fallback for shortened name
    'choco monkey': '/hero-images/choco-monkey-cinematic.png', // Fallback for user-style name
    'coconut hearts': '/hero-images/coconut-hearts-cinematic.png', // This will be the new bottle version
    'premium peanut balls': '/hero-images/peanut-balls-cinematic.png',
    'peanut balls': '/hero-images/peanut-balls-cinematic.png', // Fallback
}

// Map of millet product names to their new dedicated image folders
type MilletImageData = { basePath: string, primaryExt: string }
const milletImagesMap: Record<string, MilletImageData> = {
    'achari masala stick': { basePath: '/New_Millet_Images/Achari_Masala_Stick', primaryExt: 'png' },
    'masala stick': { basePath: '/New_Millet_Images/Achari_Masala_Stick', primaryExt: 'png' },
    'almond elephant': { basePath: '/New_Millet_Images/Almond_Elaphant', primaryExt: 'jpg' },
    'chilli chatag': { basePath: '/New_Millet_Images/Chili_Chatag', primaryExt: 'png' },
    'choco coated monkey': { basePath: '/New_Millet_Images/Choco_Coated_Monkey', primaryExt: 'jpg' },
    'multi millet choco coated balls': { basePath: '/New_Millet_Images/Choco_Coated_Monkey', primaryExt: 'jpg' },
    'monkey': { basePath: '/New_Millet_Images/Choco_Coated_Monkey', primaryExt: 'jpg' },
    'choco monkey': { basePath: '/New_Millet_Images/Choco_Coated_Monkey', primaryExt: 'jpg' },
    'coconut hearts': { basePath: '/New_Millet_Images/Coconut_Hearts', primaryExt: 'jpg' },
    'premium peanut balls': { basePath: '/New_Millet_Images/Peanut_Balls', primaryExt: 'jpg' },
    'peanut balls': { basePath: '/New_Millet_Images/Peanut_Balls', primaryExt: 'jpg' },
    'tangy tomato': { basePath: '/New_Millet_Images/Tangy_Tomato', primaryExt: 'jpg' }
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
                primary: `${data.basePath}_1.${data.primaryExt}`,
                gallery: [
                    `${data.basePath}_1.${data.primaryExt}`,
                    `${data.basePath}_2.jpg`,
                    `${data.basePath}_3.jpg`
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
