'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Guest = {
  id: number
  name: string
  slug: string
  created_at: string
}

type Message = {
  id?: number
  guest_name: string
  message: string
  created_at?: string
}

type Countdown = { d: number; h: number; m: number; s: number }

const C = {
  cream: '#FAF7F0',
  white: '#FFFFFF',
  burgundy: '#7D2535',
  navy: '#1E3A5F',
  gold: '#C4973B',
  textDark: '#2C1810',
  textLight: '#9B7B73',
}
const F = {
  display: "'Cormorant Garamond', serif",
  body: "'Nunito', sans-serif",
  arabic: "'Scheherazade New', serif",
}

function Diamond({ size = 7, color = C.gold, style = {} }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      background: color, transform: 'rotate(45deg)', ...style,
    }} />
  )
}

function Divider({ color = C.gold }: { color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px auto', maxWidth: '220px' }}>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${color})` }} />
      <Diamond size={6} color={color} />
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${color})` }} />
    </div>
  )
}

function Corner({ pos }: { pos: string }) {
  const t = pos[0] === 't', l = pos[1] === 'l'
  return (
    <div style={{
      position: 'absolute',
      [t ? 'top' : 'bottom']: '10px',
      [l ? 'left' : 'right']: '10px',
      width: '26px', height: '26px',
      borderTop: t ? `1.5px solid ${C.gold}` : 'none',
      borderBottom: !t ? `1.5px solid ${C.gold}` : 'none',
      borderLeft: l ? `1.5px solid ${C.gold}` : 'none',
      borderRight: !l ? `1.5px solid ${C.gold}` : 'none',
      opacity: 0.55,
    }} />
  )
}

function CdBox({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        background: C.burgundy, color: C.white, width: '60px', height: '60px',
        borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: F.display, fontSize: '26px', fontWeight: 600,
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <p style={{ fontFamily: F.body, fontSize: '10px', color: C.textLight, marginTop: '6px', letterSpacing: '2px', textTransform: 'uppercase' }}>
        {label}
      </p>
    </div>
  )
}

export default function InviteClient({ guest }: { guest: Guest }) {
  const [opened, setOpened] = useState(false)
  const [cd, setCd] = useState<Countdown>({ d: 0, h: 0, m: 0, s: 0 })
  const [attending, setAttending] = useState<boolean | null>(null)
  const [pax, setPax] = useState(1)
  const [note, setNote] = useState('')
  const [rsvpDone, setRsvpDone] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [msgText, setMsgText] = useState('')
  const [msgDone, setMsgDone] = useState(false)
  const [msgLoading, setMsgLoading] = useState(false)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const target = new Date('2026-06-26T08:00:00+07:00').getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff > 0) setCd({
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff % 86400000 / 3600000),
        m: Math.floor(diff % 3600000 / 60000),
        s: Math.floor(diff % 60000 / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!opened) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    }, 200)
    return () => obs.disconnect()
  }, [opened])

  useEffect(() => { loadMessages() }, [])

  async function loadMessages() {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50)
    if (data) setMessages(data)
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
    setTimeout(() => setCopied(''), 2000)
  }

  const S: React.CSSProperties = { maxWidth: '480px', margin: '0 auto', padding: '56px 24px' }
  const bgPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect x='14' y='1' width='4' height='4' transform='rotate(45 16 3)' fill='%23C4973B'/%3E%3C/svg%3E")`

  if (!opened) return (
    <div style={{
      minHeight: '100vh', background: C.cream,
      backgroundImage: `radial-gradient(ellipse at 30% 20%, rgba(125,37,53,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(30,58,95,0.05) 0%, transparent 50%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.05, backgroundImage: bgPattern }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '360px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.93)', border: `1px solid rgba(196,151,59,0.4)`,
          borderRadius: '6px', padding: '52px 36px 44px',
          position: 'relative', textAlign: 'center',
          boxShadow: '0 8px 48px rgba(125,37,53,0.08)',
        }}>
          <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
          <div style={{ marginBottom: '20px' }}>
            <Diamond size={5} color={C.gold} style={{ margin: '0 5px' }} />
            <Diamond size={8} color={C.gold} style={{ margin: '0 5px' }} />
            <Diamond size={5} color={C.gold} style={{ margin: '0 5px' }} />
          </div>
          <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '24px' }}>
            Undangan Pernikahan
          </p>
          <p style={{ fontFamily: F.display, fontSize: '13px', color: C.textLight, fontStyle: 'italic', marginBottom: '4px' }}>Kepada Yth.</p>
          <p style={{ fontFamily: F.display, fontSize: '24px', fontWeight: 600, color: C.burgundy, marginBottom: '24px', lineHeight: 1.3 }}>
            {guest.name}
          </p>
          <Divider />
          <p style={{ fontFamily: F.display, fontSize: '34px', fontWeight: 300, color: C.textDark, letterSpacing: '1px', lineHeight: 1.1 }}>
            [Nama Pria]
          </p>
          <p style={{ fontFamily: F.display, fontSize: '16px', color: C.gold, fontStyle: 'italic', margin: '2px 0' }}>dan</p>
          <p style={{ fontFamily: F.display, fontSize: '34px', fontWeight: 300, color: C.textDark, letterSpacing: '1px', lineHeight: 1.1, marginBottom: '24px' }}>
            [Nama Wanita]
          </p>
          <p style={{ fontFamily: F.body, fontSize: '12px', color: C.textLight, letterSpacing: '2px', marginBottom: '32px' }}>
            26 Juni 2026 · Jakarta
          </p>
          <button onClick={() => setOpened(true)} style={{
            display: 'block', width: '100%', padding: '15px',
            background: C.burgundy, color: C.white, border: 'none',
            borderRadius: '3px', cursor: 'pointer',
            fontFamily: F.body, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase',
          }}>
            Buka Undangan
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: C.cream }}>

      <section className="reveal" style={{
        background: `linear-gradient(180deg, rgba(125,37,53,0.06) 0%, ${C.cream} 100%)`,
        padding: '72px 24px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.035, backgroundImage: bgPattern }} />
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          <p style={{ fontFamily: F.arabic, fontSize: '36px', color: C.burgundy, lineHeight: 1.9, marginBottom: '4px' }}>
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '40px' }}>
            Undangan Pernikahan
          </p>
          <Divider />
          <p style={{ fontFamily: F.display, fontSize: '52px', fontWeight: 300, color: C.textDark, lineHeight: 1.05, letterSpacing: '1px' }}>
            [Nama Pria]
          </p>
          <p style={{ fontFamily: F.display, fontSize: '22px', color: C.gold, fontStyle: 'italic', margin: '4px 0' }}>dan</p>
          <p style={{ fontFamily: F.display, fontSize: '52px', fontWeight: 300, color: C.textDark, lineHeight: 1.05, letterSpacing: '1px', marginBottom: '32px' }}>
            [Nama Wanita]
          </p>
          <Divider />
          <p style={{ fontFamily: F.body, fontSize: '14px', color: C.textLight, letterSpacing: '1px', margin: '8px 0 40px' }}>
            Jum'at, 26 Juni 2026
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <CdBox value={cd.d} label="Hari" />
            <CdBox value={cd.h} label="Jam" />
            <CdBox value={cd.m} label="Menit" />
            <CdBox value={cd.s} label="Detik" />
          </div>
        </div>
      </section>

      <section className="reveal" style={{ ...S, textAlign: 'center' }}>
        <p style={{ fontFamily: F.body, fontSize: '11px', letterSpacing: '3px', color: C.textLight, textTransform: 'uppercase', marginBottom: '32px' }}>
          Assalamu'alaikum Warahmatullahi Wabarakatuh
        </p>
        <div style={{
          background: C.white, border: `1px solid rgba(196,151,59,0.25)`,
          borderRadius: '6px', padding: '32px 28px', marginBottom: '32px', position: 'relative',
        }}>
          <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
          <p style={{ fontFamily: F.arabic, fontSize: '20px', color: C.navy, lineHeight: 2.2, direction: 'rtl', marginBottom: '16px' }}>
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجاً لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
          </p>
          <p style={{ fontFamily: F.display, fontSize: '15px', color: C.textLight, fontStyle: 'italic', lineHeight: 1.9, marginBottom: '8px' }}>
            "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."
          </p>
          <p style={{ fontFamily: F.body, fontSize: '12px', color: C.gold, letterSpacing: '1px' }}>QS. Ar-Rum: 21</p>
        </div>
        <p style={{ fontFamily: F.body, fontSize: '14px', color: C.textDark, lineHeight: 2, marginBottom: '12px' }}>
          Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta'ala, kami mengundang
        </p>
        <p style={{ fontFamily: F.display, fontSize: '28px', fontWeight: 600, color: C.burgundy, marginBottom: '12px' }}>
          {guest.name}
        </p>
        <p style={{ fontFamily: F.body, fontSize: '14px', color: C.textDark, lineHeight: 2, marginBottom: '24px' }}>
          untuk hadir memberikan do'a restu pada acara pernikahan kami. Kehadiran Anda adalah kehormatan dan kebahagiaan yang sangat berarti bagi kami sekeluarga.
        </p>
        <p style={{ fontFamily: F.body, fontSize: '11px', letterSpacing: '3px', color: C.textLight, textTransform: 'uppercase' }}>
          Wassalamu'alaikum Warahmatullahi Wabarakatuh
        </p>
      </section>

      <section className="reveal" style={{ background: C.white, padding: '56px 24px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '40px' }}>
            Mempelai
          </p>
          {[
            { emoji: '🤵', label: 'Pria', role: 'Putra' },
            { emoji: '👰', label: 'Wanita', role: 'Putri' },
          ].map((m, i) => (
            <div key={i}>
              {i === 1 && <Divider />}
              <div style={{ marginTop: i === 1 ? '32px' : 0 }}>
                <div style={{
                  width: '110px', height: '110px', borderRadius: '50%',
                  border: `2px solid ${C.burgundy}`, margin: '0 auto 16px',
                  background: `linear-gradient(135deg, rgba(125,37,53,0.08), rgba(30,58,95,0.08))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px',
                }}>
                  {m.emoji}
                </div>
                <p style={{ fontFamily: F.display, fontSize: '30px', fontWeight: 600, color: C.burgundy, marginBottom: '6px' }}>
                  [Nama Lengkap {m.label}]
                </p>
                <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 1.9 }}>
                  {m.role} dari<br />[Nama Ayah] & [Nama Ibu]
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="reveal" style={{ ...S }}>
        <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
          Rangkaian Acara
        </p>
        <p style={{ fontFamily: F.display, fontSize: '32px', color: C.textDark, textAlign: 'center', marginBottom: '36px' }}>
          Hari Istimewa Kami
        </p>
        {[
          { bg: C.burgundy, title: 'Akad Nikah', time: '08.00 WIB', place: '[Nama Tempat Akad]' },
          { bg: C.navy, title: 'Resepsi Pernikahan', time: '11.00 – 15.00 WIB', place: 'Pejaten Terrace, Jakarta Selatan' },
        ].map((ev, i) => (
          <div key={i} style={{
            background: ev.bg, borderRadius: '6px', padding: '32px 28px',
            marginBottom: i === 0 ? '14px' : 0, position: 'relative',
            overflow: 'hidden', color: C.white,
          }}>
            <div style={{ position: 'absolute', right: -16, top: -16, width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '10px' }}>
              {ev.title}
            </p>
            <p style={{ fontFamily: F.display, fontSize: '26px', fontWeight: 600, marginBottom: '6px' }}>
              Jum'at, 26 Juni 2026
            </p>
            <p style={{ fontFamily: F.body, fontSize: '15px', opacity: 0.85, marginBottom: '4px' }}>{ev.time}</p>
            <p style={{ fontFamily: F.body, fontSize: '13px', opacity: 0.65 }}>{ev.place}</p>
          </div>
        ))}
      </section>

      <section className="reveal" style={{ paddingBottom: '56px' }}>
        <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '24px', textAlign: 'center' }}>
          Lokasi
        </p>
        <div style={{ width: '100%', height: '280px', overflow: 'hidden', marginBottom: '20px' }}>
          <iframe
            src="https://maps.google.com/maps?q=Pejaten+Terrace+Jl+Warung+Jati+Barat+No+39+Jakarta+Selatan&output=embed&hl=id"
            width="100%" height="280"
            style={{ border: 'none', display: 'block' }}
            loading="lazy"
            title="Pejaten Terrace"
          />
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: F.display, fontSize: '24px', color: C.textDark, marginBottom: '4px' }}>Pejaten Terrace</p>
          <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 1.9, marginBottom: '20px' }}>
            Jl. Warung Jati Barat No.39<br />Pejaten Timur, Pasar Minggu, Jakarta Selatan
          </p>
          <a href="https://maps.app.goo.gl/bxiGv4QxUE3u2bNPA" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', padding: '12px 28px',
            border: `2px solid ${C.navy}`, color: C.navy,
            fontFamily: F.body, fontSize: '12px',
            letterSpacing: '2px', textTransform: 'uppercase',
            textDecoration: 'none', borderRadius: '3px',
          }}>
            Buka di Google Maps →
          </a>
        </div>
      </section>

      <section className="reveal" style={{ background: C.white, padding: '56px 24px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '8px' }}>
            Konfirmasi Kehadiran
          </p>
          <p style={{ fontFamily: F.display, fontSize: '32px', color: C.textDark, marginBottom: '8px' }}>
            Apakah kamu hadir?
          </p>
          <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, lineHeight: 1.8, marginBottom: '36px' }}>
            Mohon konfirmasi paling lambat<br />19 Juni 2026
          </p>
          {rsvpDone ? (
            <div style={{ border: `1px solid ${C.burgundy}`, borderRadius: '6px', padding: '40px 24px', background: 'rgba(125,37,53,0.04)' }}>
              <p style={{ fontSize: '36px', marginBottom: '12px' }}>🤍</p>
              <p style={{ fontFamily: F.display, fontSize: '24px', color: C.burgundy, marginBottom: '8px' }}>
                Terima kasih, {guest.name.split(' ')[0]}!
              </p>
              <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight }}>
                Konfirmasi kehadiranmu sudah kami terima.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {[
                  { val: true, label: '✓  Hadir', color: C.burgundy },
                  { val: false, label: '✗  Tidak Hadir', color: '#8B7D78' }
                ].map(({ val, label, color }) => (
                  <button key={label} onClick={() => setAttending(val)} style={{
                    flex: 1, padding: '14px 8px',
                    background: attending === val ? color : C.white,
                    color: attending === val ? C.white : color,
                    border: `2px solid ${color}`, borderRadius: '3px',
                    fontFamily: F.body, fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
              {attending === true && (
                <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                  <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, marginBottom: '10px' }}>
                    Jumlah tamu yang hadir
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => setPax(p => Math.max(1, p - 1))} style={{ width: '40px', height: '40px', borderRadius: '3px', border: `1px solid ${C.burgundy}`, background: C.white, color: C.burgundy, fontSize: '20px', cursor: 'pointer' }}>−</button>
                    <span style={{ fontFamily: F.display, fontSize: '32px', color: C.textDark }}>{pax}</span>
                    <button onClick={() => setPax(p => Math.min(10, p + 1))} style={{ width: '40px', height: '40px', borderRadius: '3px', border: `1px solid ${C.burgundy}`, background: C.white, color: C.burgundy, fontSize: '20px', cursor: 'pointer' }}>+</button>
                    <span style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight }}>orang</span>
                  </div>
                </div>
              )}
              <textarea
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="Pesan untuk mempelai (opsional)"
                rows={3} style={{
                  width: '100%', padding: '14px 16px',
                  border: `1px solid rgba(196,151,59,0.35)`,
                  borderRadius: '4px', resize: 'none',
                  fontFamily: F.body, fontSize: '14px', color: C.textDark,
                  background: '#FAFAF8', outline: 'none',
                  lineHeight: 1.7, marginBottom: '14px',
                }}
              />
              <button onClick={submitRsvp} disabled={attending === null || rsvpLoading} style={{
                width: '100%', padding: '15px',
                background: attending !== null ? C.burgundy : '#DDD',
                color: C.white, border: 'none', borderRadius: '3px',
                fontFamily: F.body, fontSize: '12px',
                letterSpacing: '3px', textTransform: 'uppercase',
                cursor: attending !== null ? 'pointer' : 'not-allowed',
              }}>
                {rsvpLoading ? 'Mengirim...' : 'Kirim Konfirmasi'}
              </button>
            </>
          )}
        </div>
      </section>

      <section className="reveal" style={{ ...S }}>
        <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
          Amplop Digital
        </p>
        <p style={{ fontFamily: F.display, fontSize: '28px', color: C.textDark, textAlign: 'center', marginBottom: '10px' }}>
          Hadiah & Do'a Tulus
        </p>
        <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, textAlign: 'center', lineHeight: 1.9, marginBottom: '36px' }}>
          Kehadiran dan do'a restu Anda adalah hadiah terbesar.<br />Namun jika berkenan, berikut informasinya.
        </p>
        <div style={{ background: C.white, border: `1px solid rgba(196,151,59,0.25)`, borderRadius: '6px', padding: '24px', marginBottom: '14px' }}>
          <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: C.textLight, marginBottom: '8px' }}>
            Transfer Bank
          </p>
          <p style={{ fontFamily: F.display, fontSize: '20px', color: C.textDark, marginBottom: '4px' }}>Bank [Nama Bank]</p>
          <p style={{ fontFamily: F.body, fontSize: '22px', fontWeight: 700, color: C.burgundy, letterSpacing: '2px', marginBottom: '4px' }}>
            [Nomor Rekening]
          </p>
          <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, marginBottom: '14px' }}>a.n. [Nama Pemilik]</p>
          <button onClick={() => copyText('[Nomor Rekening]', 'rek')} style={{
            padding: '8px 20px', background: 'transparent',
            border: `1px solid ${C.burgundy}`, color: C.burgundy,
            borderRadius: '3px', fontFamily: F.body, fontSize: '12px',
            letterSpacing: '1px', cursor: 'pointer',
          }}>
            {copied === 'rek' ? '✓ Tersalin!' : 'Salin Nomor'}
          </button>
        </div>
        <div style={{ background: C.white, border: `1px solid rgba(196,151,59,0.25)`, borderRadius: '6px', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: C.textLight, marginBottom: '16px' }}>
            QRIS
          </p>
          <div style={{
            width: '160px', height: '160px', margin: '0 auto',
            background: '#F5F2EE', borderRadius: '6px',
            border: `2px dashed rgba(196,151,59,0.35)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <p style={{ fontFamily: F.body, fontSize: '12px', color: C.textLight, padding: '16px', textAlign: 'center' }}>
              [Upload QRIS di sini]
            </p>
          </div>
        </div>
      </section>

      <section className="reveal" style={{ background: C.white, padding: '56px 24px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <p style={{ fontFamily: F.body, fontSize: '10px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
            Ucapan & Doa
          </p>
          <p style={{ fontFamily: F.display, fontSize: '32px', color: C.textDark, textAlign: 'center', marginBottom: '36px' }}>
            Kirim Do'a & Selamat
          </p>
          {msgDone ? (
            <div style={{ textAlign: 'center', padding: '32px', border: `1px solid ${C.navy}`, borderRadius: '6px', background: 'rgba(30,58,95,0.04)', marginBottom: '32px' }}>
              <p style={{ fontSize: '28px', marginBottom: '8px' }}>💌</p>
              <p style={{ fontFamily: F.display, fontSize: '22px', color: C.navy }}>Ucapanmu sudah terkirim!</p>
            </div>
          ) : (
            <div style={{ marginBottom: '36px' }}>
              <textarea
                value={msgText} onChange={e => setMsgText(e.target.value)}
                placeholder="Tulis ucapan untuk mempelai..."
                rows={4} style={{
                  width: '100%', padding: '16px',
                  border: `1px solid rgba(196,151,59,0.35)`,
                  borderRadius: '4px', resize: 'none',
                  fontFamily: F.body, fontSize: '14px', color: C.textDark,
                  background: '#FAFAF8', outline: 'none',
                  lineHeight: 1.8, marginBottom: '12px',
                }}
              />
              <button onClick={submitMessage} disabled={!msgText.trim() || msgLoading} style={{
                width: '100%', padding: '14px',
                background: msgText.trim() ? C.navy : '#DDD',
                color: C.white, border: 'none', borderRadius: '3px',
                fontFamily: F.body, fontSize: '12px',
                letterSpacing: '3px', textTransform: 'uppercase',
                cursor: msgText.trim() ? 'pointer' : 'not-allowed',
              }}>
                {msgLoading ? 'Mengirim...' : 'Kirim Ucapan'}
              </button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 ? (
              <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textLight, textAlign: 'center', padding: '32px' }}>
                Jadilah yang pertama mengucapkan selamat 🤍
              </p>
            ) : messages.map((msg, i) => (
              <div key={msg.id ?? i} style={{ background: '#FAFAF8', borderRadius: '6px', padding: '18px 20px', border: `1px solid rgba(196,151,59,0.18)` }}>
                <p style={{ fontFamily: F.display, fontSize: '18px', fontWeight: 600, color: C.burgundy, marginBottom: '4px' }}>
                  {msg.guest_name}
                </p>
                <p style={{ fontFamily: F.body, fontSize: '13px', color: C.textDark, lineHeight: 1.8 }}>
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: C.burgundy, color: C.white, padding: '56px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <p style={{ fontFamily: F.arabic, fontSize: '28px', lineHeight: 2, marginBottom: '6px' }}>
            بَارَكَ اللّٰهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
          </p>
          <p style={{ fontFamily: F.display, fontSize: '14px', fontStyle: 'italic', opacity: 0.75, marginBottom: '40px', lineHeight: 1.9 }}>
            "Semoga Allah memberkahi kalian berdua dan mengumpulkan kalian dalam kebaikan."
          </p>
          <Divider color="rgba(255,255,255,0.3)" />
          <p style={{ fontFamily: F.display, fontSize: '42px', fontWeight: 300, letterSpacing: '2px', lineHeight: 1.1 }}>
            [Nama Pria]
          </p>
          <p style={{ fontFamily: F.display, fontSize: '18px', opacity: 0.55, margin: '2px 0' }}>&</p>
          <p style={{ fontFamily: F.display, fontSize: '42px', fontWeight: 300, letterSpacing: '2px', lineHeight: 1.1, marginBottom: '32px' }}>
            [Nama Wanita]
          </p>
          <p style={{ fontFamily: F.body, fontSize: '10px', opacity: 0.4, letterSpacing: '3px', textTransform: 'uppercase' }}>
            26 Juni 2026 · Jakarta
          </p>
        </div>
      </footer>
    </div>
  )
}