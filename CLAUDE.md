# chorbit-server

Node.js + Express 5 + Apollo Server (GraphQL) + Prisma + PostgreSQL.

For project-wide context, see `../chorebit-vault/README.md`.

## Stack

| Package                             | Purpose                                              |
| ----------------------------------- | ---------------------------------------------------- |
| Express 5                           | HTTP framework                                       |
| Apollo Server (`expressMiddleware`) | GraphQL — see vault: `architecture/graphql-setup.md` |
| Prisma                              | ORM + migrations                                     |
| PostgreSQL                          | Database (Docker Compose locally, RDS in prod)       |
| Jest + ts-jest                      | Testing                                              |

## Structure

```
src/
  schema/       ← GraphQL type definitions (SDL via graphql-tag)
  resolvers/    ← GraphQL resolvers
  middleware/   ← auth, error handling
  lib/          ← Prisma singleton
prisma/         ← schema.prisma + migrations
```

## Run

```bash
docker compose up -d     # start Postgres
npm run dev              # start server with hot reload
```

## Test

```bash
npm test                 # run Jest
npm run typecheck        # tsc --noEmit
npm run lint             # ESLint
```

## Key Patterns

- `createApp()` is async — Apollo Server needs `await server.start()` before mounting
- GraphQL endpoint: `/graphql`
- Health check: `/health`
- Schema-first: write SDL in `src/schema/`, resolvers in `src/resolvers/`
- Resolvers use Prisma directly, no repository/service layer
- Auth context will be injected via Express middleware into Apollo context

## Vault Workflow

1. **Before implementing**: Read the relevant feature spec in `../chorebit-vault/features/` and any referenced architecture or decision docs
2. **After implementing**: Update the feature spec to reflect what was actually built (if anything diverged from the plan)
3. **If you make an architectural decision**: Write an ADR to `../chorebit-vault/decisions/` using the template

## Conventions

- TypeScript strict, no `any`
- No default exports (named exports only)
- Commit format: `type: description (#issue)`
