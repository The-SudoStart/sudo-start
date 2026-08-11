import { Package } from '@/types';
import { FetchVersionsUseCase } from './fetch-versions.use-case';

const DYNAMIC_VERSION_TOOLS = [
  'nodejs', 'python3', 'rust', 'go', 'docker', 'nvm', 'ruby', 'php', 'kotlin', 'java',
  'bun', 'deno', 'elixir', 'erlang', 'scala', 'clojure', 'haskell', 'lua', 'perl', 'r',
  'postgresql', 'redis', 'mongodb', 'mysql', 'mariadb', 'sqlite3',
  'cockroachdb', 'cassandra', 'neo4j', 'clickhouse', 'timescaledb',
  'flutter', 'vscode', 'zed', 'vim', 'neovim', 'emacs', 'antigravity',
  'terraform', 'ansible', 'github-cli', 'git', 'curl', 'zsh', 'oh-my-zsh', 'jq', 'htop', 'tmux',
  'lazygit', 'delta', 'httpie', 'pandoc',
  'podman', 'kubectl', 'minikube', 'lima', 'multipass', 'vagrant', 'packer', 'buildah', 'skopeo',
  'jenkins', 'prometheus', 'docker-compose', 'pulumi', 'helm', 'kustomize', 'argocd-cli',
  'react', 'vue', 'angular', 'nextjs', 'django', 'flask', 'express',
  'nginx', 'apache', 'godot', 'blender', 'electron', 'tauri', 'react-native',
  'zen-browser', 'brave', 'firefox', 'alacritty', 'kitty', 'hyper',
  'jupyter', 'tensorflow', 'pandas', 'numpy', 'matplotlib',
  'aws-cli', 'azure-cli', 'gcloud', 'vercel-cli', 'netlify-cli', 'supabase-cli', 'stripe-cli', 'aws-cdk',
  'bitwarden-cli', '1password-cli', 'gpg', 'openssl', 'wireguard',
  'gimp', 'inkscape', 'krita', 'audacity', 'obs-studio', 'ffmpeg', 'imagemagick',
  'git-lfs', 'github-desktop', 'sublime-merge', 'fork', 'tower',
  'ripgrep', 'fd', 'fzf', 'bat', 'exa', 'dust', 'bottom', 'glances', 'ngrok', 'insomnia',
  'notion', 'obsidian', 'logseq', 'todoist', 'taskwarrior', 'timewarrior', 'calcurse', 'newsboat',
];

export interface PackageVersionOption {
  id: string;
  label: string;
}

export interface GetPackageVersionsInput {
  package: Package;
  dynamicVersions?: string[];
}

export interface GetPackageVersionsOutput {
  supportsDynamic: boolean;
  versions: PackageVersionOption[];
}

export class GetPackageVersionsUseCase {
  constructor(private readonly fetchVersionsUseCase: FetchVersionsUseCase) {}

  execute(input: GetPackageVersionsInput): GetPackageVersionsOutput {
    const supportsDynamic = DYNAMIC_VERSION_TOOLS.includes(input.package.id);
    const versions = supportsDynamic && input.dynamicVersions && input.dynamicVersions.length > 0
      ? input.dynamicVersions.map((version) => ({ id: version, label: version }))
      : input.package.versions.map((version) => ({ id: version.id, label: version.label }));

    return { supportsDynamic, versions };
  }

  async fetchDynamicVersions(pkg: Package): Promise<string[]> {
    if (!DYNAMIC_VERSION_TOOLS.includes(pkg.id)) return [];

    const packageId = pkg.id === 'python3' ? 'python' : pkg.id;
    const { versions } = await this.fetchVersionsUseCase.execute({ packageIds: [packageId] });
    return versions[packageId] ?? [];
  }
}
