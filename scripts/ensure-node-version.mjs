const major = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10)

if (major < 24) {
  console.error(
    `Unsupported Node.js version ${process.versions.node}. Use Node 24 or newer.`
  )
  process.exit(1)
}
