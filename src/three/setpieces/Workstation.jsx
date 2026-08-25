import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sub, smooth } from '../anim.js'
import { labelTexture, screenTexture, texture } from '../textures.js'

const BADGES = [
  'Python', 'Number Systems', 'Logic Gates', 'Boolean Algebra',
  'Operating Systems', 'Networking', 'Databases', 'Hardware',
]
const MODULES = ['Data Representation', 'Logic Gates', 'Boolean Algebra', 'Operating Systems', 'Programming']

/**
 * Chapter 0–2 setpiece: a floating tutor workstation that explodes along Z
 * (monitor becomes the bio backdrop, keycaps fly out as syllabus badges,
 * the tower opens to reveal module plates) and then aligns into a grid.
 *
 * Scroll phases (global progress p):
 *   0.00–0.10  assembled, name typography floating above (hero)
 *   0.10–0.20  explode (identity chapter)
 *   0.22–0.30  badges + modules align into a grid (track-record chapter)
 *   0.30–0.34  fade out as the camera flies on to the Neural Core
 */
export default function Workstation({ progressRef, reduce }) {
  const group = useRef(null)
  const nameGroup = useRef(null)
  const screen = useRef(null)
  const base = useRef(null)
  const keyboard = useRef(null)
  const tower = useRef(null)
  const sidePanel = useRef(null)
  const badges = useRef([])
  const modules = useRef([])
  const keycaps = useRef(null)
  const { camera } = useThree()

  const screenTex = useMemo(() => screenTexture(), [])
  const pcbTex = useMemo(() => texture('pcb', [2, 2]), [])
  const badgeTex = useMemo(
    () => BADGES.map((b) => labelTexture(b, { width: 512, height: 160, color: '#ffffff', font: '700 58px Sora, Arial' })),
    [],
  )
  const moduleTex = useMemo(
    () => MODULES.map((m) => labelTexture(m, { width: 512, height: 128, color: '#bfdbfe', font: '600 54px Inter, Arial' })),
    [],
  )
  const nameTex = useMemo(
    () => labelTexture('BHANUKA EKANAYAKA', { width: 2048, height: 256, color: '#0c1b3a', font: '800 150px Sora, Arial' }),
    [],
  )
  const tagTex = useMemo(
    () => labelTexture('Leading ICT Teacher in Sri Lanka', { width: 1600, height: 160, color: '#1d43cf', font: '600 66px Inter, Arial' }),
    [],
  )

  // Keycap grid (instances) — 13 × 4 compact keyboard.
  const capCount = 52
  const capPositions = useMemo(() => {
    const arr = []
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 13; col++) {
        arr.push([(col - 6) * 0.148, 0.075, (row - 1.5) * 0.148])
      }
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!group.current) return
    const p = progressRef.current
    const wE = reduce ? (p >= 0.1 ? 1 : 0) : smooth(sub(p, 0.1, 0.2))
    const wA = reduce ? (p >= 0.22 ? 1 : 0) : smooth(sub(p, 0.22, 0.3))
    const fade = 1 - smooth(sub(p, 0.3, 0.34))
    group.current.visible = p < 0.36
    group.current.traverse((o) => {
      if (o.material && 'opacity' in o.material) {
        o.material.transparent = true
        o.material.opacity = fade
      }
    })
    const t = clock.getElapsedTime()
    const float = reduce ? 0 : Math.sin(t * 0.9) * 0.05

    // Name typography fades out as the explosion begins.
    if (nameGroup.current) {
      nameGroup.current.position.y = 2.75 + float
      nameGroup.current.children.forEach((child) => {
        child.material.opacity = (1 - wE) * fade
      })
    }

    // Monitor → bio backdrop (pushes back and up).
    if (screen.current) {
      const z = THREE.MathUtils.lerp(0, -2.6, wE)
      const y = THREE.MathUtils.lerp(1.05 + float, 2.1, wE)
      screen.current.position.set(THREE.MathUtils.lerp(-0.4, -1.6, wA), y, z)
      screen.current.rotation.y = THREE.MathUtils.lerp(0.12, 0.32, wE)
    }

    // Laptop base sinks slightly.
    if (base.current) {
      base.current.position.set(-0.4, THREE.MathUtils.lerp(float, -1.1, wE), THREE.MathUtils.lerp(0, 1.1, wE))
    }

    // Keyboard slides forward; keycaps scatter with the explosion.
    if (keyboard.current) {
      keyboard.current.position.set(
        THREE.MathUtils.lerp(-0.4, -1.9, wE),
        THREE.MathUtils.lerp(-0.02 + float, -0.7, wE),
        THREE.MathUtils.lerp(0.62, 1.9, wE),
      )
    }
    if (keycaps.current) {
      const dummy = keycaps.current  // InstancedMesh
      for (let i = 0; i < capCount; i++) {
        const [bx, by, bz] = capPositions[i]
        const scatter = wE * (0.4 + ((i * 37) % 10) / 10)
        dummy.setMatrixAt(
          i,
          new THREE.Matrix4().makeTranslation(
            bx + Math.sin(i * 12.9) * scatter * 1.4,
            by + Math.cos(i * 7.3) * scatter * 0.9,
            bz + ((i * 17) % 7) / 7 * scatter * 2.2,
          ),
        )
      }
      dummy.instanceMatrix.needsUpdate = true
    }

    // Tower slides right; side panel swings open; modules fan out then align.
    if (tower.current) {
      tower.current.position.set(THREE.MathUtils.lerp(1.9, 2.6, wE), float, 0)
    }
    if (sidePanel.current) {
      sidePanel.current.rotation.y = -1.3 * wE
    }
    // Hero composition: whole setpiece sits right of the headline, then
    // centres as the explosion begins. Narrow screens: shrink and drop the
    // setpiece below the copy so nothing fights the text.
    const mobile = window.innerWidth < 768
    const heroShift = mobile ? 0.35 : 1.7
    group.current.position.x = THREE.MathUtils.lerp(heroShift, 0, wE)
    group.current.position.y = mobile ? -2.15 : 0
    group.current.scale.setScalar(mobile ? 0.55 : 1)
    // The HTML h1 already carries the name on phones — skip the 3D type.
    if (nameGroup.current) {
      nameGroup.current.visible = !mobile
      nameGroup.current.scale.setScalar(1)
    }
    MODULES.forEach((_, i) => {
      const m = modules.current[i]
      if (!m) return
      const basePos = [2.05, -0.45 + i * 0.22, 0]
      const fanned = [2.05 + Math.sin(i * 1.7) * 0.5, 0.2 + i * 0.34, 0.9 + i * 0.12]
      const grid = [-3.1 + i * 1.55, -1.5, 2.1]
      const x = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(basePos[0], fanned[0], wE),
        grid[0], wA,
      )
      const y = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(basePos[1], fanned[1], wE),
        grid[1], wA,
      )
      const z = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(basePos[2], fanned[2], wE),
        grid[2], wA,
      )
      m.position.set(x, y, z)
      m.rotation.y = THREE.MathUtils.lerp(0, 0.25, wE) * (i % 2 ? 1 : -1)
    })

    // Skill badges: hidden in the keyboard, fly to an arc, then align to a row.
    BADGES.forEach((_, i) => {
      const b = badges.current[i]
      if (!b) return
      const home = [-1.1 + i * 0.28, -0.02, 0.62]
      const arc = [
        -3.4 + i * 0.95,
        1.1 + Math.sin(i * 2.1) * 0.7,
        2.6 + Math.cos(i * 1.3) * 0.5,
      ]
      const row = [-3.45 + (i % 4) * 2.3, i < 4 ? 1.55 : 0.85, 2.3]
      const w = wA
      const x = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(home[0], arc[0], wE),
        row[0], w,
      )
      const y = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(home[1], arc[1], wE),
        row[1], w,
      )
      const z = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(home[2], arc[2], wE),
        row[2], w,
      )
      const scale = 0.001 + wE * 0.9 // grow out of the keyboard
      b.position.set(x, y, z)
      b.scale.setScalar(scale)
      if (!reduce) b.lookAt(camera.position) // badges always face the viewer
    })
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Floating 3D typography */}
      <group ref={nameGroup}>
        <mesh position={[0, 0.45, -0.4]}>
          <planeGeometry args={[6.4, 0.8]} />
          <meshBasicMaterial map={nameTex} transparent depthWrite={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[4.4, 0.44]} />
          <meshBasicMaterial map={tagTex} transparent depthWrite={false} />
        </mesh>
      </group>

      {/* Monitor */}
      <group ref={screen} position={[-0.4, 1.05, 0]}>
        <mesh>
          <boxGeometry args={[2.7, 1.7, 0.09]} />
          <meshStandardMaterial color="#12295c" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.051]}>
          <planeGeometry args={[2.5, 1.5]} />
          <meshBasicMaterial map={screenTex} />
        </mesh>
        <mesh position={[0, -0.95, 0]}>
          <boxGeometry args={[0.5, 0.22, 0.3]} />
          <meshStandardMaterial color="#0c1b3a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Laptop base with PCB top */}
      <group ref={base} position={[-0.4, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.7, 0.12, 1.75]} />
          <meshStandardMaterial color="#0f2a5c" metalness={0.55} roughness={0.4} map={pcbTex} />
        </mesh>
      </group>

      {/* Mechanical keyboard + keycap instances */}
      <group ref={keyboard} position={[-0.4, -0.02, 0.62]}>
        <mesh>
          <boxGeometry args={[2.05, 0.1, 0.72]} />
          <meshStandardMaterial color="#0c1b3a" metalness={0.5} roughness={0.45} />
        </mesh>
        <instancedMesh ref={keycaps} args={[undefined, undefined, capCount]} position={[0, 0.04, 0]}>
          <boxGeometry args={[0.13, 0.05, 0.13]} />
          <meshStandardMaterial color="#3b6ef6" metalness={0.3} roughness={0.35} emissive="#1d43cf" emissiveIntensity={0.35} />
        </instancedMesh>
      </group>

      {/* Tower / chassis with syllabus modules inside */}
      <group ref={tower} position={[1.9, 0, 0]}>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[0.85, 1.7, 1.3]} />
          <meshStandardMaterial color="#12295c" metalness={0.65} roughness={0.32} />
        </mesh>
        <mesh position={[0, 1.62, 0]}>
          <boxGeometry args={[0.9, 0.06, 1.35]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} metalness={0.4} roughness={0.3} />
        </mesh>
        {/* hinged side panel */}
        <group position={[0.44, 0.75, 0.66]}>
          <mesh ref={sidePanel} position={[-0.44, 0, -0.66]}>
            <boxGeometry args={[0.03, 1.5, 1.15]} />
            <meshStandardMaterial color="#1e3aa8" metalness={0.7} roughness={0.25} transparent opacity={0.92} />
          </mesh>
        </group>
      </group>

      {/* Syllabus module plates (world-space so they can align into a grid) */}
      {MODULES.map((m, i) => (
        <mesh
          key={m}
          ref={(el) => (modules.current[i] = el)}
          position={[2.05, -0.45 + i * 0.22, 0]}
        >
          <boxGeometry args={[0.62, 0.16, 0.92]} />
          <meshStandardMaterial color="#0c1b3a" metalness={0.5} roughness={0.4} emissive="#1d43cf" emissiveIntensity={0.25} />
          <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.58, 0.14]} />
            <meshBasicMaterial map={moduleTex[i]} transparent />
          </mesh>
        </mesh>
      ))}

      {/* Skill badges (grow out of the keyboard on explode) */}
      {BADGES.map((b, i) => (
        <group key={b} ref={(el) => (badges.current[i] = el)} scale={[0.001, 0.001, 0.001]}>
          <mesh>
            <boxGeometry args={[1.05, 0.34, 0.1]} />
            <meshStandardMaterial color="#12295c" metalness={0.6} roughness={0.3} emissive="#1d43cf" emissiveIntensity={0.45} />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <planeGeometry args={[1, 0.3]} />
            <meshBasicMaterial map={badgeTex[i]} transparent />
          </mesh>
        </group>
      ))}
    </group>
  )
}
