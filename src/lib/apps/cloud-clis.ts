import { Package } from '@/types';

export const cloudCliApps: Package[] = [
  {
    id: 'aws-cli',
    name: 'AWS CLI',
    description: '☁️ Official command-line interface for Amazon Web Services',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-${VERSION_NO_V}.zip" -o "awscliv2.zip" && sudo apt-get install -y unzip && unzip awscliv2.zip && sudo ./aws/install && rm -rf awscliv2.zip aws/',
    macosCommandTemplate: 'brew install awscli',
    versions: [
      {
        id: 'stable',
        label: 'Stable (v2)',
        macCommand: 'brew install awscli',
        linuxCommand: 'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && sudo apt-get install -y unzip && unzip awscliv2.zip && sudo ./aws/install && rm -rf awscliv2.zip aws/',
      },
    ],
  },
  {
    id: 'gcloud',
    name: 'Google Cloud CLI',
    description: '🌩️ Official command-line tool for Google Cloud Platform',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask google-cloud-sdk',
        linuxCommand: 'curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list && sudo apt-get update && sudo apt-get install -y google-cloud-cli',
      },
    ],
  },
  {
    id: 'azure-cli',
    name: 'Azure CLI',
    description: '🔷 Official command-line interface for Microsoft Azure',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash -s -- --version ${VERSION_NO_V}',
    macosCommandTemplate: 'brew install azure-cli',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install azure-cli',
        linuxCommand: 'curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash',
      },
    ],
  },
  {
    id: 'pulumi',
    name: 'Pulumi',
    description: '🚀 Infrastructure as Code in any programming language',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install pulumi',
        linuxCommand: 'curl -fsSL https://get.pulumi.com | sh',
      },
    ],
  },
  {
    id: 'helm',
    name: 'Helm',
    description: '⛵ Kubernetes package manager',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install helm',
        linuxCommand: 'curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash',
      },
    ],
  },
  {
    id: 'kustomize',
    name: 'Kustomize',
    description: '🔧 Kubernetes native configuration management',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install kustomize',
        linuxCommand: 'curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash && sudo mv kustomize /usr/local/bin/',
      },
    ],
  },
  {
    id: 'argocd-cli',
    name: 'ArgoCD CLI',
    description: '🐙 Declarative GitOps CD for Kubernetes',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install argocd',
        linuxCommand: 'curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64 && sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd && rm argocd-linux-amd64',
      },
    ],
  },
  {
    id: 'vercel-cli',
    name: 'Vercel CLI',
    description: '▲ Deploy web projects with ease',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'npm i -g vercel',
        linuxCommand: 'npm i -g vercel',
      },
    ],
  },
  {
    id: 'netlify-cli',
    name: 'Netlify CLI',
    description: '🌐 Deploy modern web projects',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'npm install -g netlify-cli',
        linuxCommand: 'npm install -g netlify-cli',
      },
    ],
  },
  {
    id: 'supabase-cli',
    name: 'Supabase CLI',
    description: '🔥 Open-source Firebase alternative CLI',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install supabase/tap/supabase',
        linuxCommand: 'npm install -g supabase',
      },
    ],
  },
  {
    id: 'stripe-cli',
    name: 'Stripe CLI',
    description: '💳 Build, test, and manage Stripe integration',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install stripe/stripe-cli/stripe',
        linuxCommand: 'curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg && echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list && sudo apt update && sudo apt install stripe',
      },
    ],
  },
  {
    id: 'aws-cdk',
    name: 'AWS CDK',
    description: '🏗️ AWS Cloud Development Kit for infrastructure as code',
    category: 'cloud',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'npm install -g aws-cdk',
        linuxCommand: 'npm install -g aws-cdk',
      },
    ],
  },
];