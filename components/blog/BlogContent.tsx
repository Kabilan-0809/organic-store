import { ReactNode } from 'react'

interface BlogContentProps {
    content: string
    children?: ReactNode
}

/**
 * BlogContent Component
 * 
 * Renders blog post content with proper typography and formatting.
 * Converts markdown-style content to formatted HTML.
 */
export default function BlogContent({ content }: BlogContentProps) {
    // Split content into sections for better rendering
    const sections = content.trim().split('\n\n')

    const renderSection = (section: string, index: number) => {
        const trimmed = section.trim()

        // Main heading (# )
        if (trimmed.startsWith('# ')) {
            return (
                <h1 key={index} className="mb-6 text-4xl font-bold text-neutral-900 md:text-5xl">
                    {trimmed.substring(2)}
                </h1>
            )
        }

        // Subheading (## )
        if (trimmed.startsWith('## ')) {
            return (
                <h2 key={index} className="mb-4 mt-8 text-2xl font-bold text-neutral-900 md:text-3xl">
                    {trimmed.substring(3)}
                </h2>
            )
        }

        // Sub-subheading (### )
        if (trimmed.startsWith('### ')) {
            return (
                <h3 key={index} className="mb-3 mt-6 text-xl font-semibold text-neutral-800 md:text-2xl">
                    {trimmed.substring(4)}
                </h3>
            )
        }

        // List items (- or * )
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const items = trimmed.split('\n').filter(line => line.startsWith('- ') || line.startsWith('* '))
            return (
                <ul key={index} className="mb-4 ml-6 list-disc space-y-2 text-neutral-700">
                    {items.map((item, i) => (
                        <li key={i} className="leading-relaxed">
                            {formatInlineText(item.substring(2))}
                        </li>
                    ))}
                </ul>
            )
        }

        // Regular paragraph
        return (
            <p key={index} className="mb-4 leading-relaxed text-neutral-700">
                {formatInlineText(trimmed)}
            </p>
        )
    }

    // Format inline text: supports **bold** and [label](url) links
    const formatInlineText = (text: string): React.ReactNode[] => {
        // Tokenise by **bold** and [label](url) patterns
        const tokenRegex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g
        const parts = text.split(tokenRegex)

        return parts.map((part, i) => {
            // Bold: **text**
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={i} className="font-semibold text-neutral-900">
                        {part.slice(2, -2)}
                    </strong>
                )
            }
            // Link: [label](url)
            const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
            if (linkMatch) {
                const label = linkMatch[1] ?? ''
                const href = linkMatch[2] ?? '#'
                const isExternal = href.startsWith('http')
                return (
                    <a
                        key={i}
                        href={href}
                        className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-700"
                        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                        {label}
                    </a>
                )
            }
            return part
        })
    }

    return (
        <div className="prose prose-lg max-w-none">
            {sections.map((section, index) => renderSection(section, index))}
        </div>
    )
}
