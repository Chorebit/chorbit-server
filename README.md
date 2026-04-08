# chorbit-server

GraphQL API for **Chorbit** — chore tracking for groups, inspired by Tricount.

## Stack

| Package        | Purpose                           |
| -------------- | --------------------------------- |
| Express        | HTTP framework                    |
| Apollo Server  | GraphQL via `expressMiddleware`   |
| Prisma         | ORM + migrations                  |
| PostgreSQL     | Database (Docker Compose locally) |
| TypeScript     | Strict mode                       |
| Jest + ts-jest | Testing (planned)                 |

## Structure

```
src/
  schema/       ← GraphQL type definitions (SDL via graphql-tag)
  resolvers/    ← GraphQL resolvers
  middleware/   ← auth, error handling
  lib/          ← Prisma singleton
prisma/         ← schema.prisma + migrations
```

## Setup

```bash
docker compose up -d     # start Postgres
cp .env.example .env     # configure env vars
npm install
npx prisma migrate dev
```

## Run

```bash
npm run dev              # start server with hot reload (tsx watch)
```

GraphQL playground: `http://localhost:4000/graphql`

## Test

```bash
npm test                 # Jest (when configured)
npm run typecheck        # tsc --noEmit
```

## Conventions

- TypeScript strict, no `any`
- Named exports only (no default exports)
- Schema-first GraphQL (SDL via `graphql-tag`, not code-gen)
- Apollo Server via `expressMiddleware` (NOT `startStandaloneServer`)
- Every Prisma model has `id`, `createdAt`, `updatedAt`
- Resolvers use Prisma directly, no repository/service layer
- Secrets via env vars only

## Key Patterns

- `createApp()` is async — Apollo Server needs `await server.start()` before mounting
- GraphQL endpoint: `/graphql`
- Health check: `/health`
- Schema-first: write SDL in `src/schema/`, resolvers in `src/resolvers/`
- Auth context will be injected via Express middleware into Apollo context
