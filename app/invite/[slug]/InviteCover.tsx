'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { C, F, bgWajik, PucukRebungDivider, WajikBadge, FloatingParticles, Diamond, Corner, SectionLabel } from './ui'
import type { Guest } from './ui'

interface Props {
  guest:    Guest
  onOpen:   () => void
  preview?: boolean
}

export default function InviteCover({ guest, onOpen, preview }: Props) {
  const [hovered, setHovered] = useState(false)

  // ── Refs ──────────────────────────────────────────────────────────────────
  const cardRef        = useRef<HTMLDivElement>(null)
  const badgeRef       = useRef<HTMLDivElement>(null)
  const labelRef       = useRef<HTMLDivElement>(null)
  const guestBlockRef  = useRef<HTMLDivElement>(null)
  const dividerRef     = useRef<HTMLDivElement>(null)
  const vanyaRef       = useRef<HTMLParagraphElement>(null)
  const danRowRef      = useRef<HTMLDivElement>(null)
  const faizRef        = useRef<HTMLParagraphElement>(null)
  const diamondRowRef  = useRef<HTMLDivElement>(null)
  const dateLineRef    = useRef<HTMLDivElement>(null)
  const btnRef         = useRef<HTMLButtonElement>(null)
  const bgRef          = useRef<HTMLDivElement>(null)

  // ── Entrance timeline ─────────────────────────────────────────────────────
  useEffect(() => {
    // if (preview) return

    const ctx = gsap.context(() => {
      // Card drops in from slight above, fades in with a scale bloom
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 36, scale: 0.96, filter: 'blur(6px)' },
        { opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)',
          duration: 1.0, ease: 'power3.out', clearProps: 'filter' }
      )

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.35,
      })

      // Ornament badge spins in
      tl.fromTo(badgeRef.current,
        { opacity: 0, scale: 0.4, rotation: -90 },
        { opacity: 1, scale: 1,   rotation: 0, duration: 0.6 },
        0
      )

      // Section label slides up
      tl.fromTo(labelRef.current,
        { opacity: 0, y: 14, letterSpacing: '8px' },
        { opacity: 1, y: 0,  letterSpacing: '4px', duration: 0.7 },
        0.15
      )

      // Guest name block fades in (only when not preview)
      if (guestBlockRef.current) {
        tl.fromTo(guestBlockRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6 },
          0.35
        )
      }

      // Pucuk rebung divider expands from center
      tl.fromTo(dividerRef.current,
        { opacity: 0, scaleX: 0.1 },
        { opacity: 1, scaleX: 1, duration: 0.8, transformOrigin: 'center' },
        0.5
      )

      // Names cascade in — Vanya first, letters spreading from blur
      tl.fromTo(vanyaRef.current,
        { opacity: 0, y: 28, filter: 'blur(10px)', letterSpacing: '14px' },
        { opacity: 1, y: 0,  filter: 'blur(0px)',  letterSpacing: '1px',
          duration: 1.2, clearProps: 'filter' },
        0.55
      )

      // "dan" row sweeps in from center
      tl.fromTo(danRowRef.current,
        { opacity: 0, scaleX: 0.4, filter: 'blur(3px)' },
        { opacity: 1, scaleX: 1,   filter: 'blur(0px)',
          duration: 0.65, transformOrigin: 'center', clearProps: 'filter' },
        0.88
      )

      // Faiz — slight delay after Vanya
      tl.fromTo(faizRef.current,
        { opacity: 0, y: 28, filter: 'blur(10px)', letterSpacing: '14px' },
        { opacity: 1, y: 0,  filter: 'blur(0px)',  letterSpacing: '1px',
          duration: 1.2, clearProps: 'filter' },
        0.78
      )

      // Diamond row materialises
      tl.fromTo(diamondRowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.4 },
        1.18
      )

      // Date line fades up
      tl.fromTo(dateLineRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6 },
        1.28
      )

      // CTA button rises last — slight bounce
      if (btnRef.current) {
        tl.fromTo(btnRef.current,
          { opacity: 0, y: 18, scale: 0.94 },
          { opacity: 1, y: 0,  scale: 1,
            duration: 0.7, ease: 'back.out(1.6)' },
          1.52
        )
      }

      // Subtle idle: card breathes very gently once fully in
      gsap.to(cardRef.current, {
        y: '-=4',
        duration: 3.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 2.2,
      })

    })

    return () => ctx.revert()
  }, [preview])

  // ── Exit animation (drives the "Buka Undangan" flow) ─────────────────────
  function handleOpen() {
    if (!cardRef.current) { onOpen(); return }
  
    gsap.killTweensOf(cardRef.current, 'y')
  
    if (bgRef.current) {
      gsap.to(bgRef.current, { opacity: 0, duration: 0.55, ease: 'power2.in' })
    }
  
    const tl = gsap.timeline({ onComplete: onOpen })
  
    tl.to(cardRef.current, {
      y: -32,
      opacity: 0,
      scale: 0.96,
      filter: 'blur(5px)',
      rotationX: -8,
      transformPerspective: 900,
      duration: 0.58,
      ease: 'power2.in',
    }, 0)
  
    tl.to(diamondRowRef.current, {
      opacity: 0,
      scale: 0.6,
      duration: 0.5,
      ease: 'power2.in',
    }, 0.2)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: C.cream,
      backgroundImage: `
        radial-gradient(ellipse at 15% 12%, rgba(125,37,53,0.10) 0%, transparent 52%),
        radial-gradient(ellipse at 85% 82%, rgba(30,58,95,0.08)  0%, transparent 48%),
        radial-gradient(ellipse at 50% 50%, rgba(196,151,59,0.04) 0%, transparent 66%)
      `,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated wajik background */}
      <div
        ref={bgRef}
        className="wajik-bg-animate"
        style={{ position: 'fixed', inset: 0, backgroundImage: bgWajik, zIndex: 0 }}
      />
      <FloatingParticles />

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div
        ref={cardRef}
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: '390px',
          // GSAP starts it invisible — no initial opacity here so there's no flash
          opacity: 0,
          willChange: 'transform, opacity',
        }}
      >
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          border: `1px solid rgba(196,151,59,0.3)`,
          borderRadius: '8px',
          boxShadow: `
            0 2px 6px  rgba(125,37,53,0.04),
            0 10px 36px rgba(125,37,53,0.09),
            0 30px 72px rgba(125,37,53,0.055),
            0 0 0 5px  rgba(196,151,59,0.05)
          `,
          position: 'relative', overflow: 'hidden',
        }}>

          {/* ── Corner flowers ───────────────────────────────────────────── */}
          {([
            { src: '/flower-c1.png', opacity: '66%', top: -50,    left: -60,    transform: 'rotate(10deg)',   scale: 2.6 },
            { src: '/flower-c2.png', opacity: '66%', top: -35,    right: -90,   transform: 'rotate(-10deg)' ,   scale: 2.5 },
            { src: '/flower-c3.png', opacity: '66%', bottom: -25, left: -80,    transform: 'rotate(0deg)',   scale: 2.7 },
            { src: '/flower-c4.png', opacity: '66%', bottom: -35, right: -70,   transform: 'rotate(-5deg)',   scale: 2.7 },
          ] as const).map(({ src, transform, scale, ...pos }) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: `${100 * scale}px`,
                height: `${100 * scale}px`,
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 0,
                transform,
                ...pos,
              }}
            />
          ))}

          <div style={{ padding: '24px 34px 38px', textAlign: 'center', position: 'relative' }}>
            <Corner pos="tl" /><Corner pos="tr" />
            <Corner pos="bl" /><Corner pos="br" />

            {/* Badge row */}
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: '10px', marginBottom: '22px',
            }}>
              <Diamond size={3} color={C.gold} style={{ opacity: 0.4 }} />
              <div ref={badgeRef} className="breathe wajik-rotate">
                <WajikBadge size={28} />
              </div>
              <Diamond size={3} color={C.gold} style={{ opacity: 0.4 }} />
            </div>

            {/* Section label */}
            <div ref={labelRef}>
              <SectionLabel>Undangan Pernikahan</SectionLabel>
            </div>

            {/* Guest name — only in live mode */}
            {!preview && (
              <div ref={guestBlockRef} style={{ margin: '22px 0 0' }}>
                <p style={{
                  fontFamily: F.display, fontSize: '12.5px',
                  color: C.textLight, fontStyle: 'italic', marginBottom: '8px',
                }}>
                  Kepada Yth. Bapak/Ibu/Saudara/i
                </p>
                <p style={{
                  fontFamily: F.display, fontSize: '24px', fontWeight: 600,
                  color: C.burgundy, lineHeight: 1.2,
                  textShadow: '0 1px 3px rgba(125,37,53,0.10)',
                }}>
                  {guest.name}
                </p>
              </div>
            )}

            {/* Divider */}
            <div ref={dividerRef}>
              <PucukRebungDivider />
            </div>

            {/* Names block */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '0px',
              marginBottom: '22px', position: 'relative',
            }}>
              <p
                ref={vanyaRef}
                style={{
                  fontFamily: F.display, fontSize: '46px', fontWeight: 300,
                  letterSpacing: '1px', lineHeight: 1.0, margin: 0,
                }}
              >
                <span className="gold-shimmer-text">Vanya</span>
              </p>

              <div
                ref={danRowRef}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: '12px', margin: '10px 0',
                }}
              >
                <div style={{ height: '1px', width: '28px', background: `${C.gold}40` }} />
                <p style={{
                  fontFamily: F.display, fontSize: '18px', color: C.gold,
                  fontStyle: 'italic', margin: 0,
                  textShadow: `0 0 18px ${C.gold}55`,
                }}>
                  dan
                </p>
                <div style={{ height: '1px', width: '28px', background: `${C.gold}40` }} />
              </div>

              <p
                ref={faizRef}
                style={{
                  fontFamily: F.display, fontSize: '46px', fontWeight: 300,
                  letterSpacing: '1px', lineHeight: 1.0, margin: 0,
                }}
              >
                <span className="gold-shimmer-text">Faiz</span>
              </p>

              <div
                ref={diamondRowRef}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}
              >
                <Diamond size={3} color={C.gold} style={{ opacity: 0.3 }} />
                <Diamond size={5} color={C.gold} style={{ opacity: 0.55 }} />
                <Diamond size={3} color={C.gold} style={{ opacity: 0.3 }} />
              </div>
            </div>

            {/* Date line */}
            <div
              ref={dateLineRef}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <div style={{ height: '1px', width: '20px', background: `${C.gold}50` }} />
              <p style={{
                fontFamily: F.body, fontSize: '11px',
                color: C.textLight, letterSpacing: '2.5px',
              }}>
                26 JUNI 2026 · JAKARTA
              </p>
              <div style={{ height: '1px', width: '20px', background: `${C.gold}50` }} />
            </div>

            {/* CTA button */}
            {!preview && (
              <button
                ref={btnRef}
                onClick={handleOpen}
                className="shimmer-btn cover-open-pulse"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                  display: 'block', width: '100%', padding: '16px',
                  background: hovered
                    ? `linear-gradient(135deg, ${C.burgundyDeep}, ${C.burgundy})`
                    : `linear-gradient(135deg, ${C.burgundy},     ${C.burgundyDeep})`,
                  color: C.white, border: 'none', borderRadius: '4px', cursor: 'pointer',
                  fontFamily: F.body, fontSize: '11px',
                  letterSpacing: '3.5px', textTransform: 'uppercase',
                  boxShadow: hovered
                    ? `0 8px 28px rgba(125,37,53,0.38)`
                    : `0 4px 18px rgba(125,37,53,0.22)`,
                  transition: 'background 0.3s ease, box-shadow 0.3s ease',
                  marginTop: '34px',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                Buka Undangan
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}