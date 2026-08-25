/**
 * Generates the interactive glTF models used by the ICT 3D Lab.
 *
 * Writes real glTF 2.0 files (JSON + embedded base64 buffers) into
 * public/models/. Parts are emitted as NAMED nodes so the React Three
 * Fiber viewer can address them individually for hover highlighting
 * and explode animations.
 *
 * Run with: npm run models
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'models')

/* ------------------------------------------------------------------ */
/* Geometry builders — flat arrays suitable for direct glTF emission   */
/* ------------------------------------------------------------------ */

/** Axis-aligned box centred on the origin. */
function box(w, h, d) {
  const x = w / 2
  const y = h / 2
  const z = d / 2
  const faces = [
    { n: [1, 0, 0], v: [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]] },
    { n: [-1, 0, 0], v: [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]] },
    { n: [0, 1, 0], v: [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]] },
    { n: [0, -1, 0], v: [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]] },
    { n: [0, 0, 1], v: [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]] },
    { n: [0, 0, -1], v: [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]] },
  ]
  const positions = []
  const normals = []
  const uvs = []
  const indices = []
  const faceUv = [
    [0, 0], [1, 0], [1, 1], [0, 1],
  ]
  faces.forEach((f) => {
    const base = positions.length / 3
    f.v.forEach((p, i) => {
      positions.push(...p)
      uvs.push(faceUv[i][0], faceUv[i][1])
    })
    for (let i = 0; i < 4; i++) normals.push(...f.n)
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
  })
  return { positions, normals, uvs, indices }
}

/** Cylinder centred on the origin, height along Y. Caps included. */
function cylinder(rTop, rBottom, h, seg = 36) {
  const positions = []
  const normals = []
  const uvs = []
  const indices = []
  const half = h / 2
  const slope = (rTop - rBottom) / h

  const ringY = (top) => (top ? half : -half)
  const px = (r, a) => Math.cos(a) * r
  const pz = (r, a) => Math.sin(a) * r

  // Side
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2
    const nx = Math.cos(a)
    const nz = Math.sin(a)
    const nl = Math.hypot(nx, slope, nz)
    const u = i / seg
    for (const top of [true, false]) {
      positions.push(px(top ? rTop : rBottom, a), ringY(top), pz(top ? rTop : rBottom, a))
      normals.push(nx / nl, slope / nl, nz / nl)
      uvs.push(u, top ? 1 : 0)
    }
  }
  for (let i = 0; i < seg; i++) {
    const b0 = i * 2
    const b1 = (i + 1) * 2
    // CCW seen from outside (columns advance to the left on screen)
    indices.push(b1 + 1, b0 + 1, b0, b1 + 1, b0, b1)
  }

  // Caps
  for (const top of [true, false]) {
    const r = top ? rTop : rBottom
    if (r <= 0) continue
    const cy = ringY(top)
    const ny = top ? 1 : -1
    const center = positions.length / 3
    positions.push(0, cy, 0)
    normals.push(0, ny, 0)
    uvs.push(0.5, 0.5)
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2
      positions.push(px(r, a), cy, pz(r, a))
      normals.push(0, ny, 0)
      uvs.push((Math.cos(a) + 1) / 2, (Math.sin(a) + 1) / 2)
    }
    for (let i = 1; i <= seg; i++) {
      // Top cap viewed from above runs CW with +angle, so flip; bottom is opposite.
      if (top) indices.push(center, center + i + 1, center + i)
      else indices.push(center, center + i, center + i + 1)
    }
  }
  return { positions, normals, uvs, indices }
}

/** UV sphere centred on the origin (equirectangular UVs). */
function sphere(r, widthSeg = 28, heightSeg = 20) {
  const positions = []
  const normals = []
  const uvs = []
  const indices = []
  const p = (theta, phi) => [
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.cos(theta),
  ]
  for (let j = 0; j <= heightSeg; j++) {
    const phi = (j / heightSeg) * Math.PI
    const v = 1 - j / heightSeg
    for (let i = 0; i <= widthSeg; i++) {
      const theta = (i / widthSeg) * Math.PI * 2
      const pt = p(theta, phi)
      positions.push(...pt)
      const l = Math.hypot(...pt) || 1
      normals.push(pt[0] / l, pt[1] / l, pt[2] / l)
      uvs.push(i / widthSeg, v)
    }
  }
  for (let j = 0; j < heightSeg; j++) {
    for (let i = 0; i < widthSeg; i++) {
      const a = j * (widthSeg + 1) + i
      const b = a + 1
      const c = a + widthSeg + 1
      const d = c + 1
      indices.push(c, d, b, c, b, a)
    }
  }
  return { positions, normals, uvs, indices }
}

