export const PROJECT_COVER_ICONS = [
  'layers',
  'terminal',
  'satellite',
  'map-pin',
  'file-search',
  'layout-dashboard',
  'wand-2',
  'trees',
  'building-2',
  'book-open-check',
  'workflow',
  'truck',
] as const

export type ProjectCoverIcon = (typeof PROJECT_COVER_ICONS)[number]

export const PROJECT_COVER_ICON_DEFAULT: ProjectCoverIcon = 'layers'
