/**
 * Script to download Inter-Regular.ttf font for PDF invoice generation
 * 
 * Run: node scripts/download-font.js
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

// Try multiple sources for Inter font
const FONT_SOURCES = [
  'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.ttf',
  'https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Regular.ttf',
]
const FONT_URL = FONT_SOURCES[0]
const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts')
const FONT_PATH = path.join(FONT_DIR, 'Inter-Regular.ttf')

// Create directory if it doesn't exist
if (!fs.existsSync(FONT_DIR)) {
  fs.mkdirSync(FONT_DIR, { recursive: true })
  console.log('Created assets/fonts directory')
}

// Check if font already exists
if (fs.existsSync(FONT_PATH)) {
  console.log('Font file already exists:', FONT_PATH)
  process.exit(0)
}

console.log('Downloading Inter-Regular.ttf...')
console.log('Source:', FONT_URL)
console.log('Destination:', FONT_PATH)

const file = fs.createWriteStream(FONT_PATH)

https.get(FONT_URL, (response) => {
  if (response.statusCode === 200) {
    response.pipe(file)
    file.on('finish', () => {
      file.close()
      console.log('✓ Font downloaded successfully!')
      console.log('Font file location:', FONT_PATH)
    })
  } else if (response.statusCode === 302 || response.statusCode === 301) {
    // Handle redirect
    file.close()
    fs.unlinkSync(FONT_PATH)
    console.log('Redirect detected. Please download manually from:')
    console.log('https://fonts.google.com/specimen/Inter')
    console.log('Or: https://github.com/rsms/inter')
    process.exit(1)
  } else {
    file.close()
    fs.unlinkSync(FONT_PATH)
    console.error('Failed to download font. Status:', response.statusCode)
    console.log('Please download Inter-Regular.ttf manually from:')
    console.log('https://fonts.google.com/specimen/Inter')
    console.log('And place it in:', FONT_PATH)
    process.exit(1)
  }
}).on('error', (err) => {
  file.close()
  if (fs.existsSync(FONT_PATH)) {
    fs.unlinkSync(FONT_PATH)
  }
  console.error('Error downloading font:', err.message)
  console.log('Please download Inter-Regular.ttf manually from:')
  console.log('https://fonts.google.com/specimen/Inter')
  console.log('And place it in:', FONT_PATH)
  process.exit(1)
})

