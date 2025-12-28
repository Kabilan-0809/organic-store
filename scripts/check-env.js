/**
 * Check environment variables
 * 
 * This script verifies that all required environment variables are set.
 * It prints the keys (without exposing full values) for debugging.
 */

const fs = require('fs')
const path = require('path')

// Load .env.local if it exists
const envLocalPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

// Also try .env
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

console.log('\n=== Environment Variables Check ===\n')

const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  // Razorpay: Key ID can use NEXT_PUBLIC_ prefix (same value for frontend/backend)
  'NEXT_PUBLIC_RAZORPAY_KEY_ID': process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
  'RAZORPAY_KEY_SECRET': process.env.RAZORPAY_KEY_SECRET,
}

let allPresent = true

for (const [key, value] of Object.entries(requiredVars)) {
  const isPresent = !!value
  const status = isPresent ? '✓' : '✗'
  const displayValue = value 
    ? `${value.substring(0, 20)}...${value.substring(value.length - 10)} (${value.length} chars)`
    : 'NOT SET'
  
  console.log(`${status} ${key}:`)
  console.log(`   ${displayValue}`)
  console.log(`   Present: ${isPresent}`)
  console.log('')
  
  if (!isPresent) {
    allPresent = false
  }
}

console.log(`\n=== Summary ===`)
console.log(`All required variables present: ${allPresent ? 'YES ✓' : 'NO ✗'}\n`)

if (!allPresent) {
  console.log('⚠️  Missing environment variables detected!')
  console.log('')
  console.log('Required variables:')
  console.log('  - Supabase: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.log('  - Razorpay: NEXT_PUBLIC_RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET')
  console.log('')
  console.log('📝 Setup instructions:')
  console.log('  1. Create a .env.local file in the project root')
  console.log('  2. Add your environment variables:')
  console.log('     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.log('     NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id')
  console.log('     RAZORPAY_KEY_SECRET=your_razorpay_key_secret')
  console.log('')
  console.log('  Get Razorpay keys from: https://dashboard.razorpay.com/app/keys')
  console.log('  Get Supabase keys from: https://app.supabase.com/project/_/settings/api')
  console.log('')
  console.log('  3. Restart your development server after adding variables\n')
  process.exit(1)
} else {
  console.log('✓ All environment variables are configured correctly.\n')
  process.exit(0)
}

