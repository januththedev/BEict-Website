import { Suspense, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { sub, smooth } from '../anim.js'
import { labelTexture } from '../textures.js'
import { useModelParts } from '../useModelParts.js'

const CARTRIDGES = [
  { label: 'HARDWARE & ARCHITECTURE', color: '#b45309', x: -2.3 },
  { label: 'NETWORKING & SECURITY', color: '#0e7490', x: 0 },
  { label: 'SOFTWARE & ALGORITHMS', color: '#6d28d9', x: 2.3 },
]

const OSI_LAYERS = ['Application', 'Presentation', 'Session', 'Transport', 'Network', 'Data Link', 'Physical']
const CODE_SNIPPETS = ['while(alive) {', '  learn();', '  revise();', '}', 'pass = True', 'print("A")']

/**
 * Chapter 4 setpiece: the Syllabus Vault. A floating server rack ejects
 * three cartridges toward the viewer; each expands into its topic world:
 *   Hardware & Architecture → CPU (existing textured chip) + RAM sticks
 *   Networking & Security   → OSI 7-layer stack
 *   Software & Algorithms   → floating code blocks + binary switch array
 *
 * Scroll phases (global p): eject 0.50–0.545 (staggered) · expand 0.545–0.62
 */
export default function Vault({ progressRef, reduce }) {
  const group = useRef(null)
  const carts = useRef([])
  const monogram = useRef(null)

  const labels = useMemo(
    () =>
      CARTRIDGES.map((c) =>
        labelTexture(c.label, {
          width: 1024,
          height: 128,
          color: '#ffffff',
          font: '800 62px Sora, Arial',
          bg: 'rgba(7, 18, 41, 0.82)',
        }),
      ),
    [],
  )
  const osiTex = useMemo(
    () =>
      OSI_LAYERS.map((l, i) =>
        labelTexture(`${7 - i} · ${l}`, {
          width: 640,
          height: 96,
          color: '#e0f2fe',
          font: '600 46px Inter, Arial',
          bg: 'rgba(12, 27, 58, 0.85)',
        }),
      ),
    [],
  )
  const codeTex = useMemo(
    () =>
      CODE_SNIPPETS.map((s) =>
        labelTexture(s, { width: 640, height: 110, color: '#86efac', font: '500 52px ui-monospace, Consolas, monospace' }),
      ),
    [],
  )
  const beTex = useMemo(
    () => labelTexture('BE', { width: 256, height: 256, color: '#ffffff', font: '900 150px Sora, Arial' }),
    [],
  )

  const binaryCount = 40
  const binaryRefs = useRef([])
  const scan = useRef(null)
  const stripRefs = useRef([])

  useFrame(({ clock }) => {
    if (!group.current) return
    const p = progressRef.current
    const t = clock.getElapsedTime()
    group.current.visible = p > 0.45 && p < 0.68

    // Holographic scan sweep while any cartridge expands.
    if (scan.current) {
      let active = 0
      CARTRIDGES.forEach((_, i) => {
        active = Math.max(active, smooth(sub(p, 0.545 + i * 0.022, 0.615)) * (1 - smooth(sub(p, 0.615, 0.64))))
      })
      scan.current.visible = active > 0.02
      scan.current.position.y = -0.6 + ((t * 0.55) % 1) * 3.2
      scan.current.material.opacity = active * 0.5
    }

    // Rack strips pulse.
    stripRefs.current.forEach((s, i) => {
      if (s) s.material.emissiveIntensity = 1.2 + Math.sin(t * 2 + i * Math.PI) * 0.5
    })

    CARTRIDGES.forEach((c, i) => {
      const cart = carts.current[i]
      if (!cart) return
      const eject = reduce
        ? p >= 0.5 + i * 0.04
          ? 1
          : 0
        : smooth(sub(p, 0.5 + i * 0.045, 0.545 + i * 0.045))
      const expand = reduce
        ? p >= 0.56 + i * 0.015
          ? 1
          : 0
        : smooth(sub(p, 0.548 + i * 0.022, 0.615))
      cart.userData.expand = expand
      const bob = reduce ? 0 : Math.sin(t * 1.2 + i * 2) * 0.05
      cart.position.set(
        c.x,
        0.9 + bob + eject * 0.15,
        0.9 + eject * 2.6 - expand * 0.4,
      )
      cart.rotation.y = Math.sin(t * 0.5 + i) * 0.06 + eject * 0.12 * (i - 1)
      // shell fades as it expands
      cart.children.forEach((child) => {
        if (child.userData?.shell && child.material) {
          child.material.transparent = true
          child.material.opacity = 1 - expand * 0.85
        }
        if (child.userData?.extras) child.visible = expand > 0.02
      })
    })

    const pulse = reduce ? 0 : Math.sin(t * 2.4) * 0.5 + 0.5
    binaryRefs.current.forEach((b, i) => {
      if (b) b.position.y = b.userData.baseY + pulse * (i % 2) * 0.05
    })
  })

  return (
    <group ref={group} position={[0, 0, -80]}>
      {/* Server rack frame */}
      <group position={[0, 0.4, -0.4]}>
        {[-1.35, 1.35].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.12, 2.6, 0.5]} />
            <meshStandardMaterial color="#0c1b3a" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {[-1.35, 1.35].map((x, i) => (
          <mesh key={`strip-${x}`} ref={(el) => (stripRefs.current[i] = el)} position={[x * 0.94, 0, 0.26]}>
            <boxGeometry args={[0.04, 2.4, 0.02]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.2} />
          </mesh>
        ))}
        {[-0.85, 0, 0.85].map((y) => (
          <mesh key={y} position={[0, y, -0.1]}>
            <boxGeometry args={[2.6, 0.1, 0.34]} />
            <meshStandardMaterial color="#12295c" metalness={0.7} roughness={0.35} />
          </mesh>
        ))}
        <mesh ref={monogram} position={[0, 0.42, 0.28]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial map={beTex} transparent depthWrite={false} />
        </mesh>
      </group>

      {/* Holographic scan sweep */}
      <mesh ref={scan} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[5.4, 2.2]} />
        <meshBasicMaterial color="#0891b2" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Cartridges + their expansion worlds */}
      {CARTRIDGES.map((c, i) => (
        <group key={c.label} ref={(el) => (carts.current[i] = el)} position={[c.x, 0.9, 0.9]}>
          {/* shell */}
          <mesh userData={{ shell: true }}>
            <boxGeometry args={[1.5, 0.95, 0.28]} />
            <meshStandardMaterial color={c.color} metalness={0.4} roughness={0.5} emissive={c.color} emissiveIntensity={0.08} transparent />
          </mesh>
          <lineSegments userData={{ shell: true }}>
            <edgesGeometry args={[new THREE.BoxGeometry(1.5, 0.95, 0.28)]} />
            <lineBasicMaterial color={c.color} transparent opacity={0.95} />
          </lineSegments>
          <mesh position={[0, 0, 0.15]} userData={{ shell: true }}>
            <planeGeometry args={[1.36, 0.24]} />
            <meshBasicMaterial map={labels[i]} transparent />
          </mesh>

          {/* C1 expansion: CPU + RAM (extras group) */}
          {i === 0 && (
            <group position={[0, 0.2, 0.6]} visible={false} userData={{ extras: true }}>
              <Suspense fallback={null}>
                <ChipMini />
              </Suspense>
              {[-0.55, 0.55].map((x) => (
                <group key={x} position={[x, -0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <mesh>
                    <boxGeometry args={[1.15, 0.06, 0.34]} />
                    <meshStandardMaterial color="#12295c" metalness={0.7} roughness={0.3} />
                  </mesh>
                  {[-0.35, -0.12, 0.12, 0.35].map((cx) => (
                    <mesh key={cx} position={[cx, 0.045, 0]}>
                      <boxGeometry args={[0.16, 0.03, 0.28]} />
                      <meshStandardMaterial color="#0c1b3a" metalness={0.4} roughness={0.5} />
                    </mesh>
                  ))}
                </group>
              ))}
            </group>
          )}

          {/* C2 expansion: OSI layer stack */}
          {i === 1 && (
            <group position={[0, 0.2, 0.6]} visible={false} userData={{ extras: true }}>
              {OSI_LAYERS.map((_, k) => (
                <mesh key={k} position={[0, (3 - k) * 0.34, 0]}>
                  <boxGeometry args={[1.7, 0.26, 0.12]} />
                  <meshStandardMaterial
                    color={k % 2 ? '#12295c' : '#1d43cf'}
                    metalness={0.5}
                    roughness={0.35}
                    emissive="#2563eb"
                    emissiveIntensity={0.3}
                    transparent
                  />
                  <mesh position={[0, 0, 0.065]}>
                    <planeGeometry args={[1.6, 0.22]} />
                    <meshBasicMaterial map={osiTex[k]} transparent />
                  </mesh>
                </mesh>
              ))}
            </group>
          )}

          {/* C3 expansion: code blocks + binary array */}
          {i === 2 && (
            <group position={[0, 0.2, 0.6]} visible={false} userData={{ extras: true }}>
              {CODE_SNIPPETS.map((_, k) => (
                <mesh key={k} position={[0, 0.9 - k * 0.32, Math.sin(k * 1.4) * 0.12]}>
                  <planeGeometry args={[1.55, 0.27]} />
                  <meshBasicMaterial map={codeTex[k]} transparent />
                </mesh>
              ))}
              <group position={[-1.6, -0.7, 0]}>
                {Array.from({ length: binaryCount }).map((_, k) => {
                  const row = Math.floor(k / 8)
                  const col = k % 8
                  return (
                    <mesh
                      key={k}
                      ref={(el) => {
                        binaryRefs.current[k] = el
                        if (el) el.userData.baseY = (1 - Math.floor(k / 8)) * 0.22 - 0.4
                      }}
                      position={[(col - 3.5) * 0.24, (1 - row) * 0.22 - 0.4, 0]}
                    >
                      <boxGeometry args={[0.18, 0.09, 0.18]} />
                      <meshStandardMaterial
                        color={k % 2 ? '#38bdf8' : '#1e3aa8'}
                        emissive="#2563eb"
                        emissiveIntensity={0.5}
                        metalness={0.4}
                        roughness={0.35}
                      />
                    </mesh>
                  )
                })}
              </group>
            </group>
          )}
        </group>
      ))}
    </group>
  )
}

/** The existing textured CPU model, miniaturised for the Hardware cartridge. */
function ChipMini() {
  const { root } = useModelParts('/models/cpu-chip.gltf')
  const ref = useRef(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.4
  })
  return (
    <group ref={ref} position={[0, 1.35, 0]} scale={0.55}>
      <primitive object={root} />
    </group>
  )
}

useGLTF.preload('/models/cpu-chip.gltf')
