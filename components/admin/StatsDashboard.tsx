'use client'

import { useEffect, useState } from 'react'
import StatCard from './StatCard'
import TopProductsTable from './TopProductsTable'
import LocationStats from './LocationStats'

export default function StatsDashboard() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/stats')
                if (!res.ok) throw new Error('Failed to fetch stats')
                const jsonData = await res.json()
                setData(jsonData)
            } catch (err) {
                console.error(err)
                setError('Failed to load statistics')
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="bg-red-50 p-4 text-red-600 rounded-lg">
                {error || 'No data available'}
            </div>
        )
    }

    const { metrics, topSellingProducts, locationStats } = data

    return (
        <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value={`₹${(metrics.totalRevenue / 100).toLocaleString()}`}
                    color="green"
                    description="Lifetime earnings"
                />
                <StatCard
                    title="Total Orders"
                    value={metrics.totalOrders}
                    color="blue"
                    description="All time orders"
                />
                <StatCard
                    title="Avg Order Value"
                    value={`₹${(metrics.averageOrderValue / 100).toFixed(0)}`}
                    color="primary"
                    description="Per order average"
                />
                <StatCard
                    title="Customers"
                    value={metrics.totalCustomers}
                    color="yellow"
                    description="Distinct buyers"
                />
            </div>

            {/* Charts / Tables Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Top Products - 2 Columns */}
                <div className="lg:col-span-2">
                    <TopProductsTable products={topSellingProducts} />
                </div>

                {/* Location Stats - 1 Column */}
                <div className="lg:col-span-1">
                    <LocationStats locations={locationStats} />
                </div>
            </div>
        </div>
    )
}
