function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Extract the body of a `## <title>` section, stopping at the next `##` heading (not `###`). */
export function extractSection(body: string, title: string): string {
  const regex = new RegExp(`(?:^|\\n)##\\s+${escapeRegExp(title)}\\s*\\n+([\\s\\S]*?)(?=\\n##\\s+(?!#)|$)`)
  return body.match(regex)?.[1]?.trim() ?? ''
}

/** Extract a required section, failing the build with a clear message when the heading is missing. */
export function requireSection(body: string, title: string, source: string): string {
  const section = extractSection(body, title)
  if (!section) {
    throw new Error(`Missing "## ${title}" heading in ${source}; the section would render empty.`)
  }
  return section
}

/** Split a section into its `###`-headed items. */
export function splitItems(section: string): string[] {
  return section
    .split(/\n###\s+/)
    .map((part, index) => (index === 0 ? part.replace(/^###\s+/, '') : part).trim())
    .filter(Boolean)
}

/** Extract the intro between the top-level `# <title>` heading and the first `##` heading. */
export function extractIntro(body: string, title: string): string {
  const withoutTitle = body.replace(new RegExp(`^#\\s+${escapeRegExp(title)}\\s*\\n?`), '')
  const firstSectionIndex = withoutTitle.search(/(?:^|\n)##\s+/)
  return (firstSectionIndex === -1 ? withoutTitle : withoutTitle.slice(0, firstSectionIndex)).trim()
}

/** Extract a required intro, failing the build when the `# <title>` heading is missing. */
export function requireIntro(body: string, title: string, source: string): string {
  const heading = new RegExp(`^#\\s+${escapeRegExp(title)}\\s*$`, 'm')
  if (!heading.test(body)) {
    throw new Error(`Missing "# ${title}" heading in ${source}; the intro would render empty.`)
  }
  return extractIntro(body, title)
}
