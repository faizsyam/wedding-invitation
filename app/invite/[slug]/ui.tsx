// ─── Types ──────────────────────────────────────────────────────────────────
export type Guest    = { id: number; name: string; slug: string; created_at: string; max_guests?: number | null }
export type Message  = { id?: number; guest_name: string; guest_slug?: string; message: string; isNew?: boolean }
export type Countdown = { d: number; h: number; m: number; s: number }

// ─── Design Tokens ───────────────────────────────────────────────────────────
export const C = {
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

export const F = {
  display: "'Cormorant Garamond', serif",
  body:    "'Nunito', sans-serif",
  arabic:  "'Scheherazade New', serif",
}

export const bgWajik = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Crect x='18' y='1' width='8' height='8' transform='rotate(45 22 5)' fill='%23C4973B' opacity='0.11'/%3E%3Crect x='18' y='35' width='8' height='8' transform='rotate(45 22 39)' fill='%23C4973B' opacity='0.11'/%3E%3Crect x='1' y='18' width='8' height='8' transform='rotate(45 5 22)' fill='%23C4973B' opacity='0.06'/%3E%3Crect x='35' y='18' width='8' height='8' transform='rotate(45 39 22)' fill='%23C4973B' opacity='0.06'/%3E%3C/svg%3E")`

// ─── SongketBand ─────────────────────────────────────────────────────────────
export function SongketBand({ color = C.gold, opacity = 0.12 }: { color?: string; opacity?: number }) {
  return (
    <div style={{ width: '100%', height: '20px', overflow: 'hidden', flexShrink: 0 }}>
      <svg viewBox="0 0 400 20" width="100%" height="20" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
        {Array.from({ length: 28 }, (_, i) => (
          <polygon key={`o${i}`} points={`${i*16-8},10 ${i*16},2 ${i*16+8},10 ${i*16},18`}
            fill="none" stroke={color} strokeWidth="0.7" opacity={opacity * 4} />
        ))}
        {Array.from({ length: 28 }, (_, i) => (
          <polygon key={`f${i}`} points={`${i*16-5},10 ${i*16},5 ${i*16+5},10 ${i*16},15`}
            fill={color} opacity={opacity} />
        ))}
        <line x1="0" y1="0.5"  x2="400" y2="0.5"  stroke={color} strokeWidth="0.5" opacity={opacity * 2.5} />
        <line x1="0" y1="19.5" x2="400" y2="19.5" stroke={color} strokeWidth="0.5" opacity={opacity * 2.5} />
      </svg>
    </div>
  )
}

// ─── PucukRebungDivider ───────────────────────────────────────────────────────
export function PucukRebungDivider({ color = C.gold }: { color?: string }) {
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

// ─── WajikBadge ───────────────────────────────────────────────────────────────
export function WajikBadge({ color = C.gold, size = 30 }: { color?: string; size?: number }) {
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

// ─── FloatingParticles ────────────────────────────────────────────────────────
const PARTICLES = [
  { left:  '5%', size: 4, delay: 0.0, dur: 14 }, { left: '12%', size: 3, delay: 2.4, dur: 11 },
  { left: '19%', size: 6, delay: 4.2, dur: 16 }, { left: '27%', size: 3, delay: 0.9, dur: 10 },
  { left: '34%', size: 5, delay: 3.1, dur: 13 }, { left: '42%', size: 4, delay: 1.6, dur: 12 },
  { left: '50%', size: 3, delay: 5.3, dur: 9  }, { left: '57%', size: 6, delay: 2.7, dur: 15 },
  { left: '65%', size: 4, delay: 0.5, dur: 11 }, { left: '72%', size: 3, delay: 3.8, dur: 13 },
  { left: '80%', size: 5, delay: 1.9, dur: 10 }, { left: '88%', size: 3, delay: 4.6, dur: 12 },
  { left: '94%', size: 4, delay: 0.7, dur: 14 },
]
const PETALS = [
  { left: '8%',  size: 11, delay: 1.0,  dur: 28 }, { left: '23%', size: 8,  delay: 7.5,  dur: 34 },
  { left: '41%', size: 13, delay: 3.2,  dur: 26 }, { left: '59%', size: 9,  delay: 11.0, dur: 30 },
  { left: '76%', size: 12, delay: 5.8,  dur: 32 }, { left: '91%', size: 8,  delay: 0.4,  dur: 27 },
]

export function FloatingParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.left, bottom: '-8px',
          width: `${p.size}px`, height: `${p.size}px`,
          background: C.gold, opacity: 0,
          animation: `floatUp ${p.dur}s ${p.delay}s infinite linear`,
        }} />
      ))}
      {PETALS.map((p, i) => (
        <div key={`petal-${i}`} style={{
          position: 'absolute', left: p.left, bottom: '-16px',
          width: `${p.size}px`, height: `${p.size}px`,
          background: C.goldPale, borderRadius: '50% 50% 0 50%',
          opacity: 0, animation: `petalDrift ${p.dur}s ${p.delay}s infinite linear`,
        }} />
      ))}
    </div>
  )
}

