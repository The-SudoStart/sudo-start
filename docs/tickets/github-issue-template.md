# GitHub Issue Template

Copy and paste the following into a new GitHub issue:

---

## Title
`[ARCHITECTURE] Refactor codebase to Hexagonal Architecture (Ports & Adapters)`

---

## Body

```markdown
## Overview
Refactor the SudoStart codebase from its current layered/component-based architecture to **Hexagonal Architecture** (Ports and Adapters pattern). This will improve testability, maintainability, and make the codebase more extensible for future features.

## Current Problems
- ❌ Business logic (script generation, package resolution) scattered across React components and API routes
- ❌ Tight coupling to Groq AI (hard to swap providers)
- ❌ Tight coupling to specific registries (Homebrew, apt) - Windows support difficult
- ❌ Testing business logic requires mounting React components
- ❌ Adding new features requires changes across multiple layers

## Proposed Solution
Implement Hexagonal Architecture with clear separation:

**Domain Layer (Core)**
- Entities: Package, Script, Bucket
- Value Objects: Version, Platform, Shell
- Domain Services: ScriptGenerator
- Repository Interfaces

**Application Layer**
- Use Cases: GenerateScript, ChatWithAI, FetchVersions, ManageBucket
- DTOs for input/output
- Application Services

**Infrastructure Layer**
- Adapters: GroqAI, Homebrew, Apt, LocalStorage
- API Routes (thin HTTP handlers)
- UI Components (thin presentation layer)

## Implementation Phases

### Phase 1: Domain Layer Foundation [1 day]
- [ ] Create domain entities (Package, Script, Bucket)
- [ ] Create value objects (Version, Platform, Shell)
- [ ] Define repository interfaces
- [ ] Write unit tests (target: 100% coverage)

### Phase 2: Application Layer [1-1.5 days]
- [ ] Implement use cases
- [ ] Create DTOs
- [ ] Write unit tests with mocked repositories

### Phase 3: Infrastructure Adapters [1.5-2 days]
- [ ] Refactor existing registry helpers into adapters
- [ ] Create AI provider abstraction
- [ ] Implement storage adapters
- [ ] Write integration tests

### Phase 4: UI/API Refactoring [1 day]
- [ ] Refactor components to be thin (delegate to use cases)
- [ ] Refactor API routes to be thin HTTP handlers
- [ ] Implement dependency injection
- [ ] Update existing hooks

### Phase 5: Testing & Documentation [0.5-1 day]
- [ ] Achieve >80% test coverage
- [ ] Create architecture documentation
- [ ] Add ADR (Architecture Decision Record)
- [ ] Update README

## Benefits
✅ **Testability**: Unit test business logic without React components  
✅ **Flexibility**: Swap AI providers (Groq ↔ OpenAI ↔ Anthropic) with single file change  
✅ **Platform Support**: Add Windows (Winget/Chocolatey) by creating new adapter  
✅ **Maintainability**: Changes to UI don't affect business logic  
✅ **Team Scaling**: Frontend and backend developers work independently  

## Success Metrics
- [ ] All existing functionality preserved (feature parity)
- [ ] Unit test coverage > 80% for domain and application layers
- [ ] Component file size < 100 lines (business logic extracted)
- [ ] Zero business logic in UI components
- [ ] New AI provider can be added in < 30 minutes
- [ ] New package registry can be added in < 1 hour

## Risks
| Risk | Mitigation |
|------|------------|
| Breaking changes | Feature branch, comprehensive tests, gradual rollout |
| Increased complexity | Document architecture decisions, team training |
| Time overrun | Break into phases, deliver incrementally |

## Resources
- Detailed ticket: `/docs/tickets/hexagonal-architecture-refactor.md`
- Visual reference: `/docs/tickets/hexagonal-refactor-diagram.md`
- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)

## Estimated Effort
**3-5 days** across 5 phases

## Priority
**High** - Blocks Windows support and AI provider flexibility

## Labels
`architecture`, `refactoring`, `technical-debt`, `hexagonal`, `enhancement`
```

---

## Quick Commands to Create Issue

### Option 1: Using GitHub CLI (if installed)
```bash
gh issue create \
  --title "[ARCHITECTURE] Refactor codebase to Hexagonal Architecture (Ports & Adapters)" \
  --label "architecture,refactoring,technical-debt,enhancement" \
  --body-file docs/tickets/github-issue-body.md
```

### Option 2: Using GitHub Web Interface
1. Go to: https://github.com/[username]/sudo-start/issues/new
2. Copy the title above
3. Copy the body above (between the triple backticks)
4. Add labels: `architecture`, `refactoring`, `technical-debt`, `enhancement`
5. Submit issue

---

## Related Files Created

1. **Detailed Ticket**: `docs/tickets/hexagonal-architecture-refactor.md`
   - Full implementation plan
   - Phase-by-phase breakdown
   - Directory structure
   - Acceptance criteria

2. **Visual Reference**: `docs/tickets/hexagonal-refactor-diagram.md`
   - Before/after architecture diagrams
   - Data flow examples
   - Testing strategy
   - Migration path

3. **This Template**: `docs/tickets/github-issue-template.md`
   - Ready-to-use GitHub issue format
```
