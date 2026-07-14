import { Package } from '@/types';

export const securityApps: Package[] = [
  {
    id: 'bitwarden-cli',
    name: 'Bitwarden CLI',
    description: '🔐 Open-source password manager command-line tool',
    category: 'security',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install bitwarden-cli',
        linuxCommand: 'sudo snap install bw',
      },
    ],
  },
  {
    id: '1password-cli',
    name: '1Password CLI',
    description: '🔑 Password manager for teams and individuals',
    category: 'security',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask 1password-cli',
        linuxCommand: 'curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/amd64 stable main" | sudo tee /etc/apt/sources.list.d/1password.list && sudo apt update && sudo apt install -y 1password-cli',
      },
    ],
  },
  {
    id: 'gpg',
    name: 'GPG',
    description: '🔏 GNU Privacy Guard for encryption and signing',
    category: 'security',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install gnupg',
        linuxCommand: 'sudo apt-get install -y gnupg',
      },
    ],
  },
  {
    id: 'openssl',
    name: 'OpenSSL',
    description: '🔒 Toolkit for SSL/TLS protocols and cryptography',
    category: 'security',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install openssl',
        linuxCommand: 'sudo apt-get install -y openssl',
      },
    ],
  },
  {
    id: 'wireguard',
    name: 'WireGuard',
    description: '🛡️ Modern, fast, and secure VPN protocol',
    category: 'security',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install wireguard-tools',
        linuxCommand: 'sudo apt-get install -y wireguard wireguard-tools',
      },
    ],
  },
  {
    id: 'fail2ban',
    name: 'Fail2Ban',
    description: '🚫 Intrusion prevention tool - bans IPs with failed login attempts',
    category: 'security',
    platforms: { macos: false, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'echo "Fail2Ban is Linux-only"',
        linuxCommand: 'sudo apt-get install -y fail2ban && sudo systemctl enable fail2ban && sudo systemctl start fail2ban',
      },
    ],
  },
];
