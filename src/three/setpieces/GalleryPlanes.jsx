import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GALLERY_CAPTIONS } from '../../data/content.js'

/**
 * Chapter 7 setpiece: the eight class photos as 2:3 vertical framed planes
 * floating in a gentle spiral — the camera flies straight through them.
 * Textures load lazily once the visitor is past the halfway mark (they are
 * not part of the initial page weight); navy frames show until then.
 */
export default function GalleryPlanes({ progressRef, reduce }) {
  const group = useRef(null)
  const [textures, setTextures] = useState(null)
  const started = useRef(false)

  const layout = useMemo(
    () =>
      GALLERY_CAPTIONS.map((_, i) => ({
        x: Math.sin(i * 1.05) * 3.2,
        y: Math.cos(i * 1.4) * 1.1,
        z: -147 - i * 1.2,
        rot: Math.sin(i * 0.9) * 0.22,
      })),
    [],
  )

  useFrame(({ clock, camera }) => {
    window.__gal = { kids: group.current?.children.length, started: started.current, texs: textures?.length || 0, camZ: Math.round(camera.position.z) }
    if (!group.current) return

    // Defer the ~700 KB of photo textures until the gallery is approaching.
    if (!started.current && progressRef.current > 0.55) {
      started.current = true
      const loader = new THREE.TextureLoader()
      Promise.all(
        GALLERY_CAPTIONS.map((_, i) => loader.loadAsync(`/images/gallery/${i + 1}.jpg`)),
      )
        .then((loadedTexs) =>
          loadedTexs.map((tex) => {
            // loadAsync resolves with a Texture — draw its underlying image
            // with a brightness lift baked in (the classroom shots are dim)
            const img = tex.image
            const c = document.createElement('canvas')
            c.width = img.naturalWidth
            c.height = img.naturalHeight
            const ctx = c.getContext('2d')
            ctx.filter = 'brightness(1.55) contrast(1.06) saturate(1.12)'
            ctx.drawImage(img, 0, 0)
            const t = new THREE.CanvasTexture(c)
            t.colorSpace = THREE.SRGBColorSpace
            // cover-crop: fill the 2:3 portrait frame from any source aspect
            const target = 2 / 3
            const src = c.width / c.height
            t.center.set(0.5, 0.5)
            if (src > target) {
              t.repeat.set(target / src, 1)
            } else {
              t.repeat.set(1, src / target)
            }
            t.offset.set((1 - t.repeat.x) / 2, (1 - t.repeat.y) / 2)
            t.needsUpdate = true
            return t
          }),
        )
        .then((texs) => {
          window.__texs = texs
          setTextures(texs)
        })
        .catch((e) => { window.__galErr = String(e && e.message || e) })
    }

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
          <mesh position={[0, 0, -0.035]}>
            <boxGeometry args={[1.86, 2.72, 0.06]} />
            <meshStandardMaterial color="#f8faff" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, -0.004]}>
            <boxGeometry args={[1.76, 2.62, 0.005]} />
            <meshStandardMaterial color="#1d43cf" metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[1.7, 2.55]} />
            {textures ? (
              <meshBasicMaterial map={textures[i]} toneMapped={false} side={THREE.DoubleSide} />
            ) : (
              <meshBasicMaterial color="#12295c" />
            )}
          </mesh>
        </group>
      ))}
    </group>
  )
}
