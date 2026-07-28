# Ticket: Refactor to Hexagonal Architecture

**Status:** 📋 Planned  
**Priority:** High  
**Estimated Effort:** 3-5 days  
**Labels:** `architecture`, `refactoring`, `technical-debt`, `hexagonal`

---

## Overview

Refactor the SudoStart codebase from its current layered/component-based architecture to **Hexagonal Architecture** (Ports and Adapters pattern). This will improve testability, maintainability, and make the codebase more extensible for future features like Windows support, different AI providers, and additional package managers.

---

## Current Architecture Issues

1. **Mixed Concerns**: Business logic (script generation, package resolution) is scattered across React components and API routes
2. **Tight Coupling**: Direct dependencies on:
   - Groq AI (hard to swap for OpenAI/Anthropic)
   - Specific registries (Homebrew, apt) - hard to add Windows support
   - Zustand store structure throughout components
3. **Testing Difficulty**: Business logic is intertwined with React components, making unit testing nearly impossible
4. **Extensibility Problems**: Adding new features requires changes across multiple layers

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              INFRASTRUCTURE LAYER (Adapters)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   UI Layer   │  │   API Layer  │  │ External Services│   │
│  │  (React/     │  │  (Next.js    │  │  (Groq, Registries│   │
│  │   Next.js)   │  │   Routes)    │  │   Storage)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION LAYER (Use Cases)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Generate Installation Script                      │   │
│  │  • Chat with AI Assistant                            │   │
│  │  • Fetch Package Versions                            │   │
│  │  • Manage User Bucket                                │   │
│  │  • Share Scripts                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DOMAIN LAYER (Core)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Entities   │  │   Services   │  │  Repositories    │   │
│  │  (Package,   │  │  (Script     │  │  (Interfaces)    │   │
│  │   Script,    │  │   Generator) │  │                  │   │
│  │   Bucket)    │  │              │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Domain Layer Foundation ⏳
**Estimated Time:** 1 day

#### Tasks:
- [ ] Create `src/domain/entities/` directory structure
- [ ] Implement `Package` entity with:
  - Properties: id, name, description, category, platforms, installCommands
  - Methods: supportsPlatform(), getInstallCommand()
- [ ] Implement `Script` entity with:
  - Properties: content, packages, targetPlatform, shell
  - Methods: validate(), toString()
- [ ] Implement `Bucket` entity with:
  - Properties: items, createdAt, updatedAt
  - Methods: add(), remove(), clear(), getItems()
- [ ] Create value objects:
  - `Version` (with validation)
  - `Platform` (enum: macOS, Linux, Windows)
  - `Shell` (enum: bash, zsh, fish)
- [ ] Define repository interfaces:
  - `PackageRepository` (findById, findByCategory, search)
  - `VersionRepository` (fetchLatest, validateVersion)

#### Acceptance Criteria:
- All entities have unit tests with 100% coverage
- Entities are pure TypeScript (no React, no external dependencies)
- Value objects are immutable

---

### Phase 2: Application Layer (Use Cases) ⏳
**Estimated Time:** 1-1.5 days

#### Tasks:
- [ ] Create `src/application/ports/` for incoming ports
- [ ] Implement use cases:
  - `GenerateScriptUseCase`
    - Input: packages[], platform, shell
    - Output: Script entity
  - `ChatWithAIUseCase`
    - Input: message, context (bucket contents)
    - Output: AI response
  - `FetchVersionsUseCase`
    - Input: packageIds[]
    - Output: version map
  - `ManageBucketUseCase`
    - Methods: addPackage, removePackage, clear, getContents
  - `ShareScriptUseCase`
    - Input: script content
    - Output: shareable URL/token
- [ ] Create application services for complex workflows
- [ ] Define DTOs for use case inputs/outputs

#### Acceptance Criteria:
- Use cases are independent of UI framework
- Each use case can be tested in isolation
- Clear separation between application and domain logic

---

### Phase 3: Infrastructure Layer - Adapters ⏳
**Estimated Time:** 1.5-2 days

#### Tasks:
- [ ] Create `src/infrastructure/adapters/` structure:
  ```
  adapters/
  ├── ai/
  │   ├── groq-adapter.ts
  │   ├── openai-adapter.ts (stub for future)
  │   └── ai-provider.interface.ts
  ├── registries/
  │   ├── homebrew-adapter.ts
  │   ├── apt-adapter.ts
  │   ├── npm-adapter.ts
  │   ├── pypi-adapter.ts
  │   └── registry.interface.ts
  ├── storage/
  │   ├── local-storage-adapter.ts
  │   └── storage.interface.ts
  └── http/
      └── http-client.ts
  ```
- [ ] Refactor existing registry helpers into adapters
- [ ] Implement repository pattern for data access
- [ ] Create AI provider abstraction layer
- [ ] Implement storage adapters for persistence

#### Acceptance Criteria:
- Adapters implement domain repository interfaces
- Groq AI can be swapped without changing use cases
- New registries can be added by implementing interface
- All external dependencies are in infrastructure layer

---

### Phase 4: UI and API Refactoring ⏳
**Estimated Time:** 1 day

#### Tasks:
- [ ] Refactor React components to be thin:
  - Components only handle UI state and events
  - Business logic delegated to use cases
- [ ] Refactor API routes:
  - Routes only handle HTTP concerns (validation, headers)
  - Delegate to use cases
- [ ] Update Zustand store to work with new architecture
- [ ] Implement dependency injection container
- [ ] Update existing hooks to use new use cases

