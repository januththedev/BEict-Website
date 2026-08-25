import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sub, smooth } from '../anim.js'
import { useModelParts } from '../useModelParts.js'

/**
 * Chapters 0–2 hero object: the textured CPU alone, keynote-style.
 *   0.00–0.10  centred, slow rotate (Hero)
 *   0.10–0.22  slow-motion explode, camera orbits (About)
 *   0.22–0.32  parts align into a clean orbital ring around the stats
 *   0.32–0.36  fades as the camera flies to the Neural Core
 */
const EXPLODE = {
  Substrate: [0, -0.1, -0.4],
  Pins: [0, -0.9, -0.2],
  Die: [0, 0.75, 0.2],
  HeatSpreader: [0, 1.5, 0.5],
  Capacitors: [1.3, 0.35, -0.3],
}

export default function ChipHero({ progressRef, reduce }) {
  const group = useRef(null)
  const ring = useRef(null)
  const { root, meshes, parts } = useModelParts('/models/cpu-chip.gltf')

  const ringLayout = useMemo(() => {
    // Every part lands on a circle (radius 2.3) in arrival order.
    const order = ['HeatSpreader', 'Die', 'Capacitors', 'Substrate', 'Pins']
    return Object.fromEntries(
      order.map((name, i) => {
        const a = (i / order.length) * Math.PI * 2 - Math.PI / 2
        return [name, [Math.cos(a) * 2.3, Math.sin(a) * 1.15, Math.sin(a) * 0.6]]
      }),
    )
  }, [])

  const basePos = useMemo(
    () => new Map(parts.map((p) => [p.name, p.position.clone()])),
    [parts],
  )

  // Soft radial halo so the chip reads as a lit product shot on black.
  const haloTex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128)
    g.addColorStop(0, 'rgba(147, 180, 253, 0.5)')
    g.addColorStop(0.5, 'rgba(59, 110, 246, 0.18)')
    g.addColorStop(1, 'rgba(244, 248, 255, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // Lift the substrate/pins out of the void once materials are cloned.
  useEffect(() => {
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return
      if (o.material.color && o.name === 'Substrate') o.material.color.set('#1c3f8f')
      if (o.name === 'Capacitors' && o.material.color) {
        o.material.color.set('#0c1b3a')
        o.material.metalness = 0.6
        o.material.roughness = 0.3
      }
      if (o.name === 'Pins') o.material.emissive?.set('#8a6a1f')
    })
  }, [root])

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const p = progressRef.current
    if (p > 0.37) {
      g.visible = false
      return
    }
    g.visible = true
    const t = clock.getElapsedTime()

    const wExplode = reduce ? (p >= 0.1 ? 1 : 0) : smooth(sub(p, 0.1, 0.2))
    const wRing = reduce ? (p >= 0.22 ? 1 : 0) : smooth(sub(p, 0.22, 0.3))

    // Assembled state: centred, gentle float, slow rotate.
    const assembledY = reduce ? 0 : Math.sin(t * 0.9) * 0.08
    const assembledRot = reduce ? 0.4 : 0.4 + t * 0.18

    // Exploded state: parts along their offsets, whole group tilted.
    const explodedRot = reduce ? 0.8 : 0.8 + t * 0.1

    // Ring state: parts on a circle, ring slowly counter-rotating.
    const ringRot = reduce ? 0 : t * 0.12

    parts.forEach((part) => {
      const base = basePos.get(part.name)
      const off = EXPLODE[part.name]
      if (!base || !off) return
      // assembled → exploded
      let x = base.x + off[0] * wExplode
      let y = base.y + off[1] * wExplode + assembledY * (1 - wExplode)
      let z = base.z + off[2] * wExplode
      // → ring (ring positions are in ring-local space; undo group rotation)
      const rl = ringLayout[part.name]
      if (rl) {
        const ringAngle = ringRot
        const cos = Math.cos(ringAngle)
        const sin = Math.sin(ringAngle)
        const rx = rl[0] * cos - rl[2] * sin
        const rz = rl[0] * sin + rl[2] * cos
        x = THREE.MathUtils.lerp(x, rx, wRing)
        y = THREE.MathUtils.lerp(y, rl[1], wRing)
        z = THREE.MathUtils.lerp(z, rz, wRing)
      }
      part.position.set(x, y, z)
    })

    // Group choreography.
    g.position.y = 0.2
    g.rotation.y = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(assembledRot, explodedRot, wExplode),
      0,
      wRing,
    )
    if (ring.current) ring.current.rotation.y = ringRot
    g.rotation.x = THREE.MathUtils.lerp(0.15, 0.45, wExplode) * (1 - wRing)
    const s = 1 + wExplode * 0.12 - wRing * 0.05
    g.scale.setScalar(s)

    // Emissive lift so the chip reads on black.
    meshes.forEach((m) => {
      if (m.material.emissiveIntensity !== undefined && m.name !== 'Die') {
        m.material.emissiveIntensity = 0.7 + wExplode * 0.3
      }
    })
  })

  return (
    <group ref={group} position={[0, 0.2, 0]}>
      {/* soft contact shadow under the chip */}
      <mesh position={[0.2, -1.35, 0.4]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.2, 2.2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={haloTex} transparent opacity={0.35} depthWrite={false} color="#1d43cf" />
      </mesh>
      {/* product-shot halo behind the chip */}
      <mesh position={[0, 0.3, -1.6]} scale={7.5}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={haloTex} transparent opacity={0.85} depthWrite={false} />
      </mesh>
      {/* rim/back lighting so the dark chip reads on the black void */}
      <pointLight position={[0, 1.6, -3.2]} intensity={14} color="#38bdf8" distance={12} />
      <pointLight position={[-2.6, -0.6, 2.4]} intensity={7} color="#67e8f9" distance={9} />
      <primitive object={root} rotation={[0.15, 0.4, 0]} />
    </group>
  )
}
