/**
 * Generates the site's branded raster assets from hand-authored SVG:
 *   public/images/og-image.png            (1200x630 social preview)
 *   public/images/banners/banner-*.webp   (1200x400 promo banners)
 *
 * Run: node scripts/generate-images.mjs
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const INK = '#101a30'
const BODY = '#44546e'
const BLUE = '#1e4fd8'
const SKY = '#38bdf8'

const grid = (stroke, size = 44) => `
  <pattern id="grid-${size}-${stroke.replace('#', '')}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
    <path d="M${size} 0H0v${size}" fill="none" stroke="${stroke}" stroke-width="1"/>
  </pattern>`

const monogram = (x, y, s = 88) => `
  <g transform="translate(${x} ${y}) scale(${s / 40})">
    <defs>
      <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${BLUE}"/>
        <stop offset="100%" stop-color="${SKY}"/>
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="10" fill="url(#tile)"/>
    <text x="20" y="26.5" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="15" letter-spacing="-0.5" fill="#fff">BE</text>
  </g>`

function ogImage() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>${grid('#dbe6fe', 48)}
    <radialGradient id="glow" cx="80%" cy="22%" r="55%">
      <stop offset="0%" stop-color="#bfd3fe" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#bfd3fe" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="760" height="630" fill="url(#grid-48-dbe6fe)"/>
  <rect width="1200" height="630" fill="url(#fade)"/>

  <circle cx="1010" cy="150" r="7" fill="${BLUE}"/>
  <circle cx="1120" cy="300" r="5" fill="${SKY}"/>
  <circle cx="950" cy="430" r="4" fill="#608ffa"/>
  <path d="M1010 157 v70 a14 14 0 0 0 14 14 h89 M1120 305 v90 a14 14 0 0 1 -14 14 h-140" fill="none" stroke="#93b4fd" stroke-width="2" stroke-dasharray="3 8" stroke-linecap="round"/>

  ${monogram(96, 110)}
  <text x="200" y="168" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="64" letter-spacing="-1.5" fill="${INK}">BEICT</text>

  <text x="96" y="330" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="58" letter-spacing="-1" fill="${INK}">A/L ICT with</text>
  <text x="96" y="400" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="58" letter-spacing="-1" fill="${BLUE}">Bhanuka Ekanayaka</text>
  <text x="96" y="458" font-family="Segoe UI, Arial, sans-serif" font-weight="500" font-size="30" fill="${BODY}">G.C.E. Advanced Level · Sinhala Medium</text>

  <rect x="96" y="508" rx="27" width="270" height="54" fill="${BLUE}"/>
  <text x="231" y="543" text-anchor="middle" font-family="Consolas, Menlo, monospace" font-weight="600" font-size="24" fill="#ffffff">lms.beict.lk</text>
</svg>`
}

function banner({ eyebrow, title, sub, dark = false }) {
  const bg = dark ? '#0c1937' : '#ffffff'
  const bg2 = dark ? '#12224d' : '#eff4ff'
  const gridStroke = dark ? '#1b3578' : '#dbe6fe'
  const gridId = `grid-44-${gridStroke.replace('#', '')}`
  const titleFill = dark ? '#ffffff' : INK
  const subFill = dark ? '#93b4fd' : BODY
  const chipBg = dark ? 'rgba(255,255,255,0.12)' : BLUE
  const chipText = dark ? '#bfd3fe' : '#ffffff'
  const chipWidth = Math.round(eyebrow.length * 11.5) + 44
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400">
  <defs>
    ${grid(gridStroke)}
    <linearGradient id="bgb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="bglow" cx="85%" cy="20%" r="60%">
      <stop offset="0%" stop-color="${dark ? '#3b6ef2' : '#bfd3fe'}" stop-opacity="${dark ? '0.35' : '0.55'}"/>
      <stop offset="100%" stop-color="${dark ? '#3b6ef2' : '#bfd3fe'}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="400" fill="url(#bgb)"/>
  <rect width="1200" height="400" fill="url(#bglow)"/>
  <rect x="560" width="640" height="400" fill="url(#${gridId})"/>

  <circle cx="1050" cy="90" r="6" fill="${dark ? SKY : BLUE}"/>
  <circle cx="1130" cy="250" r="4.5" fill="${dark ? '#608ffa' : SKY}"/>
  <path d="M1050 96 v60 a12 12 0 0 0 12 12 h62 M1130 257 v70 a12 12 0 0 1 -12 12 h-120" fill="none" stroke="${dark ? '#3b6ef2' : '#93b4fd'}" stroke-width="1.8" stroke-dasharray="3 7" stroke-linecap="round"/>

  ${monogram(72, 56, 56)}
  <text x="144" y="98" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="34" letter-spacing="-0.5" fill="${titleFill}">BEICT</text>

  <rect x="72" y="160" rx="19" height="38" width="${chipWidth}" fill="${chipBg}"/>
  <text x="${72 + chipWidth / 2}" y="186" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="17" letter-spacing="2" fill="${chipText}">${eyebrow}</text>

  <text x="72" y="266" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="46" letter-spacing="-0.5" fill="${titleFill}">${title}</text>
  <text x="72" y="316" font-family="Segoe UI, Arial, sans-serif" font-weight="500" font-size="24" fill="${subFill}">${sub}</text>
</svg>`
}

const outDir = 'public/images'
await mkdir(`${outDir}/banners`, { recursive: true })

await sharp(Buffer.from(ogImage())).png({ compressionLevel: 9 }).toFile(`${outDir}/og-image.png`)
console.log('og-image.png written')

const banners = [
  {
    file: 'banner-facebook.webp',
    svg: banner({
      eyebrow: 'UPDATES',
      title: 'Seminars &amp; announcements',
      sub: 'Follow BEICT on Facebook — news lands there first.',
      dark: false,
    }),
  },
  {
    file: 'banner-lms.webp',
    svg: banner({
      eyebrow: 'BICT ONLINE',
      title: 'Learn anytime at lms.beict.lk',
      sub: 'Lessons, resources and updates in your virtual classroom.',
      dark: true,
    }),
  },
  {
    file: 'banner-whatsapp.webp',
    svg: banner({
      eyebrow: 'NEW BATCHES',
      title: 'Ask about new batches today',
      sub: 'Message us on WhatsApp — 071 103 9004.',
      dark: false,
    }),
  },
]

for (const { file, svg } of banners) {
  await sharp(Buffer.from(svg)).webp({ quality: 84 }).toFile(`${outDir}/banners/${file}`)
  console.log(`${file} written`)
}
