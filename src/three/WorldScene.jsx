import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { colorKeys, lerpKeys } from './anim.js'
import StudioEnvironment from './StudioEnvironment.jsx'
import Workstation from './setpieces/Workstation.jsx'
import NeuralCore from './setpieces/NeuralCore.jsx'
import Vault from './setpieces/Vault.jsx'
import LankaMap from './setpieces/LankaMap.jsx'
import GalleryPlanes from './setpieces/GalleryPlanes.jsx'

/**
 * Camera keyframes across the whole-page scroll progress.
 * Setpieces: workstation z 0 · core z −40 · vault z −80 · map z −120 ·
 * gallery planes z −148…−164.
 */
const CAM_KEYS = [
  [0.0, 12],
  [0.06, 7.5],
  [0.1, 6.5],
  [0.22, 8.5],
  [0.3, 9.5],
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

/** Scene palette: bright white space → deep navy → back to light. */
const BG_KEYS = [
  [0.0, '#ffffff'],
  [0.06, '#f4f8ff'],
  [0.13, '#071229'],
  [0.9, '#071229'],
  [0.965, '#eef4ff'],
  [1.0, '#ffffff'],
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
      {!reduce && <Starfield count={220} />}
      <Suspense fallback={null}>
        <Workstation progressRef={progressRef} reduce={reduce} />
        <NeuralCore progressRef={progressRef} reduce={reduce} />
        <Vault progressRef={progressRef} reduce={reduce} />
        <LankaMap progressRef={progressRef} reduce={reduce} />
        <GalleryPlanes progressRef={progressRef} reduce={reduce} />
      </Suspense>
    </>
  )
}
