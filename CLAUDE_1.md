# Chorbit 🌀

Chore tracking app for groups.

## Stack
- Node.js + Express + Apollo Server (GraphQL)
- Prisma + PostgreSQL
- Jest (unit tests)

## Structure
```
/src
  /schema       ← GraphQL type definitions
  /resolvers    ← GraphQL resolvers
  /middleware   ← auth, error handling
  /lib          ← prisma singleton
/prisma         ← schema.prisma + migrations
```

## Conventions
- TypeScript strict, no `any`
- Schema-first GraphQL
- Every Prisma model has `id`, `createdAt`, `updatedAt`
- Secrets via env vars only
- Resolvers use Prisma directly, no repository pattern