/** Torus lying in the XZ plane (hole along Y). */
function torus(R, r, tubularSeg = 56, radialSeg = 14) {
  const positions = []
  const normals = []
  const uvs = []
  const indices = []
  for (let i = 0; i <= tubularSeg; i++) {
    const u = (i / tubularSeg) * Math.PI * 2
    for (let j = 0; j <= radialSeg; j++) {
      const v = (j / radialSeg) * Math.PI * 2
      // position: ring of radius (R + r*cos v) swept around Y
      const rad = R + r * Math.cos(v)
      positions.push(rad * Math.cos(u), r * Math.sin(v), rad * Math.sin(u))
      normals.push(Math.cos(v) * Math.cos(u), Math.sin(v), Math.cos(v) * Math.sin(u))
      uvs.push(i / tubularSeg, j / radialSeg)
    }
  }
  for (let i = 0; i < tubularSeg; i++) {
    for (let j = 0; j < radialSeg; j++) {
      const a = i * (radialSeg + 1) + j
      const b = a + radialSeg + 1
      // CCW from outside (u advances left on screen, v advances up)
      indices.push(b, a, a + 1, b, a + 1, b + 1)
    }
  }
  return { positions, normals, uvs, indices }
}

/* ------------------------------------------------------------------ */
/* Scene graph + glTF assembly                                        */
/* ------------------------------------------------------------------ */

function quatAxisAngle(ax, ay, az, angle) {
  const s = Math.sin(angle / 2)
  return [ax * s, ay * s, az * s, Math.cos(angle / 2)]
}

class GltfScene {
  constructor(materials) {
    this.materials = materials
    this.nodes = []
    this.roots = []
  }

  /** Add a mesh part. Returns the node index for parenting children. */
  addPart(name, geom, material, opts = {}) {
    const index = this.nodes.length
    const node = {
      name,
      mesh: index,
      translation: opts.translation ?? [0, 0, 0],
      ...(opts.rotation ? { rotation: opts.rotation } : {}),
      ...(opts.scale ? { scale: opts.scale } : {}),
      children: [],
      geom,
      material,
    }
    this.nodes.push(node)
    if (opts.parent !== undefined) this.nodes[opts.parent].children.push(index)
    else this.roots.push(index)
    return index
  }

  build() {
    const chunks = [] // {data:Uint8Array, view:{...}}
    let byteLength = 0

    const pushView = (typedArr, target) => {
      const bytes = new Uint8Array(
        typedArr.buffer,
        typedArr.byteOffset,
        typedArr.byteLength,
      )
      const aligned = Math.ceil(byteLength / 4) * 4
      if (aligned > byteLength) {
        chunks.push({ data: new Uint8Array(aligned - byteLength) })
        byteLength = aligned
      }
      const viewIndex = chunks.length
      chunks.push({ data: bytes })
      const view = { buffer: 0, byteOffset: byteLength, byteLength: bytes.byteLength }
      if (target) view.target = target
      byteLength += bytes.byteLength
      return { viewIndex, view }
    }

    const accessors = []
    const bufferViews = []
    const meshes = []

    this.nodes.forEach((node) => {
      const { positions, normals, uvs, indices } = node.geom
      const pos = new Float32Array(positions)
      const nor = new Float32Array(normals)
      const uv = new Float32Array(uvs)
      const idx = new Uint16Array(indices)

      let min = [Infinity, Infinity, Infinity]
      let max = [-Infinity, -Infinity, -Infinity]
      for (let i = 0; i < pos.length; i += 3) {
        for (let c = 0; c < 3; c++) {
          min[c] = Math.min(min[c], pos[i + c])
          max[c] = Math.max(max[c], pos[i + c])
        }
      }

      const posV = pushView(pos, 34962)
      bufferViews[posV.viewIndex] = posV.view
      const norV = pushView(nor, 34962)
      bufferViews[norV.viewIndex] = norV.view
      const uvV = pushView(uv, 34962)
      bufferViews[uvV.viewIndex] = uvV.view
      const idxV = pushView(idx, 34963)
      bufferViews[idxV.viewIndex] = idxV.view

      const posAcc = accessors.push({
        bufferView: posV.viewIndex,
        componentType: 5126,
        count: pos.length / 3,
        type: 'VEC3',
        min,
        max,
      }) - 1
      const norAcc = accessors.push({
        bufferView: norV.viewIndex,
        componentType: 5126,
        count: nor.length / 3,
        type: 'VEC3',
      }) - 1
      const uvAcc = accessors.push({
        bufferView: uvV.viewIndex,
        componentType: 5126,
        count: uv.length / 2,
        type: 'VEC2',
      }) - 1
      const idxAcc = accessors.push({
        bufferView: idxV.viewIndex,
        componentType: 5123,
        count: idx.length,
        type: 'SCALAR',
      }) - 1

      meshes.push({
        primitives: [
          {
            attributes: { POSITION: posAcc, NORMAL: norAcc, TEXCOORD_0: uvAcc },
            indices: idxAcc,
            material: this.materials.indexOf(node.material),
          },
        ],
      })
    })

    // Strip builder-only fields and wire mesh indices + children.
    const nodes = this.nodes.map((n, i) => {
      const out = { name: n.name, mesh: i, translation: n.translation }
      if (n.rotation) out.rotation = n.rotation
      if (n.scale) out.scale = n.scale
      if (n.children.length) out.children = n.children
      return out
    })

    const total = new Uint8Array(byteLength)
    let offset = 0
    for (const chunk of chunks) {
      total.set(chunk.data, offset)
      offset += chunk.data.byteLength
    }
    const uri = `data:application/octet-stream;base64,${Buffer.from(total).toString('base64')}`

    return {
      asset: { version: '2.0', generator: 'beict-model-generator' },
      scene: 0,
      scenes: [{ name: 'Scene', nodes: this.roots }],
      nodes,
      meshes,
      materials: this.materials.map((m) => ({
        name: m.name,
        pbrMetallicRoughness: {
          baseColorFactor: m.base,
          metallicFactor: m.metallic,
          roughnessFactor: m.roughness,
        },
        ...(m.emissive ? { emissiveFactor: m.emissive } : {}),
        doubleSided: true,
      })),
      buffers: [{ byteLength, uri }],
      bufferViews,
      accessors,
    }
  }
}

