export type OS = 'macos' | 'linux';
export type Shell = 'bash' | 'zsh' | 'fish';
export type Category =
  | 'ide' | 'browser' | 'tool' | 'runtime' | 'database' | 'container'
  | 'terminal' | 'framework' | 'devops' | 'data-science' | 'mobile'
  | 'game-dev' | 'desktop-dev' | 'web-server' | 'package-manager'
  | 'build-tool' | 'cloud' | 'utility' | 'communication' | 'productivity'
  | 'security' | 'media' | 'vcs';

export interface AppVersion {
  id: string;
  label: string;
  macCommand: string;
  linuxCommand: string;
}

export interface PlatformSupport {
  macos: boolean;
  linux: boolean;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  category: Category;
  icon?: string;
  platforms: PlatformSupport;
  defaultVersion: string;
  versions: AppVersion[];
  selectedVersion?: string;
  /** Optional note explaining why this version was pinned */
  versionNote?: string;
  macosInstallCmd?: string;
  linuxInstallCmd?: string;
  linuxCommandTemplate?: string;
  macosCommandTemplate?: string;
}

export interface AppState {
  os: OS | null;
  shell: Shell | null;
  bucket: Package[];
  generatedScript: string;
  currentStep: 'boot' | 'catalog' | 'chat' | 'output';
  isChatOpen: boolean;

  setOS: (os: OS) => void;
  setShell: (shell: Shell) => void;
  addToBucket: (pkg: Package) => void;
  removeFromBucket: (pkgId: string) => void;
  updatePackageVersion: (pkgId: string, version: string) => void;
  updatePackageNote: (pkgId: string, note: string) => void;
  addDefaultAppsToBucket: () => void;
  loadPreset: (packageIds: string[]) => void;
  exportBucket: () => void;
  importBucket: (json: string) => boolean;
  setGeneratedScript: (script: string) => void;
  setCurrentStep: (step: 'boot' | 'catalog' | 'chat' | 'output') => void;
  toggleChat: () => void;
  clearBucket: () => void;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}