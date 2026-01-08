'use client'

import { useReducedMotion } from 'framer-motion'

const MARQUEE_TEXT = [
    { text: "Happy Pongal! 🌾", emoji: "☀️" },
    { text: "Flat 10% OFF on all products!", emoji: "🥗" },
    { text: "Celebrate Tradition", emoji: "🍯" },
    { text: "Harvest Festival Special", emoji: "✨" },
    { text: "Limited Time Offer", emoji: "⏳" },
]

export default function MarqueeBanner() {
    const shouldReduceMotion = useReducedMotion()
    // Repeat the content enough times to ensure seamless loop
    // We double the content to allow for the -50% translation trick
    const content = [...MARQUEE_TEXT, ...MARQUEE_TEXT, ...MARQUEE_TEXT, ...MARQUEE_TEXT]

    return (
        <div className="relative w-full overflow-hidden bg-surface py-6 sm:py-8">
            {/* Container for the scrolling track */}
            <div className="flex w-max">
                <div
                    className={`flex items-center gap-8 px-4 ${shouldReduceMotion ? '' : 'animate-marquee'}`}
                >
                    {content.map((item, index) => (
                        <div
                            key={`${item.text}-${index}`}
                            className="flex items-center gap-3 whitespace-nowrap"
                        >
                            <span className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 drop-shadow-sm">
                                {item.text}
                            </span>
                            <span className="text-xl sm:text-2xl lg:text-3xl filter hover:scale-110 transition-transform cursor-default">
                                {item.emoji}
                            </span>
                            {/* Separator dot */}
                            <span className="block h-2 w-2 rounded-full bg-amber-400" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Fade edges for smooth look */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent sm:w-16" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:w-16" />
        </div>
    )
}
