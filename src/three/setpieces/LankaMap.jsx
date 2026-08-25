import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sub, smooth } from '../anim.js'
import { VENUES, mapsUrlFor } from '../../data/content.js'

// GeoJSON bounds → local units. Main-island file: lat 5.919–9.836, lng 79.693–81.879.
const CENTER = { lat: 7.88, lng: 80.786 }
const SCALE = 2.35 // island ≈ 9.2 units tall

const project = (lat, lng) => [
  (lng - CENTER.lng) * SCALE,
  (lat - CENTER.lat) * SCALE,
]

/** Soft radial glow texture for the ocean halo (generated once). */
function oceanGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128)
  g.addColorStop(0, 'rgba(56, 189, 248, 0.5)')
  g.addColorStop(0.55, 'rgba(37, 99, 235, 0.22)')
  g.addColorStop(1, 'rgba(7, 18, 41, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Chapter 5 setpiece: a dead-accurate extruded Sri Lanka (1,900-point
 * geoBoundaries outline) on a glowing ocean halo, with pulsing orange pins
 * per class hub, light beams, and route arcs from the home hub. Clicking a
 * pin opens that centre's Google Maps listing in a new tab.
 */
export default function LankaMap({ progressRef, reduce }) {
  const group = useRef(null)
  const pins = useRef([])
  const beams = useRef([])
  const fadeMats = useRef(null)
  const arcs = useRef(null)
  const [ring, setRing] = useState(null)
  const hovered = useRef(null)

  const oceanTex = useMemo(() => oceanGlowTexture(), [])

  useEffect(() => {
    let alive = true
    fetch('/models/sri-lanka-main.json')
      .then((r) => r.json())
      .then((g) => {
        if (!alive) return
        setRing(g.features[0].geometry.coordinates[0])
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const shape = useMemo(() => {
    if (!ring) return null
    const s = new THREE.Shape()
    ring.forEach(([lng, lat], i) => {
      const [x, y] = project(lat, lng)
      if (i === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    })
    s.closePath()
    return s
  }, [ring])

  // Cache the materials that fade with the scene — no per-frame traverse.
  const collectMats = (root) => {
    const list = []
    root.traverse((o) => {
      if (o.userData?.fadeWithScene && o.material) {
        o.material.transparent = true
        list.push({ mat: o.material, base: o.userData.baseOpacity ?? 1 })
      }
    })
    return list
  }

  // Route arcs: home hub (Zeon Opera, Horana) → every other centre.
  const arcGeoms = useMemo(() => {
    if (!VENUES.length) return []
    return VENUES.slice(1).map((v) => {
      const [x1, y1] = project(VENUES[0].lat, VENUES[0].lng)
      const [x2, y2] = project(v.lat, v.lng)
      const mid = [(x1 + x2) / 2, (y1 + y2) / 2]
      const dist = Math.hypot(x2 - x1, y2 - y1)
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(x1, y1, 0.45),
        new THREE.Vector3(mid[0], mid[1], 0.45 + dist * 0.35 + 0.5),
        new THREE.Vector3(x2, y2, 0.45),
      )
      return new THREE.TubeGeometry(curve, 40, 0.016, 6, false)
    })
  }, [])

  useFrame(({ clock }) => {
    if (!group.current) return
    const p = progressRef.current
    const appear = reduce ? (p >= 0.66 ? 1 : 0) : smooth(sub(p, 0.65, 0.7))
    const fade = 1 - smooth(sub(p, 0.745, 0.775))
    group.current.visible = p > 0.62 && p < 0.79
    const t = clock.getElapsedTime()
    group.current.rotation.x = -0.12
    group.current.scale.setScalar(0.9 + appear * 0.1)
    if (fadeMats.current) {
      for (const { mat, base } of fadeMats.current) {
        mat.opacity = base * appear * fade
      }
    }
    pins.current.forEach((pin, i) => {
      if (!pin) return
      const s = 1 + (reduce ? 0 : Math.sin(t * 2.5 + i * 1.1) * 0.18)
      const target = hovered.current === i ? 1.5 : s
      pin.scale.setScalar(THREE.MathUtils.lerp(pin.scale.x, target, 0.15))
    })
    beams.current.forEach((beam, i) => {
      if (beam) beam.material.opacity = (0.16 + Math.sin(t * 2 + i) * 0.08) * appear * fade
    })
    if (arcs.current) {
      arcs.current.children.forEach((arc, i) => {
        // draw-on: reveal the tube along its length
        const draw = clamp01(smooth(sub(p, 0.665 + i * 0.008, 0.715 + i * 0.008)))
        const geo = arc.geometry
        geo.setDrawRange(0, Math.floor(geo.index.count * draw))
        arc.material.opacity = 0.85 * appear * fade
      })
    }
  })

  function onPinClick(venue) {
    window.open(mapsUrlFor(venue), '_blank', 'noopener,noreferrer')
  }

  function pinHandlers(i) {
    return {
      onPointerOver: (e) => {
        e.stopPropagation()
        hovered.current = i
        document.body.style.cursor = 'pointer'
      },
      onPointerOut: () => {
        hovered.current = null
        document.body.style.cursor = 'auto'
      },
      onClick: () => onPinClick(VENUES[i]),
    }
  }

  return (
    <group ref={group} position={[0, -0.4, -120]}>
      {/* Ocean halo */}
      <mesh position={[0, -0.34, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7.2, 48]} />
        <meshBasicMaterial map={oceanTex} transparent opacity={0.85} depthWrite={false} />
      </mesh>

      {shape && (
        <group
          ref={(el) => {
            if (el && !fadeMats.current) fadeMats.current = collectMats(el)
          }}
        >
          <mesh userData={{ fadeWithScene: true, baseOpacity: 0.95 }}>
            <extrudeGeometry args={[shape, { depth: 0.32, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }]} />
            <meshStandardMaterial color="#0c1f47" metalness={0.55} roughness={0.5} />
          </mesh>
          <lineSegments position={[0, 0, 0.33]} userData={{ fadeWithScene: true, baseOpacity: 0.9 }}>
            <edgesGeometry args={[new THREE.ExtrudeGeometry(shape, { depth: 0.32, bevelEnabled: false })]} />
            <lineBasicMaterial color="#38bdf8" transparent opacity={0.9} />
          </lineSegments>

          {/* Route arcs from the home hub */}
          <group ref={arcs}>
            {arcGeoms.map((geo, i) => (
              <mesh key={i} geometry={geo}>
                <meshBasicMaterial color="#67e8f9" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
            ))}
          </group>

          {/* class-hub pins + light beams */}
          {VENUES.map((v, i) => {
            const [x, y] = project(v.lat, v.lng)
            return (
              <group
                key={v.name}
                ref={(el) => (pins.current[i] = el)}
                position={[x, y, 0.55]}
                {...pinHandlers(i)}
              >
                <mesh>
                  <coneGeometry args={[0.09, 0.3, 12]} />
                  <meshStandardMaterial color="#ff9d2e" emissive="#ff9d2e" emissiveIntensity={1.1} metalness={0.3} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.24, 0]}>
                  <sphereGeometry args={[0.085, 16, 12]} />
                  <meshStandardMaterial color="#ffb95e" emissive="#ff9d2e" emissiveIntensity={1.6} />
                </mesh>
              </group>
            )
          })}
          {VENUES.map((v, i) => {
            const [x, y] = project(v.lat, v.lng)
            return (
              <mesh
                key={`beam-${v.name}`}
                ref={(el) => (beams.current[i] = el)}
                position={[x, y + 0.75, 0.5]}
              >
                <cylinderGeometry args={[0.025, 0.06, 1.5, 8, 1, true]} />
                <meshBasicMaterial color="#ffb95e" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
              </mesh>
            )
          })}
        </group>
      )}
    </group>
  )
}

const clamp01 = (v) => Math.min(1, Math.max(0, v))
