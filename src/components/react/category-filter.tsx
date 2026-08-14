import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ProjectCategory } from '@/lib/project-categories'

type FilterCategory = 'All' | ProjectCategory

interface CategoryFilterProps {
  categories: readonly FilterCategory[]
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All')

  const handleFilter = (category: FilterCategory) => {
    setActiveCategory(category)

    const items = document.querySelectorAll<HTMLElement>('.project-item')
    items.forEach((item) => {
      const itemCategory = item.dataset.category
      item.classList.toggle('hidden', category !== 'All' && itemCategory !== category)
    })
  }

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={activeCategory === category}
          onClick={() => handleFilter(category)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
            'border border-border/60',
            activeCategory === category
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
