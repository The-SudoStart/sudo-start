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

/** Color family a category belongs to; maps to the `fam-*` classes in globals.css. */
export type CategoryFamily = 'code' | 'infra' | 'data' | 'system' | 'apps' | 'create';

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  family?: CategoryFamily;
}

/** Category slug → display label + Lucide icon. `all` is the catch-all filter. */
export const categoryMeta: Record<string, CategoryMeta> = {
  all: { label: 'All', icon: LayoutGrid },
  ide: { label: 'IDEs', icon: FileCode2, family: 'code' },
  browser: { label: 'Browsers', icon: Globe, family: 'apps' },
  tool: { label: 'Tools', icon: Wrench, family: 'system' },
  runtime: { label: 'Runtimes', icon: Cog, family: 'code' },
  container: { label: 'Containers', icon: Boxes, family: 'infra' },
  database: { label: 'Databases', icon: Database, family: 'data' },
  terminal: { label: 'Terminals', icon: TerminalSquare, family: 'system' },
  framework: { label: 'Frameworks', icon: Blocks, family: 'code' },
  devops: { label: 'DevOps', icon: InfinityIcon, family: 'infra' },
  'data-science': { label: 'Data Science', icon: FlaskConical, family: 'data' },
  mobile: { label: 'Mobile', icon: Smartphone, family: 'create' },
  'game-dev': { label: 'Game Dev', icon: Gamepad2, family: 'create' },
  'desktop-dev': { label: 'Desktop Dev', icon: MonitorSmartphone, family: 'create' },
  'web-server': { label: 'Web Servers', icon: Server, family: 'infra' },
  'package-manager': { label: 'Package Managers', icon: Package, family: 'code' },
  'build-tool': { label: 'Build Tools', icon: Hammer, family: 'code' },
  cloud: { label: 'Cloud', icon: Cloud, family: 'infra' },
  utility: { label: 'Utilities', icon: Wand2, family: 'system' },
  communication: { label: 'Communication', icon: MessagesSquare, family: 'apps' },
  productivity: { label: 'Productivity', icon: Rocket, family: 'apps' },
  security: { label: 'Security', icon: ShieldCheck, family: 'system' },
  media: { label: 'Media', icon: Clapperboard, family: 'apps' },
  vcs: { label: 'Version Control', icon: GitBranch, family: 'code' },
};

export function getCategoryMeta(slug: string): CategoryMeta {
  return categoryMeta[slug] ?? { label: slug.replace(/-/g, ' '), icon: Package, family: 'system' };
}

/** `fam-*` class for a category, or an empty string for "all". */
export function getCategoryFamilyClass(slug: string): string {
  const family = getCategoryMeta(slug).family;
  return family ? `fam-${family}` : '';
}
