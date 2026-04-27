/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',        value: '1; mode=block' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                : "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://maps.googleapis.com`,
              "frame-src https://www.google.com https://maps.google.com",
              "img-src 'self' data: blob: https://*.supabase.co https://*.googleapis.com https://*.gstatic.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; ')
          },
        ],
      },
    ]
  },
}
module.exports = nextConfig