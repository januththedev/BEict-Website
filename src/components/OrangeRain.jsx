import { useEffect, useRef } from 'react'

/**
 * Easter egg: listens for 'beict:orange-rain' (fired by clicking
 * Bhanuka Sir's photo 5 times quickly) and showers the ENTIRE site in
 * hundreds of physics-driven oranges drawn on a fixed overlay canvas.
 * Skips the particles entirely under prefers-reduced-motion.
 */
export default function OrangeRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let particles = []
    let running = false

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function drawOrange(p) {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = Math.min(1, p.life * 1.6)
      const g = ctx.createRadialGradient(-p.r * 0.3, -p.r * 0.35, p.r * 0.15, 0, 0, p.r)
      g.addColorStop(0, '#ffd97d')
      g.addColorStop(0.55, '#ff9d2e')
      g.addColorStop(1, '#e0670f')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, p.r, 0, Math.PI * 2)
      ctx.fill()
      // stem dimple + leaf
      ctx.fillStyle = '#b3540e'
      ctx.beginPath()
      ctx.arc(0, -p.r * 0.88, Math.max(1, p.r * 0.11), 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#37b24d'
      ctx.beginPath()
      ctx.ellipse(p.r * 0.3, -p.r * 0.92, p.r * 0.3, p.r * 0.12, -0.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      particles = particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 80)
      for (const p of particles) {
        p.vy += 0.34 // gravity
        p.vx *= 0.996 // drag
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life -= 0.004
        drawOrange(p)
      }
      if (particles.length > 0) {
        raf = requestAnimationFrame(tick)
      } else {
        running = false
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      }
    }

    function onOrangeRain(e) {
      if (reduce) return
      const { x, y } = e.detail || { x: window.innerWidth / 2, y: window.innerHeight / 3 }
      for (let i = 0; i < 320; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 3 + Math.random() * 15
        particles.push({
          x: x + (Math.random() - 0.5) * 60,
          y: y + (Math.random() - 0.5) * 60,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 7,
          r: 5 + Math.random() * 13,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
          life: 1 + Math.random() * 0.4,
        })
      }
      // playful whole-site shudder
      document.documentElement.classList.add('orange-shake')
      setTimeout(() => document.documentElement.classList.remove('orange-shake'), 700)
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    window.addEventListener('beict:orange-rain', onOrangeRain)
    return () => {
      window.removeEventListener('beict:orange-rain', onOrangeRain)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[90]" />
}
