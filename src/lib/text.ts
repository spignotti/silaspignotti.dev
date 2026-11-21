import type { Lang } from '@/i18n'

/** Marker for copy that must never be rendered. Split so the source does not contain the token. */
const BLOCK = '[' + 'OFFEN'

export function containsBlocked(text: string | undefined): boolean {
  return typeof text === 'string' && text.includes(BLOCK)
}

/** Drop comments, sentences and bracket notes that contain the blocked marker. */
export function omitBlocked(text: string): string {
  let out = text.replace(/<!--[\s\S]*?-->/g, (comment) => (containsBlocked(comment) ? '' : comment))
  while (containsBlocked(out)) {
    const i = out.indexOf(BLOCK)
    const j = out.indexOf(']', i)
    if (j === -1) {
      out = out.slice(0, i)
      break
    }
    let start = i
    if (start > 0 && out[start - 1] === ' ') start -= 1
    out = out.slice(0, start) + out.slice(j + 1)
  }
  return out
}

/** No-break space before a middle dot, so a heading never breaks onto the dot. */
export function headingNbsp(text: string): string {
  return text.replace(/ ·/g, '\u00A0·')
}

const NOTE: Record<Lang, string> = {
  de: 'Illustrativ, keine Messdaten',
  en: 'Illustrative, not measured data',
}

/** The raster note is rendered only while the manifest says the data is illustrative. */
export function illustrativeNote(manifest: { illustrative?: boolean }, lang: Lang): string | null {
  return manifest.illustrative === true ? NOTE[lang] : null
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

/** Render the inline marks used in the copy: bold, italics, code and links. */
export function inlineHtml(src: string, linkClass = 'tl'): string {
  const parts = src.split(INLINE)
  return parts
    .map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return `<em>${escapeHtml(part.slice(1, -1))}</em>`
      }
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link) {
        const label = inlineHtml(link[1] ?? '', linkClass)
        const href = link[2] ?? ''
        const external = /^https?:\/\//.test(href)
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : ''
        return `<a class="${linkClass}" href="${escapeHtml(href)}"${attrs}>${label}</a>`
      }
      return escapeHtml(part)
    })
    .join('')
}

const CASE_PREFIX: Record<Lang, string> = {
  de: '/projekte/',
  en: '/en/projects/',
}

/** Split on ", " outside a markdown link label or target. */
function proofItems(proof: string): string[] {
  const items: string[] = []
  let start = 0
  let square = 0
  let paren = 0
  for (let i = 0; i < proof.length; i++) {
    const ch = proof[i]
    if (ch === '[') square += 1
    else if (ch === ']') square = Math.max(0, square - 1)
    else if (ch === '(') paren += 1
    else if (ch === ')') paren = Math.max(0, paren - 1)
    else if (ch === ',' && proof[i + 1] === ' ' && square === 0 && paren === 0) {
      items.push(proof.slice(start, i))
      start = i + 2
      i += 1
    }
  }
  items.push(proof.slice(start))
  return items.map((item) => item.trim()).filter((item) => item.length > 0)
}

function linksMissingCase(item: string, slugs: ReadonlySet<string>, lang: Lang): boolean {
  for (const match of item.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const href = (match[1] ?? '').split(/[?#]/)[0] ?? ''
    const prefix = CASE_PREFIX[lang]
    if (!href.startsWith(prefix)) continue
    const slug = href.slice(prefix.length).replace(/\/$/, '')
    if (slug.length > 0 && !slug.includes('/') && !slugs.has(slug)) return true
  }
  return false
}

/** Drop proof items whose case link has no matching case. External links and plain text stay. */
export function pruneDeadCaseLinks(proof: string, slugs: readonly string[], lang: Lang): string {
  const known = new Set(slugs)
  return proofItems(proof)
    .filter((item) => !linksMissingCase(item, known, lang))
    .join(', ')
}

/** Link the "how I work" phrase. The visible words stay as written. */
export function linkifySectionPhrase(html: string, lang: Lang): string {
  const phrase = lang === 'de' ? 'Abschnitt „So arbeite ich“' : 'section "How I work"'
  const href = lang === 'de' ? '#so-arbeite-ich' : '#how-i-work'
  if (html.includes(`href="${href}"`)) return html
  const escaped = escapeHtml(phrase)
  if (!html.includes(escaped)) return html
  return html.replace(escaped, `<a class="tl tl-acc" href="${href}">${escaped}</a>`)
}
