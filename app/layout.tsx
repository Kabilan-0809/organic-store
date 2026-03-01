import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://milletsnjoy.com'),
  title: {
    default: 'Millets N Joy | Premium Organic Millet & Malt Products',
    template: '%s | Millets N Joy',
  },
  description:
    'Shop premium organic malt, saadha podi, and traditional millet products. 100% natural, preservative-free, and homemade style. Delivery available across India.',
  keywords: [
    'millets',
    'organic food',
    'health mix',
    'millet malt',
    'traditional food',
    'healthy snacks',
    'millets n joy',
    'saadha podi',
    'organic millet',
    'buy millets online'
  ],
  authors: [{ name: 'Millets N Joy' }],
  creator: 'Millets N Joy',
  publisher: 'Millets N Joy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Millets N Joy | Premium Organic Millet & Malt Products',
    description: 'Shop premium organic malt, saadha podi, and traditional millet products. 100% natural and homemade style.',
    url: 'https://milletsnjoy.com',
    siteName: 'Millets N Joy',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/Logo.png',
        width: 1200,
        height: 630,
        alt: 'Millets N Joy - Premium Organic Millet Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Millets N Joy | Premium Organic Millet & Malt Products',
    description: 'Premium organic millet products for a healthy lifestyle. 100% natural and preservative-free.',
    creator: '@milletsnjoy',
    images: ['/Logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/Logo.png',
    shortcut: '/Logo.png',
    apple: '/Logo.png',
  },
  manifest: '/site.webmanifest',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Millets N Joy',
  url: 'https://milletsnjoy.com',
  logo: 'https://milletsnjoy.com/logo.png', // Placeholder
  sameAs: [
    'https://www.instagram.com/milletsnjoy',
    'https://facebook.com/milletsnjoy', // Placeholder
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-8072101964',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: 'en',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ground Floor, No. 120/2,3,4, Karuppiah Street',
    addressLocality: 'Coimbatore',
    postalCode: '641001',
    addressCountry: 'IN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TRH3Z773');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="min-h-screen">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TRH3Z773"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* 
          Server layout ALWAYS renders children.
          Providers handles client-only logic safely.
          Ambient gradient overlay is applied via CSS ::before on body.
        */}
        <Providers>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
