import type { Metadata } from 'next'
import ProductDetailPageContent from '@/components/shop/ProductDetailPageContent'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

// Prevent caching to ensure fresh product data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ProductSlugPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({
  params,
}: ProductSlugPageProps): Promise<Metadata> {
  const { data: products } = await supabase
    .from('Product')
    .select('*')
    .eq('slug', params.slug)
    .eq('isActive', true)
    .limit(1)

  const product = products && products.length > 0 ? products[0] : null

  if (!product) {
    return {
      title: 'Product not found | Millets N Joy',
      description:
        'This product could not be found. It may have been moved or is no longer available.',
    }
  }

  const baseTitle = `${product.name} | Millets N Joy`
  const description = product.description || `Buy ${product.name} at Millets N Joy`

  return {
    title: baseTitle,
    description,
    openGraph: {
      title: baseTitle,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  }
}

export default async function ProductSlugPage({ params }: ProductSlugPageProps) {
  // Fetch product with variants (same query as API route)
  const { data: products, error } = await supabase
    .from('Product')
    .select(`
      *,
      ProductVariant (
        id,
        sizeGrams,
        price,
        stock
      )
    `)
    .eq('slug', params.slug)
    .eq('isActive', true)
    .limit(1)

  if (error || !products || products.length === 0) {
    notFound()
  }

  const product: any = products[0]
  const isMalt = product.category === 'Malt'
  const variants = product.ProductVariant || []

  // For malt products: check if any variant has stock
  // For non-malt: use product stock
  let inStock: boolean
  let stock: number

  if (isMalt) {
    const hasStock = variants.some((v: any) => v.stock > 0)
    const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
    inStock = product.isActive && hasStock
    stock = totalStock
  } else {
    inStock = product.isActive && product.stock > 0
    stock = product.stock
  }

  // Map to Product type expected by component
  const mappedProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price / 100, // Convert paise to rupees
    discountPercent: product.discountPercent,
    category: product.category,
    image: product.imageUrl,
    inStock: inStock,
    stock: stock,
    // Include variants for malt products
    ...(isMalt && {
      variants: variants.map((v: any) => ({
        id: v.id,
        sizeGrams: v.sizeGrams,
        price: v.price / 100, // Convert paise to rupees
        stock: v.stock,
        inStock: v.stock > 0,
      })),
    }),
  }
  return <ProductDetailPageContent product={mappedProduct} />
}
