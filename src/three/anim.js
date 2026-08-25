import * as THREE from 'three'

/** Clamp p into the 0..1 sub-range [a, b]. */
export const sub = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)))

/** Smoothstep easing of a 0..1 value. */
export const smooth = (v) => {
  const t = Math.min(1, Math.max(0, v))
  return t * t * (3 - 2 * t)
}

/** Piecewise-linear interpolation over [progress, value] keyframes. */
export function lerpKeys(keys, p) {
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i][0]) {
      const [p0, v0] = keys[i - 1]
      const [p1, v1] = keys[i]
      return THREE.MathUtils.lerp(v0, v1, (p - p0) / (p1 - p0))
    }
  }
  return keys[keys.length - 1][1]
}

/** Interpolate a list of [progress, THREE.Color] keyframes into `out`. */
export function colorKeys(keys, p, out) {
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i][0]) {
      const [p0, c0] = keys[i - 1]
      const [p1, c1] = keys[i]
      return out.copy(c0).lerp(c1, (p - p0) / (p1 - p0))
    }
  }
  return out.copy(keys[keys.length - 1][1])
}
