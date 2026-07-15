export interface Preset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tags: string[];
  packageIds: string[];
  estimatedTime?: number; // minutes
}

export const presets: Preset[] = [
  {
    id: 'frontend-dev',
    name: 'Frontend Developer',
    emoji: '⚛️',
    description: 'React/Next.js stack with modern tooling',
    tags: ['React', 'TypeScript', 'Node.js'],
    packageIds: ['vscode', 'cursor', 'brave', 'git', 'nodejs', 'nvm', 'pnpm', 'bun', 'deno', 'zsh', 'oh-my-zsh', 'github-cli', 'curl', 'lazygit', 'fzf', 'ripgrep', 'fd'],
  },
  {
    id: 'backend-python',
    name: 'Python Backend',
    emoji: '🐍',
    description: 'FastAPI / Django / Flask development environment',
    tags: ['Python', 'PostgreSQL', 'Docker'],
    packageIds: ['vscode', 'cursor', 'python3', 'pyenv', 'postgresql', 'redis', 'docker', 'git', 'curl', 'zsh', 'oh-my-zsh', 'postman', 'httpie', 'insomnia', 'lazygit'],
  },
  {
    id: 'rust-systems',
    name: 'Rust Systems Engineer',
    emoji: '🦀',
    description: 'Low-level Rust development with CLI tooling',
    tags: ['Rust', 'Systems', 'CLI'],
    packageIds: ['zed', 'rust', 'git', 'curl', 'cmake', 'make', 'zsh', 'oh-my-zsh', 'htop', 'tmux', 'bottom', 'dust', 'exa', 'bat', 'fd', 'ripgrep', 'fzf', 'lazygit', 'neovim'],
  },
  {
    id: 'devops-cloud',
    name: 'DevOps / Cloud',
    emoji: '☁️',
    description: 'Infrastructure, containers, and cloud CLI tools',
    tags: ['Docker', 'K8s', 'Terraform'],
    packageIds: ['vscode', 'cursor', 'docker', 'kubectl', 'minikube', 'helm', 'kustomize', 'terraform', 'pulumi', 'ansible', 'aws-cli', 'gcloud', 'azure-cli', 'git', 'zsh', 'oh-my-zsh', 'htop', 'tmux', 'jq', 'bottom', 'glances', 'argocd-cli'],
  },
  {
    id: 'ml-engineer',
    name: 'ML / Data Science',
    emoji: '🧪',
    description: 'Python-based ML and data analysis stack',
    tags: ['Python', 'Jupyter', 'TensorFlow'],
    packageIds: ['vscode', 'cursor', 'python3', 'pyenv', 'jupyter', 'tensorflow', 'pandas', 'numpy', 'matplotlib', 'git', 'curl', 'zsh', 'r', 'obsidian'],
  },
  {
    id: 'fullstack-js',
    name: 'Full-Stack JavaScript',
    emoji: '🌐',
    description: 'Node.js full-stack with databases',
    tags: ['Node.js', 'MongoDB', 'PostgreSQL'],
    packageIds: ['cursor', 'vscode', 'nodejs', 'nvm', 'pnpm', 'bun', 'deno', 'postgresql', 'mongodb', 'redis', 'docker', 'git', 'github-cli', 'postman', 'zsh', 'lazygit', 'fzf'],
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Developer',
    emoji: '📱',
    description: 'React Native + Flutter cross-platform setup',
    tags: ['Flutter', 'React Native', 'Android'],
    packageIds: ['vscode', 'flutter', 'react-native', 'nodejs', 'git', 'curl', 'android-studio', 'zsh'],
  },
  {
    id: 'go-backend',
    name: 'Go Backend',
    emoji: '🐹',
    description: 'Golang microservices and API development',
    tags: ['Go', 'Docker', 'PostgreSQL'],
    packageIds: ['vscode', 'cursor', 'go', 'docker', 'postgresql', 'redis', 'git', 'curl', 'make', 'zsh', 'oh-my-zsh', 'jq', 'lazygit', 'fzf'],
  },
  {
    id: 'java-enterprise',
    name: 'Java Enterprise',
    emoji: '☕',
    description: 'Spring Boot / enterprise Java environment',
    tags: ['Java', 'Maven', 'Spring'],
    packageIds: ['intellij', 'java', 'maven', 'gradle', 'docker', 'postgresql', 'git', 'curl', 'zsh'],
  },
  {
    id: 'minimal-setup',
    name: 'Minimal Essentials',
    emoji: '🔧',
    description: 'Just the must-haves for any new machine',
    tags: ['Git', 'Curl', 'Zsh'],
    packageIds: ['git', 'curl', 'wget', 'zsh', 'oh-my-zsh', 'htop', 'tmux', 'jq', 'vim', 'neovim', 'lazygit', 'fzf', 'fd', 'bat', 'ripgrep', 'dust', 'bottom', 'glances', 'eza'],
  },
];