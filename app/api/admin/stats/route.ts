import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createErrorResponse, unauthorizedResponse, requireAdmin } from '@/lib/auth/api-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/stats
 * 
 * Aggregates statistics for the Admin Dashboard.
 * - Revenue, Orders, Top Products, Low Stock, Locations.
 */
export async function GET() {
    try {
        const supabase = createSupabaseServer()

        // 1. Check Admin Auth
        const admin = await requireAdmin()
        if (!admin) {
            return unauthorizedResponse()
        }

        // 3. Fetch All Products
        const { data: products, error: productsError } = await supabase
            .from('Product')
            .select('id, name, price, stock, category')

        if (productsError) {
            return createErrorResponse('Failed to fetch products', 500)
        }

        // 2. Fetch All Orders
        // OrderItem is a separate table, so we need to join it
        // Assuming table name is 'OrderItem' and related by 'orderId'
        const { data: orders, error: ordersError } = await supabase
            .from('Order')
            .select('id, totalAmount, status, createdAt, userId, addressLine1, city, state, items:OrderItem(*)')
            .order('createdAt', { ascending: false })

        if (ordersError) {
            console.error('Stats Order Fetch Error:', ordersError)
            return createErrorResponse('Failed to fetch orders', 500)
        }

        // 4. Aggregate Data

        // Metrics
        const totalOrders = orders.length

        // Revenue (Only Paid/Confirmed/Delivered/Shipped)
        const validOrders = orders.filter(o =>
            ['ORDER_CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(o.status)
        )
        const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

        // Average Order Value
        const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0

        // Orders by Status
        const ordersByStatus = orders.reduce((acc: Record<string, number>, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1
            return acc
        }, {})

        // Top Selling Products
        const productSales: Record<string, { id: string, name: string, quantity: number, revenue: number }> = {}

        validOrders.forEach(order => {
            const items = order.items as any[] || []
            items.forEach((item: any) => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        id: item.productId,
                        name: item.productName || 'Unknown',
                        quantity: 0,
                        revenue: 0
                    }
                }

                const entry = productSales[item.productId]
                if (entry) {
                    entry.quantity += (item.quantity || 0)
                    entry.revenue += (item.price || 0) * (item.quantity || 0)
                }
            })
        })

        const topSellingProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5)

        // Low Stock Products
        const lowStockProducts = products
            .filter(p => p.stock < 10) // Threshold 10
            .map(p => ({ id: p.id, name: p.name, stock: p.stock }))

        // Orders by Location (State)
        const ordersByLocation = orders.reduce((acc: Record<string, number>, o) => {
            const loc = o.state || 'Unknown'
            acc[loc] = (acc[loc] || 0) + 1
            return acc
        }, {})

        const locationStats = Object.entries(ordersByLocation)
            .map(([name, count]) => ({ name, value: count }))
            .sort((a, b) => b.value - a.value)

        // Distinct Customers
        const distinctUserIds = new Set(orders.map(o => o.userId).filter(Boolean))
        const totalCustomers = distinctUserIds.size

        return NextResponse.json({
            metrics: {
                totalRevenue,
                totalOrders,
                averageOrderValue,
                totalCustomers
            },
            ordersByStatus,
            recentOrders: orders.slice(0, 5), // Already sorted desc
            topSellingProducts,
            lowStockProducts,
            locationStats
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0' // No cache for admin stats
            }
        })

    } catch (error) {
        console.error('[API Admin Stats] Error:', error)
        return createErrorResponse('Internal Server Error', 500)
    }
}
