export const PROJECT_CATEGORIES = ['Geospatial & Data', 'AI & Automation', 'Applied Systems'] as const
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]
