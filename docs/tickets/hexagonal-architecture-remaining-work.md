# Ticket: Complete Hexagonal Architecture Implementation

**Status:** 📋 Ready for Development  
**Priority:** High  
**Estimated Effort:** 2-3 days  
**Labels:** `architecture`, `refactoring`, `hexagonal`, `technical-debt`, `testing`

**Parent Ticket:** [Hexagonal Architecture Refactor](./hexagonal-architecture-refactor.md)  
**Current Compliance:** ~67% Complete

---

## Overview

The core hexagonal architecture (Domain, Application, and Infrastructure layers) has been successfully implemented. This ticket covers the **remaining work** needed to achieve full compliance with hexagonal architecture principles and complete the refactoring initiative.

## Current State

### ✅ Completed (67%)
- Domain Layer: Entities, Value Objects, Services ✓
- Application Layer: Use Cases, DTOs, Ports ✓
- Infrastructure Layer: Adapters (AI, Registries, Storage) ✓
- DI Container: Manual dependency injection ✓
- Entity Tests: Package, Bucket, Script ✓

### ❌ Remaining (33%)
- UI Layer: Business logic still in components
- Repository Pattern: Static catalog not abstracted
- Testing: Missing use case, adapter, and integration tests
- Legacy Cleanup: Old lib/ folder still in use
- Documentation: No ADR or architecture docs

---

## Phase 1: Extract Business Logic from Components ⏳
**Estimated Time:** 0.5-1 day

### Current Issues

Components contain business logic that should be in use cases:

#### 1.1 `chat-window.tsx` (350 lines)
**Problem:** Contains AI response parsing and action execution logic

**Current Code (lines 64-113):**
```typescript
const parseAndExecuteAction = useCallback((fullContent: string) => {
  // Business logic: Parse JSON, validate packages, modify bucket
  const jsonMatch = fullContent.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    const action = JSON.parse(jsonMatch[1]);
    // Directly manipulates bucket state
    if (action.action === 'add') {
      action.packageIds.forEach((id: string) => {
        const pkg = appCatalog.find(p => p.id === id); // Direct catalog access
        if (pkg) addToBucket(pkg);
      });
    }
  }
}, [bucket, addToBucket, removeFromBucket]);
```

**Required Changes:**
- [ ] Create `ParseAIResponseUseCase` in application layer
- [ ] Move JSON parsing logic to use case
- [ ] Move package validation to domain service
- [ ] Component should only call use case and handle UI state
- [ ] Add unit tests for the use case

#### 1.2 `package-manager.tsx` (565 lines)
**Problem:** Contains version fetching and command preview generation

**Current Code (lines 348-365):**
```typescript
const handleVersionDropdownOpen = async () => {
  // Direct API call from component
  const res = await fetch(`/api/versions?tool=${toolId}`);
  const data = await res.json();
  // Business logic: Process versions
  const processedVersions = data.versions?.map((v: string) => {
    return v.replace(/^(v?)(\d+\.\d+\.\d+).*$/, '$1$2');
  });
  setVersions(processedVersions);
};
```

**Current Code (lines 374-392):**
```typescript
const getPreviewCommand = () => {
  // Business logic: Template string replacement
  const cmd = selectedVersion 
    ? template.replaceAll('${VERSION}', selectedVersion)
              .replaceAll('${VERSION_NO_V}', selectedVersion.replace(/^v/, ''))
    : template;
  return cmd;
};
```

**Required Changes:**
- [ ] Create `FetchPackageVersionsUseCase` (already exists, verify usage)
- [ ] Move version processing logic to use case or domain service
- [ ] Move command template rendering to domain service
- [ ] Component should receive processed data from use case
- [ ] Add unit tests for template rendering logic

#### 1.3 `script-output.tsx` (454 lines)
**Problem:** Contains script generation orchestration

