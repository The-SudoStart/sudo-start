import { Package } from '@/types';

export const containerApps: Package[] = [
  {
    id: 'docker',
    name: 'Docker',
    description: '📦 Platform for containerized applications',
    category: 'container',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask docker',
        linuxCommand: 'sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg && sudo install -m 0755 -d /etc/apt/keyrings && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg && sudo chmod a+r /etc/apt/keyrings/docker.gpg && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin',
      },
    ],
  },
  {
    id: 'podman',
    name: 'Podman',
    description: '🦭 Daemonless container engine',
    category: 'container',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install podman',
        linuxCommand: 'sudo apt-get install -y podman',
      },
    ],
  },
  {
    id: 'kubectl',
    name: 'Kubectl',
    description: '☸️ Kubernetes command-line tool',
    category: 'container',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install kubectl',
        linuxCommand: 'K8S_VERSION=$(curl -L -s https://dl.k8s.io/release/stable.txt) && curl -LO "https://dl.k8s.io/release/${K8S_VERSION}/bin/linux/amd64/kubectl" && sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && rm kubectl',
      },
    ],
    linuxCommandTemplate: 'curl -LO "https://dl.k8s.io/release/${VERSION}/bin/linux/amd64/kubectl" && sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl',
    macosCommandTemplate: 'brew install kubectl',
  },
  {
    id: 'minikube',
    name: 'Minikube',
    description: '🏝️ Local Kubernetes environment',
    category: 'container',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install minikube',
        linuxCommand: 'curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && sudo install minikube-linux-amd64 /usr/local/bin/minikube && rm minikube-linux-amd64',
      },
    ],
    linuxCommandTemplate: 'curl -LO https://github.com/kubernetes/minikube/releases/download/${VERSION}/minikube-linux-amd64 && sudo install minikube-linux-amd64 /usr/local/bin/minikube',
    macosCommandTemplate: 'brew install minikube',
  },
  {
    id: 'lima',
    name: 'Lima',
    description: '🍋 Linux virtual machines (macOS-native)',
    category: 'container',
    platforms: { macos: true, linux: false },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install lima',
        linuxCommand: 'echo "Lima is macOS-only"',
      },
    ],
  },
  {
    id: 'multipass',
    name: 'Multipass',
    description: '☁️ Ubuntu VMs on demand',
    category: 'container',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask multipass',
        linuxCommand: 'sudo snap install multipass',
      },
    ],
  },
  {
    id: 'vagrant',
    name: 'Vagrant',
    description: '📦 VM automation and management tool',
    category: 'container',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask vagrant',
        linuxCommand: 'curl -O https://releases.hashicorp.com/vagrant/2.4.0/vagrant_2.4.0_linux_amd64.zip && unzip vagrant_2.4.0_linux_amd64.zip && sudo mv vagrant /usr/local/bin/',
      },
    ],
  },
  {
    id: 'packer',
    name: 'Packer',
    description: '📦 Machine image builder by HashiCorp',
    category: 'container',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install packer',
        linuxCommand: 'curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add - && sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main" && sudo apt-get update && sudo apt-get install packer',
      },
    ],
  },
  {
    id: 'buildah',
    name: 'Buildah',
    description: '🔨 OCI-compliant container image builder',
    category: 'container',
    platforms: { macos: false, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'echo "Buildah is Linux-only"',
        linuxCommand: 'sudo apt-get install -y buildah',
      },
    ],
  },
  {
    id: 'skopeo',
    name: 'Skopeo',
    description: '🔍 Work with container images without daemon',
    category: 'container',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install skopeo',
        linuxCommand: 'sudo apt-get install -y skopeo',
      },
    ],
  },
];
