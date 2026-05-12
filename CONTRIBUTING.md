# Contributing to SudoStart

First off, thank you for considering contributing to SudoStart! It's people like you that make SudoStart such a great tool.

> **Note:** This document is a guide for contributing to SudoStart. Please read it carefully to ensure your contributions can be accepted efficiently.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Development Environment](#development-environment)
  - [Project Structure](#project-structure)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Adding New Tools](#adding-new-tools)
  - [Pull Requests](#pull-requests)
- [Development Guidelines](#development-guidelines)
  - [Coding Standards](#coding-standards)
  - [Commit Messages](#commit-messages)
  - [Branch Naming](#branch-naming)
- [Testing](#testing)
- [Documentation](#documentation)
- [Release Process](#release-process)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to:

- **Be respectful**: Treat everyone with respect. Healthy debate is encouraged, but harassment is not tolerated.
- **Be constructive**: Provide constructive feedback and be open to receiving it.
- **Be collaborative**: Work together towards the best possible solution.
- **Be inclusive**: Welcome newcomers and help them learn.

---

## Getting Started

### Development Environment

#### Prerequisites

- Node.js 18.x or higher
- pnpm 9.x (preferred) or npm 9.x
- Git
- A code editor (VS Code recommended)

#### Setup Steps

1. **Fork the repository**
   
   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/sudo-start.git
   cd sudo-start
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/The-SudoStart/sudo-start.git
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GROQ_API_KEY
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

### Project Structure

```
sudo-start/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   ├── chat/       # AI chat endpoint
│   │   │   ├── script-share/
│   │   │   └── versions/   # Version fetching API
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Main page
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── boot-screen.tsx
│   │   ├── chat-window.tsx
│   │   ├── navbar.tsx
│   │   └── ...
│   ├── lib/                # Utility functions and data
│   │   ├── apps/           # App catalog definitions
│   │   │   ├── index.ts    # Main catalog export
│   │   │   ├── ides.ts
│   │   │   ├── browsers.ts
│   │   │   └── ...
│   │   ├── script-generator.ts
│   │   ├── store.ts        # Zustand store
│   │   └── utils.ts
│   └── types/              # TypeScript types
│       └── index.ts
├── public/                 # Static assets
├── components.json         # shadcn/ui config
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json
```

---

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please:

1. **Check existing issues** to avoid duplicates
2. **Use the latest version** to verify the bug still exists
3. **Collect information** about the bug:
   - OS and version
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

**Submit a bug report by opening a [new issue](https://github.com/The-SudoStart/sudo-start/issues/new)** with the "Bug Report" template.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

1. **Use a clear title** describing the enhancement
2. **Provide a detailed description** of the proposed feature
3. **Explain why** this enhancement would be useful
4. **List possible alternatives** you've considered

**Submit an enhancement by opening a [new issue](https://github.com/The-SudoStart/sudo-start/issues/new)** with the "Feature Request" template.

### Adding New Tools

One of the easiest ways to contribute is by adding new development tools to the catalog:

1. **Find the appropriate category file** in `src/lib/apps/`
2. **Add the tool definition** following the existing pattern
3. **Test the installation commands** on your target platform
4. **Submit a pull request**

Example tool definition:

```typescript
{
  id: 'my-tool',
  name: 'My Tool',
  description: 'A brief description of the tool',
  category: 'Category Name',
  icon: 'https://example.com/icon.png',
  platforms: {
    macos: true,
    linux: true,
  },
  versions: [
    {
      id: 'latest',
      name: 'Latest',
      macCommand: 'brew install my-tool',
      linuxCommand: 'sudo apt install my-tool',
    },
  ],
  defaultVersion: 'latest',
}
```

### Pull Requests

1. **Update your fork** before starting work:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/my-bugfix
   ```

3. **Make your changes** following our coding standards

4. **Commit your changes** with clear messages

5. **Push to your fork**:
   ```bash
   git push origin feature/my-feature
   ```

6. **Open a Pull Request** against the `main` branch

#### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated (if needed)
- [ ] No console errors or warnings
- [ ] Changes tested locally
- [ ] PR title follows convention: `type: description`

---

## 📝 Development Guidelines

### Coding Standards

#### TypeScript

- Use strict TypeScript settings
- Define explicit types for function parameters and returns
- Avoid `any` type - use `unknown` when necessary
- Use interfaces for object shapes
- Export types from `src/types/index.ts`

#### React Components

- Use functional components with hooks
- Keep components small and focused
- Use custom hooks for reusable logic
- Follow the existing component structure

```typescript
// Good example
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  className?: string;
}

export function MyComponent({ title, className }: MyComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={cn('base-class', className)}>
      <h1>{title}</h1>
    </div>
  );
}
```

#### Styling

- Use Tailwind CSS for styling
- Use the `cn()` utility for conditional classes
- Follow the existing color scheme and design system
- Ensure responsive design

#### State Management

- Use Zustand for global state
- Keep state as close to where it's used as possible
- Use React hooks for local component state

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi colons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(apps): add support for Zed editor
fix(script): correct Homebrew command for M1 Macs
docs(readme): update installation instructions
refactor(store): simplify bucket state management
```

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `chore/description` - Maintenance tasks

Examples:
- `feature/add-docker-compose`
- `fix/macos-install-command`
- `docs/contributing-guide`

---

## Testing

### Manual Testing

Before submitting a PR, test your changes:

1. **Run the development server** and verify no errors
2. **Test on both macOS and Linux selections**
3. **Verify script generation** works correctly
4. **Check responsive design** on different screen sizes
5. **Test AI chat functionality** (if applicable)

### Linting

Run ESLint to check code quality:

```bash
pnpm lint
```

Fix any linting errors before committing.

### Type Checking

Run TypeScript compiler to check for type errors:

```bash
pnpm tsc --noEmit
```

---

## Documentation

- Update the README.md if you add new features
- Add JSDoc comments to complex functions
- Update this CONTRIBUTING.md if processes change
- Keep the CHANGELOG.md updated for releases

---

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` with new changes
3. Create a new release on GitHub
4. Tag the release with semantic versioning (e.g., `v1.0.0`)

---

## Questions?

If you have questions or need help:

1. Check existing [issues](https://github.com/The-SudoStart/sudo-start/issues)
2. Open a new issue with the "Question" label
3. Join our Discord community

---

## Thank You!

Thank you for contributing to SudoStart! Your efforts help make development environment setup easier for developers worldwide.

---

<div align="center">

**[⬆ Back to Top](#contributing-to-sudostart)**

Happy coding!

</div>
