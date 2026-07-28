# GitHub Issue: Complete Hexagonal Architecture Implementation

Copy and paste the following into a new GitHub issue:

---

## Title
`[ARCHITECTURE] Complete Hexagonal Architecture Implementation (33% Remaining)`

---

## Body

```markdown
## Overview
The core hexagonal architecture has been successfully implemented (67% complete). This ticket covers the **remaining 33%** needed to achieve full compliance with hexagonal architecture principles.

## Current Status

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

## Implementation Phases

### Phase 1: Extract Business Logic from Components [0.5-1 day]
- [ ] Refactor `chat-window.tsx` - Move AI response parsing to use case
- [ ] Refactor `package-manager.tsx` - Move version fetching to use case
- [ ] Refactor `script-output.tsx` - Use DI container instead of direct calls
- [ ] Ensure all components under 150 lines
- [ ] Add unit tests for extracted use cases

### Phase 2: Implement PackageRepository Pattern [0.5 day]
- [ ] Create `PackageRepository` interface in domain layer
- [ ] Create `StaticPackageRepository` adapter
- [ ] Update DI container with repository
- [ ] Replace all direct `appCatalog` imports with repository usage
- [ ] Add unit tests for repository

### Phase 3: Add Comprehensive Testing [0.5-1 day]
- [ ] Application layer tests (all use cases)
- [ ] Infrastructure adapter tests (with mocked dependencies)
- [ ] Integration tests for critical flows
- [ ] Update CI/CD to run tests and generate coverage reports
- [ ] Target: >80% coverage for domain and application layers

### Phase 4: Legacy Code Cleanup [0.5 day]
- [ ] Migrate `src/lib/apps/` to infrastructure layer
- [ ] Remove or migrate `src/lib/registries/`
- [ ] Refactor `src/lib/store.ts` to remove business logic
- [ ] Remove bridge files (e.g., `script-generator.ts`)
- [ ] Update all imports

### Phase 5: Documentation [0.5 day]
- [ ] Create ADR (Architecture Decision Record)
- [ ] Write architecture overview document
- [ ] Create developer guide
- [ ] Update README with architecture section

## Success Metrics
- [ ] All components under 150 lines
- [ ] >80% test coverage for domain and application layers
- [ ] Zero direct `appCatalog` imports in components
- [ ] No business logic in React components
- [ ] Complete documentation (ADR + guides)
- [ ] CI/CD runs tests with coverage reports

```
