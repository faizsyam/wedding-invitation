/**
 * Server-side input sanitization utilities.
 * These strip dangerous characters, normalize whitespace, and validate format
 * before any data touches the database or is served to other users.
 */

/**
 * Strips HTML tags, null/control bytes, and normalizes whitespace.
 * Returns an empty string if the input is not a string.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars except tab, LF, CR
    .trim()
}

/**
 * Truncates text to a maximum length. Does NOT add ellipsis.
 */
export function truncateText(input: string, maxLength: number): string {
  return input.length > maxLength ? input.slice(0, maxLength) : input
}

/**
 * Validates a guest slug: only URL-safe alphanumeric, hyphens, underscores.
 * Returns null if invalid. Returns the trimmed lowercase slug if valid.
 */
export function validateSlug(slug: unknown): string | null {
  if (typeof slug !== 'string') return null
  const trimmed = slug.trim().toLowerCase()
  if (trimmed.length === 0 || trimmed.length > 128) return null
  if (!/^[a-z0-9_-]+$/.test(trimmed)) return null
  return trimmed
}