#### Files to Refactor:
- [ ] `src/components/script-output.tsx` → Use `GenerateScriptUseCase`
- [ ] `src/components/chat-window.tsx` → Use `ChatWithAIUseCase`
- [ ] `src/components/package-manager.tsx` → Use `ManageBucketUseCase`
- [ ] `src/app/api/chat/route.ts` → Delegate to use case
- [ ] `src/app/api/versions/route.ts` → Delegate to use case
- [ ] `src/lib/script-generator.ts` → Move to domain service

#### Acceptance Criteria:
- Components are under 100 lines each
- No business logic in UI components
- API routes are thin HTTP handlers
- All dependencies injected via DI container

---

### Phase 5: Testing and Documentation ⏳
**Estimated Time:** 0.5-1 day

#### Tasks:
- [ ] Write unit tests for all domain entities
- [ ] Write unit tests for all use cases (with mocked repositories)
- [ ] Write integration tests for adapters
- [ ] Update existing E2E tests if any
- [ ] Create architecture documentation
- [ ] Add ADR (Architecture Decision Record) for hexagonal architecture
- [ ] Update README with new architecture overview

#### Testing Strategy:
```
Domain Tests (Jest/Vitest)
├── entities/
│   ├── package.test.ts
│   ├── script.test.ts
│   └── bucket.test.ts
└── services/
    └── script-generator.test.ts

Application Tests
└── use-cases/
    ├── generate-script.test.ts
    ├── chat-with-ai.test.ts
    └── manage-bucket.test.ts

Integration Tests
└── adapters/
    ├── groq-adapter.test.ts
    └── homebrew-adapter.test.ts
```

---

## Directory Structure After Refactoring

```
src/
├── domain/                          # Domain Layer (Core)
│   ├── entities/
│   │   ├── package.ts
│   │   ├── script.ts
│   │   └── bucket.ts
│   ├── value-objects/
│   │   ├── version.ts
│   │   ├── platform.ts
│   │   └── shell.ts
│   ├── repositories/
│   │   ├── package-repository.interface.ts
│   │   └── version-repository.interface.ts
│   └── services/
│       └── script-generator.ts
│
├── application/                       # Application Layer
│   ├── ports/
│   │   ├── incoming/
│   │   │   ├── generate-script.port.ts
│   │   │   ├── chat-with-ai.port.ts
│   │   │   └── manage-bucket.port.ts
│   │   └── outgoing/
│   │       ├── ai-provider.port.ts
│   │       └── storage.port.ts
│   ├── use-cases/
│   │   ├── generate-script.use-case.ts
│   │   ├── chat-with-ai.use-case.ts
│   │   ├── fetch-versions.use-case.ts
│   │   └── manage-bucket.use-case.ts
│   └── dto/
│       ├── generate-script.dto.ts
│       └── chat-message.dto.ts
│
├── infrastructure/                    # Infrastructure Layer
│   ├── adapters/
│   │   ├── ai/
│   │   │   ├── groq.adapter.ts
│   │   │   └── openai.adapter.ts
│   │   ├── registries/
│   │   │   ├── homebrew.adapter.ts
│   │   │   ├── apt.adapter.ts
│   │   │   └── npm.adapter.ts
│   │   └── storage/
│   │       └── local-storage.adapter.ts
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts
│   │   ├── versions/
│   │   │   └── route.ts
│   │   └── script-share/
│   │       └── route.ts
│   └── config/
│       └── di-container.ts
│
├── presentation/                      # Presentation Layer (UI)
│   ├── components/
│   │   ├── boot-screen.tsx
│   │   ├── package-manager.tsx
│   │   ├── script-output.tsx
│   │   └── chat-window.tsx
│   ├── hooks/
│   │   ├── use-generate-script.ts
│   │   ├── use-chat.ts
│   │   └── use-bucket.ts
│   └── store/
│       └── app-store.ts
│
└── shared/                           # Shared Utilities
    ├── types/
    ├── utils/
    └── constants/
```

---

## Benefits After Completion

### Immediate Benefits:
- ✅ **Testability**: Unit test business logic without React components
- ✅ **Flexibility**: Swap AI providers (Groq ↔ OpenAI ↔ Anthropic) with single file change
- ✅ **Platform Support**: Add Windows (Winget/Chocolatey) by creating new adapter
- ✅ **Maintainability**: Changes to UI don't affect business logic

### Long-term Benefits:
- ✅ **Team Scaling**: Frontend and backend developers work independently
- ✅ **Feature Velocity**: New features require changes only in specific layers
- ✅ **Code Quality**: Clear boundaries prevent spaghetti code
- ✅ **Onboarding**: New developers understand architecture quickly

---

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes during refactor | High | Create feature branch, comprehensive tests, gradual rollout |
| Increased complexity | Medium | Document architecture decisions, provide team training |
| Time overrun | Medium | Break into phases, deliver incrementally |
| Performance regression | Low | Benchmark before/after, optimize adapters |

---

## Success Metrics

- [ ] All existing functionality preserved (feature parity)
- [ ] Unit test coverage > 80% for domain and application layers
- [ ] Component file size < 100 lines (business logic extracted)
- [ ] Zero business logic in UI components
- [ ] New AI provider can be added in < 30 minutes
- [ ] New package registry can be added in < 1 hour

---

## Related Resources

- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design by Eric Evans](https://domainlanguage.com/ddd/reference/)
- Current codebase analysis: See `/docs/architecture/current-state.md`

---

## Notes

- This is a **non-breaking refactor** - all existing features must continue working
- Consider using **feature flags** for gradual rollout if needed
- Document any deviations from pure hexagonal architecture (if necessary for Next.js constraints)
- Update CI/CD pipeline to run new test suites

---

**Created:** 2026-07-28  
**Author:** Development Team  
**Reviewers:** [To be assigned]
