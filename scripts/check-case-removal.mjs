// Builds a copy of the repo after deleting case studies. The working tree is not modified.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKIP = new Set(['node_modules', 'dist', '.git', '.astro'])
const CASES = ['routing-engine-solver', 'routing-engine-agentic', 'berlin-lst-downscaling', 'kpi-reference']

function copyRepo(dest) {
  fs.cpSync(root, dest, {
    recursive: true,
    filter(src) {
      const rel = path.relative(root, src)
      if (rel === '') return true
      return !SKIP.has(rel.split(path.sep)[0])
    },
  })
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(dest, 'node_modules'), 'dir')
}

function removeCases(dest, slugs) {
  for (const slug of slugs) {
    for (const lang of ['de', 'en']) {
      const file = path.join(dest, 'src/content/projects', lang, `${slug}.md`)
      if (!fs.existsSync(file)) throw new Error(`missing case file in copy: ${path.relative(dest, file)}`)
      fs.rmSync(file)
    }
  }
}

function build(dest) {
  const result = spawnSync('pnpm', ['build'], {
    cwd: dest,
    stdio: 'inherit',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`pnpm build failed with status ${result.status}`)
}

function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!field) continue
    let value = field[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    data[field[1]] = value
  }
  return data
}

function remainingCaseSlugs(dest) {
  const dir = path.join(dest, 'src/content/projects/de')
  if (!fs.existsSync(dir)) return []
  const slugs = []
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue
    const data = frontmatter(fs.readFileSync(path.join(dir, name), 'utf8'))
    if (!data || data.kind !== 'case' || !data.slug) continue
    const cover = path.join(dest, 'src/assets/figures', data.slug, 'cover.svg')
    if (!fs.existsSync(cover)) continue
    slugs.push(data.slug)
  }
  return slugs
}

function htmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) htmlFiles(full, out)
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

function hrefResolves(dist, href) {
  const rel = decodeURIComponent(href.split(/[?#]/)[0] ?? '').replace(/^\/+/, '')
  if (rel.includes('..')) return false
  const asIndex = path.join(dist, rel, 'index.html')
  const asHtml = rel.endsWith('.html') ? path.join(dist, rel) : path.join(dist, `${rel}.html`)
  return fs.existsSync(asIndex) || fs.existsSync(asHtml)
}

function checkCaseHrefs(dest) {
  const dist = path.join(dest, 'dist')
  const broken = []
  const re = /href="(\/(?:projekte|en\/projects)\/[^"]*)"/g
  for (const file of htmlFiles(dist)) {
    const html = fs.readFileSync(file, 'utf8')
    for (const match of html.matchAll(re)) {
      const href = match[1]
      if (!href || hrefResolves(dist, href)) continue
      broken.push(`${path.relative(dest, file)} → ${href}`)
    }
  }
  if (broken.length > 0) {
    throw new Error(`internal project links in dist do not resolve:\n${broken.join('\n')}`)
  }
}

function checkOgPngs(dest) {
  const ogDir = path.join(dest, 'dist/og')
  if (!fs.existsSync(ogDir)) throw new Error('dist/og is missing')
  const allowed = new Set(['site.png', ...remainingCaseSlugs(dest).map((slug) => `${slug}.png`)])
  const stale = fs
    .readdirSync(ogDir)
    .filter((name) => name.endsWith('.png') && !allowed.has(name))
    .sort()
  if (stale.length > 0) {
    const remaining = [...allowed].filter((name) => name !== 'site.png').sort()
    const listed = remaining.length > 0 ? remaining.join(', ') : 'none'
    throw new Error(`dist/og has PNG files that are not site.png or a remaining case (${listed}): ${stale.join(', ')}`)
  }
}

function verifyDist(dest) {
  if (!fs.existsSync(path.join(dest, 'dist'))) throw new Error('missing dist after build')
  checkCaseHrefs(dest)
  checkOgPngs(dest)
}

function cleanup(dest) {
  const link = path.join(dest, 'node_modules')
  try {
    if (fs.lstatSync(link).isSymbolicLink()) fs.unlinkSync(link)
  } catch {
    // The copy may have failed before the link existed.
  }
  fs.rmSync(dest, { recursive: true, force: true })
}

function scenario(label, slugs) {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'case-removal-'))
  console.log(`\n${label}`)
  try {
    copyRepo(dest)
    removeCases(dest, slugs)
    build(dest)
    verifyDist(dest)
    console.log(`ok: ${label}`)
  } finally {
    cleanup(dest)
  }
}

const arg = process.argv[2]
const rounds = arg ? [[arg]] : CASES.map((slug) => [slug])
for (const slugs of rounds) scenario(`remove ${slugs[0]}`, slugs)
scenario('remove all four cases', CASES)
