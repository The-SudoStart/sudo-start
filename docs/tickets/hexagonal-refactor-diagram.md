# Hexagonal Architecture Refactor - Visual Reference

## Before vs After

### Current Architecture (Layered)
```
┌────────────────────────────────────────────┐
│  UI Components (React)                     │
│  - BootScreen                              │
│  - PackageManager                          │
│  - ScriptOutput                            │
│  - ChatWindow                              │
├────────────────────────────────────────────┤
│  State (Zustand)                           │
│  - bucket                                  │
│  - generatedScript                         │
│  - currentStep                             │
├────────────────────────────────────────────┤
│  Business Logic (Mixed)                    │
│  - script-generator.ts                     │
│  - security.ts                             │
│  - API routes                              │
├────────────────────────────────────────────┤
│  External Services                           │
│  - Groq API                                │
│  - Homebrew                                │
│  - Apt                                     │
└────────────────────────────────────────────┘

Problems:
❌ Business logic scattered
❌ Hard to test
❌ Tight coupling
❌ Difficult to extend
```

### After: Hexagonal Architecture
```
┌─────────────────────────────────────────────────────────────┐
│  PRIMARY ADAPTERS (Drive the Application)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   React UI   │  │   Next.js    │  │   CLI Tool       │   │
│  │   Components │  │   API Routes │  │   (Future)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Uses
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER (Use Cases)                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  GenerateScriptUseCase                                 │   │
│  │  ChatWithAIUseCase                                     │   │
│  │  FetchVersionsUseCase                                  │   │
│  │  ManageBucketUseCase                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Uses
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  DOMAIN LAYER (Core Business Logic)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Package    │  │   Script     │  │   Bucket         │   │
│  │   Entity     │  │   Entity     │  │   Entity         │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ScriptGenerator (Domain Service)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Depends on (Interfaces)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  SECONDARY ADAPTERS (Driven by Application)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Groq       │  │   Homebrew   │  │   LocalStorage   │   │
│  │   Adapter    │  │   Adapter    │  │   Adapter        │   │
│  ├──────────────┤  ├──────────────┤  ├──────────────────┤   │
│  │   OpenAI     │  │   Apt        │  │   IndexedDB      │   │
│  │   Adapter    │  │   Adapter    │  │   Adapter        │   │
│  │   (Future)   │  │   (Future)   │  │   (Future)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Benefits:
✅ Clear separation of concerns
✅ Easy to test (mock adapters)
✅ Loose coupling
✅ Easy to extend (add adapters)
```

## Dependency Rule

```
Dependencies can only point INWARD

   Infrastructure ───────┐
         │               │
         ▼               │
   Application ──────────┼─── Domain (Core)
         │               │
         ▼               │
   Domain (No deps) ◄────┘

Domain Layer knows NOTHING about:
- React
- Next.js
- Groq
- Homebrew
- LocalStorage

It only knows its own entities and interfaces.
```

## Data Flow Example: Generate Script

```
1. User clicks "Generate Script"
   │
   ▼
2. React Component calls GenerateScriptUseCase
   │
   ▼
3. Use Case validates input (DTO)
   │
   ▼
4. Use Case calls ScriptGenerator domain service
   │
   ▼
5. Domain Service creates Script entity
   │
   ▼
6. Domain Service uses PackageRepository interface
   │
   ▼
7. Infrastructure Adapter (Homebrew/Apt) implements interface
   │
   ▼
8. Script entity returned to Use Case
   │
   ▼
9. Use Case returns ScriptDTO to UI
   │
   ▼
10. React Component displays script
```

## Port and Adapter Examples

### Incoming Port (Driven by UI)
```typescript
// application/ports/generate-script.port.ts
interface GenerateScriptPort {
  execute(input: GenerateScriptInput): Promise<ScriptDTO>;
}

// Used by React component
const { generateScript } = useGenerateScript();
```

### Outgoing Port (Drives Infrastructure)
```typescript
// domain/repositories/package-repository.interface.ts
interface PackageRepository {
  findById(id: string): Promise<Package | null>;
  findByCategory(category: string): Promise<Package[]>;
  search(query: string): Promise<Package[]>;
}

// Implemented by adapters
class HomebrewPackageRepository implements PackageRepository { }
class AptPackageRepository implements PackageRepository { }
```

## Testing Strategy

```
Domain Tests (Fast, No Dependencies)
├── entities/package.test.ts
├── entities/script.test.ts
└── services/script-generator.test.ts
    └── Mock PackageRepository

Application Tests (Fast, Mocked)
├── use-cases/generate-script.test.ts
│   └── Mock all outgoing ports
└── use-cases/chat-with-ai.test.ts
    └── Mock AI provider

Integration Tests (Slower, Real Dependencies)
├── adapters/groq-adapter.test.ts
├── adapters/homebrew-adapter.test.ts
└── adapters/local-storage-adapter.test.ts

E2E Tests (Full Stack)
└── user-journey.test.ts
```

## Migration Path

```
Phase 1: Create Domain Layer (Parallel to existing code)
   ├─ Create new directory structure
   ├─ Implement entities
   └─ Write unit tests

Phase 2: Create Application Layer
   ├─ Define use cases
   ├─ Create DTOs
   └─ Write unit tests

Phase 3: Create Adapters
   ├─ Refactor existing code into adapters
   ├─ Implement repository interfaces
   └─ Write integration tests

Phase 4: Migrate UI
   ├─ Refactor components to use use cases
   ├─ Remove business logic from components
   └─ Update E2E tests

Phase 5: Cleanup
   ├─ Remove old code
   ├─ Update documentation
   └─ Performance testing
```
