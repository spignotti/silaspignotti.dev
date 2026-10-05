import {
  BookOpenCheck,
  Building2,
  FileSearch,
  Layers,
  LayoutDashboard,
  MapPin,
  Satellite,
  Terminal,
  Trees,
  Truck,
  Wand2,
  type LucideIcon,
} from 'lucide-react'

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
  'truck',
] as const

export type ProjectCoverIcon = (typeof PROJECT_COVER_ICONS)[number]

export const PROJECT_COVER_ICON_MAP: Record<ProjectCoverIcon, LucideIcon> = {
  layers: Layers,
  terminal: Terminal,
  satellite: Satellite,
  'map-pin': MapPin,
  'file-search': FileSearch,
  'layout-dashboard': LayoutDashboard,
  'wand-2': Wand2,
  trees: Trees,
  'building-2': Building2,
  'book-open-check': BookOpenCheck,
  truck: Truck,
}

export const PROJECT_COVER_ICON_DEFAULT: ProjectCoverIcon = 'layers'
