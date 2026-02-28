
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
const milletImagesMap: Record<string, string> = {
    'achari masala stick': '/New_Millet_Images/Achara_Masala_Stick',
    'masala stick': '/New_Millet_Images/Achara_Masala_Stick',
    'almond elephant': '/New_Millet_Images/Almond_Elaphant',
    'chilli chatag': '/New_Millet_Images/Chili_Chatag',
    'choco coated monkey': '/New_Millet_Images/Choco_Coated_Monkey',
    'multi millet choco coated balls': '/New_Millet_Images/Choco_Coated_Monkey',
    'monkey': '/New_Millet_Images/Choco_Coated_Monkey',
    'choco monkey': '/New_Millet_Images/Choco_Coated_Monkey',
    'coconut hearts': '/New_Millet_Images/Coconut_Hearts',
    'premium peanut balls': '/New_Millet_Images/Peanut_Balls',
    'peanut balls': '/New_Millet_Images/Peanut_Balls',
    'tangy tomato': '/New_Millet_Images/Tangy_Tomato'
}

/**
 * Returns the primary and gallery images for Millet products, or null if not a millet product.
 */
export function getMilletImages(productName: string): { primary: string; gallery: string[] } | null {
    if (!productName) return null

    const normalizedName = productName.toLowerCase().trim()
    const githubBase = 'https://github.com/Kabilan-0809/organic-store/blob/main/public'

    for (const [key, basePath] of Object.entries(milletImagesMap)) {
        if (normalizedName.includes(key)) {
            return {
                primary: `${githubBase}${basePath}_1.jpg?raw=true`,
                gallery: [
                    `${githubBase}${basePath}_1.jpg?raw=true`,
                    `${githubBase}${basePath}_2.jpg?raw=true`,
                    `${githubBase}${basePath}_3.jpg?raw=true`
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
    const githubBase = 'https://github.com/Kabilan-0809/organic-store/blob/main/public'

    // 1. Prioritize New Millet Images first
    const milletImages = getMilletImages(normalizedName)
    if (milletImages) {
        return milletImages.primary
    }

    // 2. Fallback to older Cinematic Images
    for (const [key, value] of Object.entries(productImageMap)) {
        if (normalizedName.includes(key)) {
            // Check if value already has the base
            if (value.startsWith('http')) return value
            // Ensure leading slash for joining
            const path = value.startsWith('/') ? value : '/' + value
            return `${githubBase}${path}?raw=true`
        }
    }

    return product.image
}
