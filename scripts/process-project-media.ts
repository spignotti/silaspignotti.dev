import { copyFile, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

type ScreenshotEntry = {
  src: string
  alt: string
}

type DownloadEntry = {
  label: string
  href?: string
  note?: string
}

type ProjectFrontmatter = {
  title?: string
  slug?: string
  screenshots?: ScreenshotEntry[]
  downloads?: DownloadEntry[]
  [key: string]: unknown
}

type FileMap = {
  source: string
  destination: string
}

const ROOT = process.cwd()
const PROJECT_CONTENT_DIR = path.join(ROOT, 'src/content/projects')
const PROJECT_MEDIA_DIR = path.join(ROOT, 'public/projects')

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'])
const DOCUMENT_EXTENSIONS = new Set(['.pdf'])

function parseArgs() {
  const args = process.argv.slice(2)
  let slug: string | undefined
  const files: string[] = []
  let move = false
  let dryRun = false

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--slug') {
      slug = args[index + 1]
      index += 1
      continue
    }
    if (arg === '--file') {
      files.push(args[index + 1])
      index += 1
      continue
    }
    if (arg === '--move') {
      move = true
      continue
    }
    if (arg === '--dry-run') {
      dryRun = true
    }
  }

  if (!slug) {
    throw new Error('Missing required --slug argument.')
  }

  return { slug, files, move, dryRun }
}

function parseMapping(raw: string): FileMap {
  const splitIndex = raw.indexOf('->')
  if (splitIndex === -1) {
    throw new Error(`Invalid --file mapping '${raw}'. Use: --file "tmp/source.png -> screenshot-01.png"`)
  }

  const source = raw.slice(0, splitIndex).trim()
  const destination = raw.slice(splitIndex + 2).trim()

  if (!source || !destination) {
    throw new Error(`Invalid --file mapping '${raw}'. Source and destination are required.`)
  }

  if (destination.includes('/') || destination.includes('\\')) {
    throw new Error(`Destination '${destination}' must be a file name only, not a nested path.`)
  }

  return { source, destination }
}

function toTitleCase(input: string) {
  return input
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

function inferDownloadLabel(filename: string) {
  const extension = path.extname(filename)
  const base = filename.slice(0, -extension.length)
  const normalized = base.replace(/[-_]+/g, ' ').trim()

  if (normalized.toLowerCase() === 'report') {
    return 'Project report (PDF)'
  }

  if (!normalized) {
    return 'Project file'
  }

  return toTitleCase(normalized)
}

function inferScreenshotAlt(title: string) {
  return `${title} screenshot`
}

async function exists(filePath: string) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function run() {
  const { slug, files, move, dryRun } = parseArgs()

  if (files.length === 0) {
    console.log(`No media mappings provided for '${slug}'. Skipping media processing.`)
    return
  }

  // Each project has one file per language: src/content/projects/<lang>/<slug>.mdx
  const contentPaths: string[] = []
  for (const lang of ['de', 'en']) {
    const candidate = path.join(PROJECT_CONTENT_DIR, lang, `${slug}.mdx`)
    if (await exists(candidate)) contentPaths.push(candidate)
  }
  if (contentPaths.length === 0) {
    throw new Error(`Project content file not found: src/content/projects/<lang>/${slug}.mdx`)
  }

  const destinationDir = path.join(PROJECT_MEDIA_DIR, slug)
  if (!dryRun) {
    await mkdir(destinationDir, { recursive: true })
  }

  const added: { publicPath: string; destination: string; kind: 'image' | 'document' }[] = []
  for (const rawMapping of files) {
    const { source, destination } = parseMapping(rawMapping)
    const sourcePath = path.resolve(ROOT, source)

    if (!(await exists(sourcePath))) {
      throw new Error(`Declared source file does not exist: ${source}`)
    }

    const targetPath = path.join(destinationDir, destination)
    const publicPath = `/projects/${slug}/${destination}`

    if (dryRun) {
      console.log(`DRYRUN ${source} -> ${publicPath}`)
    } else if (move) {
      await rename(sourcePath, targetPath)
      console.log(`MOVE   ${source} -> ${publicPath}`)
    } else {
      await copyFile(sourcePath, targetPath)
      console.log(`COPY   ${source} -> ${publicPath}`)
    }

    const extension = path.extname(destination).toLowerCase()
    if (IMAGE_EXTENSIONS.has(extension)) added.push({ publicPath, destination, kind: 'image' })
    else if (DOCUMENT_EXTENSIONS.has(extension)) added.push({ publicPath, destination, kind: 'document' })
  }

  for (const contentPath of contentPaths) {
    const parsed = matter(await readFile(contentPath, 'utf8'))
    const data = parsed.data as ProjectFrontmatter
    const title = data.title ?? slug
    const screenshots = Array.isArray(data.screenshots) ? [...data.screenshots] : []
    const downloads = Array.isArray(data.downloads) ? [...data.downloads] : []

    for (const item of added) {
      if (item.kind === 'image' && !screenshots.some((entry) => entry.src === item.publicPath)) {
        screenshots.push({ src: item.publicPath, alt: inferScreenshotAlt(title) })
      }
      if (item.kind === 'document' && !downloads.some((entry) => entry.href === item.publicPath)) {
        downloads.push({ label: inferDownloadLabel(item.destination), href: item.publicPath })
      }
    }

    data.screenshots = screenshots
    data.downloads = downloads
    if (!dryRun) {
      await writeFile(contentPath, matter.stringify(parsed.content, data), 'utf8')
    }
    console.log(
      `${path.relative(ROOT, contentPath)}: screenshots=${screenshots.length}, downloads=${downloads.length}, mode=${dryRun ? 'dry-run' : move ? 'move' : 'copy'}`,
    )
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`process-project-media failed: ${message}`)
  process.exit(1)
})
