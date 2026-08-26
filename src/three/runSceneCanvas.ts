/**
 * Shared scaffolding for every WebGL canvas on the site.
 *
 * - dynamically imports three (keeps it out of the initial bundle)
 * - caps devicePixelRatio at 1.75
 * - pauses the rAF loop when the canvas is off-screen or the tab is hidden
 * - resizes with the element (ResizeObserver)
 * - returns a dispose() that cancels the loop, runs scene cleanup and frees
 *   the WebGL context
 */

type ThreeModule = typeof import('three')

type SceneInstance = InstanceType<ThreeModule['Scene']>
type CameraInstance = InstanceType<ThreeModule['PerspectiveCamera']>
type CanvasTextureInstance = InstanceType<ThreeModule['CanvasTexture']>

export interface SceneBundle {
  scene: SceneInstance
  camera: CameraInstance
  update?(dt: number, elapsed: number): void
  resize?(w: number, h: number): void
  dispose?(): void
}

export type SceneSetup = (THREE: ThreeModule, canvas: HTMLCanvasElement) => SceneBundle

const MAX_DPR = 1.75

export async function runSceneCanvas(
  canvas: HTMLCanvasElement,
  setup: SceneSetup,
): Promise<() => void> {
  const THREE = await import('three')
  const bundle = setup(THREE, canvas)

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR))

  const size = () => {
    const w = canvas.clientWidth || 1
    const h = canvas.clientHeight || 1
    renderer.setSize(w, h, false)
    bundle.camera.aspect = w / h
    bundle.camera.updateProjectionMatrix()
    bundle.resize?.(w, h)
  }
  size()

  const resizeObserver = new ResizeObserver(size)
  resizeObserver.observe(canvas)

  let visible = true
  let tabVisible = !document.hidden
  let raf = 0
  let last = performance.now()
  const start = last

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    bundle.update?.(dt, (now - start) / 1000)
    renderer.render(bundle.scene, bundle.camera)
  }

  const sync = () => {
    const shouldRun = visible && tabVisible
    if (shouldRun && !raf) {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    } else if (!shouldRun && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    sync()
  })
  intersectionObserver.observe(canvas)

  const onVisibility = () => {
    tabVisible = !document.hidden
    sync()
  }
  document.addEventListener('visibilitychange', onVisibility)

  sync()

  return () => {
    cancelAnimationFrame(raf)
    raf = 0
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
    bundle.dispose?.()
    renderer.dispose()
    canvas.width = 1
    canvas.height = 1
  }
}

/** Radial-glow sprite texture generated on a 2D canvas (no image assets). */
export function glowTexture(THREE: ThreeModule, color: string): CanvasTextureInstance {
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