/* ------------------------------------------------------------------ */
/* Material palette                                                   */
/* ------------------------------------------------------------------ */

const MAT = {
  substrate: { name: 'Substrate', base: [0.07, 0.17, 0.43, 1], metallic: 0.5, roughness: 0.35 },
  die: { name: 'Die', base: [0.16, 0.42, 1.0, 1], metallic: 0.35, roughness: 0.3, emissive: [0.02, 0.05, 0.18] },
  cap: { name: 'HeatSpreader', base: [0.25, 0.72, 0.95, 1], metallic: 0.75, roughness: 0.22 },
  gold: { name: 'Gold', base: [0.98, 0.8, 0.32, 1], metallic: 0.75, roughness: 0.32 },
  silver: { name: 'Silver', base: [0.88, 0.92, 0.97, 1], metallic: 0.7, roughness: 0.3 },
  core: { name: 'Core', base: [0.13, 0.33, 0.9, 1], metallic: 0.4, roughness: 0.35, emissive: [0.02, 0.04, 0.16] },
  ring: { name: 'RingCyan', base: [0.4, 0.88, 1.0, 1], metallic: 0.6, roughness: 0.25 },
  nodeLight: { name: 'NodeLight', base: [0.6, 0.78, 1.0, 1], metallic: 0.3, roughness: 0.3, emissive: [0.05, 0.08, 0.22] },
  diskA: { name: 'DiskA', base: [0.15, 0.34, 0.91, 1], metallic: 0.35, roughness: 0.4 },
  diskB: { name: 'DiskB', base: [0.29, 0.51, 0.97, 1], metallic: 0.35, roughness: 0.4 },
  diskC: { name: 'DiskC', base: [0.44, 0.65, 1.0, 1], metallic: 0.35, roughness: 0.4 },
}
const ALL_MATS = Object.values(MAT)

/* ------------------------------------------------------------------ */
/* Model definitions                                                  */
/* ------------------------------------------------------------------ */

