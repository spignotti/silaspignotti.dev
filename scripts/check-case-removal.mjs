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
    console.log(`ok: ${label}`)
  } finally {
    cleanup(dest)
  }
}

const arg = process.argv[2]
const rounds = arg ? [[arg]] : CASES.map((slug) => [slug])
for (const slugs of rounds) scenario(`remove ${slugs[0]}`, slugs)
scenario('remove all four cases', CASES)
