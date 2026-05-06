'use client'
import { C, F } from '../app/invite/[slug]/ui'

interface Props {
  progress: number  // 0–100
}

export default function LoadingScreen({ progress }: Props) {
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

      {/* Track */}
      <div style={{
        width: '140px',
        height: '1.5px',
        background: `rgba(196,151,59,0.15)`,
        borderRadius: '2px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Fill */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${C.gold}80, ${C.gold}, #EDD89A, ${C.gold})`,
          backgroundSize: '200% 100%',
          borderRadius: '2px',
          transition: 'width 0.3s ease',
          animation: 'shimmerSweepBg 1.8s infinite linear',
        }} />
      </div>

      {/* Percentage */}
      <p style={{
        fontFamily: F.body,
        fontSize: '10px',
        letterSpacing: '3px',
        color: `rgba(196,151,59,0.55)`,
        margin: 0,
      }}>
        {Math.round(progress)}%
      </p>
    </div>
  )
}