// ─── AnimatedSongketDivider ───────────────────────────────────────────────────
export function AnimatedSongketDivider() {
  return (
    <div style={{ width: '100%', height: '48px', overflow: 'hidden', position: 'relative', background: 'transparent' }}>
      <div style={{
        position: 'absolute', inset: 0, backgroundImage: bgWajik,
        animation: 'wajikDrift 14s linear infinite', opacity: 0.22,
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        height: '1px', transform: 'translateY(-50%)',
        background: `linear-gradient(to right, transparent, ${C.gold}40 20%, ${C.gold}60 50%, ${C.gold}40 80%, transparent)`,
      }} />
    </div>
  )
}

// ─── Diamond ─────────────────────────────────────────────────────────────────
export function Diamond({ size = 7, color = C.gold, style = {} as React.CSSProperties }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      background: color, transform: 'rotate(45deg)',
      flexShrink: 0, ...style,
    }} />
  )
}

// ─── Corner ──────────────────────────────────────────────────────────────────
export function Corner({ pos, color = C.gold }: { pos: string; color?: string }) {
  const t = pos[0] === 't', l = pos[1] === 'l'
  return (
    <>
      <div style={{
        position: 'absolute',
        [t ? 'top' : 'bottom']: '11px', [l ? 'left' : 'right']: '11px',
        width: '26px', height: '26px',
        borderTop:    t  ? `1px solid ${color}` : 'none',
        borderBottom: !t ? `1px solid ${color}` : 'none',
        borderLeft:   l  ? `1px solid ${color}` : 'none',
        borderRight:  !l ? `1px solid ${color}` : 'none',
        opacity: 0.55,
      }} />
      <div style={{
        position: 'absolute',
        [t ? 'top' : 'bottom']: `${11 + 26 - 3}px`, [l ? 'left' : 'right']: `${11 + 26 - 3}px`,
        width: '3px', height: '3px',
        background: color, transform: 'rotate(45deg)', opacity: 0.45,
      }} />
    </>
  )
}

// ─── CdBox ────────────────────────────────────────────────────────────────────
export function CdBox({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        background: `linear-gradient(155deg, ${C.burgundy} 0%, ${C.burgundyDeep} 100%)`,
        color: C.white, width: '58px', height: '62px', borderRadius: '5px',
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
          height: '0.5px', background: 'rgba(0,0,0,0.18)', transform: 'translateY(-50%)',
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

// ─── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ children, color = C.gold }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
      <Diamond size={3} color={color} style={{ opacity: 0.5 }} />
      <p style={{
        fontFamily: F.body, fontSize: '10px', letterSpacing: '5px',
        color, textTransform: 'uppercase', margin: 0,
      }}>
        {children}
      </p>
      <Diamond size={3} color={color} style={{ opacity: 0.5 }} />
    </div>
  )
}