import { Component } from 'react'
import { Canvas } from '@react-three/fiber'

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
    console.warn('3D scene unavailable:', error?.message)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function SafeCanvas({ fallback, camera, className = '', children }) {
  return (
    <GLBoundary fallback={fallback}>
      <div className={`size-full ${className}`}>
        <Canvas
          dpr={[1, 2]}
          camera={camera}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          {children}
        </Canvas>
      </div>
    </GLBoundary>
  )
}
