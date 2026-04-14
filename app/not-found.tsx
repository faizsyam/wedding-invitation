export default function NotFound() {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#FAF7F0', padding: '32px', textAlign: 'center',
      }}>
        <p style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', color: '#7D2535', marginBottom: '10px' }}>
          Undangan Tidak Ditemukan
        </p>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: '14px', color: '#9B7B73', lineHeight: 1.9 }}>
          Tautan undangan ini tidak valid atau sudah tidak aktif.<br />
          Silakan periksa kembali tautan yang Anda terima.
        </p>
      </div>
    )
  }