**Current Code:**
```typescript
// Imports from legacy lib/
import { generateScript, generateBrewfile, downloadScript } from '@/lib/script-generator';

// Component orchestrates script generation
const handleGenerate = async () => {
  const script = generateScript(bucket, os, shell); // Direct call
  setGeneratedScript(script);
};
```

**Required Changes:**
- [ ] Use `GenerateScriptUseCase` from DI container
- [ ] Remove dependency on `@/lib/script-generator`
- [ ] Component should be thin, only display results
- [ ] Add error handling at component level

### Acceptance Criteria
- [ ] No business logic in React components
- [ ] Components only handle UI state and events
- [ ] All business logic delegated to use cases
- [ ] Components under 150 lines each
- [ ] Unit tests for extracted use cases

---

## Phase 2: Implement PackageRepository Pattern ⏳
**Estimated Time:** 0.5 day

### Current Issues

Static catalog is accessed directly throughout the codebase:

**Problem Pattern:**
```typescript
// Direct import and usage
import { appCatalog } from '@/lib/apps';

// In components
const pkg = appCatalog.find(p => p.id === id);
const categoryApps = appCatalog.filter(p => p.category === category);
```

**Problems:**
- No abstraction over data source
- Impossible to swap catalog implementation (e.g., API-driven catalog)
- Hard to test (must mock module imports)
- Violates Dependency Inversion Principle

### Required Changes

#### 2.1 Create Repository Interface
**File:** `src/domain/repositories/package-repository.interface.ts`

```typescript
export interface PackageRepository {
  findById(id: string): Promise<Package | null>;
  findByCategory(category: string): Promise<Package[]>;
  findAll(): Promise<Package[]>;
  search(query: string): Promise<Package[]>;
  findByPlatform(platform: Platform): Promise<Package[]>;
}
```

#### 2.2 Create Static Catalog Adapter
**File:** `src/infrastructure/adapters/catalog/static-package.repository.ts`

```typescript
export class StaticPackageRepository implements PackageRepository {
  private catalog: PackageEntity[];
  
  constructor() {
    // Convert static appCatalog to entities
    this.catalog = appCatalog.map(pkg => PackageEntity.fromDTO(pkg));
  }
  
  async findById(id: string): Promise<PackageEntity | null> {
    return this.catalog.find(p => p.id === id) || null;
  }
  
  async findByCategory(category: string): Promise<PackageEntity[]> {
    return this.catalog.filter(p => p.category === category);
  }
  
  // ... other methods
}
```

#### 2.3 Update DI Container
**File:** `src/infrastructure/config/di-container.ts`

```typescript
import { StaticPackageRepository } from '../adapters/catalog/static-package.repository';

export const container = {
  packageRepository: new StaticPackageRepository(),
  // ... other dependencies
};
```

#### 2.4 Update Components
**Files to update:**
- [ ] `chat-window.tsx` - Use repository instead of direct catalog access
- [ ] `package-manager.tsx` - Use repository for package lookups
- [ ] `boot-screen.tsx` - Use repository if accessing packages
- [ ] Any other components importing `appCatalog`

### Acceptance Criteria
- [ ] `PackageRepository` interface defined in domain layer
- [ ] `StaticPackageRepository` implements interface
- [ ] No direct imports of `appCatalog` in components
- [ ] All package access goes through repository
- [ ] Repository can be mocked for testing
- [ ] Unit tests for repository implementation

---

## Phase 3: Add Comprehensive Testing ⏳
**Estimated Time:** 0.5-1 day

### Current State
- Only 3 test files exist (entity tests)
- No use case tests
- No adapter tests
- No integration tests
- CI/CD doesn't run tests

### Required Tests

#### 3.1 Application Layer Tests
**Directory:** `src/application/use-cases/__tests__/`

- [ ] `generate-script.use-case.test.ts`
  - Test successful script generation
  - Test with empty bucket
  - Test with unsupported platform
  - Mock `PackageRepository` and `ScriptGenerator`

