import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sub, smooth } from '../anim.js'
import { texture } from '../textures.js'

/**
 * Chapter 3 setpiece: the “Teacher’s Mind” — a holographic glass sphere
 * whose layers peel toward the camera on scroll:
 *   outer shell → his background · mid shell → glowing methodology circuits
 *   core → the verified stats · finally condenses into an Enroll trigger.
 *
 * Scroll phases (global p): peel 0.34–0.44 · stats 0.42–0.475 · condense 0.44–0.475
 */
export default function NeuralCore({ progressRef, reduce }) {
  const group = useRef(null)
  const outer = useRef(null)
  const outerWire = useRef(null)
  const mid = useRef(null)
  const core = useRef(null)

  const circuitTex = useMemo(() => texture('dieGlow', [2, 2]), [])

  useFrame(({ clock }) => {
    if (!group.current) return
    const p = progressRef.current
    const t = clock.getElapsedTime()
    const wPeel = reduce ? (p >= 0.36 ? 1 : 0) : smooth(sub(p, 0.34, 0.44))
    const wCondense = reduce ? (p >= 0.46 ? 1 : 0) : smooth(sub(p, 0.44, 0.472))
    const fade = 1 - smooth(sub(p, 0.472, 0.48))

    group.current.visible = p > 0.3 && p < 0.5

    const spin = reduce ? 0 : t * 0.25

    // Outer shell peels toward the camera and dissolves.
    if (outer.current) {
      outer.current.rotation.y = spin * 0.6
      outer.current.rotation.x = Math.sin(t * 0.3) * 0.15
      outer.current.position.z = wPeel * 3.4
      outer.current.scale.setScalar(1 - wCondense * 0.9)
      if (outer.current.material) {
        outer.current.material.opacity = (0.22 * (1 - wPeel * 0.85)) * fade
      }
    }
    if (outerWire.current) {
      outerWire.current.rotation.y = spin * 0.6
      outerWire.current.rotation.x = Math.sin(t * 0.3) * 0.15
      outerWire.current.position.z = wPeel * 3.4
      outerWire.current.scale.setScalar(1 - wCondense * 0.9)
      outerWire.current.material.opacity = (0.3 * (1 - wPeel * 0.7)) * fade
    }

    // Mid shell (methodology circuits) follows halfway.
    if (mid.current) {
      mid.current.rotation.y = -spin * 0.8
      mid.current.position.z = wPeel * 1.8
      mid.current.scale.setScalar(1 - wCondense * 0.85)
      mid.current.material.opacity = (0.9 * (1 - wPeel * 0.25)) * fade
      mid.current.material.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.25
    }

    // Core (the stats heart) brightens, then condenses into the trigger.
    if (core.current) {
      core.current.rotation.y = spin
      const pulse = 1 + Math.sin(t * 3) * 0.06
      core.current.scale.setScalar((1 - wCondense * 0.55) * pulse)
      core.current.material.emissiveIntensity = 1.6 + wPeel * 1.4 + wCondense * 2.2
    }
  })

  return (
    <group ref={group} position={[0, 0.4, -40]}>
      {/* Outer crust — background/qualifications */}
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshStandardMaterial
          color="#3b6ef6"
          transparent
          opacity={0.22}
          metalness={0.4}
          roughness={0.2}
          flatShading
          depthWrite={false}
        />
      </mesh>
      <lineSegments ref={outerWire}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(1.7, 1)]} />
        <lineBasicMaterial color="#7dd3fc" transparent opacity={0.3} depthWrite={false} />
      </lineSegments>

      {/* Mid layer — glowing methodology circuits */}
      <mesh ref={mid}>
        <icosahedronGeometry args={[1.12, 1]} />
        <meshStandardMaterial
          color="#0c1b3a"
          map={circuitTex}
          emissive="#7fb4ff"
          emissiveMap={circuitTex}
          emissiveIntensity={1.4}
          transparent
          opacity={0.9}
          flatShading
        />
      </mesh>

      {/* Core — the stats heart */}
      <mesh ref={core}>
        <sphereGeometry args={[0.55, 32, 24]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#38bdf8"
          emissiveIntensity={1.6}
          metalness={0.3}
          roughness={0.15}
        />
      </mesh>
      <pointLight position={[0, 0, 1.2]} intensity={9} color="#38bdf8" distance={7} />
    </group>
  )
}
