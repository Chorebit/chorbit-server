# chorbit-server

GraphQL API for Chorbit — chore tracking for groups.

## Stack
Node.js · Express · Apollo Server · Prisma · PostgreSQL

## Getting started

```bash
docker compose up -d
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```

GraphQL playground: `http://localhost:4000/graphql`
