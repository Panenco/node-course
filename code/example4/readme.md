# Example 4 — the full product

Monorepo capstone for [Module 4](../../content-module4.md): the module 3 NestJS
API plus a Next.js frontend, brought together with pnpm workspaces + Turborepo
and a typed SDK generated from the API's OpenAPI spec.

```
apps/api        NestJS API (from module 3)
apps/web        Next.js frontend (:3001)
packages/api-sdk  typed client generated from apps/api's OpenAPI spec
```

## Run it

```bash
pnpm install

# start + seed the database (from apps/api)
cd apps/api
cp .env.example .env
docker compose up -d
pnpm db:push
pnpm db:seed          # creates john@example.com / password123
cd ../..

# generate the typed SDK from the API, then boot everything
pnpm generate:sdk
pnpm dev
```

- API: <http://localhost:3000> (Swagger at `/docs`)
- Web: <http://localhost:3001> — log in with `john@example.com` / `password123`

## Regenerate the SDK after an API change

```bash
pnpm generate:sdk
```

This emits `packages/api-sdk/openapi.json` from the API and regenerates the typed
client in `packages/api-sdk/src/generated`.
