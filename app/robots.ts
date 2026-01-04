import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://milletsnjoy.com' // Replace with actual domain

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/profile/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
