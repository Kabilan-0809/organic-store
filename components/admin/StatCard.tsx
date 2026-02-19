'use client'

interface StatCardProps {
    title: string
    value: string | number
    icon?: React.ReactNode
    trend?: string
    trendUp?: boolean
    description?: string
    color?: 'primary' | 'green' | 'blue' | 'yellow'
}

export default function StatCard({
    title,
    value,
    icon,
    trend,
    trendUp,
    description,
    color = 'primary'
}: StatCardProps) {

    const colorClasses = {
        primary: 'bg-primary-50 text-primary-700',
        green: 'bg-green-50 text-green-700',
        blue: 'bg-blue-50 text-blue-700',
        yellow: 'bg-yellow-50 text-yellow-700',
    }

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-500">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-neutral-900">{value}</h3>
                </div>
                {icon && (
                    <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
                        {icon}
                    </div>
                )}
            </div>
            {(trend || description) && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                    {trend && (
                        <span className={`font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </span>
                    )}
                    {description && <span className="text-neutral-500">{description}</span>}
                </div>
            )}
        </div>
    )
}
