import ProtectedRoute from '@/components/auth/ProtectedRoute'
import StatsDashboard from '@/components/admin/StatsDashboard'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminStatsPage() {
    return (
        <ProtectedRoute adminOnly>
            <div className="flex min-h-screen bg-neutral-50">
                <div className="w-64 flex-shrink-0">
                    <AdminSidebar />
                </div>
                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h1>
                        <p className="mt-1 text-sm text-neutral-600">
                            Overview of your store's performance
                        </p>
                    </div>
                    <StatsDashboard />
                </main>
            </div>
        </ProtectedRoute>
    )
}