function cpuChip() {
  const s = new GltfScene(ALL_MATS)

  s.addPart('Substrate', box(2.2, 0.14, 2.2), MAT.substrate, { translation: [0, 0, 0] })

  // Contact pads along the four lower edges, merged into one mesh.
  const pinGeom = { positions: [], normals: [], uvs: [], indices: [] }
  const mergeInto = (geom, part, dx = 0, dy = 0, dz = 0) => {
    const base = geom.positions.length / 3
    for (let i = 0; i < part.positions.length; i += 3) {
      geom.positions.push(part.positions[i] + dx, part.positions[i + 1] + dy, part.positions[i + 2] + dz)
    }
    geom.normals.push(...part.normals)
    geom.uvs.push(...part.uvs)
    for (const ix of part.indices) geom.indices.push(ix + base)
  }
  const leg = box(0.09, 0.18, 0.09)
  // Front and back rows (skip the centre position where the die connector sits).
  for (let i = -4; i <= 4; i++) {
    const off = i * 0.225
    if (off === 0) continue
    mergeInto(pinGeom, leg, off, -0.17, 1.02)
    mergeInto(pinGeom, leg, off, -0.17, -1.02)
  }
  // Left and right columns.
  for (let i = -4; i <= 4; i++) {
    const off = i * 0.225
    mergeInto(pinGeom, leg, 1.02, -0.17, off)
    mergeInto(pinGeom, leg, -1.02, -0.17, off)
  }
  s.addPart('Pins', pinGeom, MAT.gold, { translation: [0, 0, 0] })

  s.addPart('Die', box(1.15, 0.12, 1.15), MAT.die, { translation: [0, 0.14, 0] })
  s.addPart('HeatSpreader', box(0.7, 0.1, 0.7), MAT.cap, { translation: [0, 0.25, 0] })

  const capGeom = { positions: [], normals: [], uvs: [], indices: [] }
  const can = cylinder(0.075, 0.075, 0.16, 16)
  ;[
    [0.72, 0.16, -0.86],
    [0.92, 0.16, -0.62],
    [-0.72, 0.16, -0.86],
    [-0.92, 0.16, -0.62],
  ].forEach(([x, y, z]) => mergeInto(capGeom, can, x, y, z))
  s.addPart('Capacitors', capGeom, MAT.silver, { translation: [0, 0, 0] })

  return s.build()
}

function networkGlobe() {
  const s = new GltfScene(ALL_MATS)
  s.addPart('Core', sphere(1), MAT.core)

  const ringGeom = torus(1.42, 0.024, 72, 10)
  const tilt = quatAxisAngle(1, 0, 0, Math.PI / 2.6)

  const r1 = s.addPart('Ring1', ringGeom, MAT.ring)
  const r2 = s.addPart('Ring2', ringGeom, MAT.ring, { rotation: tilt })
  const r3 = s.addPart('Ring3', ringGeom, MAT.ring, {
    rotation: quatAxisAngle(0, 0, 1, Math.PI / 2.2),
  })

  // Satellite nodes riding the rings (children inherit the ring tilt).
  const nodeGeom = sphere(0.085, 14, 10)
  const spots = [0, 1, 2, 3]
  spots.forEach((k) => {
    const a = (k / 4) * Math.PI * 2
    const t = [Math.cos(a) * 1.42, 0, Math.sin(a) * 1.42]
    s.addPart(`Node${k + 1}`, nodeGeom, MAT.nodeLight, { translation: t, parent: r1 })
  })
  ;[4, 5].forEach((k, idx) => {
    const a = (idx / 2) * Math.PI * 2 + Math.PI / 4
    s.addPart(`Node${k + 1}`, nodeGeom, MAT.nodeLight, {
      translation: [Math.cos(a) * 1.42, 0, Math.sin(a) * 1.42],
      parent: r2,
    })
  })
  ;[6, 7].forEach((k, idx) => {
    const a = (idx / 2) * Math.PI * 2 + Math.PI / 3
    s.addPart(`Node${k + 1}`, nodeGeom, MAT.nodeLight, {
      translation: [Math.cos(a) * 1.42, 0, Math.sin(a) * 1.42],
      parent: r3,
    })
  })
  return s.build()
}

function databaseStack() {
  const s = new GltfScene(ALL_MATS)
  s.addPart('DiskTop', cylinder(0.95, 0.95, 0.38, 40), MAT.diskC, { translation: [0, 0.54, 0] })
  s.addPart('DiskMid', cylinder(0.95, 0.95, 0.38, 40), MAT.diskB, { translation: [0, 0, 0] })
  s.addPart('DiskBottom', cylinder(0.95, 0.95, 0.38, 40), MAT.diskA, { translation: [0, -0.54, 0] })
  return s.build()
}

/* ------------------------------------------------------------------ */
/* Emit                                                               */
/* ------------------------------------------------------------------ */

mkdirSync(OUT_DIR, { recursive: true })

const files = {
  'cpu-chip.gltf': cpuChip(),
  'network-globe.gltf': networkGlobe(),
  'database.gltf': databaseStack(),
}

for (const [file, json] of Object.entries(files)) {
  const path = join(OUT_DIR, file)
  writeFileSync(path, JSON.stringify(json))
  console.log(`✓ ${path} (${(JSON.stringify(json).length / 1024).toFixed(1)} KB text)`)
}
console.log('Done.')
