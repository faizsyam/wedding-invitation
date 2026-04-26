'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,          // Lenis owns its own RAF — no duplicate loops, no jank
      duration: 1.0,
      easing: (t) => 1 - Math.pow(1 - t, 3.5),
      smoothWheel: true,
      syncTouch: false,       // native touch on mobile, preserves gallery gestures
      anchors: true,          // makes scrollIntoView() work correctly
      allowNestedScroll: true,// lets the messages scrollable div work
    })
    ;(window as any).__lenis = lenis
    return () => { lenis.destroy(); delete (window as any).__lenis }
  }, [])

  return <>{children}</>
}