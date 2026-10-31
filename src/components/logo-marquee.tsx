import { AppIcon } from './app-icon';

// Tools with a logo in AppIcon, so none fall back to a plain initial.
const tools = [
  { id: 'docker', name: 'Docker' },
  { id: 'cursor', name: 'Cursor' },
  { id: 'postgresql', name: 'PostgreSQL' },
  { id: 'rust', name: 'Rust' },
  { id: 'warp', name: 'Warp' },
  { id: 'terraform', name: 'Terraform' },
  { id: 'redis', name: 'Redis' },
  { id: 'neovim', name: 'Neovim' },
  { id: 'deno', name: 'Deno' },
  { id: 'firefox', name: 'Firefox' },
  { id: 'go', name: 'Go' },
  { id: 'mongodb', name: 'MongoDB' },
  { id: 'obsidian', name: 'Obsidian' },
  { id: 'bun', name: 'Bun' },
  { id: 'nginx', name: 'Nginx' },
  { id: 'figma', name: 'Figma' },
  { id: 'ansible', name: 'Ansible' },
  { id: 'pnpm', name: 'pnpm' },
];

/** "Works with" strip of tool logos that scrolls slowly; pauses on hover. */
export function LogoMarquee({ toolCount }: { toolCount: number }) {
  return (
    <section className="reveal border-t border-border py-8" aria-label={`Works with ${toolCount}+ tools`}>
      <p className="label-caps text-center text-muted-foreground">Works with {toolCount}+ tools</p>
      <div className="marquee mt-5 overflow-hidden">
        {/* The list is rendered twice so the -50% loop is seamless. */}
        <ul className="marquee-track flex w-max gap-3">
          {[...tools, ...tools].map((tool, i) => (
            <li
              key={`${tool.id}-${i}`}
              aria-hidden={i >= tools.length}
              className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-4 text-sm font-medium text-foreground shadow-soft"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <AppIcon id={tool.id} name={tool.name} size={22} />
              </span>
              {tool.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
