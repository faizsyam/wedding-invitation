'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
type Guest   = { id: number; name: string; slug: string; created_at: string }
type Message = { id?: number; guest_name: string; message: string; created_at?: string }
type Countdown = { d: number; h: number; m: number; s: number }
// ─── Design Tokens ─────────────────────────────────────────────────────────
const C = {
  cream:        '#FAF7F0',
  ivory:        '#F4EEE2',
  white:        '#FFFFFF',
  burgundy:     '#7D2535',
  burgundyDeep: '#561929',
  navy:         '#1E3A5F',
  navyDeep:     '#142840',
  gold:         '#C4973B',
  goldBright:   '#D4AC52',
  goldPale:     '#EDD89A',
  rose:         '#F2E8E4',
  textDark:     '#2C1810',
  textMid:      '#6B4840',
  textLight:    '#9B7B73',
  textGhost:    '#C0A89E',
}
const F = {
  display: "'Cormorant Garamond', serif",
  body:    "'Nunito', sans-serif",
  arabic:  "'Scheherazade New', serif",
}
// ─── Background Patterns ────────────────────────────────────────────────────
const bgWajik = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Crect x='18' y='1' width='8' height='8' transform='rotate(45 22 5)' fill='%23C4973B' opacity='0.11'/%3E%3Crect x='18' y='35' width='8' height='8' transform='rotate(45 22 39)' fill='%23C4973B' opacity='0.11'/%3E%3Crect x='1' y='18' width='8' height='8' transform='rotate(45 5 22)' fill='%23C4973B' opacity='0.06'/%3E%3Crect x='35' y='18' width='8' height='8' transform='rotate(45 39 22)' fill='%23C4973B' opacity='0.06'/%3E%3C/svg%3E")`
// ─── Riau Melayu Motif SVG Components ──────────────────────────────────────
function SongketBand({
  color   = C.gold,
  opacity = 0.12,
}: { color?: string; opacity?: number }) {
  return (
    <div style={{ width: '100%', height: '20px', overflow: 'hidden', flexShrink: 0 }}>
      <svg
        viewBox="0 0 400 20"
        width="100%"
        height="20"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block' }}
      >
        {Array.from({ length: 28 }, (_, i) => (
          <polygon
            key={`o${i}`}
            points={`${i * 16 - 8},10 ${i * 16},2 ${i * 16 + 8},10 ${i * 16},18`}
            fill="none" stroke={color} strokeWidth="0.7"
            opacity={opacity * 4}
          />
        ))}
        {Array.from({ length: 28 }, (_, i) => (
          <polygon
            key={`f${i}`}
            points={`${i * 16 - 5},10 ${i * 16},5 ${i * 16 + 5},10 ${i * 16},15`}
            fill={color} opacity={opacity}
          />
        ))}
        <line x1="0" y1="0.5"  x2="400" y2="0.5"  stroke={color} strokeWidth="0.5" opacity={opacity * 2.5} />
        <line x1="0" y1="19.5" x2="400" y2="19.5" stroke={color} strokeWidth="0.5" opacity={opacity * 2.5} />
      </svg>
    </div>
  )
}
function PucukRebungDivider({ color = C.gold }: { color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '28px auto', maxWidth: '300px' }}>
      <div style={{ flex: 1, height: '0.5px', background: `linear-gradient(to right, transparent, ${color}55)` }} />
      <svg viewBox="0 0 96 18" width="96" height="18" fill="none">
        <polygon points="0,9 8,3 16,9 8,15"  fill={color} opacity="0.28" />
        <polygon points="3,9 8,5 13,9 8,13"  fill={color} opacity="0.55" />
        <circle cx="22" cy="9" r="1.5" fill={color} opacity="0.4" />
        <circle cx="28" cy="9" r="1"   fill={color} opacity="0.22" />
        <polygon points="33,9 38,4  43,9  38,14" fill={color} opacity="0.7" />
        <polygon points="36,9 38,6.5 40,9 38,11.5" fill={color} opacity="1" />
        <polygon points="45,9 50,4  55,9  50,14" fill={color} opacity="0.7" />
        <polygon points="48,9 50,6.5 52,9 50,11.5" fill={color} opacity="1" />
        <circle cx="68" cy="9" r="1"   fill={color} opacity="0.22" />
        <circle cx="74" cy="9" r="1.5" fill={color} opacity="0.4" />
        <polygon points="80,9 88,3 96,9 88,15" fill={color} opacity="0.28" />
        <polygon points="83,9 88,5 93,9 88,13" fill={color} opacity="0.55" />
      </svg>
      <div style={{ flex: 1, height: '0.5px', background: `linear-gradient(to left, transparent, ${color}55)` }} />
    </div>
  )
}
function WajikBadge({ color = C.gold, size = 30 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 30 30" width={size} height={size} fill="none">
      <polygon points="15,1  28,15 15,29 2,15"  stroke={color} strokeWidth="1.2" fill="none" opacity="0.35" />
      <polygon points="15,5  25,15 15,25 5,15"  stroke={color} strokeWidth="0.8" fill="none" opacity="0.55" />
      <polygon points="15,9.5 20.5,15 15,20.5 9.5,15" fill={color} opacity="0.88" />
      <circle cx="15" cy="1"  r="1.3" fill={color} opacity="0.55" />
      <circle cx="28" cy="15" r="1.3" fill={color} opacity="0.55" />
      <circle cx="15" cy="29" r="1.3" fill={color} opacity="0.55" />
      <circle cx="2"  cy="15" r="1.3" fill={color} opacity="0.55" />
    </svg>
  )
}
// ─── Floating Particles ─────────────────────────────────────────────────────
const PARTICLES = [
  { left:  '5%', size: 4, delay: 0.0, dur: 14 },
  { left: '12%', size: 3, delay: 2.4, dur: 11 },
  { left: '19%', size: 6, delay: 4.2, dur: 16 },
  { left: '27%', size: 3, delay: 0.9, dur: 10 },
  { left: '34%', size: 5, delay: 3.1, dur: 13 },
  { left: '42%', size: 4, delay: 1.6, dur: 12 },
  { left: '50%', size: 3, delay: 5.3, dur: 9  },
  { left: '57%', size: 6, delay: 2.7, dur: 15 },
  { left: '65%', size: 4, delay: 0.5, dur: 11 },
  { left: '72%', size: 3, delay: 3.8, dur: 13 },
  { left: '80%', size: 5, delay: 1.9, dur: 10 },
  { left: '88%', size: 3, delay: 4.6, dur: 12 },
  { left: '94%', size: 4, delay: 0.7, dur: 14 },
]
const PETALS = [
  { left: '8%',  size: 11, delay: 1.0,  dur: 28 },
  { left: '23%', size: 8,  delay: 7.5,  dur: 34 },
  { left: '41%', size: 13, delay: 3.2,  dur: 26 },
  { left: '59%', size: 9,  delay: 11.0, dur: 30 },
  { left: '76%', size: 12, delay: 5.8,  dur: 32 },
  { left: '91%', size: 8,  delay: 0.4,  dur: 27 },
]
function FloatingParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: '-8px',
            width:  `${p.size}px`,
            height: `${p.size}px`,
            background: C.gold,
            opacity: 0,
            animation: `floatUp ${p.dur}s ${p.delay}s infinite linear`,
          }}
        />
      ))}
      {PETALS.map((p, i) => (
        <div
          key={`petal-${i}`}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: '-16px',
            width:  `${p.size}px`,
            height: `${p.size}px`,
            background: C.goldPale,
            borderRadius: '50% 50% 0 50%',
            opacity: 0,
            animation: `petalDrift ${p.dur}s ${p.delay}s infinite linear`,
          }}
        />
      ))}
    </div>
  )
}
// ─── AnimatedSongketDivider ─────────────────────────────────────────────────
function AnimatedSongketDivider() {
  return (
    <div style={{
      width: '100%', height: '48px', overflow: 'hidden',
      position: 'relative', background: 'transparent',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: bgWajik,
        animation: 'wajikDrift 14s linear infinite',
        opacity: 0.22,
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        height: '1px', transform: 'translateY(-50%)',
        background: `linear-gradient(to right, transparent, ${C.gold}40 20%, ${C.gold}60 50%, ${C.gold}40 80%, transparent)`,
      }} />
    </div>
  )
}
// ─── Primitive UI Atoms ─────────────────────────────────────────────────────
function Diamond({
  size  = 7,
  color = C.gold,
  style = {} as React.CSSProperties,
}) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      background: color, transform: 'rotate(45deg)',
      flexShrink: 0, ...style,
    }} />
  )
}
function Divider({ color = C.gold }: { color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px auto', maxWidth: '220px' }}>
      <div style={{ flex: 1, height: '0.5px', background: `linear-gradient(to right, transparent, ${color})` }} />
      <Diamond size={3} color={color} />
      <Diamond size={6} color={color} />
      <Diamond size={3} color={color} />
      <div style={{ flex: 1, height: '0.5px', background: `linear-gradient(to left, transparent, ${color})` }} />
    </div>
  )
}
function Corner({ pos, color = C.gold }: { pos: string; color?: string }) {
  const t = pos[0] === 't', l = pos[1] === 'l'
  return (
    <>
      <div style={{
        position: 'absolute',
        [t ? 'top'    : 'bottom']: '11px',
        [l ? 'left'   : 'right']:  '11px',
        width: '26px', height: '26px',
        borderTop:    t ?  `1px solid ${color}` : 'none',
        borderBottom: !t ? `1px solid ${color}` : 'none',
        borderLeft:   l ?  `1px solid ${color}` : 'none',
        borderRight:  !l ? `1px solid ${color}` : 'none',
        opacity: 0.55,
      }} />
      <div style={{
        position: 'absolute',
        [t ? 'top'    : 'bottom']: `${11 + 26 - 3}px`,
        [l ? 'left'   : 'right']:  `${11 + 26 - 3}px`,
        width: '3px', height: '3px',
        background: color,
        transform: 'rotate(45deg)',
        opacity: 0.45,
      }} />
    </>
  )
}
function CdBox({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        background: `linear-gradient(155deg, ${C.burgundy} 0%, ${C.burgundyDeep} 100%)`,
        color: C.white, width: '58px', height: '62px',
        borderRadius: '5px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: F.display, fontSize: '24px', fontWeight: 600,
        boxShadow: `0 6px 22px rgba(125,37,53,0.30), 0 1px 0 rgba(255,255,255,0.09) inset`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '6%', right: '6%',
          height: '0.5px', background: 'rgba(0,0,0,0.18)',
          transform: 'translateY(-50%)',
        }} />
        <span key={value} style={{ animation: 'countIn 0.28s ease forwards', lineHeight: 1 }}>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <p style={{
        fontFamily: F.body, fontSize: '9px', color: C.textLight,
        marginTop: '8px', letterSpacing: '2.5px', textTransform: 'uppercase',
      }}>
        {label}
      </p>
    </div>
  )
}
function SectionLabel({ children, color = C.gold }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '10px', marginBottom: '12px',
    }}>
      <Diamond size={3} color={color} style={{ opacity: 0.5 }} />
      <p style={{
        fontFamily: F.body, fontSize: '9.5px', letterSpacing: '4px',
        color, textTransform: 'uppercase', margin: 0,
      }}>
        {children}
      </p>
      <Diamond size={3} color={color} style={{ opacity: 0.5 }} />
    </div>
  )
}
// ─── Main Component ─────────────────────────────────────────────────────────
export default function InviteClient({ guest }: { guest: Guest }) {
  const [opened,      setOpened]      = useState(false)
  const [closing,     setClosing]     = useState(false)
  const [flashing,    setFlashing]    = useState(false)
  const [cd,          setCd]          = useState<Countdown>({ d: 0, h: 0, m: 0, s: 0 })
  const [attending,   setAttending]   = useState<boolean | null>(null)
  const [pax,         setPax]         = useState(1)
  const [note,        setNote]        = useState('')
  const [rsvpDone,    setRsvpDone]    = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [messages,    setMessages]    = useState<Message[]>([])
  const [msgText,     setMsgText]     = useState('')
  const [msgDone,     setMsgDone]     = useState(false)
  const [msgLoading,  setMsgLoading]  = useState(false)
  const [copied,      setCopied]      = useState('')
  const [hovered,     setHovered]     = useState<string | null>(null)
  // Countdown timer
  useEffect(() => {
    const target = new Date('2026-06-26T08:00:00+07:00').getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff > 0) setCd({
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff % 86400000 / 3600000),
        m: Math.floor(diff % 3600000  / 60000),
        s: Math.floor(diff % 60000    / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  // Scroll reveal
  useEffect(() => {
    if (!opened) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.07 },
    )
    const id = setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el))
    }, 120)
    return () => { clearTimeout(id); obs.disconnect() }
  }, [opened])
  useEffect(() => { loadMessages() }, [])
  async function loadMessages() {
    const { data } = await supabase
      .from('messages').select('*')
      .order('created_at', { ascending: false }).limit(50)
    if (data) setMessages(data)
  }
  function openInvite() {
    setFlashing(true)
    setClosing(true)
    setTimeout(() => setOpened(true), 640)
  }
  async function submitRsvp() {
    if (attending === null) return
    setRsvpLoading(true)
    await supabase.from('rsvps').insert({
      guest_slug: guest.slug, guest_name: guest.name,
      attending, pax: attending ? pax : 0, note,
    })
    setRsvpDone(true)
    setRsvpLoading(false)
  }
  async function submitMessage() {
    if (!msgText.trim()) return
    setMsgLoading(true)
    await supabase.from('messages').insert({
      guest_slug: guest.slug, guest_name: guest.name, message: msgText.trim(),
    })
    setMsgDone(true)
    setMsgLoading(false)
    loadMessages()
  }
  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2500)
  }
  const S: React.CSSProperties = { maxWidth: '480px', margin: '0 auto', padding: '64px 24px' }
  // ═══════════════════════════════════════════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  if (!opened) return (
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
      {/* Flash overlay */}
      {flashing && <div className="flash-overlay" />}
      {/* Woven wajik background */}
      <div className="wajik-bg-animate" style={{ position: 'fixed', inset: 0, backgroundImage: bgWajik, zIndex: 0 }} />
      {/* Floating gold particles */}
      <FloatingParticles />
      {/* ── Envelope card ── */}
      <div
        className={closing ? 'cover-card closing' : 'cover-card'}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '390px' }}
      >
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          border: `1px solid rgba(196,151,59,0.3)`,
          borderRadius: '8px',
          boxShadow: `
            0 2px 6px   rgba(125,37,53,0.04),
            0 10px 36px rgba(125,37,53,0.09),
            0 30px 72px rgba(125,37,53,0.055),
            0 0 0 5px   rgba(196,151,59,0.05)
          `,
          position: 'relative', overflow: 'hidden',
        }}>
          <SongketBand color={C.gold} opacity={0.14} />
          <div style={{ padding: '40px 34px 38px', textAlign: 'center', position: 'relative' }}>
            <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
              <Diamond size={3} color={C.gold} style={{ opacity: 0.4 }} />
              <div className="breathe wajik-rotate"><WajikBadge size={28} /></div>
              <Diamond size={3} color={C.gold} style={{ opacity: 0.4 }} />
            </div>
            <SectionLabel>Undangan Pernikahan</SectionLabel>
            <div style={{ margin: '22px 0 0' }}>
              <p style={{ fontFamily: F.display, fontSize: '12.5px', color: C.textLight, fontStyle: 'italic', marginBottom: '8px' }}>
                Kepada Yth. Bapak/Ibu/Saudara/i
              </p>
              <p style={{
                fontFamily: F.display, fontSize: '28px', fontWeight: 600,
                color: C.burgundy, lineHeight: 1.2,
                textShadow: '0 1px 3px rgba(125,37,53,0.10)',
              }}>
                {guest.name}
              </p>
            </div>
            <PucukRebungDivider />
            <p style={{ fontFamily: F.display, fontSize: '38px', fontWeight: 300, color: C.textDark, letterSpacing: '0.5px', lineHeight: 1.04 }}>
              Vanya
            </p>
            <p style={{ fontFamily: F.display, fontSize: '17px', color: C.gold, fontStyle: 'italic', margin: '5px 0' }}>dan</p>
            <p style={{ fontFamily: F.display, fontSize: '38px', fontWeight: 300, color: C.textDark, letterSpacing: '0.5px', lineHeight: 1.04, marginBottom: '22px' }}>
              Faiz
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '34px' }}>
              <div style={{ height: '1px', width: '20px', background: `${C.gold}50` }} />
              <p style={{ fontFamily: F.body, fontSize: '11px', color: C.textLight, letterSpacing: '2.5px' }}>
                26 JUNI 2026 · JAKARTA
              </p>
              <div style={{ height: '1px', width: '20px', background: `${C.gold}50` }} />
            </div>
            <button
              onClick={openInvite}
              className="shimmer-btn"
              onMouseEnter={() => setHovered('open')}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'block', width: '100%', padding: '16px',
                background: hovered === 'open'
                  ? `linear-gradient(135deg, ${C.burgundyDeep}, ${C.burgundy})`
                  : `linear-gradient(135deg, ${C.burgundy}, ${C.burgundyDeep})`,
                color: C.white, border: 'none', borderRadius: '4px', cursor: 'pointer',
                fontFamily: F.body, fontSize: '11px', letterSpacing: '3.5px', textTransform: 'uppercase',
                boxShadow: hovered === 'open'
                  ? `0 8px 28px rgba(125,37,53,0.38)`
                  : `0 4px 18px rgba(125,37,53,0.22)`,
                transition: 'background 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              Buka Undangan
            </button>
          </div>
          <SongketBand color={C.gold} opacity={0.14} />
        </div>
      </div>
    </div>
  )
  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN INVITATION CONTENT
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ background: C.cream }} className="page-enter">
      {/* ── HERO ─────────────────────────────────────────────────────────────*/}
      <section className="reveal" style={{
        background: `linear-gradient(180deg, rgba(125,37,53,0.075) 0%, rgba(125,37,53,0.02) 65%, transparent 100%)`,
        padding: '84px 24px 68px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Woven texture */}
        <div className="wajik-bg-animate" style={{ position: 'absolute', inset: 0, backgroundImage: bgWajik, zIndex: 0 }} />
        {/* Ambient glow orb */}
        <div className="orb-pulse" style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '560px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,151,59,0.05) 0%, transparent 68%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Arabic Bismillah */}
          <p
            className="arabic-glow"
            style={{
              fontFamily: F.arabic, fontSize: '32px', color: C.burgundy,
              lineHeight: 2.1, marginBottom: '8px', marginTop: '-6px'
            }}
          >
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <SectionLabel>Undangan Pernikahan</SectionLabel>
          <PucukRebungDivider />
          {/* Couple names */}
          <p style={{
            fontFamily: F.display, fontSize: 'clamp(44px, 12vw, 60px)',
            fontWeight: 300, color: C.textDark,
            lineHeight: 1.0, letterSpacing: '0.5px',
            marginBottom: '-2px',
          }}>
            <span className="name-float gold-shimmer-text">Vanya</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '8px 0' }}>
            <div style={{ height: '1px', flex: 1, maxWidth: '64px', background: `${C.gold}45` }} />
            <p style={{ fontFamily: F.display, fontSize: '20px', color: C.gold, fontStyle: 'italic' }}>dan</p>
            <div style={{ height: '1px', flex: 1, maxWidth: '64px', background: `${C.gold}45` }} />
          </div>
          <p style={{
            fontFamily: F.display, fontSize: 'clamp(44px, 12vw, 60px)',
            fontWeight: 300, color: C.textDark,
            lineHeight: 1.0, letterSpacing: '0.5px',
            marginTop: '-2px',
            marginBottom: '32px',
          }}>
            <span className="name-float gold-shimmer-text">Faiz</span>
          </p>
          <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, letterSpacing: '2px', marginBottom: '52px' }}>
            Jum'at, 26 Juni 2026 · Jakarta
          </p>
          {/* Countdown */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '8px' }}>
            <div className="cd-heartbeat" style={{ animationDelay: '0s' }}>
              <CdBox value={cd.d} label="Hari" />
            </div>
            <p style={{ fontFamily: F.display, fontSize: '30px', color: C.gold, opacity: 0.45, marginTop: '16px', lineHeight: 1 }}>:</p>
            <div className="cd-heartbeat" style={{ animationDelay: '0.08s' }}>
              <CdBox value={cd.h} label="Jam" />
            </div>
            <p style={{ fontFamily: F.display, fontSize: '30px', color: C.gold, opacity: 0.45, marginTop: '16px', lineHeight: 1 }}>:</p>
            <div className="cd-heartbeat" style={{ animationDelay: '0.16s' }}>
              <CdBox value={cd.m} label="Menit" />
            </div>
            <p style={{ fontFamily: F.display, fontSize: '30px', color: C.gold, opacity: 0.45, marginTop: '16px', lineHeight: 1 }}>:</p>
            <div className="cd-heartbeat" style={{ animationDelay: '0.24s' }}>
              <CdBox value={cd.s} label="Detik" />
            </div>
          </div>
        </div>
      </section>
      {/* ── ANIMATED SONGKET DIVIDER ─────────────────────────────────────────*/}
      <AnimatedSongketDivider />
      {/* ── INTRODUCTION ─────────────────────────────────────────────────────*/}
      <section className="reveal" style={{ ...S, textAlign: 'center' }}>
        <p style={{
          fontFamily: F.body, fontSize: '10px', letterSpacing: '3.5px',
          color: C.textLight, textTransform: 'uppercase', marginBottom: '36px', lineHeight: 2.2,
        }}>
          Assalamu'alaikum Warahmatullahi Wabarakatuh
        </p>
        {/* Quranic verse card */}
        <div style={{
          background: C.white,
          border: `1px solid rgba(196,151,59,0.18)`,
          borderRadius: '8px',
          marginBottom: '36px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 28px rgba(44,24,16,0.06)',
        }}>
          <SongketBand color={C.gold} opacity={0.09} />
          <div style={{ padding: '34px 28px', position: 'relative' }}>
            <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
            <p style={{
              fontFamily: F.arabic, fontSize: '22px', color: C.navy,
              lineHeight: 2.5, direction: 'rtl', marginBottom: '22px',
            }}>
              وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجاً لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
            </p>
            <div style={{ width: '36px', height: '0.5px', background: `${C.gold}70`, margin: '0 auto 18px' }} />
            <p style={{
              fontFamily: F.display, fontSize: '15px', color: C.textLight,
              fontStyle: 'italic', lineHeight: 2.1, marginBottom: '12px',
            }}>
              "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."
            </p>
            <p style={{ fontFamily: F.body, fontSize: '11px', color: C.gold, letterSpacing: '1.5px' }}>
              QS. Ar-Rum: 21
            </p>
          </div>
          <SongketBand color={C.gold} opacity={0.09} />
        </div>
        <p style={{ fontFamily: F.body, fontSize: '14px', color: C.textDark, lineHeight: 2.1, marginBottom: '18px' }}>
          Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta'ala, kami mengundang Bapak/Ibu/Saudara/i
        </p>
        <div style={{ display: 'inline-block', position: 'relative', marginBottom: '18px', padding: '4px 8px' }}>
          <p style={{ fontFamily: F.display, fontSize: '30px', fontWeight: 600, color: C.burgundy, lineHeight: 1.2 }}>
            {guest.name}
          </p>
          <div style={{
            position: 'absolute', bottom: 0, left: '8%', right: '8%',
            height: '1.5px',
            background: `linear-gradient(to right, transparent, ${C.gold}90, transparent)`,
          }} />
        </div>
        <p style={{ fontFamily: F.body, fontSize: '14px', color: C.textDark, lineHeight: 2.1, marginBottom: '32px' }}>
          untuk hadir memberikan do'a restu pada acara pernikahan kami. Kehadiran Anda adalah kehormatan dan kebahagiaan yang sangat berarti bagi kami sekeluarga.
        </p>
        <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '3.5px', color: C.textLight, textTransform: 'uppercase' }}>
          Wassalamu'alaikum Warahmatullahi Wabarakatuh
        </p>
      </section>
      {/* ── MEMPELAI ─────────────────────────────────────────────────────────*/}
      <section className="reveal" style={{ background: C.white, padding: '68px 24px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <SectionLabel>Mempelai</SectionLabel>
          <p style={{ fontFamily: F.display, fontSize: '24px', color: C.textDark, marginBottom: '52px', lineHeight: 1.1, fontStyle: 'italic' }}>
            Kami yang berbahagia
          </p>
          {/* ── Wanita ── */}
          <div className="reveal-left">
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '22px' }}>
              <div className="ring-pulse" style={{
                width: '122px', height: '122px', borderRadius: '50%',
                border: `1px solid ${C.gold}80`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '108px', height: '108px', borderRadius: '50%',
                  border: `3px solid rgba(125,37,53,0.18)`,
                  background: `linear-gradient(135deg, rgba(125,37,53,0.07), rgba(30,58,95,0.07))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '44px',
                }}>🤵</div>
              </div>
              <div style={{
                position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)',
                width: '7px', height: '7px', background: C.gold,
                borderRadius: '50%', border: `1.5px solid ${C.white}`,
              }} />
            </div>
            <p style={{ fontFamily: F.display, fontSize: '32px', fontWeight: 600, color: C.burgundy, marginBottom: '8px' }}>
              Vanya Alverissa, SE.
            </p>
            <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 1.6 }}>
              Putri ke 3
            </p>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{
                display: 'block', fontFamily: F.body, fontSize: '14px',
                color: C.burgundy, fontWeight: 700, letterSpacing: '0.01em',
              }}>
                Bapak Darmasyah Yusuf
              </span>
              <span style={{
                display: 'block', fontFamily: F.body, fontSize: '13px',
                color: C.textMid, fontStyle: 'italic',
              }}>&amp;</span>
              <span style={{
                display: 'block', fontFamily: F.body, fontSize: '14px',
                color: C.burgundy, fontWeight: 700, letterSpacing: '0.01em',
              }}>
                Ibu Marlina Susanti, SE.
              </span>
            </div>
          </div>
          {/* ── Central ornament ── */}
          <div style={{ margin: '28px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
            <div style={{ height: '1px', flex: 1, maxWidth: '72px', background: `${C.gold}38` }} />
            <div style={{ textAlign: 'center' }}>
              <div className="wajik-rotate">
                <WajikBadge size={38} />
              </div>
              <p style={{ fontFamily: F.display, fontSize: '13px', color: C.gold, fontStyle: 'italic', marginTop: '-2px' }}>
                bersama
              </p>
            </div>
            <div style={{ height: '1px', flex: 1, maxWidth: '72px', background: `${C.gold}38` }} />
          </div>
          {/* ── Pria ── */}
          <div className="reveal-right">
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '22px' }}>
              <div className="ring-pulse" style={{
                width: '122px', height: '122px', borderRadius: '50%',
                border: `1px solid ${C.gold}80`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '108px', height: '108px', borderRadius: '50%',
                  border: `3px solid rgba(125,37,53,0.18)`,
                  background: `linear-gradient(135deg, rgba(125,37,53,0.07), rgba(30,58,95,0.07))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '44px',
                }}>🤵</div>
              </div>
              <div style={{
                position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)',
                width: '7px', height: '7px', background: C.gold,
                borderRadius: '50%', border: `1.5px solid ${C.white}`,
              }} />
            </div>
            <p style={{
              fontFamily: F.display, fontSize: '26px', fontWeight: 600,
              color: C.burgundy, marginBottom: '8px',
              whiteSpace: 'nowrap',
            }}>
              Faizuddarain Syam, S.Kom, M.Sc.
            </p>
            <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 1.6 }}>
              Putra ke 1
            </p>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{
                display: 'block', fontFamily: F.body, fontSize: '14px',
                color: C.burgundy, fontWeight: 700, letterSpacing: '0.01em',
              }}>
                Bapak Prof. Dr. Syamsudhuha, M.Sc.
              </span>
              <span style={{
                display: 'block', fontFamily: F.body, fontSize: '13px',
                color: C.textMid, fontStyle: 'italic',
              }}>&amp;</span>
              <span style={{
                display: 'block', fontFamily: F.body, fontSize: '14px',
                color: C.burgundy, fontWeight: 700, letterSpacing: '0.01em',
              }}>
                Ibu Dr. Nurhayati, M.Sc.
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* ── EVENTS ───────────────────────────────────────────────────────────*/}
      <section className="reveal" style={{ ...S }}>
        <SectionLabel>Rangkaian Acara</SectionLabel>
        <p style={{ fontFamily: F.display, fontSize: '24px', color: C.textDark, textAlign: 'center', marginBottom: '44px', lineHeight: 1.1, fontStyle: 'italic' }}>
          Hari Istimewa Kami
        </p>
        {[
          {
            gradient: `linear-gradient(140deg, ${C.burgundy} 0%, ${C.burgundyDeep} 100%)`,
            glow:  C.burgundy,
            label: 'Akad Nikah',
            time:  '16.00 WIB',
            venue: 'Pejaten Terrace, Jakarta Selatan',
            icon:  '☪',
            revealClass: 'reveal-left',
          },
          {
            gradient: `linear-gradient(140deg, ${C.navy} 0%, ${C.navyDeep} 100%)`,
            glow:  C.navy,
            label: 'Resepsi Pernikahan',
            time:  '19.00 – 21.00 WIB',
            venue: 'Pejaten Terrace, Jakarta Selatan',
            icon:  '✿',
            revealClass: 'reveal-right',
          },
        ].map((ev, i) => (
          <div
            key={i}
            className={`event-card ${ev.revealClass}`}
            style={{
              borderRadius: '8px',
              marginBottom: i === 0 ? '14px' : 0,
              boxShadow: `0 8px 32px ${ev.glow}28, 0 2px 8px ${ev.glow}18`,
              overflow: 'hidden', color: C.white, position: 'relative',
            }}
          >
            <SongketBand color="rgba(255,255,255,1)" opacity={0.05} />
            <div style={{ background: ev.gradient, padding: '26px 28px 32px', position: 'relative' }}>
              <div style={{
                position: 'absolute', right: '-28px', top: '-28px',
                width: '150px', height: '150px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', right: '14px', bottom: '10px',
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)',
                pointerEvents: 'none',
              }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', flexShrink: 0, marginTop: '2px',
                }}>
                  {ev.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: F.body, fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.55, marginBottom: '7px' }}>
                    {ev.label}
                  </p>
                  <p style={{ fontFamily: F.display, fontSize: '26px', fontWeight: 600, lineHeight: 1.1, marginBottom: '10px' }}>
                    Jum'at, 26 Juni 2026
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ width: '14px', height: '1px', background: 'rgba(255,255,255,0.38)' }} />
                    <p style={{ fontFamily: F.body, fontSize: '14px', opacity: 0.88 }}>{ev.time}</p>
                  </div>
                  <p style={{ fontFamily: F.body, fontSize: '13px', opacity: 0.58 }}>{ev.venue}</p>
                </div>
              </div>
            </div>
            <SongketBand color="rgba(255,255,255,1)" opacity={0.04} />
          </div>
        ))}
      </section>
      {/* ── ANIMATED SONGKET DIVIDER ─────────────────────────────────────────*/}
      <AnimatedSongketDivider />
      {/* ── LOCATION ─────────────────────────────────────────────────────────*/}
      <section className="reveal" style={{ paddingTop: '64px', paddingBottom: '68px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px', padding: '0 24px' }}>
          <SectionLabel>Lokasi</SectionLabel>
          <p style={{ fontFamily: F.display, fontSize: '22px', color: C.textLight, fontStyle: 'italic' }}>
            Temukan kami di sini
          </p>
        </div>
        {/* Map with songket frame */}
        <div className="reveal" style={{ position: 'relative', boxShadow: '0 4px 28px rgba(44,24,16,0.09)', transformOrigin: 'center top' }}>
          <SongketBand color={C.gold} opacity={0.11} />
          <iframe
            src="https://maps.google.com/maps?q=Pejaten+Terrace+Jl+Warung+Jati+Barat+No+39+Jakarta+Selatan&output=embed&hl=id"
            width="100%" height="280"
            style={{ border: 'none', display: 'block' }}
            loading="lazy" title="Pejaten Terrace"
          />
          <SongketBand color={C.gold} opacity={0.11} />
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '28px 24px 0', textAlign: 'center' }}>
          <p style={{ fontFamily: F.display, fontSize: '26px', color: C.textDark, marginBottom: '8px' }}>
            Pejaten Terrace
          </p>
          <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 2.1, marginBottom: '26px' }}>
            Jl. Warung Jati Barat No.39<br />
            Pejaten Timur, Pasar Minggu, Jakarta Selatan
          </p>
          
            <a href="https://maps.app.goo.gl/bxiGv4QxUE3u2bNPA"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 28px',
              border: `1.5px solid ${C.navy}`, color: C.navy,
              fontFamily: F.body, fontSize: '11px',
              letterSpacing: '2px', textTransform: 'uppercase',
              textDecoration: 'none', borderRadius: '4px',
            }}
          >
            📍 Buka di Google Maps
          </a>
        </div>
      </section>
      {/* ── RSVP ─────────────────────────────────────────────────────────────*/}
      <section className="reveal" style={{ background: C.white, padding: '68px 24px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <SectionLabel>Konfirmasi Kehadiran</SectionLabel>
          <p style={{ fontFamily: F.display, fontSize: '38px', color: C.textDark, marginBottom: '10px', lineHeight: 1.05 }}>
            Apakah kamu hadir?
          </p>
          <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 2, marginBottom: '42px' }}>
            Mohon konfirmasi paling lambat<br />
            <span style={{ color: C.burgundy, fontWeight: 600 }}>19 Juni 2026</span>
          </p>
          {rsvpDone ? (
            <div style={{
              border: `1px solid rgba(125,37,53,0.18)`, borderRadius: '8px',
              overflow: 'hidden', background: 'rgba(125,37,53,0.025)',
              position: 'relative',
            }}>
              <SongketBand color={C.burgundy} opacity={0.05} />
              <div style={{ padding: '44px 24px' }}>
                <p style={{ fontSize: '42px', marginBottom: '18px' }}>🤍</p>
                <p style={{ fontFamily: F.display, fontSize: '28px', color: C.burgundy, marginBottom: '10px' }}>
                  Terima kasih, {guest.name.split(' ')[0]}!
                </p>
                <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 1.9 }}>
                  Konfirmasi kehadiranmu sudah kami terima dengan baik.<br />Kami nantikan kehadiranmu!
                </p>
              </div>
              <SongketBand color={C.burgundy} opacity={0.05} />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {[
                  { val: true,  label: 'Hadir',       icon: '✓', color: C.burgundy },
                  { val: false, label: 'Tidak Hadir', icon: '✗', color: C.textLight },
                ].map(({ val, label, icon, color }) => (
                  <button
                    key={label}
                    onClick={() => setAttending(val)}
                    style={{
                      flex: 1, padding: '15px 8px',
                      background: attending === val ? color : C.white,
                      color:      attending === val ? C.white : color,
                      border:     `1.5px solid ${attending === val ? color : `${color}55`}`,
                      borderRadius: '5px',
                      fontFamily: F.body, fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                      boxShadow: attending === val ? `0 4px 18px ${color}28` : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <span style={{ marginRight: '6px' }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
              {attending === true && (
                <div style={{
                  marginBottom: '20px', textAlign: 'left',
                  background: C.cream, borderRadius: '6px', padding: '20px 20px 18px',
                }}>
                  <p style={{ fontFamily: F.body, fontSize: '11px', color: C.textLight, marginBottom: '14px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    Jumlah tamu yang hadir
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button
                      onClick={() => setPax(p => Math.max(1, p - 1))}
                      style={{
                        width: '40px', height: '40px', borderRadius: '4px',
                        border: `1.5px solid ${C.burgundy}`, background: C.white,
                        color: C.burgundy, fontSize: '20px', cursor: 'pointer',
                      }}
                    >−</button>
                    <span style={{ fontFamily: F.display, fontSize: '38px', color: C.textDark, minWidth: '44px', textAlign: 'center', lineHeight: 1 }}>
                      {pax}
                    </span>
                    <button
                      onClick={() => setPax(p => Math.min(10, p + 1))}
                      style={{
                        width: '40px', height: '40px', borderRadius: '4px',
                        border: `1.5px solid ${C.burgundy}`, background: C.white,
                        color: C.burgundy, fontSize: '20px', cursor: 'pointer',
                      }}
                    >+</button>
                    <span style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight }}>orang</span>
                  </div>
                </div>
              )}
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Pesan untuk mempelai (opsional)"
                rows={3}
                style={{
                  width: '100%', padding: '16px',
                  border: `1.5px solid rgba(196,151,59,0.28)`,
                  borderRadius: '5px', resize: 'none',
                  fontFamily: F.body, fontSize: '14px', color: C.textDark,
                  background: '#FAFAF8', lineHeight: 1.8,
                  marginBottom: '16px', boxSizing: 'border-box',
                }}
              />
              <button
                onClick={submitRsvp}
                disabled={attending === null || rsvpLoading}
                className={attending !== null ? 'shimmer-btn' : ''}
                style={{
                  width: '100%', padding: '16px',
                  background: attending !== null
                    ? `linear-gradient(135deg, ${C.burgundy}, ${C.burgundyDeep})`
                    : '#E8E0DC',
                  color: attending !== null ? C.white : '#B0A09A',
                  border: 'none', borderRadius: '5px',
                  fontFamily: F.body, fontSize: '11px',
                  letterSpacing: '3.5px', textTransform: 'uppercase',
                  cursor: attending !== null ? 'pointer' : 'not-allowed',
                  boxShadow: attending !== null ? `0 4px 18px rgba(125,37,53,0.26)` : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {rsvpLoading ? 'Mengirim...' : 'Kirim Konfirmasi'}
              </button>
            </>
          )}
        </div>
      </section>
      {/* ── DIGITAL ENVELOPE ─────────────────────────────────────────────────*/}
      <section className="reveal" style={{ ...S }}>
        <SectionLabel>Amplop Digital</SectionLabel>
        <p style={{ fontFamily: F.display, fontSize: '34px', color: C.textDark, textAlign: 'center', marginBottom: '12px' }}>
          Hadiah &amp; Do'a Tulus
        </p>
        <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, textAlign: 'center', lineHeight: 2, marginBottom: '42px' }}>
          Kehadiran dan do'a restu Anda adalah hadiah terbesar.<br />Namun jika berkenan, berikut informasinya.
        </p>
        <div style={{
          background: C.white, borderRadius: '8px',
          border: `1px solid rgba(196,151,59,0.16)`,
          overflow: 'hidden', marginBottom: '14px',
          boxShadow: '0 4px 22px rgba(44,24,16,0.055)',
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.burgundy}, ${C.burgundyDeep})`,
            padding: '12px 24px',
          }}>
            <p style={{ fontFamily: F.body, fontSize: '9px', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
              Transfer Bank
            </p>
          </div>
          <div style={{ padding: '24px 24px 26px' }}>
            <p style={{ fontFamily: F.display, fontSize: '22px', color: C.textDark, marginBottom: '6px' }}>
              Bank [Nama Bank]
            </p>
            <p style={{ fontFamily: F.body, fontSize: '24px', fontWeight: 700, color: C.burgundy, letterSpacing: '3px', marginBottom: '5px' }}>
              [Nomor Rekening]
            </p>
            <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, marginBottom: '20px' }}>
              a.n. [Nama Pemilik]
            </p>
            <button
              onClick={() => copyText('[Nomor Rekening]', 'rek')}
              className={copied === 'rek' ? '' : 'shimmer-btn'}
              style={{
                padding: '10px 22px',
                background: copied === 'rek'
                  ? `linear-gradient(135deg, ${C.burgundy}, ${C.burgundyDeep})`
                  : 'transparent',
                border: `1.5px solid ${C.burgundy}`,
                color:  copied === 'rek' ? C.white : C.burgundy,
                borderRadius: '4px',
                fontFamily: F.body, fontSize: '11px', letterSpacing: '1.5px',
                cursor: 'pointer', transition: 'all 0.3s ease',
              }}
            >
              {copied === 'rek' ? '✓ Tersalin!' : 'Salin Nomor'}
            </button>
          </div>
        </div>
        <div style={{
          background: C.white, borderRadius: '8px',
          border: `1px solid rgba(196,151,59,0.16)`,
          overflow: 'hidden',
          boxShadow: '0 4px 22px rgba(44,24,16,0.055)',
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})`,
            padding: '12px 24px',
          }}>
            <p style={{ fontFamily: F.body, fontSize: '9px', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
              QRIS
            </p>
          </div>
          <div style={{ padding: '28px 24px', textAlign: 'center' }}>
            <div style={{
              width: '164px', height: '164px', margin: '0 auto',
              background: C.cream, borderRadius: '8px',
              border: `2px dashed rgba(196,151,59,0.38)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <p style={{ fontFamily: F.body, fontSize: '12px', color: C.textGhost, padding: '16px', textAlign: 'center', lineHeight: 1.8 }}>
                [Upload QRIS di sini]
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ── MESSAGES ─────────────────────────────────────────────────────────*/}
      <section className="reveal" style={{ background: C.white, padding: '68px 24px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <SectionLabel>Ucapan &amp; Doa</SectionLabel>
          <p style={{ fontFamily: F.display, fontSize: '36px', color: C.textDark, textAlign: 'center', marginBottom: '42px' }}>
            Kirim Do'a &amp; Selamat
          </p>
          {msgDone ? (
            <div style={{
              textAlign: 'center', padding: '44px 24px',
              border: `1px solid rgba(30,58,95,0.18)`, borderRadius: '8px',
              background: 'rgba(30,58,95,0.025)', marginBottom: '40px',
              overflow: 'hidden', position: 'relative',
            }}>
              <SongketBand color={C.navy} opacity={0.04} />
              <div style={{ padding: '8px 0' }}>
                <p style={{ fontSize: '34px', marginBottom: '14px' }}>💌</p>
                <p style={{ fontFamily: F.display, fontSize: '26px', color: C.navy, marginBottom: '8px' }}>
                  Ucapanmu sudah terkirim!
                </p>
                <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 1.9 }}>
                  Terima kasih atas do'a tulusmu 🤍
                </p>
              </div>
              <SongketBand color={C.navy} opacity={0.04} />
            </div>
          ) : (
            <div style={{ marginBottom: '44px' }}>
              <textarea
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                placeholder="Tulis ucapan untuk mempelai..."
                rows={4}
                style={{
                  width: '100%', padding: '18px',
                  border: `1.5px solid rgba(196,151,59,0.28)`,
                  borderRadius: '6px', resize: 'none',
                  fontFamily: F.body, fontSize: '14px', color: C.textDark,
                  background: '#FAFAF8', lineHeight: 1.9,
                  marginBottom: '14px', boxSizing: 'border-box',
                }}
              />
              <button
                onClick={submitMessage}
                disabled={!msgText.trim() || msgLoading}
                className={msgText.trim() ? 'shimmer-btn' : ''}
                style={{
                  width: '100%', padding: '15px',
                  background: msgText.trim()
                    ? `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})`
                    : '#E8E0DC',
                  color: msgText.trim() ? C.white : '#B0A09A',
                  border: 'none', borderRadius: '5px',
                  fontFamily: F.body, fontSize: '11px',
                  letterSpacing: '3.5px', textTransform: 'uppercase',
                  cursor: msgText.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: msgText.trim() ? `0 4px 18px rgba(30,58,95,0.26)` : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {msgLoading ? 'Mengirim...' : 'Kirim Ucapan'}
              </button>
            </div>
          )}
          {/* Messages list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '44px 24px' }}>
                <p style={{ fontSize: '28px', marginBottom: '14px', opacity: 0.35 }}>✉️</p>
                <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textGhost }}>
                  Jadilah yang pertama mengucapkan selamat 🤍
                </p>
              </div>
            ) : messages.map((msg, i) => (
              <div
                key={msg.id ?? i}
                className="msg-card"
                style={{
                  background: i % 2 === 0 ? '#FAFAF8' : C.cream,
                  borderRadius: '8px', padding: '18px 20px',
                  border: `1px solid rgba(196,151,59,0.13)`,
                  boxShadow: '0 2px 10px rgba(44,24,16,0.03)',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: `linear-gradient(135deg, rgba(125,37,53,0.12), rgba(30,58,95,0.12))`,
                    border: `1px solid ${C.gold}28`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: F.display, fontSize: '15px', fontWeight: 600, color: C.burgundy,
                    flexShrink: 0,
                  }}>
                    {msg.guest_name.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontFamily: F.display, fontSize: '18px', fontWeight: 600, color: C.burgundy }}>
                    {msg.guest_name}
                  </p>
                </div>
                <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textDark, lineHeight: 1.9, paddingLeft: '44px' }}>
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── FOOTER ───────────────────────────────────────────────────────────*/}
      <footer style={{
        background: `linear-gradient(180deg, ${C.burgundyDeep} 0%, ${C.burgundy} 100%)`,
        color: C.white, position: 'relative', overflow: 'hidden',
      }}>
        <SongketBand color="rgba(255,255,255,1)" opacity={0.07} />
        <div style={{ padding: '72px 24px 60px', textAlign: 'center', position: 'relative' }}>
          {/* Floating particles in footer */}
          <FloatingParticles />
          {/* Ambient radial glow */}
          <div style={{
            position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
            width: '500px', height: '420px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,151,59,0.09) 0%, transparent 68%)',
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <Diamond size={3} color="rgba(196,151,59,0.4)" />
              <div className="breathe"><WajikBadge color="rgba(196,151,59,0.65)" size={40} /></div>
              <Diamond size={3} color="rgba(196,151,59,0.4)" />
            </div>
            <p style={{ fontFamily: F.arabic, fontSize: '30px', lineHeight: 2.3, marginBottom: '10px' }}>
              بَارَكَ اللّٰهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
            </p>
            <p style={{ fontFamily: F.display, fontSize: '14px', fontStyle: 'italic', opacity: 0.62, marginBottom: '48px', lineHeight: 2 }}>
              "Semoga Allah memberkahi kalian berdua dan mengumpulkan kalian dalam kebaikan."
            </p>
            <PucukRebungDivider color="rgba(196,151,59,0.48)" />
            <p className="footer-name-shimmer" style={{ fontFamily: F.display, fontSize: 'clamp(36px, 10vw, 48px)', fontWeight: 300, letterSpacing: '2px', lineHeight: 1.05 }}>
              Vanya
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '8px 0' }}>
              <div style={{ height: '1px', flex: 1, maxWidth: '36px', background: 'rgba(196,151,59,0.3)' }} />
              <p style={{ fontFamily: F.display, fontSize: '18px', opacity: 0.42 }}>&amp;</p>
              <div style={{ height: '1px', flex: 1, maxWidth: '36px', background: 'rgba(196,151,59,0.3)' }} />
            </div>
            <p className="footer-name-shimmer" style={{ fontFamily: F.display, fontSize: 'clamp(36px, 10vw, 48px)', fontWeight: 300, letterSpacing: '2px', lineHeight: 1.05, marginBottom: '40px' }}>
              Faiz
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Diamond size={3} color="rgba(196,151,59,0.38)" />
              <p style={{ fontFamily: F.body, fontSize: '10px', opacity: 0.38, letterSpacing: '3px', textTransform: 'uppercase' }}>
                26 Juni 2026 · Jakarta
              </p>
              <Diamond size={3} color="rgba(196,151,59,0.38)" />
            </div>
          </div>
        </div>
        <SongketBand color="rgba(255,255,255,1)" opacity={0.07} />
      </footer>
    </div>
  )
}