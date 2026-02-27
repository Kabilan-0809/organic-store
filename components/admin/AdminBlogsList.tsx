'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface BlogPost {
    id: string
    slug: string
    title: string
    tagline: string
    excerpt: string
    content: string
    author: string
    publishedDate: string
    readingTime: number
    heroImage: string
    category: string
    keywords: string[]
    metaDescription: string
    sortOrder: number
    isVisible: boolean
    createdAt: string
}

const EMPTY_FORM: Omit<BlogPost, 'id' | 'sortOrder' | 'isVisible' | 'createdAt'> = {
    slug: '',
    title: '',
    tagline: '',
    excerpt: '',
    content: '',
    author: 'Millets N Joy',
    publishedDate: new Date().toISOString().split('T')[0] as string,
    readingTime: 5,
    heroImage: '',
    category: 'Health & Nutrition',
    keywords: [],
    metaDescription: '',
}

export default function AdminBlogsList({ accessToken }: { accessToken: string | null }) {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [view, setView] = useState<'list' | 'form'>('list')
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [keywordsInput, setKeywordsInput] = useState('')
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [reorderingId, setReorderingId] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const contentRef = useRef<HTMLTextAreaElement>(null)

    const headers = {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch('/api/admin/blogs', { headers })
            if (!res.ok) throw new Error('Failed to load blog posts')
            const data = await res.json()
            setPosts(data.posts || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [accessToken])

    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    function openNewForm() {
        setEditingPost(null)
        setForm(EMPTY_FORM)
        setKeywordsInput('')
        setFormError(null)
        setView('form')
    }

    function openEditForm(post: BlogPost) {
        setEditingPost(post)
        setForm({
            slug: post.slug,
            title: post.title,
            tagline: post.tagline,
            excerpt: post.excerpt,
            content: post.content,
            author: post.author,
            publishedDate: post.publishedDate,
            readingTime: post.readingTime,
            heroImage: post.heroImage,
            category: post.category,
            keywords: post.keywords,
            metaDescription: post.metaDescription,
        })
        setKeywordsInput((post.keywords || []).join(', '))
        setFormError(null)
        setView('form')
    }

    function cancelForm() {
        setView('list')
        setEditingPost(null)
        setFormError(null)
    }

    function insertLink() {
        const text = prompt('Link text (label):')
        if (!text) return
        const url = prompt('URL (e.g. https://milletsnjoy.com/shop):')
        if (!url) return
        const markdown = `[${text}](${url})`

        const textarea = contentRef.current
        if (!textarea) {
            setForm((f) => ({ ...f, content: f.content + markdown }))
            return
        }

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = textarea.value.substring(0, start)
        const after = textarea.value.substring(end)
        const newContent = before + markdown + after
        setForm((f) => ({ ...f, content: newContent }))

        // Restore focus and move cursor after inserted link
        requestAnimationFrame(() => {
            textarea.focus()
            const newCursor = start + markdown.length
            textarea.setSelectionRange(newCursor, newCursor)
        })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setFormError(null)

        const payload = {
            ...form,
            keywords: keywordsInput
                .split(',')
                .map((k) => k.trim())
                .filter(Boolean),
            readingTime: Number(form.readingTime),
        }

        try {
            let res: Response
            if (editingPost) {
                res = await fetch(`/api/admin/blogs/${editingPost.id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(payload),
                })
            } else {
                res = await fetch('/api/admin/blogs', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload),
                })
            }

            const data = await res.json()
            if (!res.ok) {
                setFormError(data.error || 'Something went wrong')
                return
            }

            await fetchPosts()
            setView('list')
        } catch (err: any) {
            setFormError(err.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(post: BlogPost) {
        if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
        setDeletingId(post.id)
        try {
            const res = await fetch(`/api/admin/blogs/${post.id}`, { method: 'DELETE', headers })
            if (!res.ok) throw new Error('Delete failed')
            await fetchPosts()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setDeletingId(null)
        }
    }

    async function handleToggleVisibility(post: BlogPost) {
        setTogglingId(post.id)
        try {
            const res = await fetch(`/api/admin/blogs/${post.id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ isVisible: !post.isVisible }),
            })
            if (!res.ok) throw new Error('Toggle failed')
            setPosts((prev) =>
                prev.map((p) => (p.id === post.id ? { ...p, isVisible: !p.isVisible } : p))
            )
        } catch (err: any) {
            alert(err.message)
        } finally {
            setTogglingId(null)
        }
    }

    async function handleReorder(post: BlogPost, direction: 'up' | 'down') {
        const idx = posts.findIndex((p) => p.id === post.id)
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= posts.length) return

        const swapPost = posts[swapIdx]
        if (!swapPost) return
        setReorderingId(post.id)

        try {
            await Promise.all([
                fetch(`/api/admin/blogs/${post.id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ sortOrder: swapPost.sortOrder }),
                }),
                fetch(`/api/admin/blogs/${swapPost.id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ sortOrder: post.sortOrder }),
                }),
            ])

            // Optimistically swap in local state
            const newPosts = [...posts]
            newPosts[idx] = { ...swapPost, sortOrder: post.sortOrder }
            newPosts[swapIdx] = { ...post, sortOrder: swapPost.sortOrder }
            newPosts.sort((a, b) => a.sortOrder - b.sortOrder)
            setPosts(newPosts)
        } catch (err: any) {
            alert(err.message)
            await fetchPosts()
        } finally {
            setReorderingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
                <p className="font-medium">{error}</p>
                <button onClick={fetchPosts} className="mt-3 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
                    Retry
                </button>
            </div>
        )
    }

    // ── FORM VIEW ─────────────────────────────────────────────────────────────
    if (view === 'form') {
        return (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-neutral-900">
                        {editingPost ? 'Edit Blog Post' : 'Add New Blog Post'}
                    </h2>
                    <button
                        onClick={cancelForm}
                        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                    >
                        ← Back to List
                    </button>
                </div>

                {formError && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Title *" required>
                            <input
                                required
                                value={form.title}
                                onChange={(e) => {
                                    const title = e.target.value
                                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                                    setForm((f) => ({ ...f, title, ...(!editingPost ? { slug } : {}) }))
                                }}
                                className={inputCls}
                                placeholder="Complete Guide to Health Benefits of Millets"
                            />
                        </Field>

                        <Field label="Slug *" required>
                            <input
                                required
                                value={form.slug}
                                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                                className={inputCls}
                                placeholder="health-benefits-of-millets"
                            />
                        </Field>
                    </div>

                    <Field label="Tagline">
                        <input
                            value={form.tagline}
                            onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                            className={inputCls}
                            placeholder="Discover why millets are the superfood your body needs"
                        />
                    </Field>

                    <Field label="Excerpt">
                        <textarea
                            rows={2}
                            value={form.excerpt}
                            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                            className={inputCls}
                            placeholder="Short summary shown on the blog listing page..."
                        />
                    </Field>

                    <Field label="Content (Markdown) *" required>
                        {/* Toolbar */}
                        <div className="mb-1.5 flex gap-2">
                            <button
                                type="button"
                                onClick={insertLink}
                                className="inline-flex items-center gap-1.5 rounded border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                title="Insert a markdown link at current cursor position"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Insert Link
                            </button>
                        </div>
                        <textarea
                            ref={contentRef}
                            required
                            rows={14}
                            value={form.content}
                            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                            className={`${inputCls} font-mono text-sm`}
                            placeholder={`# Your Blog Post Title\n\nWrite your content in Markdown...\n\nAdd links like: [Shop Now](https://milletsnjoy.com/shop)`}
                        />
                        <p className="mt-1 text-xs text-neutral-400">
                            Use <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono">[label](https://url.com)</code> to add clickable links in your content.
                        </p>
                    </Field>

                    <Field label="Meta Description">
                        <textarea
                            rows={2}
                            value={form.metaDescription}
                            onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                            className={inputCls}
                            placeholder="SEO meta description (150-160 chars recommended)"
                        />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-3">
                        <Field label="Category">
                            <input
                                value={form.category}
                                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                className={inputCls}
                                placeholder="Health & Nutrition"
                            />
                        </Field>

                        <Field label="Author">
                            <input
                                value={form.author}
                                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                                className={inputCls}
                            />
                        </Field>

                        <Field label="Reading Time (min)">
                            <input
                                type="number"
                                min={1}
                                value={form.readingTime}
                                onChange={(e) => setForm((f) => ({ ...f, readingTime: Number(e.target.value) }))}
                                className={inputCls}
                            />
                        </Field>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Published Date">
                            <input
                                type="date"
                                value={form.publishedDate}
                                onChange={(e) => setForm((f) => ({ ...f, publishedDate: e.target.value }))}
                                className={inputCls}
                            />
                        </Field>

                        <Field label="Hero Image URL">
                            <input
                                value={form.heroImage}
                                onChange={(e) => setForm((f) => ({ ...f, heroImage: e.target.value }))}
                                className={inputCls}
                                placeholder="/blog/my-image.jpg"
                            />
                        </Field>
                    </div>

                    <Field label="Keywords (comma-separated)">
                        <input
                            value={keywordsInput}
                            onChange={(e) => setKeywordsInput(e.target.value)}
                            className={inputCls}
                            placeholder="millet health benefits, ancient grains, organic millets"
                        />
                    </Field>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving…' : editingPost ? 'Save Changes' : 'Publish Blog Post'}
                        </button>
                        <button
                            type="button"
                            onClick={cancelForm}
                            className="rounded-lg border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    // ── LIST VIEW ─────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Blog Posts</h2>
                    <p className="text-sm text-neutral-500">{posts.length} posts total</p>
                </div>
                <button
                    onClick={openNewForm}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Blog Post
                </button>
            </div>

            {posts.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-neutral-200 py-16 text-center">
                    <svg className="mx-auto mb-4 h-12 w-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-neutral-500">No blog posts yet.</p>
                    <button onClick={openNewForm} className="mt-4 rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                        Create your first post
                    </button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="w-16 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Order</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Title</th>
                                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 sm:table-cell">Category</th>
                                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 md:table-cell">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Visible</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {posts.map((post, idx) => (
                                <tr key={post.id} className={`transition-colors hover:bg-neutral-50 ${!post.isVisible ? 'opacity-50' : ''}`}>
                                    {/* Reorder buttons */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-0.5">
                                            <button
                                                onClick={() => handleReorder(post, 'up')}
                                                disabled={idx === 0 || reorderingId === post.id}
                                                className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-30"
                                                title="Move up"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleReorder(post, 'down')}
                                                disabled={idx === posts.length - 1 || reorderingId === post.id}
                                                className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-30"
                                                title="Move down"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-neutral-900 line-clamp-1">{post.title}</p>
                                            <p className="text-xs text-neutral-400">/{post.slug}</p>
                                        </div>
                                    </td>

                                    <td className="hidden px-4 py-3 sm:table-cell">
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                            {post.category}
                                        </span>
                                    </td>

                                    <td className="hidden px-4 py-3 text-sm text-neutral-500 md:table-cell">
                                        {new Date(post.publishedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>

                                    {/* Visibility toggle */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggleVisibility(post)}
                                            disabled={togglingId === post.id}
                                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed ${post.isVisible ? 'bg-primary-600' : 'bg-neutral-300'
                                                }`}
                                            title={post.isVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${post.isVisible ? 'translate-x-4' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={`/blog/${post.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                                                title="Preview"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>

                                            <button
                                                onClick={() => openEditForm(post)}
                                                className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                                                title="Edit"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => handleDelete(post)}
                                                disabled={deletingId === post.id}
                                                className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// ── Helpers ────────────────────────────────────────────────────────────────
const inputCls = 'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                {label}{required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {children}
        </div>
    )
}
