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
  metadataBase: new URL('https://milletsnjoy.com'), // Replace with actual domain
  title: {
    default: 'Millets N Joy | Traditional Millet Products',
    template: '%s | Millets N Joy',
  },
  description:
    'Discover premium malt, saadha podi, and traditional millet products made with quality ingredients and authentic preparation. Natural, healthy, and delicious.',
  keywords: ['millets', 'organic food', 'health mix', 'millet malt', 'traditional food', 'healthy snacks', 'millets n joy'],
  authors: [{ name: 'Millets N Joy' }],
  openGraph: {
    title: 'Millets N Joy | Traditional Millet Products',
    description: 'Discover premium malt, saadha podi, and traditional millet products. 100% natural and homemade style.',
    url: 'https://milletsnjoy.com',
    siteName: 'Millets N Joy',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Millets N Joy | Traditional Millet Products',
    description: 'Premium organic millet products for a healthy lifestyle.',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        {/* 
          Server layout ALWAYS renders children.
          Providers handles client-only logic safely.
          Ambient gradient overlay is applied via CSS ::before on body.
        */}
        <Providers>
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
