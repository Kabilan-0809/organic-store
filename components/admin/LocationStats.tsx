'use client'

interface LocationStat {
    name: string
    value: number
}

export default function LocationStats({ locations }: { locations: LocationStat[] }) {
    // Take top 6 locations
    const topLocations = locations.slice(0, 6)

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden h-full">
            <div className="border-b border-neutral-200 px-6 py-4">
                <h3 className="font-semibold text-neutral-900">Orders by Location</h3>
            </div>
            <div className="p-6">
                {locations.length === 0 ? (
                    <p className="text-center text-neutral-500">No location data available</p>
                ) : (
                    <div className="space-y-4">
                        {topLocations.map((loc, index) => {
                            const max = topLocations[0]?.value || 1
                            const percent = (loc.value / max) * 100

                            return (
                                <div key={loc.name} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-neutral-700">{loc.name}</span>
                                        <span className="text-neutral-500">{loc.value} orders</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                        <div
                                            className="h-full bg-primary-500 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
