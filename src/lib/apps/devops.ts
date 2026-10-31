import { Package } from '@/types';

export const devopsApps: Package[] = [
  {
    id: 'jenkins',
    name: 'Jenkins',
    description: 'Open-source automation server',
    category: 'devops',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'wget https://github.com/jenkinsci/jenkins/releases/download/jenkins-${VERSION_NO_V}/jenkins.war',
    macosCommandTemplate: 'brew install jenkins-lts@${VERSION_NO_V}',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install jenkins-lts',
        linuxCommand: 'wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo gpg --dearmor -o /usr/share/keyrings/jenkins.gpg && echo "deb [signed-by=/usr/share/keyrings/jenkins.gpg] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null && sudo apt-get update && sudo apt-get install -y jenkins',
      },
    ],
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    description: 'Monitoring system and time series database',
    category: 'devops',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install prometheus',
        linuxCommand: 'sudo apt-get install -y prometheus',
      },
    ],
    linuxCommandTemplate: 'wget https://github.com/prometheus/prometheus/releases/download/${VERSION}/prometheus-${VERSION_NO_V}.linux-amd64.tar.gz && tar -xvf prometheus-${VERSION_NO_V}.linux-amd64.tar.gz && sudo mv prometheus-${VERSION_NO_V}.linux-amd64/prometheus /usr/local/bin/ && sudo mv prometheus-${VERSION_NO_V}.linux-amd64/promtool /usr/local/bin/ && rm -rf prometheus-${VERSION_NO_V}.linux-amd64*',
    macosCommandTemplate: 'brew install prometheus',
  },
  {
    id: 'docker-compose',
    name: 'Docker Compose',
    description: 'Define and run multi-container applications',
    category: 'devops',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install docker-compose',
        linuxCommand: 'sudo apt-get install -y docker-compose-plugin',
      },
    ],
    linuxCommandTemplate: 'sudo curl -L "https://github.com/docker/compose/releases/download/${VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose',
    macosCommandTemplate: 'brew install docker-compose',
  },
];
