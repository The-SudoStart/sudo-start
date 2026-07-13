import { OS, Shell, Package } from '@/types';
import { requiresFlatpak } from './apps';
import { sanitizeVersion, isValidVersion } from './security';

/**
 * Generates a progress bar string for bash output
 */
function generateProgressBar(current: number, total: number, width: number = 30): string {
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * SECURITY: Validates and sanitizes version strings to prevent command injection.
 * Version strings flow directly into shell commands via template interpolation,
 * so we must ensure they contain only safe characters.
 */
function sanitizeVersionString(versionId: string): string {
  // First check if version is valid
  if (!isValidVersion(versionId)) {
    console.warn(`[Security] Invalid version string detected: ${versionId}, using default`);
    // Return safe default - empty string will be handled by caller
    return '';
  }
  // Apply sanitization as defense in depth
  return sanitizeVersion(versionId);
}

/**
 * Resolves the exact install command for a package+version combo.
 */
function resolveCommand(pkg: Package, os: 'macos' | 'linux'): string {
  const rawVersionId = pkg.selectedVersion || pkg.defaultVersion;
  
  // SECURITY: Sanitize version string before any shell interpolation
  const versionId = sanitizeVersionString(rawVersionId);
  
  // If version is invalid/empty after sanitization, fall back to default
  if (!versionId) {
    const defaultEntry = pkg.versions.find((v) => v.id === pkg.defaultVersion) ?? pkg.versions[0];
    return os === 'macos'
      ? (defaultEntry?.macCommand ?? '')
      : (defaultEntry?.linuxCommand ?? '');
  }
  
  const template = os === 'macos' ? pkg.macosCommandTemplate : pkg.linuxCommandTemplate;

  const exactEntry = pkg.versions.find((v) => v.id === versionId);
  const isGeneric = ['stable', 'latest', 'fnm', 'deb', 'appimage', 'community', 'ultimate', 'brew', 'standalone'].includes(versionId);

  if (template && !isGeneric) {
    const v = versionId.startsWith('v') ? versionId : `v${versionId}`;
    const v_no_v = versionId.startsWith('v') ? versionId.slice(1) : versionId;
    const v_major = v_no_v.split('.')[0];
    return template
      .replaceAll('${VERSION}', v)
      .replaceAll('${VERSION_NO_V}', v_no_v)
      .replaceAll('${VERSION_MAJOR}', v_major);
  }

  if (exactEntry) {
    return os === 'macos' ? exactEntry.macCommand : exactEntry.linuxCommand;
  }

  const defaultEntry =
    pkg.versions.find((v) => v.id === pkg.defaultVersion) ?? pkg.versions[0];
  return os === 'macos'
    ? (defaultEntry?.macCommand ?? '')
    : (defaultEntry?.linuxCommand ?? '');
}

export function generateScript(
  os: OS | null,
  shell: Shell | null,
  packages: Package[]
): string {
  if (!os || !shell) {
    return '# Please select an OS and Shell to generate a script';
  }

  const lines: string[] = [];

  lines.push('#!/bin/bash');
  lines.push('');
  lines.push('# ╔══════════════════════════════════════════════════╗');
  lines.push('# ║     SudoStart — Zero-to-Code Setup Script        ║');
  lines.push('# ╚══════════════════════════════════════════════════╝');
  lines.push(`# OS: ${os.toUpperCase()}  |  Shell: ${shell}  |  Packages: ${packages.length}`);
  lines.push(`# Generated: ${new Date().toISOString().split('T')[0]}`);
  lines.push('');

  // Emit version pin notes summary if any packages have notes
  const annotatedPkgs = packages.filter((p) => p.versionNote?.trim());
  if (annotatedPkgs.length > 0) {
    lines.push('# ── Version Pin Notes ─────────────────────────────────');
    annotatedPkgs.forEach((pkg) => {
      const v = pkg.selectedVersion || pkg.defaultVersion;
      const isGeneric = ['stable', 'latest'].includes(v);
      const vLabel = isGeneric ? 'stable' : v.startsWith('v') ? v : `v${v}`;
      lines.push(`# ${pkg.name} @ ${vLabel}: ${pkg.versionNote}`);
    });
    lines.push('');
  }

  lines.push('set -e  # Exit immediately on error');
  lines.push('set -u  # Treat unset variables as errors');
  lines.push('');

  // Colour helpers
  lines.push('# ── Colour helpers ────────────────────────────────────');
  lines.push('RED="\\033[0;31m"');
  lines.push('GREEN="\\033[0;32m"');
  lines.push('YELLOW="\\033[1;33m"');
  lines.push('CYAN="\\033[0;36m"');
  lines.push('BLUE="\\033[0;34m"');
  lines.push('RESET="\\033[0m"');
  lines.push('BOLD="\\033[1m"');
  lines.push('');
  lines.push('log()  { echo -e "${CYAN}[SudoStart]${RESET} $*"; }');
  lines.push('ok()   { echo -e "${GREEN}  ✓${RESET} $*"; }');
  lines.push('warn() { echo -e "${YELLOW}  ⚠${RESET} $*"; }');
  lines.push('err()  { echo -e "${RED}  ✗${RESET} $*" >&2; }');
  lines.push('');

  // Progress bar functions
  lines.push('# ── Progress bar functions ───────────────────────────');
  lines.push('PROGRESS_WIDTH=30');
  lines.push('draw_progress_bar() {');
  lines.push('  local current=$1');
  lines.push('  local total=$2');
  lines.push('  local name="$3"');
  lines.push('  local filled=$((current * PROGRESS_WIDTH / total))');
  lines.push('  local empty=$((PROGRESS_WIDTH - filled))');
  lines.push('  local bar=""');
  lines.push('  for ((i=0; i<filled; i++)); do bar+="█"; done');
  lines.push('  for ((i=0; i<empty; i++)); do bar+="░"; done');
  lines.push('  printf "\\r${CYAN}[%s]${RESET} %s ${BOLD}%s${RESET} (%d/%d)" "$bar" "Installing:" "$name" "$current" "$total"');
  lines.push('}');
  lines.push('');
  lines.push('clear_line() {');
  lines.push('  printf "\\r%-80s\\r" ""');
  lines.push('}');
  lines.push('');

  // Check for verbose mode
  lines.push('# ── Check for verbose mode ────────────────────────────');
  lines.push('VERBOSE=false');
  lines.push('if [[ "${1:-}" == "--verbose" || "${1:-}" == "-v" ]]; then');
  lines.push('  VERBOSE=true');
  lines.push('  log "Verbose mode enabled"');
  lines.push('fi');
  lines.push('');

  // Spinner function for visual feedback
  lines.push('# ── Spinner for visual feedback ────────────────────────');
  lines.push('spinner() {');
  lines.push('  local pid=$1');
  lines.push('  local delay=0.1');
  lines.push('  local spinstr="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"');
  lines.push('  while ps -p $pid > /dev/null 2>&1; do');
  lines.push('    local temp=${spinstr#?}');
  lines.push('    printf " ${CYAN}%c${RESET}" "$spinstr"');
  lines.push('    local spinstr=$temp${spinstr%"$temp"}');
  lines.push('    sleep $delay');
  lines.push('    printf "\\b\\b "');
  lines.push('  done');
  lines.push('  printf "\\b\\b"');
  lines.push('}');
  lines.push('');

  lines.push('echo ""');
  lines.push('echo -e "${CYAN}╔══════════════════════════════════════════════════╗${RESET}"');
  lines.push('echo -e "${CYAN}║     SudoStart — System Setup Initialization      ║${RESET}"');
  lines.push('echo -e "${CYAN}╚══════════════════════════════════════════════════╝${RESET}"');
  lines.push('echo ""');
  lines.push('');

  const needsFlatpak = os === 'linux' && packages.some((pkg) => requiresFlatpak(pkg));

  if (os === 'macos') {
    lines.push('# ── Bootstrap: Homebrew ───────────────────────────────');
    lines.push('if ! command -v brew &>/dev/null; then');
    lines.push('  log "Installing Homebrew..."');
    lines.push('  if [ "$VERBOSE" = true ]; then');
    lines.push('    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
    lines.push('  else');
    lines.push('    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" 2>&1 | tail -5');
    lines.push('  fi');
    lines.push('  ok "Homebrew installed"');
    lines.push('else');
    lines.push('  log "Homebrew found — updating..."');
    lines.push('  if [ "$VERBOSE" = true ]; then');
    lines.push('    brew update');
    lines.push('  else');
    lines.push('    brew update --quiet 2>&1 | tail -3');
    lines.push('  fi');
    lines.push('  ok "Homebrew up to date"');
    lines.push('fi');
    lines.push('');
  } else {
    lines.push('# ── Bootstrap: apt ────────────────────────────────────');
    lines.push('log "Updating package lists..."');
    lines.push('if [ "$VERBOSE" = true ]; then');
    lines.push('  sudo apt-get update');
    lines.push('else');
    lines.push('  sudo apt-get update -qq 2>&1 | tail -5');
    lines.push('fi');
    lines.push('ok "Package lists updated"');
    lines.push('');

    if (needsFlatpak) {
      lines.push('# ── Bootstrap: Flatpak ────────────────────────────────');
      lines.push('if ! command -v flatpak &>/dev/null; then');
      lines.push('  log "Installing Flatpak..."');
      lines.push('  if [ "$VERBOSE" = true ]; then');
      lines.push('    sudo apt-get install -y flatpak');
      lines.push('  else');
      lines.push('    sudo apt-get install -y flatpak -qq 2>&1 | tail -3');
      lines.push('  fi');
      lines.push('  sudo flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo');
      lines.push('  warn "A system restart may be required for Flatpak apps to appear"');
      lines.push('else');
      lines.push('  ok "Flatpak already installed"');
      lines.push('fi');
      lines.push('');
    }
  }

  if (packages.length > 0) {
    lines.push('# ── Package Installation ─────────────────────────────');
    lines.push(`TOTAL_PACKAGES=${packages.length}`);
    lines.push('CURRENT_PACKAGE=0');
    lines.push('');
    lines.push('echo ""');
    lines.push(`echo -e "\${BOLD}Installing ${packages.length} package(s)...\${RESET}"`);
    lines.push('echo ""');
    lines.push('');

    packages.forEach((pkg, idx) => {
      const versionId = pkg.selectedVersion || pkg.defaultVersion;
      const isGeneric = ['stable', 'latest'].includes(versionId);
      const versionLabel = isGeneric ? '' : ` @ ${versionId}`;

      lines.push(`# [${idx + 1}/${packages.length}] ${pkg.name}${versionLabel}`);
      lines.push(`CURRENT_PACKAGE=$((CURRENT_PACKAGE + 1))`);
      lines.push(`draw_progress_bar $CURRENT_PACKAGE ${packages.length} "${pkg.name}"`);
      lines.push('');

      // Emit pin note as inline comment if present
      if (pkg.versionNote?.trim()) {
        lines.push(`# 📌 Pin note: ${pkg.versionNote.trim()}`);
      }

      const installCmd = resolveCommand(pkg, os);

      if (!installCmd || installCmd.trim().startsWith('#')) {
        lines.push(`warn "${pkg.name} is not available on ${os.toUpperCase()} — skipping"`);
      } else {
        const checkCmd = getCheckCommand(pkg.id);
        if (checkCmd) {
          lines.push(`if command -v ${checkCmd} &>/dev/null; then`);
          lines.push(`  : # Already installed`);
          lines.push('else');
          // Run install with suppressed output unless verbose
          lines.push('  if [ "$VERBOSE" = true ]; then');
          installCmd.split('\n').forEach((line) => {
            lines.push(`    ${line}`);
          });
          lines.push('  else');
          lines.push('    # Suppress output and show only errors');
          installCmd.split('\n').forEach((line) => {
            if (line.trim()) {
              lines.push(`    ${line} > /dev/null 2>&1 || true`);
            }
          });
          lines.push('  fi');
          lines.push('fi');
        } else {
          lines.push('if [ "$VERBOSE" = true ]; then');
          installCmd.split('\n').forEach((line) => {
            lines.push(`  ${line}`);
          });
          lines.push('else');
          installCmd.split('\n').forEach((line) => {
            if (line.trim()) {
              lines.push(`  ${line} > /dev/null 2>&1 || true`);
            }
          });
          lines.push('fi');
        }
      }

      lines.push('');
    });

    lines.push('clear_line');
    lines.push('');
  }

  lines.push('echo ""');
  lines.push('echo -e "${GREEN}╔══════════════════════════════════════════════════╗${RESET}"');
  lines.push('echo -e "${GREEN}║      ✓  Setup complete. Happy coding! 🚀         ║${RESET}"');
  lines.push('echo -e "${GREEN}╚══════════════════════════════════════════════════╝${RESET}"');
  lines.push('echo ""');
  lines.push(`echo "  OS       : ${os.toUpperCase()}"`);
  lines.push(`echo "  Shell    : ${shell}"`);
  lines.push(`echo "  Packages : ${packages.length} installed"`);
  lines.push('echo ""');
  lines.push('if [ "$VERBOSE" = false ]; then');
  lines.push('  echo -e "${CYAN}Tip:${RESET} Run with ${BOLD}--verbose${RESET} flag to see detailed output"');
  lines.push('fi');
  lines.push('echo ""');

  return lines.join('\n');
}

/** Generate a macOS Brewfile */
export function generateBrewfile(packages: Package[]): string {
  const lines: string[] = [];
  lines.push('# Brewfile generated by SudoStart');
  lines.push(`# Date: ${new Date().toISOString().split('T')[0]}`);
  lines.push('');

  const taps: string[] = [];
  const brews: string[] = [];
  const casks: string[] = [];

  packages.forEach((pkg) => {
    const versionId = pkg.selectedVersion || pkg.defaultVersion;
    const entry = pkg.versions.find((v) => v.id === versionId) ?? pkg.versions[0];
    if (!entry) return;
    const cmd = entry.macCommand;

    if (cmd.includes('brew install --cask')) {
      const name = cmd.replace(/brew install --cask\s+/, '').trim();
      if (pkg.versionNote?.trim()) {
        casks.push(`# 📌 ${pkg.versionNote}`);
      }
      casks.push(`cask "${name}"`);
    } else if (cmd.includes('brew tap')) {
      const tap = cmd.replace(/brew tap\s+/, '').trim();
      taps.push(`tap "${tap}"`);
    } else if (cmd.includes('brew install')) {
      const name = cmd.replace(/brew install\s+/, '').trim();
      if (pkg.versionNote?.trim()) {
        brews.push(`# 📌 ${pkg.versionNote}`);
      }
      brews.push(`brew "${name}"`);
    }
  });

  if (taps.length) {
    lines.push('# Taps');
    taps.forEach((t) => lines.push(t));
    lines.push('');
  }
  if (brews.length) {
    lines.push('# CLI tools');
    brews.forEach((b) => lines.push(b));
    lines.push('');
  }
  if (casks.length) {
    lines.push('# GUI apps');
    casks.forEach((c) => lines.push(c));
    lines.push('');
  }

  return lines.join('\n');
}

/** Estimate install time in minutes */
export function estimateInstallTime(packages: Package[]): number {
  const weights: Record<string, number> = {
    ide: 3, browser: 2, runtime: 4, container: 5, database: 4,
    'data-science': 6, mobile: 8, 'game-dev': 10, 'desktop-dev': 5,
    framework: 2, tool: 1, utility: 1, terminal: 2, 'package-manager': 1,
    'build-tool': 2, cloud: 2, devops: 3, communication: 2, productivity: 2,
    'web-server': 2,
  };
  const total = packages.reduce((sum, p) => sum + (weights[p.category] ?? 2), 0);
  return Math.max(1, total);
}

/** Rough disk-space estimate in MB */
export function estimateDiskSpace(packages: Package[]): number {
  const weights: Record<string, number> = {
    ide: 400, browser: 300, runtime: 200, container: 500, database: 300,
    'data-science': 800, mobile: 1500, 'game-dev': 2000, 'desktop-dev': 400,
    framework: 100, tool: 30, utility: 20, terminal: 80, 'package-manager': 50,
    'build-tool': 100, cloud: 80, devops: 150, communication: 200,
    productivity: 150, 'web-server': 80,
  };
  return packages.reduce((sum, p) => sum + (weights[p.category] ?? 100), 0);
}

function getCheckCommand(pkgId: string): string | null {
  const map: Record<string, string> = {
    vscode: 'code', cursor: 'cursor', zed: 'zed', vim: 'vim', intellij: 'idea',
    nvm: 'nvm', nodejs: 'node', npm: 'npm', python3: 'python3',
    ruby: 'ruby', php: 'php', kotlin: 'kotlinc', rust: 'rustc',
    go: 'go', java: 'java', cpp: 'g++',
    pnpm: 'pnpm', yarn: 'yarn', pyenv: 'pyenv', rbenv: 'rbenv', sdkman: 'sdk',
    make: 'make', cmake: 'cmake', gradle: 'gradle', maven: 'mvn',
    docker: 'docker', 'docker-desktop': 'docker', podman: 'podman',
    kubectl: 'kubectl', minikube: 'minikube',
    'aws-cli': 'aws', gcloud: 'gcloud', 'azure-cli': 'az',
    git: 'git', curl: 'curl', wget: 'wget', jq: 'jq', htop: 'htop',
    tmux: 'tmux', openssh: 'ssh', ngrok: 'ngrok', zsh: 'zsh',
    'oh-my-zsh': 'omz', terraform: 'terraform', ansible: 'ansible',
    'github-cli': 'gh', postman: 'postman', insomnia: 'insomnia',
    postgresql: 'psql', mysql: 'mysql', mariadb: 'mariadb',
    sqlite3: 'sqlite3', redis: 'redis-cli', mongodb: 'mongosh',
    warp: 'warp-terminal', alacritty: 'alacritty', kitty: 'kitty',
    hyper: 'hyper', ghostty: 'ghostty',
    zoom: 'zoom', telegram: 'telegram-desktop',
    bitwarden: 'bitwarden', raycast: 'raycast', flutter: 'flutter',
  };
  return map[pkgId] ?? null;
}

export function downloadScript(script: string, filename = 'sudo-start-setup.sh') {
  const blob = new Blob([script], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}