- [ ] `chat-with-ai.use-case.test.ts`
  - Test successful chat
  - Test error handling
  - Test rate limiting
  - Mock `AIProvider`

- [ ] `fetch-versions.use-case.test.ts`
  - Test successful version fetch
  - Test caching behavior
  - Test error handling
  - Mock `VersionRepository`

- [ ] `share-script.use-case.test.ts`
  - Test successful share
  - Test validation
  - Mock `ScriptShareAdapter`

- [ ] `manage-bucket.use-case.test.ts` (if created)
  - Test add, remove, clear operations
  - Test duplicate prevention

#### 3.2 Infrastructure Adapter Tests
**Directory:** `src/infrastructure/adapters/__tests__/`

- [ ] `groq-adapter.test.ts`
  - Test successful API call
  - Test error handling
  - Test rate limiting
  - Mock `groq-sdk`

- [ ] `http-version.repository.test.ts`
  - Test version fetching for different tools
  - Test caching
  - Test error handling
  - Mock `fetch` or use MSW

- [ ] `local-storage-adapter.test.ts`
  - Test storage operations
  - Test serialization/deserialization
  - Mock `localStorage`

- [ ] `static-package.repository.test.ts`
  - Test findById
  - Test findByCategory
  - Test search

#### 3.3 Integration Tests
**Directory:** `src/__tests__/integration/`

- [ ] `script-generation.flow.test.ts`
  - Test full flow: bucket → script generation
  - Use real domain services, mock external APIs

- [ ] `chat.flow.test.ts`
  - Test full chat flow with AI
  - Mock Groq API

#### 3.4 Update CI/CD
**File:** `.github/workflows/ci.yml`

```yaml
- name: Run Tests
  run: pnpm test

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### Acceptance Criteria
- [ ] >80% test coverage for application layer
- [ ] >80% test coverage for domain layer (already have entity tests)
- [ ] All adapters have unit tests with mocked dependencies
- [ ] At least 2 integration tests for critical flows
- [ ] CI/CD runs tests on every PR
- [ ] Coverage report generated

---

## Phase 4: Legacy Code Cleanup ⏳
**Estimated Time:** 0.5 day

### Current Issues

Legacy `/src/lib/` folder still contains mixed concerns:

```
src/lib/
├── apps/                    # 3,173 lines - Static catalog
│   ├── index.ts
│   ├── ides.ts
│   ├── browsers.ts
│   └── ... (18 more files)
├── registries/              # Legacy registry adapters
│   ├── homebrew.ts
│   ├── apt.ts
│   ├── npm.ts
│   └── pypi.ts
├── store.ts                 # 147 lines - Zustand with business logic
├── script-generator.ts      # Re-exports from domain (bridge file)
├── security.ts              # 185 lines - Security utilities
└── ...                      # Other utilities
```

### Required Changes

#### 4.1 Migrate Static Catalog
- [ ] Move `src/lib/apps/` to `src/infrastructure/data/catalog/`
- [ ] Update imports in `StaticPackageRepository`
- [ ] Ensure no other files import from old location

#### 4.2 Remove Legacy Registry Adapters
- [ ] Verify `src/lib/registries/` is no longer used
- [ ] Check if any components still import from here
- [ ] Remove if safe, or migrate remaining logic

#### 4.3 Refactor Store
**File:** `src/lib/store.ts`

**Current Issues:**
```typescript
// Store mixes persistence with business logic
addToBucket: (pkg) => set((state) => {
  // Business logic in store
  const bucket = createBucket(state.bucket).add(PackageEntity.fromDTO(pkg));
  return { bucket: bucketToPackages(bucket) };
}),
```

**Required Changes:**
- [ ] Create `ManageBucketUseCase` if not exists
- [ ] Store should only handle persistence and UI state
- [ ] Business logic should delegate to use case
- [ ] Or use domain events pattern

#### 4.4 Remove Bridge Files
- [ ] Remove `src/lib/script-generator.ts` (re-exports from domain)
- [ ] Update all imports to use domain directly or DI container

#### 4.5 Security Utilities
- [ ] Keep `src/lib/security.ts` but consider moving to `src/shared/security/`
- [ ] Or create `SecurityService` in domain layer

### Acceptance Criteria
- [ ] No imports from `@/lib/apps` (use repository instead)
- [ ] No imports from `@/lib/registries` (use adapters instead)
- [ ] Store only handles persistence, no business logic
- [ ] Bridge files removed
- [ ] All imports updated

---

## Phase 5: Documentation ⏳
**Estimated Time:** 0.5 day

### Required Documentation

#### 5.1 Architecture Decision Record (ADR)
**File:** `docs/adr/001-hexagonal-architecture.md`

```markdown
# ADR 001: Hexagonal Architecture

