import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function scanImages(dir: string, base: string): string[] {
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const urlPath  = `${base}/${entry.name}`

    if (entry.isDirectory()) {
      results.push(...scanImages(fullPath, urlPath))
    } else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) {
      results.push(urlPath)
    }
  }

  return results
}

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public')
  const images = scanImages(publicDir, '')
  return NextResponse.json(images)
}