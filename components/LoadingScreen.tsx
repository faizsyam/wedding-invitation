'use client'
import { C, F } from '../app/invite/[slug]/ui'

export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: C.cream,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
    }}>
      <p style={{
        fontFamily: F.display,
        fontSize: '15px',
        fontStyle: 'italic',
        color: C.textLight,
        letterSpacing: '1.5px',
        margin: 0,
      }}>
        Menyiapkan undangan..
      </p>
      <div style={{
        width: '120px',
        height: '1.5px',
        background: `rgba(196,151,59,0.18)`,
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          height: '100%',
          width: '45%',
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          animation: 'loadingSlide 1.6s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}