## Status
Accepted

## Context
SudoStart needed better separation of concerns, testability, and extensibility.

## Decision
Implement Hexagonal Architecture (Ports and Adapters pattern).

## Consequences
- Positive: Better testability, clear boundaries, easy to extend
- Negative: Initial learning curve, more files/directories
```

#### 5.2 Architecture Overview
**File:** `docs/architecture/overview.md`

- [ ] Explain the three layers (Domain, Application, Infrastructure)
- [ ] Describe the dependency rule
- [ ] Document the DI container approach
- [ ] Include architecture diagrams

#### 5.3 Developer Guide
**File:** `docs/development/guide.md`

- [ ] How to add a new use case
- [ ] How to add a new adapter
- [ ] How to add a new entity
- [ ] Testing guidelines
- [ ] Code organization rules

#### 5.4 Update README
**File:** `README.md`

- [ ] Add architecture section
- [ ] Link to detailed documentation
- [ ] Add diagram showing architecture

### Acceptance Criteria
- [ ] ADR created and committed
- [ ] Architecture overview document complete
- [ ] Developer guide with examples
- [ ] README updated with architecture info

---

## Success Metrics

- [ ] **Component Size:** All components under 150 lines
- [ ] **Test Coverage:** >80% for domain and application layers
- [ ] **No Direct Catalog Access:** All package access via repository
- [ ] **Clean Imports:** No imports from legacy `lib/` (except utilities)
- [ ] **Documentation:** ADR + architecture docs complete
- [ ] **CI/CD:** Tests run on every PR with coverage report

---

## Implementation Order

**Recommended sequence:**

1. **Phase 2** (PackageRepository) - Unblocks component refactoring
2. **Phase 1** (Extract Business Logic) - Depends on repository
3. **Phase 4** (Legacy Cleanup) - Do alongside Phase 1
4. **Phase 3** (Testing) - Test as you refactor
5. **Phase 5** (Documentation) - Document what you've built

**Alternative: Parallel Work**
- Developer A: Phases 1 & 2 (Components + Repository)
- Developer B: Phase 3 (Testing)
- Developer C: Phase 5 (Documentation)
- Together: Phase 4 (Legacy cleanup)

---

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing functionality | High | Comprehensive tests, feature flags, gradual rollout |
| Performance regression | Medium | Benchmark before/after, optimize adapters |
| Developer confusion | Low | Documentation, code review, pair programming |
| Scope creep | Medium | Stick to ticket scope, create follow-up tickets |

---

## Related Tickets

- Parent: [Hexagonal Architecture Refactor](./hexagonal-architecture-refactor.md)
- Related: [Component Refactoring Guidelines](./component-refactoring.md) (if exists)

---

## Notes

- This ticket assumes the core architecture is already in place
- Focus is on completing the implementation, not redesigning
- Keep changes minimal and focused
- Update tests as you refactor (don't break existing tests)

---

**Created:** 2026-07-28  
**Author:** Development Team  
**Reviewers:** [To be assigned]  
**Estimated Completion:** 2-3 days
