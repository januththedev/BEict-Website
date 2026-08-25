import * as THREE from 'three'

/**
 * Procedural PBR texture factory — gives the generated models real surface
 * detail (circuit traces, silicon dies, planet dots, data bands) instead of
 * flat solid colours. Everything is drawn on offscreen canvases at runtime,
 * so there are zero image assets to ship.
 */

const cache = new Map()

function makeCanvas(size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return { canvas, ctx: canvas.getContext('2d') }
}

function cached(key, build) {
  if (!cache.has(key)) {
    const { canvas, ctx } = makeCanvas()
    build(ctx, canvas.width)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.anisotropy = 8
    cache.set(key, tex)
  }
  return cache.get(key)
}

/** Deep-teal PCB with copper traces and solder pads. */
function drawPCB(ctx, S) {
  ctx.fillStyle = '#0b3a5e'
  ctx.fillRect(0, 0, S, S)
  // subtle fibre weave
  ctx.globalAlpha = 0.08
  for (let i = 0; i < S; i += 6) {
    ctx.fillRect(0, i, S, 2)
    ctx.fillRect(i, 0, 2, S)
  }
  ctx.globalAlpha = 1
  // copper traces
  ctx.strokeStyle = '#1f6f8c'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let t = 0; t < 46; t++) {
    ctx.beginPath()
    let x = rand() * S
    let y = rand() * S
    ctx.moveTo(x, y)
    for (let seg = 0; seg < 4; seg++) {
      if (rand() > 0.5) x += (rand() - 0.5) * S * 0.4
      else y += (rand() - 0.5) * S * 0.4
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  // pads / vias
  for (let v = 0; v < 90; v++) {
    ctx.beginPath()
    ctx.arc(rand() * S, rand() * S, 3 + rand() * 4, 0, Math.PI * 2)
    ctx.fillStyle = rand() > 0.5 ? '#d9a441' : '#155e75'
    ctx.fill()
  }
}

/** Silicon die: violet-blue wafer with luminous circuit blocks (emissive). */
function drawDie(ctx, S, glow) {
  ctx.fillStyle = glow ? '#000000' : '#101a4d'
  ctx.fillRect(0, 0, S, S)
  const cell = S / 16
  let seed = 21
  const rand = () => {
    seed = (seed * 48271) % 2147483647
    return seed / 2147483647
  }
  for (let gx = 0; gx < 16; gx++) {
    for (let gy = 0; gy < 16; gy++) {
      const r = rand()
      if (!glow && r > 0.72) continue
      const x = gx * cell
      const y = gy * cell
      if (glow) {
        // luminous interconnects
        ctx.strokeStyle = `rgba(125, 180, 255, ${0.25 + r * 0.75})`
        ctx.lineWidth = 2
        ctx.strokeRect(x + 4, y + 4, cell - 8, cell - 8)
        if (r > 0.8) {
          ctx.fillStyle = `rgba(160, 210, 255, 0.9)`
          ctx.fillRect(x + cell / 2 - 3, y + cell / 2 - 3, 6, 6)
        }
      } else {
        ctx.fillStyle = r > 0.5 ? '#182463' : '#131c52'
        ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4)
        ctx.strokeStyle = '#26327d'
        ctx.lineWidth = 1
        ctx.strokeRect(x + 2, y + 2, cell - 4, cell - 4)
      }
    }
  }
}

