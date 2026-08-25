import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { colorKeys, lerpKeys, smooth, sub } from './anim.js'
import StudioEnvironment from './StudioEnvironment.jsx'
import ChipHero from './setpieces/ChipHero.jsx'
import NeuralCore from './setpieces/NeuralCore.jsx'
import Vault from './setpieces/Vault.jsx'
import LankaMap from './setpieces/LankaMap.jsx'
import GalleryPlanes from './setpieces/GalleryPlanes.jsx'

/**
 * Camera keyframes across the whole-page scroll progress.
 * Setpieces: chip z 0 · core z −40 · vault z −80 · map z −120 ·
 * gallery planes z −148…−164.
 */
const CAM_KEYS = [
  [0.0, 6.2],
  [0.1, 7.5],
  [0.22, 9],
  [0.32, 10],
  [0.36, -33],
  [0.44, -33],
  [0.52, -73],
  [0.6, -73],
  [0.68, -106.5],
  [0.76, -108],
  [0.84, -140],
  [0.94, -161],
  [1.0, -172],
]

/** Scene palette: one continuous near-black keynote void. */
const BG_KEYS = [
  [0.0, '#04070f'],
  [0.5, '#081020'],
  [1.0, '#0a1428'],
]

function CameraRig({ progressRef, reduce }) {
  const camera = useThree((s) => s.camera)
  useFrame(() => {
    const p = progressRef.current
    const z = lerpKeys(CAM_KEYS, p)
    const sway = reduce ? 0 : 1
    camera.position.set(
      Math.sin(p * Math.PI * 4) * 0.8 * sway,
      1.1 + Math.cos(p * Math.PI * 2.4) * 0.35 * sway,
      z,
    )
    camera.lookAt(0, 0.3, z - 12)
    // gentle roll at chapter boundaries
    if (!reduce) camera.rotateZ(Math.sin(p * Math.PI * 5) * 0.018)
  })
  return null
}

function Starfield({ count = 220 }) {
  const ref = useRef(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = (Math.random() - 0.5) * 26
      arr[i * 3 + 2] = 12 - Math.random() * 190
    }
    return arr
  }, [count])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.015
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#8ec5ff" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/**
 * Single accent discipline: one cyan key light per setpiece, gated by its
 * chapter — no rainbow.
 */
function AccentLights({ progressRef }) {
  const lights = useMemo(
    () => [
      { ref: null, pos: [2.5, 2.5, 3], color: '#22d3ee', base: 18, a: 0.0, b: 0.32 },
      { ref: null, pos: [0, 0.6, -37], color: '#a78bfa', base: 20, a: 0.32, b: 0.48 },
      { ref: null, pos: [0, 1.4, -77], color: '#f59e0b', base: 16, a: 0.48, b: 0.64 },
      { ref: null, pos: [0, 0.6, -117], color: '#ff9d2e', base: 7, a: 0.64, b: 0.78 },
    ],
    [],
  )
  const refs = useRef([])

  useFrame(() => {
    const p = progressRef.current
    lights.forEach((l, i) => {
      const el = refs.current[i]
      if (!el) return
      const gate = smooth(sub(p, l.a - 0.03, l.a + 0.03)) * (1 - smooth(sub(p, l.b, l.b + 0.04)))
      el.intensity = l.base * gate
    })
  })

  return (
    <>
      {lights.map((l, i) => (
        <pointLight
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={l.pos}
          color={l.color}
          intensity={0}
          distance={18}
          decay={2}
        />
      ))}
    </>
  )
}

export default function WorldScene({ progressRef, reduce }) {
  const scene = useThree((s) => s.scene)
  const tmpColor = useMemo(() => new THREE.Color(), [])
  const bgKeys = useMemo(() => BG_KEYS.map(([p, c]) => [p, new THREE.Color(c)]), [])
  const gl = useThree((s) => s.gl)

  // Own the scene background so it can be lerped every frame.
  useEffect(() => {
    scene.background = new THREE.Color('#ffffff')
    return () => {
      scene.background = null
    }
  }, [scene])

  useFrame(() => {
    const p = progressRef.current
    colorKeys(bgKeys, p, tmpColor)
    if (scene.background) scene.background.copy(tmpColor)
    if (scene.fog) scene.fog.color.copy(tmpColor)
    // fade the whole stage out during the soft landing
    const fade = p > 0.965 ? Math.max(0, 1 - (p - 0.965) / 0.03) : 1
    gl.domElement.style.opacity = String(fade)
  })

  return (
    <>
      <fog attach="fog" args={['#ffffff', 9, 30]} />
      <StudioEnvironment intensity={0.95} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 7, 5]} intensity={1.9} />
      <directionalLight position={[-6, 3, -5]} intensity={0.9} color="#7dd3fc" />
      <CameraRig progressRef={progressRef} reduce={Boolean(reduce)} />
      
      <Starfield count={220} />
      <AccentLights progressRef={progressRef} />
      <Suspense fallback={null}>
        <ChipHero progressRef={progressRef} reduce={reduce} />
        <NeuralCore progressRef={progressRef} reduce={reduce} />
        <Vault progressRef={progressRef} reduce={reduce} />
        <LankaMap progressRef={progressRef} reduce={reduce} />
        <GalleryPlanes progressRef={progressRef} reduce={reduce} />
      </Suspense>
    </>
  )
}
