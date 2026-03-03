/**
 * Generate PWA icons from SVG using sharp (if available) or a Canvas fallback.
 * Run: node scripts/generate-icons.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Check if sharp is available, if not try to use built-in canvas or Inkscape/rsvg
async function generateWithSharp(svgPath, sizes) {
  try {
    const { default: sharp } = await import('sharp')
    const svg = readFileSync(svgPath)
    for (const size of sizes) {
      const outPath = join(root, 'public', 'icons', `icon-${size}.png`)
      await sharp(svg).resize(size, size).png().toFile(outPath)
      console.log(`✅ Generated ${outPath}`)
    }
    return true
  } catch {
    return false
  }
}

async function generateWithSvgToPng(svgPath, sizes) {
  // Fallback: try svg2png-wasm or canvas
  try {
    const { default: svg2imgModule } = await import('svg2img')
    const svg = readFileSync(svgPath, 'utf8')
    for (const size of sizes) {
      const outPath = join(root, 'public', 'icons', `icon-${size}.png`)
      await new Promise((resolve, reject) => {
        svg2imgModule(svg, { width: size, height: size }, (err, buffer) => {
          if (err) reject(err)
          else { writeFileSync(outPath, buffer); resolve() }
        })
      })
      console.log(`✅ Generated ${outPath}`)
    }
    return true
  } catch {
    return false
  }
}

const svgPath = join(root, 'public', 'icons', 'icon.svg')
const sizes = [192, 512]

console.log('Generating PWA icons...')
const ok = await generateWithSharp(svgPath, sizes) || await generateWithSvgToPng(svgPath, sizes)

if (!ok) {
  console.log('⚠️  Could not auto-generate PNG icons.')
  console.log('   Please manually convert public/icons/icon.svg to:')
  console.log('   - public/icons/icon-192.png (192x192)')
  console.log('   - public/icons/icon-512.png (512x512)')
  console.log('   You can use: https://svgtopng.com or https://squoosh.app')
}
