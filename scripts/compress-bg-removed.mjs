import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(__dirname, '..', 'public', 'BG_Removed')

const files = (await readdir(dir)).filter(f => f.endsWith('.png'))

let totalBefore = 0, totalAfter = 0

for (const file of files) {
    const filePath = path.join(dir, file)
    const before = (await stat(filePath)).size
    totalBefore += before

    // Compress in-place: resize to max 1200px wide, optimize PNG
    await sharp(filePath)
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: false, quality: 85 })
        .toFile(filePath + '.tmp')

    // Replace original with compressed version
    const { rename, unlink } = await import('fs/promises')
    await unlink(filePath)
    await rename(filePath + '.tmp', filePath)

    const after = (await stat(filePath)).size
    totalAfter += after
    const saved = Math.round((1 - after / before) * 100)
    console.log(`✓ ${file}: ${(before / 1024 / 1024).toFixed(2)}MB → ${(after / 1024 / 1024).toFixed(2)}MB (-${saved}%)`)
}

console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(1)}MB (saved ${(((totalBefore - totalAfter) / 1024 / 1024)).toFixed(1)}MB)`)
