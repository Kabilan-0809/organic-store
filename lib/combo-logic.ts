import { calculateDiscountedPrice } from '@/lib/pricing'

export const MILLET_COMBO_NAMES = [
    'Barnyard Almond Elephant',
    'Finger Millet Coconut Hearts',
    'Multi Millet Choco Coated Balls',
    'Foxtail Peanut Balls',
    'Multi Millet Achari Masala Stick',
    'Multi Millet Chilli Chatag',
    'Multi Millet Tangy Tomato'
]

export const MALT_COMBO_NAMES = [
    'Nuts Boost',
    'Nutty Beets',
    'Choco Ragi Malt'
]

export const MILLET_COMBO_PRICE = 475
export const MALT_COMBO_PRICE = 300

interface CartItemBase {
    product: {
        id: string
        name: string
        price: number
        discountPercent?: number | null
        inStock: boolean
    }
    quantity: number
}

export function calculateCartTotals(items: CartItemBase[]) {
    // 1. Group items by name to identify combos
    const quantities: Record<string, number> = {}

    items.forEach(item => {
        if (!item.product.inStock) return
        const name = item.product.name
        quantities[name] = (quantities[name] || 0) + item.quantity
    })

    // 2. Determine number of complete combos
    const numMilletCombos = Math.min(
        ...MILLET_COMBO_NAMES.map(name => quantities[name] || 0)
    )

    const numMaltCombos = Math.min(
        ...MALT_COMBO_NAMES.map(name => quantities[name] || 0)
    )

    // 3. Subtract combo items from pool
    if (numMilletCombos > 0) {
        MILLET_COMBO_NAMES.forEach(name => {
            quantities[name] = (quantities[name] || 0) - numMilletCombos
        })
    }

    if (numMaltCombos > 0) {
        MALT_COMBO_NAMES.forEach(name => {
            quantities[name] = (quantities[name] || 0) - numMaltCombos
        })
    }

    // 4. Calculate prices
    let subtotal = 0
    let originalSubtotal = 0
    let nonComboSubtotal = 0 // Used for 15% discount calculation

    // Add Combos
    subtotal += numMilletCombos * MILLET_COMBO_PRICE
    if (numMilletCombos > 0) {
        // Because the user could have gathered this from various variants/prices,
        // We'll calculate a standard typical Millet combo original price just by summing standard ones, 
        // or if they are in the cart we use their original price.
        // Wait, different millet products might have different prices, but usually they are 80Rs each. 80 * 7 = 560
        // We know standard M.R.P is 560 for Millet, 360 for Malt.
        originalSubtotal += numMilletCombos * 560
    }

    subtotal += numMaltCombos * MALT_COMBO_PRICE
    if (numMaltCombos > 0) {
        originalSubtotal += numMaltCombos * 360
    }

    // Add Remaining Items
    items.forEach(item => {
        if (!item.product.inStock) return

        // How many of THIS specific item are left not part of a combo?
        // Note: Multiple items could have the same name (e.g. variants). 
        // We'll trust that the first occurrences consume the non-combo pool.
        const name = item.product.name
        const remainingForThisName = quantities[name] || 0

        if (remainingForThisName > 0) {
            // The quantity to charge normally is min(item.quantity, remainingForThisName)
            // But wait! If an item name occurs multiple times (variants), we distribute the remaining.
            const qtyToChargeNormally = Math.min(item.quantity, remainingForThisName)

            const originalPriceInPaise = item.product.price * 100
            const discountedPriceInPaise = calculateDiscountedPrice(
                originalPriceInPaise,
                item.product.discountPercent
            )
            const discountedPriceInRupees = discountedPriceInPaise / 100

            const itemSubtotal = discountedPriceInRupees * qtyToChargeNormally
            subtotal += itemSubtotal
            nonComboSubtotal += itemSubtotal

            originalSubtotal += (item.product.price * qtyToChargeNormally)

            // Reduce the remaining count for the next iteration if there are multiple cart items with same name
            quantities[name] = (quantities[name] || 0) - qtyToChargeNormally
        }
    })

    return {
        numMilletCombos,
        numMaltCombos,
        subtotal,
        originalSubtotal,
        nonComboSubtotal
    }
}
