# Developer Guide

## Where New Code Goes

- New business rules belong in `src/domain`.
- New workflows belong in `src/application/use-cases`.
- New external integrations belong in `src/infrastructure/adapters`.
- New UI belongs in `src/presentation/components` with a thin export from `src/components` when preserving existing imports is useful.
- API routes should parse requests, validate HTTP concerns, set headers, and delegate to use cases.

## Package Catalog Access

Do not import `appCatalog` from React components or application use cases. Use the package repository instead:

```ts
import { clientContainer } from '@/infrastructure/config/client-container';

const packages = clientContainer.packageRepository.findForPlatformSync(os);
```

Server-side code should use `container.packageRepository`.

## Version Fetching

UI code should use `FetchVersionsUseCase` through `clientContainer`. Server API routes should use the server `container`.

## AI Action Parsing

AI response parsing and validation belongs to `ParseAIActionUseCase`. React components should only apply the parsed action to UI state.

## Testing

Run:

```bash
pnpm test
pnpm test:coverage
```

Coverage is configured for domain and application layers with an 80% threshold.

## Boundaries Checklist

- No React imports in `domain` or `application`.
- No SDK, `fetch`, filesystem, or browser storage usage in `domain`.
- No direct `appCatalog` imports in components.
- New adapters implement ports or repository interfaces.
- Components call use cases or repositories through browser-safe infrastructure bindings.
