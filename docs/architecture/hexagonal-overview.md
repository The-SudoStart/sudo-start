# Hexagonal Architecture Overview


```mermaid

flowchart TB
    subgraph "Infrastructure Layer (Adapters)"
        direction TB
        UI[("UI Components<br/>React/Next.js")]
        API[("API Routes<br/>Next.js API")]
        Groq[("Groq Adapter")]
        Brew[("Homebrew Adapter")]
        Apt[("Apt Adapter")]
        Npm[("NPM Adapter")]
        File[("File System")]
    end

    subgraph "Application Layer (Ports)"
        direction TB
        UC1[("Generate Script<br/>Use Case")]
        UC2[("Chat with AI<br/>Use Case")]
        UC3[("Fetch Versions<br/>Use Case")]
        UC4[("Manage Bucket<br/>Use Case")]
    end

    subgraph "Domain Layer (Core)"
        direction TB
        Ent1[("Package<br/>Entity")]
        Ent2[("Script<br/>Entity")]
        Ent3[("Bucket<br/>Entity")]
        Svc[("Script Generation<br/>Domain Service")]
        Repo[("Package Repository<br/>Interface")]
    end

    UI -->|"drives"| UC1
    UI -->|"drives"| UC2
    UI -->|"drives"| UC4
    API -->|"drives"| UC2
    API -->|"drives"| UC3
    
    UC1 -->|"uses"| Svc
    UC2 -->|"uses"| Groq
    UC3 -->|"uses"| Brew
    UC3 -->|"uses"| Apt
    UC4 -->|"uses"| Ent3
    
    Svc -->|"uses"| Ent1
    Svc -->|"uses"| Ent2
    Svc -->|"uses"| Repo
    
    Brew -->|"implements"| Repo
    Apt -->|"implements"| Repo
    Npm -->|"implements"| Repo
```
SudoStart is organized around ports and adapters so core behavior can be tested without React, Next.js, Groq, browser storage, or registry HTTP calls.

## Layers

### Domain

`src/domain` contains the core model:

- Entities: `PackageEntity`, `Script`, `Bucket`
- Value objects: `Platform`, `Shell`, `Version`
- Repository interfaces: `PackageRepository`, `VersionRepository`
- Domain services: script generation and install cost estimation

Domain code should not import React components, API routes, Zustand stores, SDK clients, or browser APIs.

### Application

`src/application` contains use cases and ports:

- `GenerateScriptUseCase`
- `ChatWithAIUseCase`
- `FetchVersionsUseCase`
- `ManageBucketUseCase`
- `ParseAIActionUseCase`
- `ShareScriptUseCase`

Use cases coordinate domain objects and outgoing ports. They should not know whether the caller is a React component, API route, CLI command, or test.

### Infrastructure

`src/infrastructure` contains adapters:

- AI: Groq and future OpenAI adapter
- Catalog: static package repository
- Registries: HTTP and browser version repositories
- Storage: local storage adapter
- Sharing: file-backed script share adapter
- Config: server and browser-safe dependency containers

External dependencies belong here.

### Presentation

`src/presentation` contains UI implementations. `src/components` exposes thin compatibility wrappers so existing imports remain stable while presentation code moves out of the legacy component layer.

Presentation code can call browser-safe use cases through `clientContainer`, but it should not import static catalog data or server adapters directly.

## Dependency Direction

Allowed direction:

`presentation/api -> application -> domain`

Adapters implement ports and are injected from infrastructure containers. Domain and application code do not import infrastructure implementations.

## Adding a Provider or Registry

To add a new AI provider, implement `AIProvider` and wire it in the DI container.

To add a new version source, implement `VersionRepository` or extend the HTTP version repository source map.

To add a new package catalog backend, implement `PackageRepository` and replace the static package repository binding.
