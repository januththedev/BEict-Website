import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
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

/**
 * Chapter 5 setpiece: a dead-accurate extruded Sri Lanka (1,900-point
 * geoBoundaries outline) with a pulsing pin per class hub. Clicking a pin
 * opens that centre's Google Maps listing in a new tab.
 */
export default function LankaMap({ progressRef, reduce }) {
  const group = useRef(null)
  const pins = useRef([])
  const [ring, setRing] = useState(null)
  const hovered = useRef(null)
  const { camera } = useThree()

  useEffect(() => {
    let alive = true
    fetch('/models/sri-lanka-main.json')
      .then((r) => r.json())
      .then((g) => {
        if (!alive) return
        const ring = g.features[0].geometry.coordinates[0]
        setRing(ring)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const shape = useMemo(() => {
    if (!ring) return null
    const shape = new THREE.Shape()
    ring.forEach(([lng, lat], i) => {
      const [x, y] = project(lat, lng)
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    })
    shape.closePath()
    return shape
  }, [ring])

  useFrame(({ clock }) => {
    if (!group.current) return
    const p = progressRef.current
    const appear = reduce ? (p >= 0.66 ? 1 : 0) : smooth(sub(p, 0.65, 0.7))
    const fade = 1 - smooth(sub(p, 0.745, 0.775))
    group.current.visible = p > 0.62 && p < 0.79
    const t = clock.getElapsedTime()
    group.current.rotation.x = -0.12
    group.current.scale.setScalar(0.9 + appear * 0.1)
    group.current.traverse((o) => {
      if (o.userData?.fadeWithScene && o.material) {
        o.material.transparent = true
        o.material.opacity = (o.userData.baseOpacity ?? 1) * appear * fade
      }
    })
    // pins pulse
    pins.current.forEach((pin, i) => {
      if (!pin) return
      const s = 1 + (reduce ? 0 : Math.sin(t * 2.5 + i * 1.1) * 0.18)
      const target = hovered.current === i ? 1.5 : s
      pin.scale.setScalar(THREE.MathUtils.lerp(pin.scale.x, target, 0.15))
    })
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
      {shape && (
        <group>
          <mesh userData={{ fadeWithScene: true, baseOpacity: 0.95 }}>
            <extrudeGeometry args={[shape, { depth: 0.32, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }]} />
            <meshStandardMaterial color="#12295c" metalness={0.65} roughness={0.35} />
          </mesh>
          <lineSegments position={[0, 0, 0.33]} userData={{ fadeWithScene: true, baseOpacity: 0.9 }}>
            <edgesGeometry args={[new THREE.ExtrudeGeometry(shape, { depth: 0.32, bevelEnabled: false })]} />
            <lineBasicMaterial color="#38bdf8" transparent opacity={0.9} />
          </lineSegments>
          {/* class-hub pins */}
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
                  <meshStandardMaterial color="#ffb95e" emissive="#ff9d2e" emissiveIntensity={1.4} />
                </mesh>
              </group>
            )
          })}
        </group>
      )}
    </group>
  )
}
