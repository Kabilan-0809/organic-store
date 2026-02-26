// Seed existing blog posts from lib/blog-data.ts into Supabase BlogPost table
// Run with: npx tsx scripts/seed-blogs.js
// Safe to run multiple times — uses upsert on slug

const fs = require('fs')
const path = require('path')

// Manually load .env.local or .env (avoids needing dotenv package)
const envFile = ['.env.local', '.env'].map(f => path.join(__dirname, '..', f)).find(f => fs.existsSync(f))
if (envFile) {
    const lines = fs.readFileSync(envFile, 'utf-8').split('\n')
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx === -1) continue
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = val
    }
}

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ── Paste blog posts data here (from lib/blog-data.ts) ────────────────────
// To avoid TypeScript compilation, we define the posts inline.
// This is a seed script — run it once after creating the BlogPost table.

const { blogPosts } = require('../lib/blog-data') // may fail if TS — see note below

async function seed() {
    console.log(`Seeding ${blogPosts.length} blog posts into Supabase...`)

    const records = blogPosts.map((post, index) => ({
        slug: post.slug,
        title: post.title,
        tagline: post.tagline || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        author: post.author || 'Millets N Joy',
        publishedDate: post.publishedDate,
        readingTime: post.readingTime || 5,
        heroImage: post.heroImage || '/blog/default.jpg',
        category: post.category || 'Health & Nutrition',
        keywords: post.keywords || [],
        metaDescription: post.metaDescription || '',
        sortOrder: index,
        isVisible: true,
    }))

    const { data, error } = await supabase
        .from('BlogPost')
        .upsert(records, { onConflict: 'slug' })
        .select('slug')

    if (error) {
        console.error('Seed error:', error)
        process.exit(1)
    }

    console.log(`✅ Successfully seeded ${data.length} blog posts.`)
}

seed()
