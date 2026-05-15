import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security';

// Cache for version data (5 minute TTL)
const versionCache: Record<string, { data: string[]; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limit: 30 requests per minute per IP
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

// Helper for GitHub releases
const githubReleases = (repo: string, filter: (tag: string) => boolean = () => true) => ({
    url: `https://api.github.com/repos/${repo}/releases?per_page=10`,
    parser: (data: unknown) => {
        const releases = data as { tag_name: string; prerelease: boolean }[];
        return releases
            .filter((r) => !r.prerelease && filter(r.tag_name))
            .map((r) => r.tag_name)
            .slice(0, 5);
    },
});

// Helper for EndOfLife.date API
const eolApi = (product: string) => ({
    url: `https://endoflife.date/api/${product}.json`,
    parser: (data: unknown) => {
        const releases = data as { cycle: string; latest: string }[];
        return releases.slice(0, 5).map((r) => r.latest);
    },
});

// Version source configurations
const VERSION_SOURCES: Record<string, {
    url: string;
    parser: (data: unknown) => string[];
}> = {
    nodejs: {
        url: 'https://nodejs.org/dist/index.json',
        parser: (data) => {
            const releases = data as { version: string; lts: boolean | string }[];
            // Get LTS versions only, limit to 5
            return releases
                .filter((r) => r.lts)
                .slice(0, 5)
                .map((r) => r.version);
        },
    },
    go: {
        url: 'https://go.dev/dl/?mode=json',
        parser: (data) => {
            const releases = data as { version: string; stable: boolean }[];
            return releases
                .filter((r) => r.stable)
                .slice(0, 5)
                .map((r) => r.version.replace('go', ''));
        },
    },
    python: {
        url: 'https://endoflife.date/api/python.json',
        parser: (data) => {
            const releases = data as { cycle: string; latest: string }[];
            return releases
                .slice(0, 5)
                .map((r) => r.latest);
        },
    },
    rust: {
        url: 'https://api.github.com/repos/rust-lang/rust/releases?per_page=5',
        parser: (data) => {
            const releases = data as { tag_name: string; prerelease: boolean }[];
            return releases
                .filter((r) => !r.prerelease)
                .map((r) => r.tag_name);
        },
    },
    docker: {
        url: 'https://api.github.com/repos/docker/cli/releases?per_page=5',
        parser: (data) => {
            const releases = data as { tag_name: string; prerelease: boolean }[];
            return releases
                .filter((r) => !r.prerelease)
                .map((r) => r.tag_name.replace('v', ''));
        },
    },
    postgresql: eolApi('postgresql'),
    redis: {
        url: 'https://api.github.com/repos/redis/redis/releases?per_page=5',
        parser: (data) => {
            const releases = data as { tag_name: string; prerelease: boolean }[];
            return releases
                .filter((r) => !r.prerelease)
                .map((r) => r.tag_name);
        },
    },
    mongodb: {
        url: 'https://api.github.com/repos/mongodb/mongo/releases?per_page=5',
        parser: (data) => {
            const releases = data as { tag_name: string; prerelease: boolean }[];
            return releases
                .filter((r) => !r.prerelease && r.tag_name.startsWith('r'))
                .map((r) => r.tag_name.replace('r', ''));
        },
    },
    flutter: {
        url: 'https://storage.googleapis.com/flutter_infra_release/releases/releases_linux.json',
        parser: (data) => {
            const releases = (data as { releases: { version: string }[] }).releases;
            return Array.from(new Set(releases.map((r) => r.version))).slice(0, 5);
        },
    },
    // IDEs
    vscode: githubReleases('microsoft/vscode'),
    zed: githubReleases('zed-industries/zed'),

    // Tools
    terraform: githubReleases('hashicorp/terraform'),
    ansible: githubReleases('ansible/ansible'),
    'github-cli': githubReleases('cli/cli'),

    // Containers
    podman: githubReleases('containers/podman'),
    kubectl: githubReleases('kubernetes/kubernetes', (tag) => tag.startsWith('v')),
    minikube: githubReleases('kubernetes/minikube'),

    // DevOps
    jenkins: githubReleases('jenkinsci/jenkins'),
    prometheus: githubReleases('prometheus/prometheus'),
    'docker-compose': githubReleases('docker/compose'),

    // Frameworks
    react: githubReleases('facebook/react'),
    vue: githubReleases('vuejs/core'),
    angular: githubReleases('angular/angular'),
    nextjs: githubReleases('vercel/next.js'),
    django: githubReleases('django/django'),
    flask: githubReleases('pallets/flask'),
    express: githubReleases('expressjs/express'),

    // Web Servers
    nginx: githubReleases('nginx/nginx'),

    // Game Dev
    godot: githubReleases('godotengine/godot'),
    blender: githubReleases('blender/blender'),

    // Desktop Dev
    electron: githubReleases('electron/electron'),
    tauri: githubReleases('tauri-apps/tauri'),

    // Mobile
    'react-native': githubReleases('facebook/react-native'),
};

export async function GET(request: NextRequest) {
    // SECURITY: Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`versions:${clientIP}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const tool = searchParams.get('tool');

    if (!tool) {
        return NextResponse.json(
            { error: 'Missing "tool" query parameter' },
            { status: 400 }
        );
    }

    const source = VERSION_SOURCES[tool.toLowerCase()];
    if (!source) {
        return NextResponse.json(
            { error: `Unsupported tool: ${tool}. Supported: ${Object.keys(VERSION_SOURCES).join(', ')}` },
            { status: 400 }
        );
    }

    // Check cache
    const cached = versionCache[tool];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({ 
            versions: cached.data, 
            cached: true,
            tool 
        });
    }

    try {
        const response = await fetch(source.url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'SudoStart-App',
            },
            next: { revalidate: 300 }, // ISR cache for 5 min
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch versions: ${response.status}`);
        }

        const data = await response.json();
        const versions = source.parser(data);

        // Update cache
        versionCache[tool] = {
            data: versions,
            timestamp: Date.now(),
        };

        return NextResponse.json({
            versions,
            cached: false,
            tool
        }, {
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
          }
        });
    } catch (error) {
        console.error(`Error fetching versions for ${tool}:`, error);
        
        // Return cached data if available, even if stale
        if (cached) {
            return NextResponse.json({
                versions: cached.data,
                cached: true,
                stale: true,
                tool
            }, {
              headers: {
                'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
                'X-RateLimit-Remaining': String(rateLimit.remaining),
                'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
              }
            });
        }

        return NextResponse.json(
            { error: 'Failed to fetch versions', tool },
            {
              status: 500,
              headers: {
                'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
                'X-RateLimit-Remaining': String(rateLimit.remaining),
                'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
              }
            }
        );
    }
}
