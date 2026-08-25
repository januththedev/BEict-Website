import { Component } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import WorldScene from './WorldScene.jsx'

/**
 * Canvas wrapped in an error boundary so browsers without WebGL get a
 * graceful static fallback instead of a crashed tree.
 */
class GLBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.warn('3D stage unavailable:', error?.message)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * The persistent full-page 3D stage — fixed behind all content, with a
 * cinematic post stack: mipmapped bloom makes every emissive surface
 * genuinely glow, and the vignette focuses the flight.
 */
export default function StageCanvas({ progressRef, reduce }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <GLBoundary
        fallback={
          <div className="size-full bg-gradient-to-b from-white via-brand-50 to-brand-100 opacity-30" />
        }
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.1, 12], fov: 42, near: 0.1, far: 220 }}
          gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        >
          <WorldScene progressRef={progressRef} reduce={reduce} />
          {/* composer disabled for bisect */}
        </Canvas>
      </GLBoundary>
    </div>
  )
}
