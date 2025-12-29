import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

// Type definitions (no longer from Prisma)
interface Order {
  id: string
  userId: string
  status: string
  totalAmount: number
  currency: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  razorpayPaymentId: string | null
  paidAt: string | null
  createdAt: string
}

interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  unitPrice: number
  discountPercent: number | null
  finalPrice: number
  quantity: number
  createdAt: string
}

interface User {
  id: string
  email: string
  role: string
}

interface InvoiceData {
  order: Order & {
    items: OrderItem[]
    user: User
  }
  isAdmin: boolean
}

/**
 * Get font path for PDF generation
 * Works in both local dev and Vercel production
 */
function getFontPath(): string | null {
  // Resolve font path relative to project root
  // Works in both development and production (Vercel)
  const fontPath = path.join(process.cwd(), 'assets', 'fonts', 'Inter-Regular.ttf')
  
  // Check if font file exists
  if (fs.existsSync(fontPath)) {
    return fontPath
  }
  
  // Fallback: Try alternative locations
  const altPaths = [
    path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf'),
    path.join(__dirname, '..', '..', 'assets', 'fonts', 'Inter-Regular.ttf'),
  ]
  
  for (const altPath of altPaths) {
    if (fs.existsSync(altPath)) {
      return altPath
    }
  }
  
  // Font not found - return null (will use fallback)
  console.warn(
    `[PDF Generation] Font file not found at ${fontPath}. ` +
    `Using fallback approach. Please add Inter-Regular.ttf to assets/fonts/ for best results.`
  )
  return null
}

/**
 * Generate invoice PDF for an order
 * 
 * @param invoiceData - Order data with user and items
 * @returns PDF buffer
 */
export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
  const { order } = invoiceData

  return new Promise((resolve, reject) => {
    try {
      // Get font path
      const fontPath = getFontPath()

      // Create PDF document
      const doc = new PDFDocument({ 
        margin: 50, 
        size: 'A4',
      })
      const buffers: Buffer[] = []

      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })
      doc.on('error', (err) => {
        console.error('[PDF Generation] Error:', err)
        reject(err)
      })

      // Register and use custom font if available
      // DO NOT use PDFKit default font names (Helvetica, Times-Roman, etc.)
      if (fontPath) {
        try {
          doc.registerFont('CustomFont', fontPath)
          doc.registerFont('CustomFontBold', fontPath) // Use same font for bold
          // Set default font before writing any text
          doc.font('CustomFont')
        } catch (fontError) {
          console.error('[PDF Generation] Failed to register font:', fontError)
          // Continue without custom font - PDFKit will use its internal fallback
          // But we still need to avoid using default font names
          throw new Error('Custom font registration failed. Please ensure Inter-Regular.ttf exists in assets/fonts/')
        }
      } else {
        // Font file not found - throw error with instructions
        throw new Error(
          'Font file not found. Please add Inter-Regular.ttf to assets/fonts/ directory. ' +
          'Run: node scripts/download-font.js or download from https://fonts.google.com/specimen/Inter'
        )
      }

      // Header
      doc
        .fontSize(20)
        .font('CustomFontBold')
        .text('Millets N Joy', 50, 50)
        .fontSize(12)
        .font('CustomFont')
        .text('Invoice', 50, 80)

      // Order Info
      let yPos = 120
      doc
        .fontSize(10)
        .font('CustomFont')
        .text(`Order ID: ${order.id}`, 50, yPos)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, yPos + 15)

      // Customer Info
      yPos += 50
      doc
        .fontSize(12)
        .font('CustomFontBold')
        .text('Bill To:', 50, yPos)
        .fontSize(10)
        .font('CustomFont')
        .text(order.user.email, 50, yPos + 15)

      // Delivery Address
      yPos += 60
      doc
        .fontSize(12)
        .font('CustomFontBold')
        .text('Delivery Address:', 50, yPos)
        .fontSize(10)
        .font('CustomFont')
        .text(order.addressLine1, 50, yPos + 15)
      if (order.addressLine2) {
        doc.text(order.addressLine2, 50, yPos + 30)
      }
      doc
        .text(`${order.city}, ${order.state} ${order.postalCode}`, 50, yPos + 45)
        .text(order.country, 50, yPos + 60)

      // Items Table
      yPos += 120
      doc
        .fontSize(12)
        .font('CustomFontBold')
        .text('Items', 50, yPos)

      yPos += 20
      // Table header
      doc
        .fontSize(10)
        .font('CustomFontBold')
        .text('Product', 50, yPos)
        .text('Qty', 200, yPos)
        .text('Price', 250, yPos)
        .text('Amount', 350, yPos)

      yPos += 20
      doc
        .moveTo(50, yPos)
        .lineTo(550, yPos)
        .stroke()

      yPos += 10

      // Items
      doc.font('CustomFont')
      for (const item of order.items) {
        const unitPrice = item.unitPrice / 100
        const finalPrice = item.finalPrice / 100

        doc
          .text(item.productName, 50, yPos, { width: 140 })
          .text(item.quantity.toString(), 200, yPos)
          .text(`₹${unitPrice.toFixed(2)}`, 250, yPos)
          .text(`₹${finalPrice.toFixed(2)}`, 350, yPos)

        yPos += 20
      }

      // Price Breakdown
      yPos += 20
      doc
        .moveTo(50, yPos)
        .lineTo(550, yPos)
        .stroke()

      yPos += 15

      // Subtotal
      const subtotal = order.totalAmount / 100
      doc
        .fontSize(10)
        .font('CustomFont')
        .text('Subtotal:', 400, yPos)
        .text(`₹${subtotal.toFixed(2)}`, 450, yPos)

      yPos += 20

      // Tax (GST 18%)
      const taxRate = 0.18
      const taxAmount = subtotal * taxRate
      doc
        .text(`GST (18%):`, 400, yPos)
        .text(`₹${taxAmount.toFixed(2)}`, 450, yPos)

      yPos += 20

      // Total
      const total = subtotal + taxAmount
      doc
        .fontSize(12)
        .font('CustomFontBold')
        .text('Total:', 400, yPos)
        .text(`₹${total.toFixed(2)}`, 450, yPos)

      // Payment Info
      yPos += 40
      if (order.razorpayPaymentId) {
        doc
          .fontSize(10)
          .font('CustomFont')
          .text(`Payment ID: ${order.razorpayPaymentId.substring(0, 20)}...`, 50, yPos)
      }
      if (order.paidAt) {
        doc.text(`Paid: ${new Date(order.paidAt).toLocaleString()}`, 50, yPos + 15)
      }

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
