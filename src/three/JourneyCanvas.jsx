import SafeCanvas from './SafeCanvas.jsx'
import JourneyScene from './JourneyScene.jsx'

/**
 * Lazy-loaded entry for the Z-scroll stage. The lazy boundary must wrap the
 * whole Canvas (R3F renders canvas children in a second reconciler root,
 * where an outer Suspense cannot catch a lazy suspension).
 */
export default function JourneyCanvas({ progressRef, reduce }) {
  return (
    <SafeCanvas
      fallback={
        <div className="grid size-full place-items-center bg-gradient-to-b from-navy-900 to-navy-950 px-6 text-center">
          <p className="max-w-sm text-sm text-brand-100/70">
            Your browser can’t display the 3D journey — the rest of the site works
            fine without it.
          </p>
        </div>
      }
      camera={{ position: [0, 0.6, 14], fov: 42, near: 0.1, far: 160 }}
    >
      <JourneyScene progressRef={progressRef} reduce={reduce} />
    </SafeCanvas>
  )
}
