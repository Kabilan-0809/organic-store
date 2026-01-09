/**
 * Calculate discounted price from original price and discount percentage.
 * 
 * @param price - Original price (in smallest currency unit, e.g., paise for INR)
 * @param discountPercent - Discount percentage (0-100). If 0 or undefined, returns original price.
 * @returns Discounted price rounded to 2 decimal places (in smallest currency unit)
 * 
 * @example
 * calculateDiscountedPrice(10000, 15) // Returns 8500 (15% off 100.00)
 * calculateDiscountedPrice(10000, 0) // Returns 10000 (no discount)
 * calculateDiscountedPrice(10000, undefined) // Returns 10000 (no discount)
 */
export function calculateDiscountedPrice(
  price: number,
  discountPercent?: number | null
): number {
  // If discount is 0, null, or undefined, return original price
  if (!discountPercent || discountPercent === 0) {
    return price
  }

  // Calculate discounted price: price * (1 - discountPercent / 100)
  const discountedPrice = price * (1 - discountPercent / 100)

  // Round to 2 decimal places (for smallest currency unit, this means rounding to nearest integer)
  // Since price is in paise, we round to nearest integer
  return Math.round(discountedPrice)
}



/**
 * Central logic for shipping fee calculation based on subtotal and state.
 * 
 * Rules:
 * - Free Shipping: Order >= ₹1000 (all states)
 * - Tamil Nadu: ₹40 shipping fee
 * - Kerala, Andhra Pradesh, Karnataka: ₹70 shipping fee
 * - All other states: ₹100 shipping fee
 * 
 * @param subtotalInRupees - Order subtotal in rupees
 * @param stateName - Shipping state name for location-based pricing
 * @returns Shipping fee in rupees
 */
export function calculateShippingFee(subtotalInRupees: number, stateName: string): number {
  // Free shipping for orders >= ₹1000
  if (subtotalInRupees >= 1000) {
    return 0
  }

  // Normalize state name for comparison (case-insensitive, trimmed)
  const normalizedState = stateName.trim().toLowerCase()

  // Tamil Nadu: ₹40
  if (normalizedState === 'tamil nadu') {
    return 40
  }

  // Kerala, Andhra Pradesh, Karnataka: ₹70
  if (
    normalizedState === 'kerala' ||
    normalizedState === 'andhra pradesh' ||
    normalizedState === 'karnataka'
  ) {
    return 70
  }

  // All other states: ₹100
  return 100
}