/** Planet surface: deep ocean blue with glowing city-dot clusters. */
function drawPlanet(ctx, S, dots) {
  ctx.fillStyle = dots ? '#000000' : 'linear-gradient(0deg,#123a91,#0c2a70)'
  if (!dots) {
    const grad = ctx.createLinearGradient(0, 0, 0, S)
    grad.addColorStop(0, '#16409e')
    grad.addColorStop(1, '#0b2564')
    ctx.fillStyle = grad
  }
  ctx.fillRect(0, 0, S, S)
  if (dots) {
    // continent clusters of glowing dots
    let seed = 99
    const rand = () => {
      seed = (seed * 69621) % 2147483647
      return seed / 2147483647
    }
    for (let c = 0; c < 9; c++) {
      const cx = rand() * S
      const cy = rand() * S
      const spread = S * (0.06 + rand() * 0.1)
      for (let d = 0; d < 130; d++) {
        const a = rand() * Math.PI * 2
        const rr = rand() * spread
        const alpha = 0.35 + rand() * 0.65
        ctx.fillStyle = `rgba(140, 220, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1.4 + rand() * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else {
    // faint latitude/longitude lines
    ctx.strokeStyle = 'rgba(120, 180, 255, 0.18)'
    ctx.lineWidth = 2
    for (let i = 1; i < 8; i++) {
      ctx.beginPath()
      ctx.moveTo(0, (i * S) / 8)
      ctx.lineTo(S, (i * S) / 8)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo((i * S) / 8, 0)
      ctx.lineTo((i * S) / 8, S)
      ctx.stroke()
    }
  }
}

/** Brushed-metal noise used as a roughness map for pins and capacitors. */
function drawBrushed(ctx, S) {
  ctx.fillStyle = '#8a8a8a'
  ctx.fillRect(0, 0, S, S)
  let seed = 13
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 2600; i++) {
    const y = rand() * S
    const w = 20 + rand() * 120
    const g = 110 + Math.floor(rand() * 130)
    ctx.strokeStyle = `rgba(${g},${g},${g},0.16)`
    ctx.beginPath()
    ctx.moveTo(rand() * S, y)
    ctx.lineTo(rand() * S + w, y + (rand() - 0.5) * 3)
    ctx.stroke()
  }
}

/** Glossy storage-disk shell with horizontal data bands. */
function drawDisk(ctx, S, hue) {
  const grad = ctx.createLinearGradient(0, 0, S, S)
  grad.addColorStop(0, `hsl(${hue} 85% 62%)`)
  grad.addColorStop(0.5, `hsl(${hue} 80% 50%)`)
  grad.addColorStop(1, `hsl(${hue + 12} 82% 42%)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, S, S)
  // data bands
  ctx.globalAlpha = 0.28
  let seed = 41
  const rand = () => {
    seed = (seed * 48271) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = rand() > 0.5 ? '#ffffff' : '#081c46'
    const y = rand() * S
    ctx.fillRect(0, y, S, 2 + rand() * 5)
  }
  ctx.globalAlpha = 1
  // specular streaks
  ctx.globalAlpha = 0.14
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, S, S * 0.12)
  ctx.globalAlpha = 1
}

const builders = {
  pcb: (ctx, S) => drawPCB(ctx, S),
  die: (ctx, S) => drawDie(ctx, S, false),
  dieGlow: (ctx, S) => drawDie(ctx, S, true),
  planet: (ctx, S) => drawPlanet(ctx, S, false),
  planetDots: (ctx, S) => drawPlanet(ctx, S, true),
  brushed: (ctx, S) => drawBrushed(ctx, S),
  diskA: (ctx, S) => drawDisk(ctx, S, 224),
  diskB: (ctx, S) => drawDisk(ctx, S, 212),
  diskC: (ctx, S) => drawDisk(ctx, S, 200),
}

export function texture(key, repeat = [1, 1]) {
  const tex = cached(key, builders[key]).clone()
  tex.needsUpdate = true
  tex.repeat.set(repeat[0], repeat[1])
  return tex
}

/**
 * Crisp text label as a transparent canvas texture — used for 3D typography,
 * keycap badges, cartridge and OSI-layer labels (no text dependencies).
 */
export function labelTexture(text, { width = 512, height = 128, color = '#ffffff', font = '700 64px Sora, Arial', bg = null, align = 'center' } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (bg) {
    ctx.fillStyle = bg
    const r = Math.min(width, height) * 0.18
    ctx.beginPath()
    ctx.roundRect(0, 0, width, height, r)
    ctx.fill()
  }
  ctx.fillStyle = color
  ctx.font = font
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(text, align === 'center' ? width / 2 : width * 0.06, height / 2 + 2)
  const out = new THREE.CanvasTexture(canvas)
  out.colorSpace = THREE.SRGBColorSpace
  out.anisotropy = 8
  out.needsUpdate = true
  return out
}

/** Laptop screen: code editor look with the BEICT mark. */
export function screenTexture() {
  return cached('screen', (ctx, S) => {
    const grad = ctx.createLinearGradient(0, 0, 0, S)
    grad.addColorStop(0, '#0d1b3e')
    grad.addColorStop(1, '#0a1229')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, S, S)
    // code lines
    const colors = ['#60a5fa', '#34d399', '#f59e0b', '#c084fc', '#7dd3fc']
    let y = S * 0.09
    let seed = 5
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < 16; i++) {
      const w = S * (0.15 + rand() * 0.5)
      ctx.fillStyle = colors[i % colors.length]
      ctx.globalAlpha = 0.75
      ctx.fillRect(S * 0.08, y, w, S * 0.022)
      if (rand() > 0.6) {
        ctx.fillStyle = '#334155'
        ctx.fillRect(S * 0.08, y + S * 0.035, S * 0.3, S * 0.016)
      }
      y += S * 0.055
    }
    ctx.globalAlpha = 1
    // BEICT wordmark
    ctx.fillStyle = '#ffffff'
    ctx.font = `800 ${S * 0.11}px Sora, Arial`
    ctx.textAlign = 'center'
    ctx.fillText('BEICT', S / 2, S * 0.94)
    ctx.fillStyle = '#38bdf8'
    ctx.font = `600 ${S * 0.04}px Inter, Arial`
    ctx.fillText('ICT · A/L · Bhanuka Ekanayaka', S / 2, S * 0.985)
  }).clone()
}

/**
 * Apply procedural maps to a loaded model's materials, matched by the
 * generator's material names. Call once per cloned model instance.
 */
export function applyModelTextures(root) {
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material?.name) return
    const m = obj.material
    switch (m.name) {
      case 'Substrate':
        m.map = texture('pcb', [2, 2])
        m.roughness = 0.55
        break
      case 'Die':
        m.map = texture('die', [1, 1])
        m.emissiveMap = texture('dieGlow', [1, 1])
        m.emissive = new THREE.Color('#7fb4ff')
        m.emissiveIntensity = 2.1
        break
      case 'HeatSpreader':
        m.map = null
        m.metalness = 0.85
        m.roughness = 0.18
        break
      case 'Gold':
      case 'Silver':
        m.roughnessMap = texture('brushed', [2, 2])
        break
      case 'Core':
        m.map = texture('planet', [1, 1])
        m.emissiveMap = texture('planetDots', [1, 1])
        m.emissive = new THREE.Color('#67d8ff')
        m.emissiveIntensity = 1.9
        break
      case 'DiskA':
        m.map = texture('diskA', [1, 1])
        m.roughness = 0.32
        break
      case 'DiskB':
        m.map = texture('diskB', [1, 1])
        m.roughness = 0.32
        break
      case 'DiskC':
        m.map = texture('diskC', [1, 1])
        m.roughness = 0.32
        break
      default:
        break
    }
    m.needsUpdate = true
  })
}
