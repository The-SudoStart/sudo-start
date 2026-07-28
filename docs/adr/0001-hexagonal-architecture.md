# ADR 0001: Hexagonal Architecture

## Status

Accepted

## Context

SudoStart needs clearer boundaries between script generation, package/version resolution, AI provider calls, API handlers, and React presentation. The previous structure made Groq, registry HTTP calls, and bucket mutation behavior hard to test or replace independently.

## Decision

Adopt Hexagonal Architecture with three primary layers:

- `src/domain`: pure entities, value objects, repository interfaces, and domain services.
- `src/application`: use cases, DTOs, and incoming/outgoing ports.
- `src/infrastructure`: adapters for AI providers, registries, storage, sharing, and dependency wiring.

Next.js API routes remain in `src/app/api`, but they should only handle HTTP concerns such as request parsing, validation, rate-limit headers, and response formatting. Business workflows are delegated to application use cases.

## Consequences

New AI providers can be added by implementing `AIProvider`. New package/version registries can be added by implementing the repository or registry adapter interfaces. UI and API code should consume use cases rather than depending directly on SDKs, registry helpers, or domain internals.
