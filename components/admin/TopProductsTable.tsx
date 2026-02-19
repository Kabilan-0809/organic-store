'use client'

interface ProductStat {
    id: string
    name: string
    quantity: number
    revenue: number
}

export default function TopProductsTable({ products }: { products: ProductStat[] }) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-neutral-200 px-6 py-4">
                <h3 className="font-semibold text-neutral-900">Top Selling Products</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-neutral-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Product Name</th>
                            <th className="px-6 py-3 font-medium text-right">Sold</th>
                            <th className="px-6 py-3 font-medium text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">No sales data yet</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-3 font-medium text-neutral-900 text-truncate max-w-xs truncate" title={product.name}>
                                        {product.name}
                                    </td>
                                    <td className="px-6 py-3 text-right text-neutral-600">
                                        {product.quantity} units
                                    </td>
                                    <td className="px-6 py-3 text-right font-medium text-neutral-900">
                                        ₹{(product.revenue / 100).toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
