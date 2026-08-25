import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import SafeCanvas from './SafeCanvas.jsx'
import StudioEnvironment from './StudioEnvironment.jsx'
import { useModelParts } from './useModelParts.js'

function FloatingChip({ reduce }) {
  const { root } = useModelParts('/models/cpu-chip.gltf')
  const group = useRef(null)

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    if (!reduce) {
      group.current.rotation.y += delta * 0.45
      group.current.position.y = Math.sin(t * 1.2) * 0.09
      group.current.rotation.x = Math.sin(t * 0.6) * 0.05
    }
  })

  return (
    <primitive ref={group} object={root} scale={0.92} position={[0, -0.15, 0]} rotation={[0.35, 0.6, 0]} />
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <directionalLight position={[-5, 3, -4]} intensity={0.9} color="#7dd3fc" />
      <pointLight position={[0, -3, 2]} intensity={12} color="#2563eb" />
    </>
  )
}

export default function HeroScene() {
  return (
    <SafeCanvas
      fallback={
        <div className="grid size-full place-items-center text-sm text-slate-500">
          Interactive 3D preview unavailable on this device.
        </div>
      }
      camera={{ position: [3.2, 2, 4.4], fov: 38 }}
    >
      <Suspense fallback={null}>
        <StudioEnvironment intensity={1.0} />
        <Lights />
        <HeroContent />
      </Suspense>
    </SafeCanvas>
  )
}

function HeroContent() {
  const reduce = Boolean(useReducedMotion())
  return (
    <>
      <FloatingChip reduce={reduce} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!reduce}
        autoRotateSpeed={0.8}
        makeDefault
      />
    </>
  )
}

useGLTF.preload('/models/cpu-chip.gltf')
