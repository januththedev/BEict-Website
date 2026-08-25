import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import * as THREE from 'three'

/**
 * Procedural environment map (no network assets) so metallic PBR
 * materials — the gold pins, silver capacitors, chrome rings — get
 * reflections and don't render black under direct lights alone.
 */
export default function StudioEnvironment({ intensity = 0.9 }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = env.texture
    scene.environmentIntensity = intensity
    pmrem.dispose()
  }, [gl, scene, intensity])

  return null
}
