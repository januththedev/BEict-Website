/**
 * The "BEICT Core": an interactive 3D showcase for the dark panel section.
 *
 * A wireframe icosahedron core with topic nodes orbiting on tilted rings.
 * - drag to spin (with inertia), auto-rotates when idle
 * - hovering a node scales it up and reports its screen position so React can
 *   draw an HTML label
 * - clicking a node reports the topic so React can open its link
 * - touch: horizontal drag spins; vertical swipes still scroll the page
 *   (canvas uses touch-action: pan-y)
 */
import { runSceneCanvas, glowTexture, type SceneSetup } from './runSceneCanvas'
import type { CoreTopic } from '../data/content'

export interface CoreCallbacks {
  topics: CoreTopic[]
  onHover: (topic: CoreTopic | null, x: number, y: number) => void
  onSelect: (topic: CoreTopic) => void
}

export async function mountCoreScene(
  canvas: HTMLCanvasElement,
  callbacks: CoreCallbacks,
): Promise<() => void> {
  const setup: SceneSetup = (THREE, canvasEl) => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120)
    camera.position.set(0, 0.6, 12)
    camera.lookAt(0, 0, 0)

    const group = new THREE.Group()
    scene.add(group)

    const disposables: { dispose(): void }[] = []

    // Core: outer wireframe shell + inner shell + soft glow
    const outerGeo = new THREE.IcosahedronGeometry(2.1, 1)
    const outerMat = new THREE.MeshBasicMaterial({
      color: '#608ffa',
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    })
    const outer = new THREE.Mesh(outerGeo, outerMat)
    group.add(outer)
    disposables.push(outerGeo, outerMat)

    const innerGeo = new THREE.IcosahedronGeometry(1.1, 0)
    const innerMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const inner = new THREE.Mesh(innerGeo, innerMat)
    group.add(inner)
    disposables.push(innerGeo, innerMat)

    const coreGlowTex = glowTexture(THREE, 'rgba(59,110,242,0.85)')
    const coreGlowMat = new THREE.SpriteMaterial({
      map: coreGlowTex,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const coreGlow = new THREE.Sprite(coreGlowMat)
    coreGlow.scale.setScalar(6.5)
    group.add(coreGlow)
    disposables.push(coreGlowTex, coreGlowMat)

    // Distant starfield for depth
    const starCount = 260
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const r = 16 + Math.random() * 12
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      starPositions[i * 3 + 2] = r * Math.cos(phi)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMat = new THREE.PointsMaterial({
      color: '#93b4fd',
      size: 0.14,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)
    disposables.push(starGeo, starMat)

    // Orbiting topic nodes
    const nodeColors = ['#38bdf8', '#608ffa', '#7dd3fc', '#1e4fd8', '#93b4fd', '#38bdf8']
    const orbitRadius = 4.4
    interface OrbitNode {
      pivot: import('three').Group
      sprite: import('three').Sprite
      material: import('three').SpriteMaterial
      texture: import('three').Texture
      angle0: number
      speed: number
      topic: CoreTopic
      baseScale: number
    }
    const nodes: OrbitNode[] = callbacks.topics.map((topic, i) => {
      const pivot = new THREE.Group()
      pivot.rotation.set(Math.random() * 0.9 - 0.45, 0, Math.random() * 0.9 - 0.45)
      group.add(pivot)

      const color = nodeColors[i % nodeColors.length]
      const texture = glowTexture(THREE, color)
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
      const sprite = new THREE.Sprite(material)
      const baseScale = 0.85
      sprite.scale.setScalar(baseScale)
      pivot.add(sprite)
      disposables.push(texture, material)

      return {
        pivot,
        sprite,
        material,
        texture,
        angle0: (i / callbacks.topics.length) * Math.PI * 2,
        speed: 0.16 + (i % 3) * 0.05,
        topic,
        baseScale,
      }
    })

    // Interaction state
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2(-2, -2)
    const pointerPx = { x: 0, y: 0 }
    let hovered: OrbitNode | null = null
    let dragging = false
    let dragMoved = 0
    let lastX = 0
    let lastY = 0
    let velX = 0
    let velY = 0

    const rect = () => canvasEl.getBoundingClientRect()

    const toNdc = (clientX: number, clientY: number) => {
      const r = rect()
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
      pointerPx.x = clientX - r.left
      pointerPx.y = clientY - r.top
    }

    const onPointerDown = (e: PointerEvent) => {
      dragging = true
      dragMoved = 0
      lastX = e.clientX
      lastY = e.clientY
      canvasEl.style.cursor = 'grabbing'
      canvasEl.setPointerCapture?.(e.pointerId)
    }

    const onPointerMove = (e: PointerEvent) => {
      toNdc(e.clientX, e.clientY)
      if (dragging) {
        const dx = e.clientX - lastX
        const dy = e.clientY - lastY
        dragMoved += Math.abs(dx) + Math.abs(dy)
        velX = dx * 0.005
        velY = dy * 0.003
        group.rotation.y += velX
        group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + velY, -0.7, 0.7)
        lastX = e.clientX
        lastY = e.clientY
      }
    }

    const onPointerUp = () => {
      if (dragging && dragMoved < 6 && hovered) callbacks.onSelect(hovered.topic)
      dragging = false
      canvasEl.style.cursor = hovered ? 'pointer' : 'grab'
    }

    const onPointerLeave = () => {
      ndc.set(-2, -2)
      if (hovered) {
        hovered = null
        callbacks.onHover(null, 0, 0)
      }
    }

    canvasEl.addEventListener('pointerdown', onPointerDown)
    canvasEl.addEventListener('pointermove', onPointerMove)
    canvasEl.addEventListener('pointerup', onPointerUp)
    canvasEl.addEventListener('pointerleave', onPointerLeave)
    canvasEl.style.cursor = 'grab'
    canvasEl.style.touchAction = 'pan-y'

    const update = (dt: number, elapsed: number) => {
      // inertia + idle auto-rotation
      if (!dragging) {
        group.rotation.y += velX
        group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + velY, -0.7, 0.7)
        velX *= 0.94
        velY *= 0.9
        group.rotation.y += dt * 0.12
      }
      inner.rotation.y -= dt * 0.3
      inner.rotation.x += dt * 0.18
      stars.rotation.y += dt * 0.008

      // orbit the nodes
      for (const node of nodes) {
        const a = node.angle0 + elapsed * node.speed
        node.sprite.position.set(
          Math.cos(a) * orbitRadius,
          0,
          Math.sin(a) * orbitRadius,
        )
      }

      // hover detection (world-space sprite positions → group transform applies)
      group.updateMatrixWorld()
      raycaster.setFromCamera(ndc, camera)
      const hits = ndc.x < -1.5 ? [] : raycaster.intersectObjects(nodes.map((n) => n.sprite), false)
      const hitObject = hits[0]?.object ?? null
      const next = nodes.find((n) => n.sprite === hitObject) ?? null

      if (next !== hovered) {
        hovered = next
        canvasEl.style.cursor = dragging ? 'grabbing' : next ? 'pointer' : 'grab'
      }
      for (const node of nodes) {
        const target = node === hovered ? node.baseScale * 1.5 : node.baseScale
        const s = node.sprite.scale.x + (target - node.sprite.scale.x) * Math.min(1, dt * 10)
        node.sprite.scale.setScalar(s)
      }

      if (hovered) {
        const pos = hovered.sprite.getWorldPosition(new THREE.Vector3())
        pos.project(camera)
        const r = rect()
        callbacks.onHover(
          hovered.topic,
          ((pos.x + 1) / 2) * r.width,
          ((1 - pos.y) / 2) * r.height,
        )
      }
    }

    return {
      scene,
      camera,
      update,
      dispose() {
        canvasEl.removeEventListener('pointerdown', onPointerDown)
        canvasEl.removeEventListener('pointermove', onPointerMove)
        canvasEl.removeEventListener('pointerup', onPointerUp)
        canvasEl.removeEventListener('pointerleave', onPointerLeave)
        for (const d of disposables) d.dispose()
      },
    }
  }

  return runSceneCanvas(canvas, setup)
}
