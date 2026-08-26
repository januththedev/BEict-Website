/**
 * Hero backdrop: a drifting particle network ("circuit constellation") in the
 * BEICT blues. The cloud parallaxes with the pointer; nodes drift slowly and
 * connect with faint lines when close. Deliberately subtle — it decorates the
 * hero, it never competes with the headline.
 *
 * Mounted only when motion is allowed; the static SVG grid stays as fallback.
 */
import { runSceneCanvas, glowTexture, type SceneSetup } from './runSceneCanvas'

const NODE_COLOR = '#1e4fd8'
const LINE_COLOR = '#608ffa'
const LINK_DISTANCE = 13

export async function mountHeroField(canvas: HTMLCanvasElement): Promise<() => void> {
  const setup: SceneSetup = (THREE, canvasEl) => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 300)
    camera.position.z = 70

    const isSmall = canvasEl.clientWidth < 640
    const count = isSmall ? 80 : 150
    const bounds = { x: 110, y: 70, z: 50 }

    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * bounds.x
      positions[i * 3 + 1] = (Math.random() - 0.5) * bounds.y
      positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z
      velocities[i * 3] = (Math.random() - 0.5) * 0.08
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.08
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.04
    }

    const pointsGeo = new THREE.BufferGeometry()
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const dotTexture = glowTexture(THREE, 'rgba(30,79,216,0.95)')
    const pointsMaterial = new THREE.PointsMaterial({
      color: NODE_COLOR,
      size: 2.6,
      sizeAttenuation: true,
      map: dotTexture,
      transparent: true,
      opacity: 0.55,
      alphaTest: 0.08,
      depthWrite: false,
    })
    const points = new THREE.Points(pointsGeo, pointsMaterial)
    scene.add(points)

    const MAX_SEGMENTS = 900
    const linePositions = new Float32Array(MAX_SEGMENTS * 2 * 3)
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    const lines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({ color: LINE_COLOR, transparent: true, opacity: 0.16, depthWrite: false }),
    )
    scene.add(lines)

    // Pointer parallax (listened on window — the canvas itself is pointer-events:none)
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onPointerLeave = () => {
      pointer.tx = 0
      pointer.ty = 0
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)

    const update = (dt: number) => {
      // drift + soft bounce
      for (let i = 0; i < count; i++) {
        const ix = i * 3
        positions[ix] += velocities[ix] * dt * 10
        positions[ix + 1] += velocities[ix + 1] * dt * 10
        positions[ix + 2] += velocities[ix + 2] * dt * 10
        for (const axis of [0, 1, 2] as const) {
          const limit = axis === 0 ? bounds.x / 2 : axis === 1 ? bounds.y / 2 : bounds.z / 2
          const v = positions[ix + axis]
          if (v > limit || v < -limit) velocities[ix + axis] *= -1
        }
      }
      pointsGeo.attributes.position.needsUpdate = true

      // rebuild proximity lines
      let seg = 0
      const maxDistSq = LINK_DISTANCE * LINK_DISTANCE
      for (let i = 0; i < count && seg < MAX_SEGMENTS; i++) {
        for (let j = i + 1; j < count && seg < MAX_SEGMENTS; j++) {
          const dx = positions[i * 3] - positions[j * 3]
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
          if (dx * dx + dy * dy + dz * dz < maxDistSq) {
            const o = seg * 6
            linePositions[o] = positions[i * 3]
            linePositions[o + 1] = positions[i * 3 + 1]
            linePositions[o + 2] = positions[i * 3 + 2]
            linePositions[o + 3] = positions[j * 3]
            linePositions[o + 4] = positions[j * 3 + 1]
            linePositions[o + 5] = positions[j * 3 + 2]
            seg++
          }
        }
      }
      lineGeo.setDrawRange(0, seg * 2)
      lineGeo.attributes.position.needsUpdate = true

      // eased pointer parallax
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3)
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3)
      camera.position.x = pointer.x * 8
      camera.position.y = -pointer.y * 5
      camera.lookAt(0, 0, 0)
      points.rotation.z += dt * 0.008
    }

    return {
      scene,
      camera,
      update,
      dispose() {
        window.removeEventListener('pointermove', onPointerMove)
        document.documentElement.removeEventListener('pointerleave', onPointerLeave)
        pointsGeo.dispose()
        pointsMaterial.dispose()
        dotTexture.dispose()
        lineGeo.dispose()
      },
    }
  }

  return runSceneCanvas(canvas, setup)
}
