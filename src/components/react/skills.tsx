import { technologies, type Technologies, type Category } from '../../consts'
import { InfiniteScroll } from '../ui/infinite-scroll'
import { type IconType } from 'react-icons'
import { FaQuestionCircle } from 'react-icons/fa'
import {
  SiDocker,
  SiFastapi,
  SiGeopandas,
  SiGit,
  SiGooglecloud,
  SiGoogleearth,
  SiPostgresql,
  SiPython,
  SiQgis,
  SiScikitlearn,
} from 'react-icons/si'
import { Code, Database, Network, Terminal, Workflow } from 'lucide-react'

const iconMap: { [key: string]: IconType } = {
  'si:docker': SiDocker,
  'si:fastapi': SiFastapi,
  'mdi:git': SiGit,
  'si:googlecloud': SiGooglecloud,
  'si:googleearth': SiGoogleearth,
  'si:geopandas': SiGeopandas,
  'si:postgresql': SiPostgresql,
  'si:python': SiPython,
  'si:qgis': SiQgis,
  'si:scikitlearn': SiScikitlearn,
  'lucide:database': Database,
  'lucide:terminal': Terminal,
  'lucide:code': Code,
  'lucide:network': Network,
  'lucide:workflow': Workflow,
}

const categories = Object.keys(technologies)

const Skills: React.FC = () => {
  return (
    <div className="mx-auto mt-6 flex w-full max-w-[calc(100vw-2rem)] flex-col lg:max-w-full">
      <div className="space-y-3">
        {categories.map((category, categoryIndex) => (
          <InfiniteScroll
            key={category}
            duration={46000}
            direction={categoryIndex % 2 === 0 ? 'normal' : 'reverse'}
            showFade={true}
            className="flex flex-row justify-start"
          >
            {technologies[category as keyof Technologies].map(
              (tech: Category, techIndex: number) => {
                const IconComponent = iconMap[tech.logo] || FaQuestionCircle
                return (
                  <div
                    key={`${category}-${techIndex}`}
                    className="tech-badge mr-4 flex min-h-12 items-center gap-3 rounded-full border border-border bg-card px-3 py-2 text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    data-tech-name={`${category}-${techIndex}`}
                  >
                    <span className="bg-muted flex h-9 w-9 items-center justify-center rounded-full p-2 text-base shadow-inner">
                      <IconComponent className="tech-icon text-primary" aria-hidden="true" />
                    </span>
                    <span className="text-foreground text-sm font-medium sm:text-base">
                      {tech.text}
                    </span>
                  </div>
                )
              },
            )}
          </InfiniteScroll>
        ))}
      </div>
    </div>
  )
}

export default Skills
