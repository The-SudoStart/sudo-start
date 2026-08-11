import { VersionRepository } from '@/domain/repositories/version-repository.interface';

type VersionSource = {
  url: string;
  parser: (data: unknown) => string[];
};

const githubReleases = (repo: string, filter: (tag: string) => boolean = () => true): VersionSource => ({
  url: `https://api.github.com/repos/${repo}/releases?per_page=10`,
  parser: (data: unknown) => {
    const releases = data as { tag_name: string; prerelease: boolean }[];
    return releases
      .filter((release) => !release.prerelease && filter(release.tag_name))
      .map((release) => release.tag_name)
      .slice(0, 5);
  },
});

const eolApi = (product: string): VersionSource => ({
  url: `https://endoflife.date/api/${product}.json`,
  parser: (data: unknown) => {
    const releases = data as { cycle: string; latest: string }[];
    return releases.slice(0, 5).map((release) => release.latest);
  },
});

export const VERSION_SOURCES: Record<string, VersionSource> = {
  nodejs: {
    url: 'https://nodejs.org/dist/index.json',
    parser: (data) => (data as { version: string; lts: boolean | string }[])
      .filter((release) => release.lts)
      .slice(0, 5)
      .map((release) => release.version),
  },
  go: {
    url: 'https://go.dev/dl/?mode=json',
    parser: (data) => (data as { version: string; stable: boolean }[])
      .filter((release) => release.stable)
      .slice(0, 5)
      .map((release) => release.version.replace('go', '')),
  },
  python: eolApi('python'),
  rust: githubReleases('rust-lang/rust'),
  docker: {
    url: 'https://api.github.com/repos/docker/cli/releases?per_page=5',
    parser: (data) => (data as { tag_name: string; prerelease: boolean }[])
      .filter((release) => !release.prerelease)
      .map((release) => release.tag_name.replace('v', '')),
  },
  postgresql: eolApi('postgresql'),
  redis: githubReleases('redis/redis'),
  mongodb: {
    url: 'https://api.github.com/repos/mongodb/mongo/releases?per_page=5',
    parser: (data) => (data as { tag_name: string; prerelease: boolean }[])
      .filter((release) => !release.prerelease && release.tag_name.startsWith('r'))
      .map((release) => release.tag_name.replace('r', '')),
  },
  flutter: {
    url: 'https://storage.googleapis.com/flutter_infra_release/releases/releases_linux.json',
    parser: (data) => {
      const releases = (data as { releases: { version: string }[] }).releases;
      return Array.from(new Set(releases.map((release) => release.version))).slice(0, 5);
    },
  },
  vscode: githubReleases('microsoft/vscode'),
  zed: githubReleases('zed-industries/zed'),
  terraform: githubReleases('hashicorp/terraform'),
  ansible: githubReleases('ansible/ansible'),
  'github-cli': githubReleases('cli/cli'),
  podman: githubReleases('containers/podman'),
  kubectl: githubReleases('kubernetes/kubernetes', (tag) => tag.startsWith('v')),
  minikube: githubReleases('kubernetes/minikube'),
  jenkins: githubReleases('jenkinsci/jenkins'),
  prometheus: githubReleases('prometheus/prometheus'),
  'docker-compose': githubReleases('docker/compose'),
  react: githubReleases('facebook/react'),
  vue: githubReleases('vuejs/core'),
  angular: githubReleases('angular/angular'),
  nextjs: githubReleases('vercel/next.js'),
  django: githubReleases('django/django'),
  flask: githubReleases('pallets/flask'),
  express: githubReleases('expressjs/express'),
  nginx: githubReleases('nginx/nginx'),
  godot: githubReleases('godotengine/godot'),
  blender: githubReleases('blender/blender'),
  electron: githubReleases('electron/electron'),
  tauri: githubReleases('tauri-apps/tauri'),
  'react-native': githubReleases('facebook/react-native'),
  'zen-browser': githubReleases('zen-browser/desktop'),
  brave: githubReleases('brave/brave-browser'),
  firefox: githubReleases('mozilla/gecko-dev', (tag) => tag.includes('FIREFOX') && tag.includes('_RELEASE')),
  alacritty: githubReleases('alacritty/alacritty'),
  kitty: githubReleases('kovidgoyal/kitty'),
  hyper: githubReleases('vercel/hyper'),
  git: githubReleases('git/git', (tag) => tag.startsWith('v') && !tag.includes('rc') && !tag.includes('beta')),
  zsh: githubReleases('zsh-users/zsh'),
  'oh-my-zsh': githubReleases('ohmyzsh/ohmyzsh'),
  curl: githubReleases('curl/curl'),
  jq: githubReleases('jqlang/jq'),
  htop: githubReleases('htop-dev/htop'),
  tmux: githubReleases('tmux/tmux'),
  mysql: githubReleases('mysql/mysql-server'),
  mariadb: githubReleases('MariaDB/server', (tag) => tag.startsWith('v')),
  nvm: githubReleases('nvm-sh/nvm'),
  ruby: githubReleases('ruby/ruby', (tag) => tag.startsWith('v') && !tag.includes('preview') && !tag.includes('rc')),
  php: githubReleases('php/php-src', (tag) => tag.startsWith('php-')),
  kotlin: githubReleases('JetBrains/kotlin'),
  java: githubReleases('openjdk/jdk', (tag) => tag.startsWith('jdk-')),
  'aws-cli': githubReleases('aws/aws-cli', (tag) => tag.startsWith('v') && !tag.includes('dev')),
  'azure-cli': githubReleases('Azure/azure-cli'),
  apache: githubReleases('apache/httpd'),
  jupyter: githubReleases('jupyterlab/jupyterlab'),
  tensorflow: githubReleases('tensorflow/tensorflow', (tag) => tag.startsWith('v')),
  pandas: githubReleases('pandas-dev/pandas'),
  numpy: githubReleases('numpy/numpy'),
  matplotlib: githubReleases('matplotlib/matplotlib'),
  vim: githubReleases('vim/vim'),
};

export class HttpVersionRepository implements VersionRepository {
  private readonly cache: Record<string, { data: string[]; timestamp: number }> = {};

  constructor(private readonly cacheTtlMs = 5 * 60 * 1000) {}

  async fetchLatest(packageId: string): Promise<string[]> {
    const key = packageId.toLowerCase();
    const source = VERSION_SOURCES[key];
    if (!source) {
      throw new Error(`Unsupported tool: ${packageId}. Supported: ${Object.keys(VERSION_SOURCES).join(', ')}`);
    }

    const cached = this.cache[key];
    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return cached.data;
    }

    try {
      const response = await fetch(source.url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'SudoStart-App',
        },
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch versions: ${response.status}`);
      }

      const versions = source.parser(await response.json());
      this.cache[key] = { data: versions, timestamp: Date.now() };
      return versions;
    } catch (error) {
      if (cached) return cached.data;
      throw error;
    }
  }

  async validateVersion(packageId: string, version: string): Promise<boolean> {
    return (await this.fetchLatest(packageId)).includes(version);
  }

  getCached(packageId: string): string[] | null {
    return this.cache[packageId.toLowerCase()]?.data ?? null;
  }
}
