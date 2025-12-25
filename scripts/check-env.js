/**
 * Check Supabase environment variables
 * 
 * This script verifies that all required Supabase environment variables are set.
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

console.log('\n=== Supabase Environment Variables Check ===\n')

const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
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
  console.log('⚠️  Missing environment variables will cause authentication to fail!')
  console.log('   Make sure to set them in .env.local or your deployment platform.\n')
  process.exit(1)
} else {
  console.log('✓ All environment variables are configured correctly.\n')
  process.exit(0)
}

