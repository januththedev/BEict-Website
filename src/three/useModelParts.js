import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { applyModelTextures } from './textures.js'

export const HOVER_COLOR = new THREE.Color('#7dd3fc')

/**
 * Loads a glTF file and prepares an isolated instance:
 * - clones the scene AND its materials, so hover effects on one viewer
 *   (hero vs. journey) never bleed into another instance of the same model
 * - layers procedural PBR textures onto the flat generator colours
 * - collects every mesh plus the top-level groups (named parts)
 */
export function useModelParts(file) {
  const { scene } = useGLTF(file)

  return useMemo(() => {
    const clone = scene.clone(true)
    // Textures must be applied BEFORE the hover baseline is captured so
    // baseEmissive includes the glowing die/planet maps.
    applyModelTextures(clone)
    const meshes = []
    clone.traverse((obj) => {
      if (obj.isMesh) {
        obj.material = obj.material.clone()
        obj.userData.baseEmissive = obj.material.emissive.clone()
        obj.userData.baseIntensity = obj.material.emissiveIntensity ?? 1
        obj.userData.hoverT = 0 // animated 0..1 by the render loop
        meshes.push(obj)
      }
    })
    const parts = [...clone.children] // named top-level groups from the generator
    return { root: clone, meshes, parts }
  }, [scene])
}

/**
 * Per-frame highlight easing: every mesh's userData.hoverT is nudged toward
 * `hovered === mesh`, and the material emissive follows it.
 */
export function useHighlightFrame(meshes, hoveredRef) {
  const tmpColor = useRef(new THREE.Color())
  useFrame(() => {
    for (const mesh of meshes) {
      const target = hoveredRef.current === mesh ? 1 : 0
      const t = (mesh.userData.hoverT += (target - mesh.userData.hoverT) * 0.18)
      if (target === 0 && mesh.userData.hoverPrev === 0) continue
      mesh.userData.hoverPrev = t
      const mat = mesh.material
      if (t > 0.001) {
        mat.emissive.copy(tmpColor.current.copy(mesh.userData.baseEmissive).lerp(HOVER_COLOR, t))
        mat.emissiveIntensity = mesh.userData.baseIntensity + t * 0.9
      } else {
        mat.emissive.copy(mesh.userData.baseEmissive)
        mat.emissiveIntensity = mesh.userData.baseIntensity
      }
    }
  })
}

/** Attach standard pointer handlers that drive the hover state. */
export function hoverHandlers(setHovered, enabled = true) {
  if (!enabled) return {}
  return {
    onPointerOver: (e) => {
      e.stopPropagation()
      setHovered(e.object)
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      setHovered(null)
      document.body.style.cursor = 'auto'
    },
  }
}
