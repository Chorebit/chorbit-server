# Chorbit Server — Claude Code Instructions

## Project
Chore tracking app for groups (inspired by Tricount).

## Stack
- Node.js + Express 5 + Apollo Server (GraphQL via `expressMiddleware`)
- Prisma + PostgreSQL
- TypeScript (strict, no `any`)
- Jest (unit tests)

## Structure
```
/src
  /schema       ← GraphQL type definitions (SDL via graphql-tag)
  /resolvers    ← GraphQL resolvers
  /middleware   ← auth, error handling
  /lib          ← prisma singleton
/prisma         ← schema.prisma + migrations
```

## Conventions
- TypeScript strict, no `any`
- Schema-first GraphQL (SDL, not code-gen) — write types in `/src/schema/index.ts` using `gql` tag
- Apollo Server is mounted via `expressMiddleware`, NOT `startStandaloneServer`
- `createApp()` is async — Apollo must `await server.start()` before mounting
- Every Prisma model has `id`, `createdAt`, `updatedAt`
- Secrets via env vars only — never hardcode
- Resolvers use Prisma directly, no repository pattern
- Commit format: `feat/fix/chore: description (#issue)` e.g. `feat: add createGroup mutation (#3)`

## Data Model
`User`, `Group`, `GroupMember` (OWNER | MEMBER), `Chore` (with points + frequency), `ChoreAssignment`, `ChoreCompletion`

## Knowledge Base
**Always read the vault before implementing a feature.**

The Obsidian vault lives at `~/projects/chorbit/chorebit-vault/` and contains:

| Path | Contents |
|------|----------|
| `features/` | Feature specs — one file per feature, describes what to build and why |
| `architecture/` | System-level docs (GraphQL setup, DB design, deployment) |
| `decisions/` | ADRs — why we chose X over Y |
| `sessions/` | Session logs — design decisions from past conversations |
| `templates/` | Reusable templates for specs, decisions, and session logs |

### Workflow
1. **Before implementing**: Read the relevant feature spec in `features/` and any referenced architecture or decision docs
2. **After implementing**: Update the feature spec to reflect what was actually built (if anything diverged from the plan)
3. **If you make an architectural decision**: Write an ADR to `decisions/` using the template

## Common Commands
```bash
# Start local DB
docker compose up -d

# Run dev server
npm run dev

# Run migrations
npx prisma migrate dev

# Run tests
npm test
```
