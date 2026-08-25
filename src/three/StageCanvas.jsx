import { Component } from 'react'
import { Canvas } from '@react-three/fiber'
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
 * The persistent full-page 3D stage — fixed behind all content. The lazy
 * boundary for this chunk lives in App (it must wrap the whole Canvas,
 * since R3F renders canvas children in a second reconciler root).
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
          dpr={[1, 2]}
          camera={{ position: [0, 1.1, 12], fov: 42, near: 0.1, far: 220 }}
          gl={{ antialias: true, alpha: false }}
        >
          <WorldScene progressRef={progressRef} reduce={reduce} />
        </Canvas>
      </GLBoundary>
    </div>
  )
}
