export const PROJECT_CATEGORIES = ['Geospatial', 'AI/Automation'] as const
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]
