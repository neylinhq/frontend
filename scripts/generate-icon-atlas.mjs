/**
 * Generate icon sprite atlas for WebGL rendering.
 *
 * Renders SVG icons into a 256x256 PNG atlas using sharp.
 * White stroke icons on transparent background.
 *
 * Usage: node scripts/generate-icon-atlas.mjs
 * Output: public/assets/icons.png + public/assets/icons.json
 */

import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = resolve(__dirname, '../public/assets')

const ATLAS_SIZE = 512
const ICON_SIZE = 128
const COLS = ATLAS_SIZE / ICON_SIZE // 4
const PAD = 16

// Icon SVG paths from @untitledui/icons-react/outline (viewBox 0 0 24 24, stroke)
const ICONS = {
  brain:
    'M17.115 15.358q-.405.459-.851.906c-4.296 4.295-9.678 5.878-12.021 3.535-1.607-1.606-1.368-4.641.325-7.775M6.89 8.725q.422-.48.888-.947C12.074 3.482 17.456 1.9 19.8 4.243c1.608 1.607 1.367 4.645-.33 7.781m-3.206-4.246c4.296 4.296 5.88 9.678 3.536 12.021s-7.725.76-12.02-3.535c-4.297-4.296-5.88-9.678-3.536-12.021s7.725-.76 12.02 3.535M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
  'file-text':
    'M14 2.27V6.4c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C14.76 8 15.04 8 15.6 8h4.13M20 9.988V17.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.72 22 16.88 22 15.2 22H8.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C4 19.72 4 18.88 4 17.2V6.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C6.28 2 7.12 2 8.8 2h3.212c.733 0 1.1 0 1.446.083.306.073.598.195.867.36.303.185.562.444 1.08.963l3.19 3.188c.518.519.777.778.963 1.081a3 3 0 0 1 .36.867c.082.346.082.712.082 1.446',
  'graduation-cap':
    'M5 10v6.011c0 .36 0 .539.055.697a1 1 0 0 0 .23.374c.118.12.278.2.6.36l5.4 2.7c.262.131.393.197.53.223q.186.034.37 0c.137-.026.268-.091.53-.223l5.4-2.7c.322-.16.482-.24.6-.36a1 1 0 0 0 .23-.374c.055-.158.055-.338.055-.697v-6.01M2 8.5l9.642-4.822c.131-.066.197-.098.266-.111a.5.5 0 0 1 .184 0c.069.013.135.045.266.11L22 8.5l-9.642 4.821c-.131.066-.197.099-.266.111a.5.5 0 0 1-.184 0c-.069-.012-.135-.045-.266-.11z',
  lightbulb:
    'M15 16.5V19c0 .932 0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C13.398 22 12.932 22 12 22s-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C9 20.398 9 19.932 9 19v-2.5m6 0c2.649-1.157 4.5-3.924 4.5-7a7.5 7.5 0 0 0-15 0c0 3.076 1.851 5.843 4.5 7m6 0H9',
  question:
    'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10',
  target:
    'M22 12c0 5.523-4.477 10-10 10m10-10c0-5.523-4.477-10-10-10m10 10h-4m-6 10C6.477 22 2 17.523 2 12m10 10v-4M2 12C2 6.477 6.477 2 12 2M2 12h4m6-10v4',
  user:
    'M20 21c0-1.396 0-2.093-.172-2.661a4 4 0 0 0-2.667-2.667c-.568-.172-1.265-.172-2.661-.172h-5c-1.396 0-2.093 0-2.661.172a4 4 0 0 0-2.667 2.667C4 18.907 4 19.604 4 21M16.5 7.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0',
  zap:
    'M13 2 4.093 12.688c-.348.418-.523.628-.525.804a.5.5 0 0 0 .185.397c.138.111.41.111.955.111H12l-1 8 8.907-10.688c.348-.418.523-.628.525-.804a.5.5 0 0 0-.185-.397c-.138-.111-.41-.111-.955-.111H12z'
}

// Build a single SVG with all icons in a grid
const iconNames = Object.keys(ICONS)
let svgIcons = ''

const iconsJson = {
  atlas: { width: ATLAS_SIZE, height: ATLAS_SIZE, iconSize: ICON_SIZE },
  icons: {}
}

iconNames.forEach((name, idx) => {
  const col = idx % COLS
  const row = Math.floor(idx / COLS)
  const cellX = col * ICON_SIZE
  const cellY = row * ICON_SIZE
  const drawSize = ICON_SIZE - PAD * 2
  const scale = drawSize / 24

  // For zap: filled white shape
  const fill = name === 'zap' ? 'white' : 'none'

  svgIcons += `<g transform="translate(${cellX + PAD}, ${cellY + PAD}) scale(${scale})">
    <path d="${ICONS[name]}" fill="${fill}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>\n`

  iconsJson.icons[name] = {
    x: cellX,
    y: cellY,
    width: ICON_SIZE,
    height: ICON_SIZE,
    uv: [
      cellX / ATLAS_SIZE,
      cellY / ATLAS_SIZE,
      ICON_SIZE / ATLAS_SIZE,
      ICON_SIZE / ATLAS_SIZE
    ]
  }
})

const svgDoc = `<svg xmlns="http://www.w3.org/2000/svg" width="${ATLAS_SIZE}" height="${ATLAS_SIZE}" viewBox="0 0 ${ATLAS_SIZE} ${ATLAS_SIZE}">
${svgIcons}
</svg>`

// Rasterize with sharp
const pngBuffer = await sharp(Buffer.from(svgDoc))
  .resize(ATLAS_SIZE, ATLAS_SIZE)
  .png()
  .toBuffer()

writeFileSync(resolve(ASSETS_DIR, 'icons.png'), pngBuffer)
console.log(`Written icons.png (${pngBuffer.length} bytes)`)

writeFileSync(resolve(ASSETS_DIR, 'icons.json'), JSON.stringify(iconsJson, null, 2))
console.log('Written icons.json')

console.log(`Generated ${iconNames.length} icons: ${iconNames.join(', ')}`)
