'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthContext'
import { useRouter } from 'next/navigation'
import AnimatedPage from '@/components/AnimatedPage'

const GENDER_OPTIONS = [
    { value: 'female', label: '♀ Female' },
    { value: 'male', label: '♂ Male' },
    { value: 'other', label: '⚧ Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export default function ProfileContent() {
    const { isAuthenticated, email, isLoading: authLoading, accessToken } = useAuth()
    const router = useRouter()

    const [gender, setGender] = useState<string>('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fetchLoading, setFetchLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login?redirect=/profile')
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        if (!isAuthenticated || !accessToken) return
        fetch('/api/profile', {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.profile?.gender) setGender(data.profile.gender)
            })
            .catch(() => { })
            .finally(() => setFetchLoading(false))
    }, [isAuthenticated, accessToken])

    const handleSave = async () => {
        if (!gender) { setError('Please select a gender option'); return }
        setSaving(true)
        setError(null)
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ gender }),
            })
            if (!res.ok) throw new Error('Failed to save')
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch {
            setError('Failed to save. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (authLoading || fetchLoading) {
        return (
            <AnimatedPage>
                <div className="flex items-center justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600" />
                </div>
            </AnimatedPage>
        )
    }

    return (
        <AnimatedPage>
            <div className="mx-auto max-w-lg py-10 sm:py-16 px-4">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-8">My Profile</h1>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
                    {/* Email (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                        <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2.5 text-sm text-neutral-600">
                            {email ?? '—'}
                        </div>
                    </div>

                    {/* Gender selector */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-3">Gender</label>
                        <div className="grid grid-cols-2 gap-3">
                            {GENDER_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => { setGender(opt.value); setError(null) }}
                                    className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all text-left ${gender === opt.value
                                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                    </div>

                    {/* Save button */}
                    {saved && (
                        <div className="rounded-xl bg-primary-50 border border-primary-200 px-4 py-3 text-sm text-primary-700 font-medium">
                            ✅ Profile saved successfully!
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-800 active:scale-95 disabled:opacity-60"
                    >
                        {saving ? 'Saving…' : 'Save Profile'}
                    </button>
                </div>
            </div>
        </AnimatedPage>
    )
}
