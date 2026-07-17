import {
  LayoutGrid,
  FileCode2,
  Globe,
  Wrench,
  Cog,
  Boxes,
  Database,
  TerminalSquare,
  Blocks,
  Infinity as InfinityIcon,
  FlaskConical,
  Smartphone,
  Gamepad2,
  MonitorSmartphone,
  Server,
  Package,
  Hammer,
  Cloud,
  Wand2,
  MessagesSquare,
  Rocket,
  ShieldCheck,
  Clapperboard,
  GitBranch,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
}

/** Category slug → display label + Lucide icon. `all` is the catch-all filter. */
export const categoryMeta: Record<string, CategoryMeta> = {
  all: { label: 'All', icon: LayoutGrid },
  ide: { label: 'IDEs', icon: FileCode2 },
  browser: { label: 'Browsers', icon: Globe },
  tool: { label: 'Tools', icon: Wrench },
  runtime: { label: 'Runtimes', icon: Cog },
  container: { label: 'Containers', icon: Boxes },
  database: { label: 'Databases', icon: Database },
  terminal: { label: 'Terminals', icon: TerminalSquare },
  framework: { label: 'Frameworks', icon: Blocks },
  devops: { label: 'DevOps', icon: InfinityIcon },
  'data-science': { label: 'Data Science', icon: FlaskConical },
  mobile: { label: 'Mobile', icon: Smartphone },
  'game-dev': { label: 'Game Dev', icon: Gamepad2 },
  'desktop-dev': { label: 'Desktop Dev', icon: MonitorSmartphone },
  'web-server': { label: 'Web Servers', icon: Server },
  'package-manager': { label: 'Package Managers', icon: Package },
  'build-tool': { label: 'Build Tools', icon: Hammer },
  cloud: { label: 'Cloud', icon: Cloud },
  utility: { label: 'Utilities', icon: Wand2 },
  communication: { label: 'Communication', icon: MessagesSquare },
  productivity: { label: 'Productivity', icon: Rocket },
  security: { label: 'Security', icon: ShieldCheck },
  media: { label: 'Media', icon: Clapperboard },
  vcs: { label: 'Version Control', icon: GitBranch },
};

export function getCategoryMeta(slug: string): CategoryMeta {
  return categoryMeta[slug] ?? { label: slug.replace(/-/g, ' '), icon: Package };
}
