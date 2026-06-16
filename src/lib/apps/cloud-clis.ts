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
];