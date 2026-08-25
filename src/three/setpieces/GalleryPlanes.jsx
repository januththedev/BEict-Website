import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GALLERY_CAPTIONS } from '../../data/content.js'

/**
 * Chapter 7 setpiece: the eight class photos as framed planes floating in a
 * gentle spiral — the camera flies straight through them.
 */
export default function GalleryPlanes({ progressRef, reduce }) {
  const group = useRef(null)
  const textures = useLoader(
    THREE.TextureLoader,
    GALLERY_CAPTIONS.map((_, i) => `/images/gallery/${i + 1}.jpg`),
  )

  const layout = useMemo(
    () =>
      GALLERY_CAPTIONS.map((_, i) => ({
        x: Math.sin(i * 1.05) * 2.6,
        y: Math.cos(i * 1.4) * 1.1,
        z: -148 - i * 2.3,
        rot: Math.sin(i * 0.9) * 0.22,
      })),
    [],
  )

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    group.current.children.forEach((child, i) => {
      if (!reduce) {
        child.position.y = layout[i].y + Math.sin(t * 0.8 + i) * 0.08
        child.rotation.z = Math.sin(t * 0.5 + i * 2) * 0.02
      }
    })
  })

  return (
    <group ref={group}>
      {layout.map((pos, i) => (
        <group key={i} position={[pos.x, pos.y, pos.z]} rotation={[0, pos.rot, 0]}>
          <mesh>
            <boxGeometry args={[2.55, 1.95, 0.07]} />
            <meshStandardMaterial color="#0c1b3a" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[2.4, 1.8]} />
            <meshBasicMaterial map={textures[i]} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
