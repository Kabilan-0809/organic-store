'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface AuthLayoutProps {
    children: React.ReactNode
    title: string
    subtitle: string
    imageSrc?: string
}

export default function AuthLayout({
    children,
    title,
    subtitle,
    imageSrc = '/image0.png', // Default fallback
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* Left Panel: Form Section */}
            <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link href="/" className="flex items-center gap-2 mb-10 group">
                            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                                M
                            </div>
                            <span className="text-xl font-bold text-neutral-900 tracking-tight">Millets N Joy</span>
                        </Link>

                        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-neutral-900">
                            {title}
                        </h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            {subtitle}
                        </p>
                    </motion.div>

                    <div className="mt-8">
                        {children}
                    </div>
                </div>
            </div>

            {/* Right Panel: Hero Image Section (Hidden on mobile) */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 h-full w-full bg-neutral-900">
                    {/* Background Image */}
                    <Image
                        src={imageSrc}
                        alt="Organic Food Background"
                        fill
                        className="h-full w-full object-cover opacity-90"
                        priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-20 text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                        >
                            <div className="h-1 w-20 bg-primary-500 mb-6 rounded-full" />
                            <h3 className="text-4xl font-bold leading-tight mb-4">
                                Experience the Goodness of Nature
                            </h3>
                            <p className="text-lg text-neutral-200 max-w-md leading-relaxed">
                                Join thousands of families who trust us for their daily dose of health and tradition.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
