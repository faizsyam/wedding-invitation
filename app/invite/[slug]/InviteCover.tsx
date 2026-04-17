'use client'
import { useState } from 'react'
import { C, F, bgWajik, SongketBand, PucukRebungDivider, WajikBadge, FloatingParticles, Diamond, Corner, SectionLabel } from './ui'
import type { Guest } from './ui'

interface Props {
    guest:   Guest
    closing: boolean
    onOpen:  () => void
    preview?: boolean
}

export default function InviteCover({ guest, closing, onOpen, preview }: Props) {
  const [hovered, setHovered] = useState(false)

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
      <div className="wajik-bg-animate" style={{ position: 'fixed', inset: 0, backgroundImage: bgWajik, zIndex: 0 }} />
      <FloatingParticles />

      <div className={closing ? 'cover-card closing' : 'cover-card'}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '390px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          border: `1px solid rgba(196,151,59,0.3)`,
          borderRadius: '8px',
          boxShadow: `
            0 2px 6px rgba(125,37,53,0.04), 0 10px 36px rgba(125,37,53,0.09),
            0 30px 72px rgba(125,37,53,0.055), 0 0 0 5px rgba(196,151,59,0.05)
          `,
          position: 'relative', overflow: 'hidden',
        }}>
          <SongketBand color={C.gold} opacity={0.14} />
          <div style={{ padding: '24px 34px 38px', textAlign: 'center', position: 'relative' }}>
            <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
              <Diamond size={3} color={C.gold} style={{ opacity: 0.4 }} />
              <div className="breathe wajik-rotate"><WajikBadge size={28} /></div>
              <Diamond size={3} color={C.gold} style={{ opacity: 0.4 }} />
            </div>

            <SectionLabel>Undangan Pernikahan</SectionLabel>

            {!preview && (
                <div style={{ margin: '22px 0 0' }}>
                <p style={{ fontFamily: F.display, fontSize: '12.5px', color: C.textLight, fontStyle: 'italic', marginBottom: '8px' }}>
                    Kepada Yth. Bapak/Ibu/Saudara/i
                </p>
                <p style={{ fontFamily: F.display, fontSize: '24px', fontWeight: 600, color: C.burgundy, lineHeight: 1.2, textShadow: '0 1px 3px rgba(125,37,53,0.10)' }}>
                    {guest.name}
                </p>
                </div>
            )}

            <PucukRebungDivider />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', marginBottom: '22px', position: 'relative' }}>
              <p style={{ fontFamily: F.display, fontSize: '46px', fontWeight: 300, letterSpacing: '1px', lineHeight: 1.0, margin: 0 }}>
                <span className="gold-shimmer-text">Vanya</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '10px 0' }}>
                <div style={{ height: '1px', width: '28px', background: `${C.gold}40` }} />
                <p style={{ fontFamily: F.display, fontSize: '18px', color: C.gold, fontStyle: 'italic', margin: 0, textShadow: `0 0 18px ${C.gold}55` }}>dan</p>
                <div style={{ height: '1px', width: '28px', background: `${C.gold}40` }} />
              </div>
              <p style={{ fontFamily: F.display, fontSize: '46px', fontWeight: 300, letterSpacing: '1px', lineHeight: 1.0, margin: 0 }}>
                <span className="gold-shimmer-text">Faiz</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <Diamond size={3} color={C.gold} style={{ opacity: 0.3 }} />
                <Diamond size={5} color={C.gold} style={{ opacity: 0.55 }} />
                <Diamond size={3} color={C.gold} style={{ opacity: 0.3 }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div style={{ height: '1px', width: '20px', background: `${C.gold}50` }} />
              <p style={{ fontFamily: F.body, fontSize: '11px', color: C.textLight, letterSpacing: '2.5px' }}>
                26 JUNI 2026 · JAKARTA
              </p>
              <div style={{ height: '1px', width: '20px', background: `${C.gold}50` }} />
            </div>
            
            {!preview && (
                <button
                onClick={onOpen}
                className="shimmer-btn"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    display: 'block', width: '100%', padding: '16px',
                    background: hovered
                    ? `linear-gradient(135deg, ${C.burgundyDeep}, ${C.burgundy})`
                    : `linear-gradient(135deg, ${C.burgundy}, ${C.burgundyDeep})`,
                    color: C.white, border: 'none', borderRadius: '4px', cursor: 'pointer',
                    fontFamily: F.body, fontSize: '11px', letterSpacing: '3.5px', textTransform: 'uppercase',
                    boxShadow: hovered ? `0 8px 28px rgba(125,37,53,0.38)` : `0 4px 18px rgba(125,37,53,0.22)`,
                    transition: 'background 0.3s ease, box-shadow 0.3s ease', marginTop: '34px',
                }}
                >
                Buka Undangan
                </button>
            )}
          </div>
          <SongketBand color={C.gold} opacity={0.14} />
        </div>
      </div>
    </div>
  )
}