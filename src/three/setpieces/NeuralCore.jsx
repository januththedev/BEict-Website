import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sub, smooth } from '../anim.js'
import { texture } from '../textures.js'

/**
 * Chapter 3 setpiece: the “Teacher’s Mind” — an iridescent glass sphere
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
  const halo = useRef(null)
  const motes = useRef(null)

  const circuitTex = useMemo(() => texture('dieGlow', [2, 2]), [])

  // Orbiting data motes between the circuits and the core.
  const moteCount = 26
  const moteSeeds = useMemo(
    () =>
      Array.from({ length: moteCount }, (_, i) => ({
        r: 0.75 + ((i * 29) % 10) / 10 * 0.5,
        speed: 0.4 + ((i * 13) % 10) / 10 * 0.7,
        phase: (i / moteCount) * Math.PI * 2,
        incline: ((i * 7) % 10) / 10 * Math.PI,
      })),
    [],
  )
  const moteMesh = useRef(null)

  useFrame(({ clock }) => {
    if (!group.current) return
    const p = progressRef.current
    const t = clock.getElapsedTime()
    const wPeel = reduce ? (p >= 0.36 ? 1 : 0) : smooth(sub(p, 0.34, 0.44))
    const wCondense = reduce ? (p >= 0.46 ? 1 : 0) : smooth(sub(p, 0.44, 0.472))

    group.current.visible = p > 0.3 && p < 0.5
    const fade = 1 - smooth(sub(p, 0.472, 0.48))
    const spin = reduce ? 0 : t * 0.25

    if (outer.current) {
      outer.current.rotation.y = spin * 0.6
      outer.current.rotation.x = Math.sin(t * 0.3) * 0.15
      outer.current.position.z = wPeel * 3.4
      outer.current.scale.setScalar((1 - wCondense * 0.9) * (1 + Math.sin(t * 1.4) * 0.015))
      outer.current.material.opacity = (0.5 * (1 - wPeel * 0.8)) * fade
    }
    if (outerWire.current) {
      outerWire.current.rotation.y = spin * 0.6
      outerWire.current.rotation.x = Math.sin(t * 0.3) * 0.15
      outerWire.current.position.z = wPeel * 3.4
      outerWire.current.scale.setScalar(1 - wCondense * 0.9)
      outerWire.current.material.opacity = (0.34 * (1 - wPeel * 0.7)) * fade
    }
    if (mid.current) {
      mid.current.rotation.y = -spin * 0.8
      mid.current.position.z = wPeel * 1.8
      mid.current.scale.setScalar(1 - wCondense * 0.85)
      mid.current.material.emissiveIntensity = 1.6 + Math.sin(t * 2) * 0.3
    }
    if (core.current) {
      core.current.rotation.y = spin
      const pulse = 1 + Math.sin(t * 3) * 0.06
      core.current.scale.setScalar((1 - wCondense * 0.55) * pulse)
      core.current.material.emissiveIntensity = 2 + wPeel * 1.6 + wCondense * 2.4
    }
    if (halo.current) {
      halo.current.scale.setScalar(2.1 + Math.sin(t * 1.8) * 0.08)
      halo.current.material.opacity = (0.35 + wPeel * 0.2) * (1 - wCondense) * fade
    }
    if (moteMesh.current && !reduce) {
      const m = new THREE.Matrix4()
      moteSeeds.forEach((s, i) => {
        const a = t * s.speed + s.phase
        m.makeTranslation(
          Math.cos(a) * s.r,
          Math.sin(a * 0.8 + s.incline) * s.r * 0.6,
          Math.sin(a) * s.r,
        )
        moteMesh.current.setMatrixAt(i, m)
      })
      moteMesh.current.instanceMatrix.needsUpdate = true
      moteMesh.current.material.opacity = fade * (0.5 + wPeel * 0.5)
    }
  })

  return (
    <group ref={group} position={[0, 0.4, -40]}>
      {/* Outer crust — iridescent glass (iGPU-friendly: no transmission pass) */}
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshPhysicalMaterial
          color="#9ec5ff"
          transparent
          opacity={0.32}
          roughness={0.08}
          metalness={0.1}
          iridescence={1}
          iridescenceIOR={1.35}
          clearcoat={1}
          clearcoatRoughness={0.15}
          flatShading
          depthWrite={false}
        />
      </mesh>
      <lineSegments ref={outerWire}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(1.71, 1)]} />
        <lineBasicMaterial color="#7dd3fc" transparent opacity={0.34} depthWrite={false} />
      </lineSegments>

      {/* Mid layer — glowing methodology circuits */}
      <mesh ref={mid}>
        <icosahedronGeometry args={[1.12, 1]} />
        <meshStandardMaterial
          color="#0c1b3a"
          map={circuitTex}
          emissive="#7fb4ff"
          emissiveMap={circuitTex}
          emissiveIntensity={1.6}
          transparent
          opacity={0.95}
          flatShading
        />
      </mesh>

      {/* Orbiting data motes */}
      <instancedMesh ref={moteMesh} args={[undefined, undefined, moteCount]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={0.8} depthWrite={false} />
      </instancedMesh>

      {/* Halo ring behind the core */}
      <mesh ref={halo} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[1.35, 0.02, 8, 64]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Core — the stats heart */}
      <mesh ref={core}>
        <sphereGeometry args={[0.55, 32, 24]} />
        <meshStandardMaterial
          color="#a5f3fc"
          emissive="#38bdf8"
          emissiveIntensity={2}
          metalness={0.3}
          roughness={0.12}
        />
      </mesh>
      <pointLight position={[0, 0, 1.2]} intensity={11} color="#38bdf8" distance={8} />
      <pointLight position={[-1.4, 0.8, -0.6]} intensity={6} color="#a78bfa" distance={7} />
    </group>
  )
}
