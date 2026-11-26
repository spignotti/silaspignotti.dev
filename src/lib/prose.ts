export type LinkItem = { label: string; href: string }

export type HomeContent = {
  name: string
  fieldLine: string
  areasTitle: string
  projectsTitle: string
  projectsIntro: string
  aboutTitle: string
  about: string[]
  aboutLink: LinkItem | null
  contactTitle: string
  contactLead: string
  contactLinks: LinkItem[]
}

export type CaseSection = { heading: string; id: string; paragraphs: string[] }

function sliceSection(body: string, index: number): string {
  const marks = [...body.matchAll(/^## .+$/gm)]
  const start = marks[index]
  if (!start || start.index === undefined) return ''
  const from = start.index + start[0].length
  const end = marks[index + 1]?.index ?? body.length
  return body.slice(from, end).trim()
}

function headings(body: string): string[] {
  return [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1] ?? '')
}

function paragraphs(block: string): string[] {
  return block
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
}

function linksIn(block: string): LinkItem[] {
  return [...block.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((match) => ({
    label: match[1] ?? '',
    href: match[2] ?? '',
  }))
}

function onlyLink(paragraph: string): LinkItem | null {
  const match = paragraph.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
  return match ? { label: match[1] ?? '', href: match[2] ?? '' } : null
}

/** Text between the h1 and the first h2. */
function leadBlock(body: string): string {
  return body.split(/^## /m)[0]?.replace(/^# .+\n*/, '').trim() ?? ''
}

function firstLine(block: string): string {
  return (
    block
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? ''
  )
}

export function parseHome(body: string): HomeContent {
  const name = body.match(/^# (.+)$/m)?.[1]?.trim() ?? ''
  const heads = headings(body)

  const aboutParagraphs = paragraphs(sliceSection(body, 2))
  const aboutLink = aboutParagraphs.map(onlyLink).find((link) => link !== null) ?? null
  const about = aboutParagraphs.filter((paragraph) => onlyLink(paragraph) === null)

  const contactBlock = sliceSection(body, 3)
  const contactLines = contactBlock.split('\n').map((line) => line.trim()).filter(Boolean)
  const contactLead = contactLines.find((line) => !line.startsWith('-')) ?? ''
  const contactLinks = linksIn(contactLines.filter((line) => line.startsWith('-')).join('\n'))

  return {
    name,
    fieldLine: firstLine(leadBlock(body)),
    areasTitle: heads[0] ?? '',
    projectsTitle: heads[1] ?? '',
    projectsIntro: paragraphs(sliceSection(body, 1)).join(' '),
    aboutTitle: heads[2] ?? '',
    about,
    aboutLink,
    contactTitle: heads[3] ?? '',
    contactLead,
    contactLinks,
  }
}

/** A copy placeholder, marked in the renderer with class "ph". Link-only lines are not placeholders. */
export function isPlaceholder(text: string): boolean {
  return /^\[(?:Platzhalter|Placeholder)\b/.test(text.trim())
}

export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parseSections(body: string): CaseSection[] {
  return headings(body)
    .map((heading, index) => ({
      heading,
      id: slugifyHeading(heading),
      paragraphs: paragraphs(sliceSection(body, index)).filter(
        (paragraph) => isPlaceholder(paragraph) || !paragraph.startsWith('['),
      ),
    }))
    .filter((section) => section.id !== '')
}

export type PageIntro = { title: string; intro: string; furtherTitle: string }

export function parsePageIntro(body: string): PageIntro {
  const title = body.match(/^# (.+)$/m)?.[1]?.trim() ?? ''
  const heads = headings(body)
  const intro = leadBlock(body)
  return { title, intro, furtherTitle: heads[0] ?? '' }
}
