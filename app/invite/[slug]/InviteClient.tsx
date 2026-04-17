'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import {
  C, F, bgWajik,
  SongketBand, PucukRebungDivider, WajikBadge,
  FloatingParticles, AnimatedSongketDivider,
  Diamond, Corner, CdBox, SectionLabel,
} from './ui'
import type { Guest, Message, Countdown } from './ui'
import InviteCover from './InviteCover'

export default function InviteClient({ guest }: { guest: Guest }) {
  const [opened,      setOpened]      = useState(false)
  const [closing,     setClosing]     = useState(false)
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
  const [muted,       setMuted]       = useState(false)
  const [mapLoaded,   setMapLoaded]   = useState(false)
  const [paxVisible,  setPaxVisible]  = useState(false)
  const [existingRsvpId,    setExistingRsvpId]    = useState<number | null>(null)
  const [showRsvpWarning,   setShowRsvpWarning]   = useState(false)
  const [rsvpWarningClosing, setRsvpWarningClosing] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const maxPax = guest.max_guests ?? 2
  const guestMsgCount = messages.filter(m => m.guest_slug === guest.slug || m.isNew).length

  const S: React.CSSProperties = { maxWidth: '480px', margin: '0 auto', padding: '80px 28px' }

  // ── Audio ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio('/it_aint_over_til_its_over.mp3')
    audio.loop = true
    audio.volume = 0.4
    audioRef.current = audio
    const tryPlay = () => audio.play().catch(() => {})
    const handleVisibility = () => document.hidden ? audio.pause() : audio.play().catch(() => {})
    document.addEventListener('click', tryPlay, { once: true })
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      audio.pause()
      document.removeEventListener('click', tryPlay)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  function toggleMute() {
    if (!audioRef.current) return
    audioRef.current.muted = !audioRef.current.muted
    setMuted(prev => !prev)
  }

  // ── Countdown ──────────────────────────────────────────────────────────────
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

  // ── Scroll reveal ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!opened) return
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.04 },
    )
    const id = setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .msg-card').forEach(el => obs.observe(el))
    }, 120)
    return () => { clearTimeout(id); obs.disconnect() }
  }, [opened])

  // ── Messages ───────────────────────────────────────────────────────────────
  useEffect(() => { loadMessages() }, [])
  async function loadMessages() {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50)
    if (data) setMessages(data)
  }

  // ── Pax animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (attending === true) {
      requestAnimationFrame(() => requestAnimationFrame(() => setPaxVisible(true)))
    } else {
      setPaxVisible(false)
    }
  }, [attending])

  // ── Actions ────────────────────────────────────────────────────────────────
  function openInvite() {
    setClosing(true)
    setTimeout(() => setOpened(true), 640)
  }

  async function submitRsvp(forceUpdate = false) {
    if (attending === null) return
    setRsvpLoading(true)
    if (!forceUpdate) {
      const { data: existing } = await supabase.from('rsvps').select('id').eq('guest_slug', guest.slug).maybeSingle()
      if (existing) {
        setExistingRsvpId(existing.id)
        setShowRsvpWarning(true)
        setRsvpLoading(false)
        return
      }
    }
    if (forceUpdate && existingRsvpId) {
      await supabase.from('rsvps').update({ attending, pax: attending ? pax : 0, note }).eq('id', existingRsvpId)
    } else {
      await supabase.from('rsvps').insert({ guest_slug: guest.slug, guest_name: guest.name, attending, pax: attending ? pax : 0, note })
    }
    setShowRsvpWarning(false)
    setRsvpDone(true)
    setRsvpLoading(false)
  }

  async function submitMessage() {
    if (!msgText.trim() || guestMsgCount >= 3) return
    setMsgLoading(true)
    const optimistic: Message = { guest_name: guest.name, message: msgText.trim(), isNew: true }
    setMessages(prev => [optimistic, ...prev])
    setMsgDone(true)
    setMsgLoading(false)
    await supabase.from('messages').insert({ guest_slug: guest.slug, guest_name: guest.name, message: msgText.trim() })
    setTimeout(async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50)
      if (data) setMessages(data)
    }, 3000)
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2500)
  }

  function closeRsvpWarning() {
    setRsvpWarningClosing(true)
    setTimeout(() => { setShowRsvpWarning(false); setRsvpWarningClosing(false) }, 280)
  }

  // ── Cover ──────────────────────────────────────────────────────────────────
  if (!opened) return <InviteCover guest={guest} closing={closing} onOpen={openInvite} />

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN INVITATION CONTENT
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
    <div style={{ background: C.cream }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(180deg, rgba(125,37,53,0.075) 0%, rgba(125,37,53,0.02) 65%, transparent 100%)`,
        padding: '68px 24px 68px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="wajik-bg-animate" style={{ position: 'absolute', inset: 0, backgroundImage: bgWajik, zIndex: 0 }} />
        <div className="orb-pulse" style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '560px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,151,59,0.05) 0%, transparent 68%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{
            fontFamily: F.arabic, fontSize: '32px', color: C.burgundy,
            lineHeight: 2.1, marginBottom: '10px', marginTop: '-24px',
            animation: 'heroBismillahIn 1.8s 1.6s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <div style={{ animation: 'heroFadeRise 1.4s 2.3s cubic-bezier(0.16,1,0.3,1) both' }}>
            <SectionLabel>Undangan Pernikahan</SectionLabel>
          </div>
          <div style={{ animation: 'heroDividerExpand 1.4s 2.7s cubic-bezier(0.16,1,0.3,1) both', transformOrigin: 'center' }}>
            <PucukRebungDivider />
          </div>
          <p style={{
            fontFamily: F.display, fontSize: 'clamp(44px, 12vw, 60px)', fontWeight: 300,
            color: C.textDark, lineHeight: 1.0, letterSpacing: '0.5px',
            marginTop: '-2px', marginBottom: '-2px',
            animation: 'heroNameIn 2.0s 0.0s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <span className="gold-shimmer-text">Vanya</span>
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '16px', margin: '10px 0',
            animation: 'heroDanIn 1.4s 0.6s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <div style={{ height: '1px', flex: 1, maxWidth: '64px', background: `${C.gold}45` }} />
            <p style={{ fontFamily: F.display, fontSize: '20px', color: C.gold, fontStyle: 'italic', margin: 0 }}>dan</p>
            <div style={{ height: '1px', flex: 1, maxWidth: '64px', background: `${C.gold}45` }} />
          </div>
          <p style={{
            fontFamily: F.display, fontSize: 'clamp(44px, 12vw, 60px)', fontWeight: 300,
            color: C.textDark, lineHeight: 1.0, letterSpacing: '0.5px',
            marginTop: '-2px', marginBottom: '36px',
            animation: 'heroNameIn 2.0s 0.28s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <span className="gold-shimmer-text">Faiz</span>
          </p>
          <p style={{
            fontFamily: F.body, fontSize: '13px', color: C.textLight,
            letterSpacing: '2px', marginBottom: '58px',
            animation: 'heroFadeRise 1.3s 3.2s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            Jum'at, 26 Juni 2026 · Jakarta
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '8px' }}>
            {([
              { val: cd.d, label: 'Hari',  delay: '3.7s'  },
              { val: cd.h, label: 'Jam',   delay: '3.85s' },
              { val: cd.m, label: 'Menit', delay: '4.0s'  },
              { val: cd.s, label: 'Detik', delay: '4.15s' },
            ] as const).reduce<React.ReactNode[]>((acc, item, i) => {
              if (i > 0) acc.push(
                <p key={`sep${i}`} style={{
                  fontFamily: F.display, fontSize: '30px', color: C.gold,
                  opacity: 0.45, marginTop: '16px', lineHeight: 1,
                  animation: `heroFadeRise 0.8s ${['3.8s','3.95s','4.1s'][i-1]} cubic-bezier(0.16,1,0.3,1) both`,
                }}>:</p>
              )
              acc.push(
                <div key={item.label} style={{ animation: `heroCountdownIn 1.0s ${item.delay} cubic-bezier(0.16,1,0.3,1) both` }}>
                  <CdBox value={item.val} label={item.label} />
                </div>
              )
              return acc
            }, [])}
          </div>
          <div style={{
            marginTop: '40px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '10px',
            animation: 'heroFadeRise 1.2s 4.6s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <p style={{ fontFamily: F.body, fontSize: '9px', letterSpacing: '3.5px', color: C.textLight, textTransform: 'uppercase', margin: 0 }}>
              Tandai Kalendarmu
            </p>
            
            <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+Vanya+%26+Faiz&dates=20260626T090000Z%2F20260626T140000Z&details=Akad+Nikah+16.00+WIB+%7C+Resepsi+19.00–21.00+WIB&location=Pejaten+Terrace%2C+Jl.+Warung+Jati+Barat+No.39%2C+Jakarta+Selatan&ctz=Asia%2FJakarta"
              target="_blank" rel="noopener noreferrer"
              className="save-date-btn shimmer-btn"
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = C.gold; (e.currentTarget as HTMLAnchorElement).style.color = C.white }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = C.gold }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '13px 28px', background: 'transparent',
                border: `1.5px solid ${C.gold}`, color: C.gold, borderRadius: '4px',
                fontFamily: F.body, fontSize: '10px', letterSpacing: '3px',
                textTransform: 'uppercase', textDecoration: 'none',
                position: 'relative', overflow: 'hidden',
                transition: 'background 0.3s ease, color 0.3s ease',
              }}
            >
              <svg viewBox="0 0 18 18" width="14" height="14" fill="none" style={{ flexShrink: 0 }}>
                <rect x="1" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="5.5" y1="1" x2="5.5" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="12.5" y1="1" x2="12.5" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="9" cy="12" r="1.3" fill="currentColor"/>
              </svg>
              Save the Date
            </a>
            <p style={{ fontFamily: F.display, fontSize: '12px', fontStyle: 'italic', color: C.textGhost, margin: 0, letterSpacing: '0.5px' }}>
              26 Juni 2026
            </p>
          </div>
          <div style={{ marginTop: '36px', animation: 'heroFadeRise 1.0s 5.2s cubic-bezier(0.16,1,0.3,1) both' }}>
            <button
              onClick={() => document.getElementById('rsvp-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                margin: '0 auto', padding: '8px 16px',
                fontFamily: F.body, fontSize: '9px', letterSpacing: '3px',
                color: C.textLight, textTransform: 'uppercase',
                animation: 'nudgeDown 2.4s 6.2s ease-in-out infinite',
              }}
            >
              Konfirmasi Kehadiran
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <path d="M3 6l5 5 5-5" stroke={C.gold} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <AnimatedSongketDivider />

      {/* ── INTRODUCTION ─────────────────────────────────────────────────── */}
      <section className="reveal" style={{ ...S, textAlign: 'center' }}>
        <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '3.5px', color: C.textLight, textTransform: 'uppercase', marginBottom: '36px', lineHeight: 2.2 }}>
          Assalamu'alaikum Warahmatullahi Wabarakatuh
        </p>
        <div style={{
          background: C.white, border: `1px solid rgba(196,151,59,0.18)`,
          borderRadius: '8px', marginBottom: '36px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 28px rgba(44,24,16,0.06)',
        }}>
          <SongketBand color={C.gold} opacity={0.09} />
          <div style={{ padding: '34px 28px', position: 'relative' }}>
            <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
            <p style={{ fontFamily: F.arabic, fontSize: '22px', color: C.navy, lineHeight: 2.5, direction: 'rtl', marginBottom: '22px' }}>
              وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجاً لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
            </p>
            <div style={{ width: '36px', height: '0.5px', background: `${C.gold}70`, margin: '0 auto 18px' }} />
            <p style={{ fontFamily: F.display, fontSize: '15px', color: C.textLight, fontStyle: 'italic', lineHeight: 2.1, marginBottom: '12px' }}>
              "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."
            </p>
            <p style={{ fontFamily: F.body, fontSize: '11px', color: C.gold, letterSpacing: '1.5px' }}>QS. Ar-Rum: 21</p>
          </div>
          <SongketBand color={C.gold} opacity={0.09} />
        </div>
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontFamily: F.display, fontSize: '16px', color: C.textMid, lineHeight: 2, fontStyle: 'italic', marginBottom: '0' }}>
            Dengan memohon rahmat dan ridho Allah ﷻ, kami mengundang Bapak/Ibu/Saudara/i
          </p>
          <div style={{ display: 'inline-block', position: 'relative', margin: '10px 0 12px', padding: '2px 12px' }}>
            <p style={{ fontFamily: F.display, fontSize: '30px', fontWeight: 600, color: C.burgundy, lineHeight: 1.2, margin: 0 }}>
              {guest.name}
            </p>
            <div style={{
              position: 'absolute', bottom: 0, left: '8%', right: '8%', height: '1.5px',
              background: `linear-gradient(to right, transparent, ${C.gold}90, transparent)`,
            }} />
          </div>
          <p style={{ fontFamily: F.display, fontSize: '16px', color: C.textMid, lineHeight: 2, fontStyle: 'italic', marginBottom: '0' }}>
            untuk hadir memberikan do'a restu pada acara pernikahan kami. Kehadiran Anda adalah kehormatan dan kebahagiaan yang sangat berarti bagi kami sekeluarga.
          </p>
        </div>
        <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '3.5px', color: C.textLight, textTransform: 'uppercase' }}>
          Wassalamu'alaikum Warahmatullahi Wabarakatuh
        </p>
      </section>

      {/* ── MEMPELAI ─────────────────────────────────────────────────────── */}
      <section className="reveal" style={{ background: `linear-gradient(160deg, #fdfdfd 0%, #f5f7fa 60%, #fdfdfd 100%)`, padding: '72px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect x='17' y='2' width='6' height='6' transform='rotate(45 20 5)' fill='%23C4973B'/%3E%3C/svg%3E")` }} />
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,150,120,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,160,200,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <SectionLabel>Mempelai</SectionLabel>
            <p style={{ fontFamily: F.display, fontSize: '24px', color: C.textDark, fontStyle: 'italic', lineHeight: 1.2 }}>Kami yang berbahagia</p>
          </div>
          {/* Bride */}
          <div className="portrait-card reveal-left" style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', height: '480px', boxShadow: '0 20px 60px rgba(125,37,53,0.18)' }}>
              <img src="/bride.png" alt="Vanya Alverissa" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0.0) 35%, rgba(20,8,12,0.78) 100%), radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.15) 0%, transparent 60%)` }} />
              {(['tl','tr','bl','br'] as const).map(p => {
                const t = p[0]==='t', l = p[1]==='l'
                return <div key={p} style={{ position: 'absolute', [t?'top':'bottom']: '14px', [l?'left':'right']: '14px', width: '28px', height: '28px', borderTop: t ? `1.5px solid ${C.gold}` : 'none', borderBottom: !t ? `1.5px solid ${C.gold}` : 'none', borderLeft: l ? `1.5px solid ${C.gold}` : 'none', borderRight: !l ? `1.5px solid ${C.gold}` : 'none', opacity: 0.75 }} />
              })}
              <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: `1px solid rgba(255,255,255,0.3)`, borderRadius: '2px', padding: '5px 16px' }}>
                <p style={{ fontFamily: F.body, fontSize: '9px', letterSpacing: '4px', color: C.white, textTransform: 'uppercase', margin: 0, whiteSpace: 'nowrap' }}>Mempelai Wanita</p>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px' }}>
                <p style={{ fontFamily: F.display, fontSize: '34px', fontWeight: 600, color: C.white, lineHeight: 1.1, marginBottom: '6px' }}>Vanya Alverissa, SE.</p>
                <p style={{ fontFamily: F.body, fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginBottom: '12px', letterSpacing: '0.5px' }}>Putri ke-3 dari</p>
                <div style={{ height: '1px', background: `${C.gold}60`, marginBottom: '12px' }} />
                <p style={{ fontFamily: F.body, fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: 2 }}>
                  Bapak Darmansyah Yusuf<br /><span style={{ color: C.gold, fontSize: '11px' }}>&amp;</span><br />Ibu Marlina Susanti, SE.
                </p>
              </div>
            </div>
          </div>
          {/* Separator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', margin: '8px 0' }}>
            <div style={{ height: '1px', flex: 1, background: `${C.gold}38` }} />
            <div style={{ textAlign: 'center' }}>
              <div className="wajik-rotate"><WajikBadge size={34} /></div>
              <p style={{ fontFamily: F.display, fontSize: '13px', color: C.gold, fontStyle: 'italic', marginTop: '-2px' }}>bersama</p>
            </div>
            <div style={{ height: '1px', flex: 1, background: `${C.gold}38` }} />
          </div>
          {/* Groom */}
          <div className="portrait-card reveal-right" style={{ marginTop: '20px' }}>
            <div style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', height: '480px', boxShadow: '0 20px 60px rgba(30,58,95,0.18)' }}>
              <img src="/groom.png" alt="Faizuddarain Syam" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0.0) 35%, rgba(20,8,12,0.78) 100%), radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.15) 0%, transparent 60%)` }} />
              {(['tl','tr','bl','br'] as const).map(p => {
                const t = p[0]==='t', l = p[1]==='l'
                return <div key={p} style={{ position: 'absolute', [t?'top':'bottom']: '14px', [l?'left':'right']: '14px', width: '28px', height: '28px', borderTop: t ? `1.5px solid ${C.gold}` : 'none', borderBottom: !t ? `1.5px solid ${C.gold}` : 'none', borderLeft: l ? `1.5px solid ${C.gold}` : 'none', borderRight: !l ? `1.5px solid ${C.gold}` : 'none', opacity: 0.75 }} />
              })}
              <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: `1px solid rgba(255,255,255,0.3)`, borderRadius: '2px', padding: '5px 16px' }}>
                <p style={{ fontFamily: F.body, fontSize: '9px', letterSpacing: '4px', color: C.white, textTransform: 'uppercase', margin: 0 }}>Mempelai Pria</p>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px' }}>
                <p style={{ fontFamily: F.display, fontSize: '30px', fontWeight: 600, color: C.white, lineHeight: 1.1, marginBottom: '6px' }}>Faizuddarain Syam,<br />S.Kom, M.Sc.</p>
                <p style={{ fontFamily: F.body, fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginBottom: '12px', letterSpacing: '0.5px' }}>Putra ke-1 dari</p>
                <div style={{ height: '1px', background: `${C.gold}60`, marginBottom: '12px' }} />
                <p style={{ fontFamily: F.body, fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: 2 }}>
                  Bapak Prof. Dr. Syamsudhuha, M.Sc.<br /><span style={{ color: C.gold, fontSize: '11px' }}>&amp;</span><br />Ibu Dr. Nurhayati, M.Sc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS ───────────────────────────────────────────────────────── */}
      <section className="reveal" style={{ ...S }}>
        <SectionLabel>Rangkaian Acara</SectionLabel>
        <p style={{ fontFamily: F.display, fontSize: '24px', color: C.textDark, textAlign: 'center', marginBottom: '44px', lineHeight: 1.1, fontStyle: 'italic' }}>
          Hari Istimewa Kami
        </p>
        {[
          { gradient: `linear-gradient(140deg, ${C.burgundy} 0%, ${C.burgundyDeep} 100%)`, glow: C.burgundy, label: 'Akad Nikah',          time: '16.00 WIB',          icon: '☪', revealClass: 'reveal-left'  },
          { gradient: `linear-gradient(140deg, ${C.navy} 0%, ${C.navyDeep} 100%)`,         glow: C.navy,    label: 'Resepsi Pernikahan', time: '19.00 – 21.00 WIB', icon: '✿', revealClass: 'reveal-right' },
        ].map((ev, i) => (
          <div key={i} className={`event-card ${ev.revealClass}`} style={{ borderRadius: '8px', marginBottom: i === 0 ? '14px' : 0, boxShadow: `0 8px 32px ${ev.glow}28, 0 2px 8px ${ev.glow}18`, overflow: 'hidden', color: C.white, position: 'relative' }}>
            <SongketBand color="rgba(255,255,255,1)" opacity={0.05} />
            <div style={{ background: ev.gradient, padding: '26px 28px 32px', position: 'relative' }}>
              <div style={{ position: 'absolute', right: '-28px', top: '-28px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, marginTop: '2px' }}>
                  {ev.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: F.body, fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.55, marginBottom: '7px' }}>{ev.label}</p>
                  <p style={{ fontFamily: F.display, fontSize: '26px', fontWeight: 600, lineHeight: 1.1, marginBottom: '10px' }}>Jum'at, 26 Juni 2026</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ width: '14px', height: '1px', background: 'rgba(255,255,255,0.38)' }} />
                    <p style={{ fontFamily: F.body, fontSize: '14px', opacity: 0.88 }}>{ev.time}</p>
                  </div>
                  <p style={{ fontFamily: F.body, fontSize: '13px', opacity: 0.58 }}>Pejaten Terrace, Jakarta Selatan</p>
                </div>
              </div>
            </div>
            <SongketBand color="rgba(255,255,255,1)" opacity={0.04} />
          </div>
        ))}
      </section>

      <AnimatedSongketDivider />

      {/* ── LOCATION ─────────────────────────────────────────────────────── */}
      <section className="reveal" style={{ paddingTop: '64px', paddingBottom: '68px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px', padding: '0 24px' }}>
          <SectionLabel>Lokasi</SectionLabel>
          <p style={{ fontFamily: F.display, fontSize: '22px', color: C.textLight, fontStyle: 'italic' }}>Temukan kami di sini</p>
        </div>
        <div style={{ position: 'relative' }}>
          <SongketBand color={C.gold} opacity={0.11} />
          {!mapLoaded && (
            <div style={{ position: 'absolute', inset: 0, height: '280px', background: `linear-gradient(90deg, ${C.cream} 25%, ${C.ivory} 50%, ${C.cream} 75%)`, backgroundSize: '200% 100%', animation: 'shimmerSweepBg 1.8s infinite linear', zIndex: 1 }} />
          )}
          <iframe
            onLoad={() => setMapLoaded(true)}
            src="https://maps.google.com/maps?q=Pejaten+Terrace+Jl+Warung+Jati+Barat+No+39+Jakarta+Selatan&output=embed&hl=id"
            width="100%" height="280" style={{ border: 'none', display: 'block' }}
            loading="lazy" title="Pejaten Terrace"
          />
          <SongketBand color={C.gold} opacity={0.11} />
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '28px 24px 0', textAlign: 'center' }}>
          <p style={{ fontFamily: F.display, fontSize: '26px', color: C.textDark, marginBottom: '8px' }}>Pejaten Terrace</p>
          <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 2.1, marginBottom: '26px' }}>
            Jl. Warung Jati Barat No.39<br />Pejaten Timur, Pasar Minggu, Jakarta Selatan
          </p>
          
            <a href="https://maps.app.goo.gl/bxiGv4QxUE3u2bNPA"
            target="_blank" rel="noopener noreferrer"
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = C.navy; (e.currentTarget as HTMLAnchorElement).style.color = C.white }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = C.navy }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px',
              border: `1.5px solid ${C.navy}`, color: C.navy, background: 'transparent',
              fontFamily: F.body, fontSize: '11px', letterSpacing: '2px',
              textTransform: 'uppercase', textDecoration: 'none', borderRadius: '4px',
              transition: 'background 0.3s ease, color 0.3s ease',
            }}
          >
            📍 Buka di Google Maps
          </a>
        </div>
      </section>

      {/* ── RSVP ─────────────────────────────────────────────────────────── */}
      <section className="reveal" id="rsvp-section" style={{ background: C.white, padding: '80px 28px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <SectionLabel>Konfirmasi Kehadiran</SectionLabel>
          <p style={{ fontFamily: F.display, fontSize: '38px', color: C.textDark, marginBottom: '10px', lineHeight: 1.05 }}>Apakah kamu hadir?</p>
          <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 2, marginBottom: '42px' }}>
            Mohon konfirmasi paling lambat<br /><span style={{ color: C.burgundy, fontWeight: 600 }}>19 Juni 2026</span>
          </p>
          {rsvpDone ? (
            <div className="success-bounce" style={{ border: `1px solid rgba(125,37,53,0.18)`, borderRadius: '8px', overflow: 'hidden', background: 'rgba(125,37,53,0.025)', position: 'relative' }}>
              <SongketBand color={C.burgundy} opacity={0.05} />
              <div style={{ padding: '22px 24px' }}>
                <p style={{ fontSize: '42px', marginBottom: '18px', marginTop: '8px' }}>🤍</p>
                <p style={{ fontFamily: F.display, fontSize: '28px', color: C.burgundy, marginBottom: '10px' }}>Terima kasih, {guest.name.split(' ')[0]}!</p>
                <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 1.9 }}>Konfirmasi kehadiranmu sudah kami terima dengan baik.<br />Kami nantikan kehadiranmu!</p>
              </div>
              <SongketBand color={C.burgundy} opacity={0.05} />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {([
                  { val: true,  label: 'Hadir',       icon: '✓', color: C.burgundy },
                  { val: false, label: 'Tidak Hadir', icon: '✗', color: C.textLight },
                ] as const).map(({ val, label, icon, color }) => (
                  <button
                    key={label}
                    onClick={() => setAttending(val)}
                    onMouseEnter={e => { if (attending !== val) { (e.currentTarget as HTMLButtonElement).style.background = color; (e.currentTarget as HTMLButtonElement).style.color = C.white } }}
                    onMouseLeave={e => { if (attending !== val) { (e.currentTarget as HTMLButtonElement).style.background = C.white; (e.currentTarget as HTMLButtonElement).style.color = color } }}
                    style={{
                      flex: 1, padding: '15px 8px',
                      background: attending === val ? color : C.white,
                      color: attending === val ? C.white : color,
                      border: `1.5px solid ${attending === val ? color : `${color}55`}`,
                      borderRadius: '5px', fontFamily: F.body, fontSize: '14px',
                      fontWeight: 600, cursor: 'pointer',
                      boxShadow: attending === val ? `0 4px 18px ${color}28` : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <span style={{ marginRight: '6px' }}>{icon}</span>{label}
                  </button>
                ))}
              </div>
              {attending === true && maxPax > 1 && (
                <div style={{
                  display: 'grid',
                  gridTemplateRows: paxVisible ? '1fr' : '0fr',
                  opacity: paxVisible ? 1 : 0,
                  transform: paxVisible ? 'translateY(0px)' : 'translateY(-12px)',
                  marginBottom: paxVisible ? '20px' : '0px',
                  transition: 'grid-template-rows 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1), margin-bottom 0.55s cubic-bezier(0.16,1,0.3,1)',
                }}>
                  <div style={{ overflow: 'hidden', minHeight: 0 }}>
                    <div style={{ textAlign: 'left', background: C.cream, borderRadius: '6px', padding: '20px 20px 18px' }}>
                      <p style={{ fontFamily: F.body, fontSize: '11px', color: C.textLight, marginBottom: '14px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                        Jumlah tamu yang hadir
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => setPax(p => Math.max(1, p - 1))} className="pax-btn" style={{ width: '40px', height: '40px', borderRadius: '4px', border: `1.5px solid ${C.burgundy}`, background: C.white, color: C.burgundy, fontSize: '20px', cursor: 'pointer' }}>−</button>
                        <span key={pax} style={{ fontFamily: F.display, fontSize: '38px', color: C.textDark, minWidth: '44px', textAlign: 'center', lineHeight: 1, animation: 'paxTick 0.28s cubic-bezier(0.34,1.56,0.64,1) both' }}>{pax}</span>
                        <button onClick={() => setPax(p => Math.min(maxPax, p + 1))} className="pax-btn" style={{ width: '40px', height: '40px', borderRadius: '4px', border: `1.5px solid ${C.burgundy}`, background: C.white, color: C.burgundy, fontSize: '20px', cursor: 'pointer' }}>+</button>
                        <span style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight }}>orang</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <textarea
                value={note} onChange={e => setNote(e.target.value.slice(0, 280))} maxLength={280}
                placeholder="Pesan untuk mempelai (opsional)" rows={3}
                style={{ width: '100%', padding: '16px', border: `1.5px solid rgba(196,151,59,0.28)`, borderRadius: '5px', resize: 'none', fontFamily: F.body, fontSize: '14px', color: C.textDark, background: '#FAFAF8', lineHeight: 1.8, marginBottom: '6px', boxSizing: 'border-box' }}
              />
              <div style={{ textAlign: 'right', marginBottom: '10px', fontFamily: F.body, fontSize: '11px', letterSpacing: '0.5px', color: note.length >= 260 ? (note.length >= 280 ? '#C0392B' : '#C4973B') : 'rgba(0,0,0,0.28)', transition: 'color 0.2s ease' }}>
                {note.length}/280
              </div>
              <button
                onClick={() => submitRsvp()}
                disabled={attending === null || rsvpLoading}
                className={attending !== null ? 'shimmer-btn' : ''}
                onMouseEnter={e => { if (attending !== null) { (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, ${C.burgundyDeep}, #3a0f1a)`; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 28px rgba(125,37,53,0.44)` } }}
                onMouseLeave={e => { if (attending !== null) { (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, ${C.burgundy}, ${C.burgundyDeep})`; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 18px rgba(125,37,53,0.26)` } }}
                style={{
                  width: '100%', padding: '16px',
                  background: attending !== null ? `linear-gradient(135deg, ${C.burgundy}, ${C.burgundyDeep})` : '#E8E0DC',
                  color: attending !== null ? C.white : '#B0A09A',
                  border: 'none', borderRadius: '5px', fontFamily: F.body, fontSize: '11px',
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

      {/* ── DIGITAL ENVELOPE ─────────────────────────────────────────────── */}
      <section className="reveal" style={{ ...S }}>
        <SectionLabel>Amplop Digital</SectionLabel>
        <p style={{ fontFamily: F.display, fontSize: '34px', color: C.textDark, textAlign: 'center', marginBottom: '12px' }}>Hadiah &amp; Do'a Tulus</p>
        <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, textAlign: 'center', lineHeight: 2, marginBottom: '42px' }}>
          Kehadiran dan do'a restu Anda adalah hadiah terbesar.<br />Namun jika berkenan, berikut informasinya.
        </p>
        {/* BCA */}
        <div style={{ background: C.white, borderRadius: '8px', border: `1px solid rgba(196,151,59,0.16)`, overflow: 'hidden', marginBottom: '14px', boxShadow: '0 4px 22px rgba(44,24,16,0.055)' }}>
          <div style={{ background: `linear-gradient(135deg, ${C.burgundy}, ${C.burgundyDeep})`, padding: '12px 24px' }}>
            <p style={{ fontFamily: F.body, fontSize: '9px', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Transfer Bank</p>
          </div>
          <div style={{ padding: '8px 24px 26px' }}>
            <p style={{ fontFamily: F.display, fontSize: '22px', color: C.textDark }}>Bank BCA</p>
            <p style={{ fontFamily: F.body, fontSize: '28px', fontWeight: 700, color: C.burgundy, letterSpacing: '3px', marginTop: '-8px', marginBottom: '5px' }}>8288061851</p>
            <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, marginBottom: '20px' }}>a.n. Vanya Alverissa</p>
            <button
              onClick={() => copyText('8288061851', 'rek')}
              className={copied === 'rek' ? '' : 'shimmer-btn'}
              onMouseEnter={e => { if (copied !== 'rek') { (e.currentTarget as HTMLButtonElement).style.background = C.burgundy; (e.currentTarget as HTMLButtonElement).style.color = C.white } }}
              onMouseLeave={e => { if (copied !== 'rek') { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = C.burgundy } }}
              style={{ padding: '10px 22px', position: 'relative', overflow: 'hidden', background: copied === 'rek' ? `linear-gradient(135deg, ${C.burgundy}, ${C.burgundyDeep})` : 'transparent', border: `1.5px solid ${C.burgundy}`, color: copied === 'rek' ? C.white : C.burgundy, borderRadius: '4px', fontFamily: F.body, fontSize: '11px', letterSpacing: '1.5px', cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              {copied === 'rek' && <span className="copy-ripple" />}
              {copied === 'rek' ? '✓ Tersalin!' : 'Salin Nomor'}
            </button>
          </div>
        </div>
        {/* Kirim Kado */}
        <div style={{ background: C.white, borderRadius: '8px', border: `1px solid rgba(196,151,59,0.16)`, overflow: 'hidden', marginTop: '14px', boxShadow: '0 4px 22px rgba(44,24,16,0.055)' }}>
          <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})`, padding: '12px 24px' }}>
            <p style={{ fontFamily: F.body, fontSize: '9px', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', margin: '5px' }}>Kirim Kado</p>
          </div>
          <div style={{ padding: '24px 24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, rgba(125,37,53,0.1), rgba(30,58,95,0.1))`, border: `1px solid ${C.gold}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎁</div>
              <div>
                <p style={{ fontFamily: F.display, fontSize: '22px', color: C.textDark, margin: 0, lineHeight: 1.2 }}>Vanya Alverissa</p>
                <p style={{ fontFamily: F.body, fontSize: '11px', color: C.textLight, margin: 0, letterSpacing: '0.5px' }}>Penerima kado</p>
              </div>
            </div>
            <div style={{ background: C.cream, borderRadius: '6px', padding: '14px 16px', marginBottom: '20px', border: `1px solid rgba(196,151,59,0.12)` }}>
              <p style={{ fontFamily: F.body, fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', color: C.textLight, marginBottom: '8px' }}>Alamat Pengiriman</p>
              <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textDark, lineHeight: 2, margin: 0 }}>
                Jl. Bona Sarana Indah Blok E No. 12<br />RT 01/RW 02, Kelurahan Panunggangan Utara<br />Kecamatan Pinang, Kota Tangerang
              </p>
            </div>
            <button
              onClick={() => copyText('Jl. Bona Sarana Indah Blok E No. 12 RT 01/RW 02, Kelurahan Panunggangan Utara, Kecamatan Pinang, Kota Tangerang', 'alamat')}
              className={copied === 'alamat' ? '' : 'shimmer-btn'}
              onMouseEnter={e => { if (copied !== 'alamat') { (e.currentTarget as HTMLButtonElement).style.background = C.navy; (e.currentTarget as HTMLButtonElement).style.color = C.white } }}
              onMouseLeave={e => { if (copied !== 'alamat') { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = C.navy } }}
              style={{ padding: '10px 22px', position: 'relative', overflow: 'hidden', background: copied === 'alamat' ? `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})` : 'transparent', border: `1.5px solid ${C.navy}`, color: copied === 'alamat' ? C.white : C.navy, borderRadius: '4px', fontFamily: F.body, fontSize: '11px', letterSpacing: '1.5px', cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              {copied === 'alamat' && <span className="copy-ripple" style={{ background: 'rgba(30,58,95,0.18)' }} />}
              {copied === 'alamat' ? '✓ Tersalin!' : 'Salin Alamat'}
            </button>
          </div>
        </div>
      </section>

      {/* ── MESSAGES ─────────────────────────────────────────────────────── */}
      <section className="reveal" style={{ background: C.white, padding: '80px 28px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <SectionLabel>Ucapan &amp; Doa</SectionLabel>
          <p style={{ fontFamily: F.display, fontSize: '36px', color: C.textDark, textAlign: 'center', marginBottom: '42px' }}>Kirim Do'a &amp; Selamat</p>
          {msgDone || guestMsgCount >= 3 ? (
            <div style={{ textAlign: 'center', padding: '24px 24px', border: `1px solid rgba(30,58,95,0.18)`, borderRadius: '8px', background: 'rgba(30,58,95,0.025)', marginBottom: '20px', overflow: 'hidden', position: 'relative', animation: 'successReveal 0.6s cubic-bezier(0.22,1,0.36,1) forwards' }}>
              <SongketBand color={C.navy} opacity={0.04} />
              <div style={{ padding: '0 0' }}>
                <p style={{ fontSize: '34px', marginBottom: '14px', marginTop: '16px' }}>💌</p>
                <p style={{ fontFamily: F.display, fontSize: '26px', color: C.navy, marginBottom: '8px' }}>Ucapanmu sudah terkirim!</p>
                <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 1.9, marginBottom: '28px' }}>Terima kasih atas do'a tulusmu 🤍</p>
              </div>
              <SongketBand color={C.navy} opacity={0.04} />
            </div>
          ) : (
            <div style={{ marginBottom: '44px' }}>
              <textarea
                value={msgText} onChange={e => setMsgText(e.target.value.slice(0, 280))} maxLength={280}
                placeholder="Tulis ucapan untuk mempelai..." rows={4}
                style={{ width: '100%', padding: '18px', border: `1.5px solid rgba(196,151,59,0.28)`, borderRadius: '6px', resize: 'none', fontFamily: F.body, fontSize: '14px', color: C.textDark, background: '#FAFAF8', lineHeight: 1.9, marginBottom: '6px', boxSizing: 'border-box' }}
              />
              <div style={{ textAlign: 'right', marginBottom: '10px', fontFamily: F.body, fontSize: '11px', letterSpacing: '0.5px', color: msgText.length >= 260 ? (msgText.length >= 280 ? '#C0392B' : '#C4973B') : 'rgba(0,0,0,0.28)', transition: 'color 0.2s ease' }}>
                {msgText.length}/280
              </div>
              <button
                onClick={submitMessage}
                disabled={!msgText.trim() || msgLoading || guestMsgCount >= 3}
                className={msgText.trim() && guestMsgCount < 3 ? 'shimmer-btn' : ''}
                onMouseEnter={e => { if (msgText.trim() && guestMsgCount < 3) { (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, ${C.navyDeep}, #0a1a2e)`; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 28px rgba(30,58,95,0.44)` } }}
                onMouseLeave={e => { if (msgText.trim() && guestMsgCount < 3) { (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})`; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 18px rgba(30,58,95,0.26)` } }}
                style={{ width: '100%', padding: '15px', background: msgText.trim() && guestMsgCount < 3 ? `linear-gradient(135deg, ${C.navy}, ${C.navyDeep})` : '#E8E0DC', color: msgText.trim() && guestMsgCount < 3 ? C.white : '#B0A09A', border: 'none', borderRadius: '5px', fontFamily: F.body, fontSize: '11px', letterSpacing: '3.5px', textTransform: 'uppercase', cursor: msgText.trim() && guestMsgCount < 3 ? 'pointer' : 'not-allowed', boxShadow: msgText.trim() && guestMsgCount < 3 ? `0 4px 18px rgba(30,58,95,0.26)` : 'none', transition: 'all 0.3s ease' }}
              >
                {msgLoading ? 'Mengirim...' : 'Kirim Ucapan'}
              </button>
            </div>
          )}
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 24px' }}>
              <p style={{ fontSize: '28px', marginBottom: '14px', opacity: 0.35 }}>✉️</p>
              <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textGhost }}>Jadilah yang pertama mengucapkan selamat 🤍</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <p style={{ fontFamily: F.body, fontSize: '11px', color: C.textLight, letterSpacing: '2px', textTransform: 'uppercase' }}>{messages.length} ucapan</p>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0.5, 0.8, 1].map((o, i) => <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.gold, opacity: o }} />)}
                </div>
              </div>
              <div id="messages-scroll" style={{ height: '300px', overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '4px', scrollbarWidth: 'thin', scrollbarColor: `${C.gold}40 transparent` }}>
                {(messages.length > 2 ? [...messages, ...messages] : messages).map((msg, i) => (
                  <div key={`${msg.id ?? 'opt'}-${i}`} className={msg.isNew ? 'msg-new' : ''} style={{ background: msg.isNew ? `linear-gradient(135deg, rgba(125,37,53,0.04), rgba(196,151,59,0.06))` : i % 2 === 0 ? '#FAFAF8' : C.cream, borderRadius: '8px', padding: '0 20px', border: msg.isNew ? `1px solid rgba(196,151,59,0.35)` : `1px solid rgba(196,151,59,0.13)`, boxShadow: msg.isNew ? `0 4px 20px rgba(125,37,53,0.08)` : '0 2px 10px rgba(44,24,16,0.03)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: msg.isNew ? `linear-gradient(135deg, rgba(125,37,53,0.2), rgba(196,151,59,0.2))` : `linear-gradient(135deg, rgba(125,37,53,0.12), rgba(30,58,95,0.12))`, border: `1px solid ${C.gold}${msg.isNew ? '55' : '28'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontSize: '15px', fontWeight: 600, color: C.burgundy, flexShrink: 0, marginTop: '16px' }}>
                        {msg.guest_name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: F.display, fontSize: '18px', fontWeight: 600, color: C.burgundy, lineHeight: 1, marginBottom: '0px' }}>{msg.guest_name}</p>
                        {msg.isNew && <p style={{ fontFamily: F.body, fontSize: '10px', color: C.gold, letterSpacing: '1.5px', marginTop: '3px' }}>BARU SAJA</p>}
                      </div>
                    </div>
                    <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textDark, lineHeight: 1.4, paddingLeft: '44px', marginBottom: '24px' }}>{msg.message}</p>
                  </div>
                ))}
              </div>
              <div style={{ position: 'absolute', top: '36px', left: 0, right: '6px', height: '30px', background: `linear-gradient(to bottom, ${C.white}, transparent)`, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: '6px', height: '40px', background: `linear-gradient(to bottom, transparent, ${C.white})`, pointerEvents: 'none' }} />
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: `linear-gradient(180deg, ${C.burgundyDeep} 0%, ${C.burgundy} 100%)`, color: C.white, position: 'relative', overflow: 'hidden' }}>
        <SongketBand color="rgba(255,255,255,1)" opacity={0.07} />
        <div style={{ padding: '72px 24px 60px', textAlign: 'center', position: 'relative' }}>
          <FloatingParticles />
          <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,151,59,0.09) 0%, transparent 68%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '-14px', marginBottom: '28px' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
              <p className="footer-name-shimmer" style={{ fontFamily: F.display, fontSize: 'clamp(36px,10vw,48px)', fontWeight: 300, letterSpacing: '2px', lineHeight: 1.05, margin: 0 }}>Vanya</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ height: '1px', width: '36px', background: 'rgba(196,151,59,0.3)' }} />
                <p style={{ fontFamily: F.display, fontSize: '18px', opacity: 0.42, margin: 0 }}>&amp;</p>
                <div style={{ height: '1px', width: '36px', background: 'rgba(196,151,59,0.3)' }} />
              </div>
              <p className="footer-name-shimmer" style={{ fontFamily: F.display, fontSize: 'clamp(36px,10vw,48px)', fontWeight: 300, letterSpacing: '2px', lineHeight: 1.05, margin: 0 }}>Faiz</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Diamond size={3} color="rgba(196,151,59,0.38)" />
              <p style={{ fontFamily: F.body, fontSize: '10px', opacity: 0.38, letterSpacing: '3px', textTransform: 'uppercase' }}>26 Juni 2026 · Jakarta</p>
              <Diamond size={3} color="rgba(196,151,59,0.38)" />
            </div>
          </div>
        </div>
        <SongketBand color="rgba(255,255,255,1)" opacity={0.07} />
      </footer>
    </div>

    {/* ── FLOATING MUSIC BUTTON ────────────────────────────────────────────── */}
    <button
      onClick={toggleMute} title={muted ? 'Nyalakan musik' : 'Matikan musik'}
      style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(250,247,240,0.15)', backdropFilter: 'blur(12px) saturate(160%)', WebkitBackdropFilter: 'blur(12px) saturate(160%)', border: `1.5px solid rgba(196,151,59,0.35)`, color: C.gold, fontSize: '16px', boxShadow: '0 4px 20px rgba(125,37,53,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s ease, opacity 0.2s ease' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {muted ? '🔇' : '🎵'}
    </button>

    {/* ── RSVP DUPLICATE WARNING ───────────────────────────────────────────── */}
    {showRsvpWarning && (
      <>
        <div onClick={closeRsvpWarning} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(20,10,8,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: `${rsvpWarningClosing ? 'fadeOut' : 'fadeIn'} 0.28s ease forwards` }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', pointerEvents: 'none' }}>
          <div style={{ width: '100%', maxWidth: '400px', background: C.white, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(44,24,16,0.22), 0 4px 0 rgba(196,151,59,0.18)', pointerEvents: 'all', animation: `${rsvpWarningClosing ? 'dialogFadeOut' : 'dialogFadeIn'} 0.32s cubic-bezier(0.16,1,0.3,1) forwards` }}>
            <SongketBand color={C.gold} opacity={0.1} />
            <div style={{ padding: '32px 28px 36px', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `rgba(125,37,53,0.07)`, border: `1px solid rgba(125,37,53,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 20px' }}>⚠️</div>
              <p style={{ fontFamily: F.display, fontSize: '26px', color: C.textDark, marginBottom: '12px', lineHeight: 1.2 }}>Konfirmasi Sudah Ada</p>
              <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 2, marginBottom: '32px' }}>
                Kamu sudah pernah mengirimkan konfirmasi kehadiran sebelumnya. Apakah kamu ingin menggantikannya dengan konfirmasi yang baru?
              </p>
              <button onClick={() => submitRsvp(true)} className="shimmer-btn" style={{ width: '100%', padding: '15px', background: `linear-gradient(135deg, ${C.burgundy}, ${C.burgundyDeep})`, color: C.white, border: 'none', borderRadius: '5px', fontFamily: F.body, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '10px', boxShadow: `0 4px 18px rgba(125,37,53,0.26)`, position: 'relative', overflow: 'hidden' }}>
                Ya, Ganti Konfirmasi
              </button>
              <button onClick={closeRsvpWarning} style={{ width: '100%', padding: '14px', background: 'transparent', color: C.textLight, border: `1.5px solid rgba(196,151,59,0.28)`, borderRadius: '5px', fontFamily: F.body, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer' }}>
                Tidak, Batalkan
              </button>
            </div>
            <SongketBand color={C.gold} opacity={0.06} />
          </div>
        </div>
      </>
    )}

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <p style={{ fontFamily: F.body, fontSize: '10px', opacity: 0.65, letterSpacing: '2px', textTransform: 'uppercase', padding: '12px 0' }}>
        Made with ❤️ by Faizuddarain Syam
      </p>
    </div>
    </>
  )
}