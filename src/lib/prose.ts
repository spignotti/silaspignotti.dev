export type Step = { title: string; text: string }
export type TimelineItem = { year: string; text: string }
export type LinkItem = { label: string; href: string }

export type HomeContent = {
  heroTitle: string
  heroLead: string
  casesTitle: string
  casesIntro: string
  areasTitle: string
  stepsTitle: string
  steps: Step[]
  timelineTitle: string
  timeline: TimelineItem[]
  more: LinkItem | null
  contactTitle: string
  contactLead: string
  contactLinks: LinkItem[]
}

export type AboutItem = {
  period: string
  title: string
  line: string
  details: string[]
}

export type AboutSection = { heading: string; items: AboutItem[] }

export type AboutContent = {
  title: string
  intro: string
  sections: AboutSection[]
  more: LinkItem | null
}

export type CaseSection = { heading: string; id: string; paragraphs: string[] }

const SECTION_ID: Record<string, string> = {
  Problem: 'problem',
  Vorgehen: 'approach',
  Approach: 'approach',
  System: 'system',
  Ergebnis: 'result',
  Result: 'result',
  Grenzen: 'limits',
  Limits: 'limits',
}

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

function linksIn(block: string): LinkItem[] {
  return [...block.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((match) => ({
    label: match[1] ?? '',
    href: match[2] ?? '',
  }))
}

export function parseHome(body: string): HomeContent {
  const title = body.match(/^# (.+)$/m)?.[1]?.trim() ?? ''
  const lead = body.split(/^## /m)[0]?.replace(/^# .+\n+/, '').trim() ?? ''
  const heads = headings(body)
  const casesBlock = sliceSection(body, 0)
  const stepsBlock = sliceSection(body, 2)
  const timeBlock = sliceSection(body, 3)
  const contactBlock = sliceSection(body, 4)
  const timeLines = timeBlock.split('\n').filter((line) => line.startsWith('- '))
  const moreLine = timeBlock
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('['))
  const more = moreLine ? linksIn(moreLine)[0] ?? null : null
  const contactLines = contactBlock.split('\n').filter((line) => line.trim().startsWith('- '))
  const contactLead = contactBlock.split('\n').map((line) => line.trim()).find((line) => line && !line.startsWith('-')) ?? ''

  return {
    heroTitle: title,
    heroLead: lead,
    casesTitle: heads[0] ?? '',
    casesIntro: casesBlock,
    areasTitle: heads[1] ?? '',
    stepsTitle: heads[2] ?? '',
    steps: [...stepsBlock.matchAll(/^\d+\. \*\*([^*]+)\*\* (.+)$/gm)].map((match) => ({
      title: match[1] ?? '',
      text: match[2] ?? '',
    })),
    timelineTitle: heads[3] ?? '',
    timeline: timeLines.map((line) => {
      const match = line.match(/^- \*\*([^*]+)\*\* · (.+)$/)
      return { year: match?.[1] ?? '', text: match?.[2] ?? '' }
    }),
    more,
    contactTitle: heads[4] ?? '',
    contactLead,
    contactLinks: linksIn(contactLines.join('\n')),
  }
}

function parseAboutItems(block: string): AboutItem[] {
  const chunks = block.split(/\n(?=- )/).map((chunk) => chunk.trim()).filter((chunk) => chunk.startsWith('- '))
  return chunks.map((chunk) => {
    const lines = chunk
      .replace(/^- /, '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const first = lines[0] ?? ''
    const details = lines.slice(1).filter((line) => !/^\[[^\]]+\]\([^)]+\)$/.test(line))
    const bold = first.match(/^\*\*([^*]+)\*\*(?: · (.*))?$/)
    if (!bold) return { period: '', title: '', line: first, details }
    const label = bold[1] ?? ''
    const rest = bold[2] ?? ''
    if (/^\d/.test(label)) return { period: label, title: '', line: rest, details }
    const parts = rest.split(' · ')
    const period = parts.length > 1 ? (parts.pop() ?? '') : ''
    return { period, title: label, line: parts.join(' · '), details }
  })
}

export function parseAbout(body: string): AboutContent {
  const title = body.match(/^# (.+)$/m)?.[1]?.trim() ?? ''
  const intro = body.split(/^## /m)[0]?.replace(/^# .+\n+/, '').trim() ?? ''
  const heads = headings(body)
  const sections = heads.map((heading, index) => ({
    heading,
    items: parseAboutItems(sliceSection(body, index)),
  }))
  const tail = sliceSection(body, heads.length - 1)
  const moreLine = tail.split('\n').map((line) => line.trim()).find((line) => line.startsWith('['))
  return { title, intro, sections, more: moreLine ? linksIn(moreLine)[0] ?? null : null }
}

export function parseSections(body: string): CaseSection[] {
  return headings(body)
    .map((heading, index) => ({
      heading,
      id: SECTION_ID[heading] ?? '',
      paragraphs: sliceSection(body, index)
        .split(/\n\n+/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0 && !paragraph.startsWith('[')),
    }))
    .filter((section) => section.id !== '')
}

export type PageIntro = { title: string; intro: string; furtherTitle: string }

export function parsePageIntro(body: string): PageIntro {
  const title = body.match(/^# (.+)$/m)?.[1]?.trim() ?? ''
  const heads = headings(body)
  const intro = body.split(/^## /m)[0]?.replace(/^# .+\n+/, '').trim() ?? ''
  return { title, intro, furtherTitle: heads[0] ?? '' }
}
