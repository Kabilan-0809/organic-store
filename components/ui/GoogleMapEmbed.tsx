'use client'

interface GoogleMapEmbedProps {
    className?: string
    height?: string
}

export default function GoogleMapEmbed({ className = '', height = '450px' }: GoogleMapEmbedProps) {
    return (
        <div className={`relative w-full overflow-hidden rounded-2xl bg-neutral-100 ${className}`} style={{ height }}>
            <iframe
                width="100%"
                height="100%"
                title="Millets N Joy Location"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src="https://maps.google.com/maps?q=Karuppiah%20Street%2C%20Coimbatore%2C%20Tamil%20Nadu&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="absolute inset-0 filter grayscale-[0.2] contrast-[1.1] opacity-90 hover:opacity-100 transition-opacity duration-300"
            ></iframe>
        </div>
    )
}
