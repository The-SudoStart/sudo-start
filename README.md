<div align="center">

# SudoStart

**The Developer's Boot Screen**

Configure your dream development environment in seconds with a terminal-inspired interface.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Live Demo](https://sudo-start.vercel.app) · [Report Bug](https://github.com/The-SudoStart/sudo-start/issues) · [Request Feature](https://github.com/The-SudoStart/sudo-start/issues)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Usage](#usage)
  - [Selecting Tools](#selecting-tools)
  - [Using Root AI](#using-root-ai)
  - [Generating Scripts](#generating-scripts)
- [Supported Platforms](#supported-platforms)
- [App Categories](#app-categories)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🔍 About

SudoStart is a modern web application that simplifies development environment setup. With a hacker-themed, terminal-inspired interface, developers can quickly select their preferred tools and generate customized installation scripts for macOS and Linux.

### Why SudoStart?

- **Save Time**: No more manually installing tools one by one
- **Consistency**: Ensure your team uses the same development stack
- **Discoverability**: Find new tools across 17+ categories
- **AI-Powered**: Get intelligent recommendations from "Root" AI

---

## ✨ Features

### 🎨 Terminal Aesthetics
- Beautiful, hacker-themed UI with deep dark modes
- Retro terminal animations and visual effects
- Intuitive command-line inspired interface

### 📦 Modern App Catalog
Curated list of 2025's best development tools across 17+ categories:

| Category | Example Tools |
|----------|---------------|
| **AI IDEs** | Windsurf, Cursor, Zed, VS Code |
| **Browsers** | Zen Browser, Arc, Vivaldi, Brave |
| **Languages** | Rust, Go, Python, Java, Node.js, C++ |
| **Containers** | Docker, Podman, Kubernetes (kubectl, minikube) |
| **DevOps** | Terraform, Ansible, AWS CLI, Azure CLI |
| **Databases** | PostgreSQL, MySQL, MongoDB, Redis |
| **Frameworks** | React, Vue, Angular, Svelte |
| **Mobile Dev** | Flutter, React Native, Android Studio |
| **Game Dev** | Unity Hub, Unreal Engine, Godot |
| **Data Science** | Jupyter, Anaconda, RStudio |
| **Terminals** | Alacritty, iTerm2, Warp, WezTerm |
| **Productivity** | Notion, Obsidian, Slack, Discord |

### Smart "Root" AI Assistant
- **Agentic Capabilities**: Root can actively add and remove packages from your bucket
- **Context Aware**: Knows your OS (Mac/Linux) and suggests valid tools
- **Natural Language**: "Add Rust and Docker to my setup" or "What do I need for backend development?"
- **Smart Recommendations**: Suggests complementary tools based on your selections

### Cross-Platform Support
- **macOS**: Homebrew-based installation scripts
- **Linux**: apt/snap/flatpak-based installation scripts
- **Version Selection**: Choose specific versions for supported tools
- **Existence Checks**: Scripts check if tools are already installed

### Developer Experience
- **Real-time Version API**: Fetches latest versions from official sources
- **Script Sharing**: Share your setup configuration with others
- **Bucket Management**: Save, review, and modify your tool selections
- **Copy & Paste**: One-click script generation and copying

---

## Demo

![SudoStart Demo](https://via.placeholder.com/800x400/0a0a0a/00ff00?text=SudoStart+Demo+Screenshot)

*Terminal-inspired interface with AI chat and tool selection*

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or **pnpm** 9.x)
- **Git**
- **Groq API Key** (for AI chat functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/The-SudoStart/sudo-start.git
   cd sudo-start
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure Environment**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Groq API Key:
   ```env
   GROQ_API_KEY=gsk_your_api_key_here
   ```
   
   > Get your API key at [console.groq.com](https://console.groq.com)

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open in browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

---

## Usage

### Selecting Tools

1. Choose your target platform (macOS or Linux)
2. Browse categories in the navigation bar
3. Click on tools to add them to your bucket
4. Click the bucket icon to review selections
5. Click "Generate Script" to create your installation script

### Using Root AI

The AI chat interface is located in the bottom right corner:

| Command Type | Example | Result |
|--------------|---------|--------|
| **Advice** | "What do I need for a Rust backend?" | Gets recommendations |
| **Add Tools** | "Add Rust and Docker to my setup" | Adds to bucket |
| **Remove Tools** | "Remove Node.js" | Removes from bucket |
| **Clear All** | "Remove everything" | Empties bucket |
| **Generate** | "Create my script" | Generates installation script |

### Generating Scripts

Once you've selected your tools:

1. Click "Generate Script" to create a bash script
2. Review the generated script
3. Click "Copy to Clipboard" or "Download"
4. Run the script on your target machine

---

## 💻 Supported Platforms

| Platform | Package Manager | Status |
|----------|-----------------|--------|
| **macOS** | Homebrew | ✅ Fully Supported |
| **Ubuntu/Debian** | apt | ✅ Fully Supported |
| **Linux (Generic)** | snap/flatpak | ✅ Fully Supported |
| **Windows** | - | 🚧 Planned |

---

## App Categories

SudoStart supports tools across 17 categories:

1. **AI IDEs** - AI-powered code editors
2. **Browsers** - Development-focused web browsers
3. **Build Tools** - Compilers and build systems
4. **Cloud CLIs** - AWS, Azure, GCP command-line tools
5. **Communication** - Team collaboration tools
6. **Containers** - Docker, Kubernetes, and container tools
7. **Databases** - SQL and NoSQL database systems
8. **Data Science** - Jupyter, R, and analytics tools
9. **Desktop Dev** - Cross-platform desktop development
10. **DevOps** - Infrastructure and deployment tools
11. **Frameworks** - Web and mobile frameworks
12. **Game Dev** - Game development engines and tools
13. **IDEs** - Code editors and integrated environments
14. **Mobile** - iOS and Android development tools
15. **Package Managers** - npm, yarn, pip, cargo, etc.
16. **Productivity** - Note-taking and workflow tools
17. **Runtimes** - Node.js, Python, Go, Rust, etc.
18. **Terminals** - Terminal emulators and shells
19. **Utilities** - System tools and utilities
20. **Web Servers** - Nginx, Apache, Caddy

---

## 🔌 API Reference

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | AI chat with Root assistant |
| `/api/versions` | GET | Fetch latest tool versions |
| `/api/script-share` | POST | Share script configurations |

### Version API

Fetches real-time versions from official sources:

- **Node.js**: Official Node.js releases API
- **Go**: Go official downloads page
- **Python**: endoflife.date API
- **Rust**: GitHub Releases API
- **Docker**: GitHub Releases API

---

## 🗺️ Roadmap

- [ ] Windows support (Winget/Scoop)
- [ ] User accounts and saved configurations
- [ ] Team/workspace collaboration
- [ ] More AI providers (OpenAI, Anthropic)
- [ ] Offline mode
- [ ] CLI tool for local script generation
- [ ] Docker image for self-hosting
- [ ] Plugin system for custom tools

See [open issues](https://github.com/The-SudoStart/sudo-start/issues) for proposed features and known issues.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [Contributing Guide](CONTRIBUTING.md) for information on:
- Code of Conduct
- Development setup
- Coding standards
- Submitting pull requests

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Groq](https://groq.com/) - Fast AI inference
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Lucide](https://lucide.dev/) - Beautiful icons

---

<div align="center">

**[⬆ Back to Top](#-sudostart)**

</div>
