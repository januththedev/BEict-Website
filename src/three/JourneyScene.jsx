import { Suspense, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { JOURNEY } from '../data/content.js'
import StudioEnvironment from './StudioEnvironment.jsx'
import { useModelParts, useHighlightFrame, hoverHandlers } from './useModelParts.js'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (v) => v * v * (3 - 2 * v)

/** Chip part offsets used while the visitor scrolls past the first station. */
const CHIP_EXPLODE = {
  Substrate: [0, 0, 0],
  Pins: [0, -0.5, 0],
  Die: [0, 0.62, 0],
  HeatSpreader: [0, 1.2, 0],
  Capacitors: [0, 0.28, -0.62],
}

const DISK_SIGN = { DiskTop: 1, DiskMid: 0, DiskBottom: -1 }

/** Drifting data-motes along the flight path — depth cue for the Z-scroll. */
function Starfield({ count = 160 }) {
  const ref = useRef(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 34
      arr[i * 3 + 1] = (Math.random() - 0.5) * 22
      arr[i * 3 + 2] = 10 - Math.random() * 85 // spread along the whole flight
    }
    return arr
  }, [count])

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.02
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#8ec5ff"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

/**
 * Camera dolly: scroll progress (0..1) maps to a flight down the Z axis
 * with a gentle sway. The section's scrollable range puts panel centres at
 * p = 0, 1/3, 2/3, 1 — each keyed to a point ~7 units before its station
 * (chip z=0, globe z=-30, database z=-60).
 */
const CAM_KEYS = [
  [0.0, 12],
  [1 / 3, 6],
  [2 / 3, -24],
  [1.0, -54],
]

function camZAt(p) {
  for (let i = 1; i < CAM_KEYS.length; i++) {
    if (p <= CAM_KEYS[i][0]) {
      const [p0, z0] = CAM_KEYS[i - 1]
      const [p1, z1] = CAM_KEYS[i]
      return THREE.MathUtils.lerp(z0, z1, (p - p0) / (p1 - p0))
    }
  }
  return CAM_KEYS[CAM_KEYS.length - 1][1]
}

function CameraRig({ progressRef, reduce }) {
  const camera = useThree((s) => s.camera)
  useFrame(() => {
    const p = progressRef.current
    const z = camZAt(p)
    const sway = reduce ? 0 : 1
    camera.position.set(
      Math.sin(p * Math.PI * 3) * 0.9 * sway,
      1.2 + Math.cos(p * Math.PI * 2) * 0.3 * sway,
      z,
    )
    camera.lookAt(0, 0, z - 12)
  })
  return null
}

function Station({ station, reduce }) {
  const { root, meshes, parts } = useModelParts(station.file)
  const group = useRef(null)
  const hovered = useRef(null)
  const explodeT = useRef(0)

  const basePos = useMemo(
    () => new Map(parts.map((p) => [p.name, p.position.clone()])),
    [parts],
  )

  useHighlightFrame(meshes, hovered)

  useFrame(({ clock, camera }) => {
    if (!group.current) return
    const dz = camera.position.z - station.z // distance still ahead of the station
    const sub = smooth(clamp01((26 - dz) / 19)) // 0 far away → 1 as we arrive
    const t = clock.getElapsedTime()

    group.current.rotation.y =
      (reduce ? 0 : t * 0.12) + sub * Math.PI * 1.5
    group.current.scale.setScalar(0.55 + 0.45 * sub)

    if (station.id === 'chip') {
      const target = smooth(clamp01((sub - 0.3) / 0.6))
      explodeT.current = reduce ? target : explodeT.current + (target - explodeT.current) * 0.1
      for (const part of parts) {
        const base = basePos.get(part.name)
        const off = CHIP_EXPLODE[part.name]
        if (!base || !off) continue
        part.position.set(
          base.x + off[0] * explodeT.current,
          base.y + off[1] * explodeT.current,
          base.z + off[2] * explodeT.current,
        )
      }
    } else if (station.id === 'database') {
      for (const part of parts) {
        const base = basePos.get(part.name)
        const sign = DISK_SIGN[part.name]
        if (!base || sign === undefined) continue
        part.position.y = base.y + sign * sub * 0.55
      }
    } else if (station.id === 'globe' && !reduce) {
      for (const mesh of meshes) {
        if (mesh.name.startsWith('Node')) {
          const phase = Number(mesh.name.slice(4)) || 0
          mesh.scale.setScalar(1 + Math.sin(t * 2.2 + phase * 1.3) * 0.18)
        }
      }
    }
  })

  return (
    <group ref={group} position={[0, 0, station.z]}>
      <group {...hoverHandlers((obj) => { hovered.current = obj })}>
        <primitive object={root} />
      </group>
    </group>
  )
}

export default function JourneyScene({ progressRef, reduce }) {
  return (
    <>
      <color attach="background" args={['#071229']} />
      <fog attach="fog" args={['#071229', 8, 27]} />
      <StudioEnvironment intensity={0.8} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.7} />
      <directionalLight position={[-5, 2, -4]} intensity={0.9} color="#67e8f9" />
      <CameraRig progressRef={progressRef} reduce={Boolean(reduce)} />
      {!reduce && <Starfield />}
      <Suspense fallback={null}>
        {JOURNEY.stations.map((station) => (
          <Station key={station.id} station={station} reduce={reduce} />
        ))}
      </Suspense>
    </>
  )
}

useGLTF.preload('/models/cpu-chip.gltf')
useGLTF.preload('/models/network-globe.gltf')
useGLTF.preload('/models/database.gltf')
