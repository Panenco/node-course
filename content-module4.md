# Module 4

In the previous modules you built a real-world **API**: a NestJS service with
JWT authentication, Swagger documentation and a Prisma database. That's the
backend of a product — but a product needs a **frontend** too.

In this module we build the *example product*: a small web app that lets you log
in and manage users. Along the way we bring the API and the frontend together
into **one monorepo** so they share tooling and — most importantly — share
**types**. When you're done, a single `pnpm dev` boots the whole product, and the
frontend calls the backend through a fully typed client that is generated from
the API itself.

The topics of this module:

-   **Monorepo** with [pnpm workspaces](https://pnpm.io/workspaces) and
    [Turborepo](https://turborepo.com/) — one repo, many apps and packages.
-   **A generated, typed SDK** — the API describes itself with OpenAPI, and we
    generate a TypeScript client from that description with
    [`@hey-api/openapi-ts`](https://heyapi.dev/).
-   **[Next.js](https://nextjs.org/)** (App Router) for the frontend.
-   **[TanStack Query](https://tanstack.com/query)** for data fetching, caching
    and mutations.
-   **[react-hook-form](https://react-hook-form.com/)** +
    [zod](https://zod.dev/) for forms and validation.
-   **[Tailwind CSS](https://tailwindcss.com/)** for styling.

> The finished result lives in [`code/example4`](./code/example4). As always: try
> to build it yourself by following the steps, and only peek at the example when
> you get stuck.

The end result looks like this:

```
code/example4/
├── apps/
│   ├── api/          ← the NestJS API from module 3
│   └── web/          ← the new Next.js frontend
├── packages/
│   └── api-sdk/      ← typed client, generated from the API
├── package.json      ← root scripts
├── pnpm-workspace.yaml
└── turbo.json
```

# Part 1 — Turn the API into a monorepo

Right now your module 3 project is a single app: one `package.json`, one `src`.
A **monorepo** is a single repository that holds several projects side by side.
We'll end up with two runnable apps (`api`, `web`) and one shared library
(`api-sdk`). They can depend on each other, install together, and run together.

Two tools make this pleasant:

-   **pnpm workspaces** — teaches pnpm that several `package.json` files in
    subfolders form one install. Packages can depend on each other with the
    `workspace:*` version specifier.
-   **Turborepo (`turbo`)** — a task runner that runs a script (like `dev` or
    `build`) across every package that has it, in the right order.

## Move the API into `apps/api`

Create the folders and move your module 3 project into `apps/api`:

```bash
mkdir -p apps/api packages

# copy your module 3 project into apps/api. The trailing "/." copies the folder's
# contents (including dotfiles). In the example repo the source is code/example3:
cp -a /path/to/your-module-3-project/. apps/api/
```

Your API keeps its own `package.json`, `src`, `prisma`, everything. Two small
changes: give it a **scoped name** so the other packages can refer to it, and
remove the app-level `packageManager` field — module 3 pinned `pnpm@9`, but the
root will pin `pnpm@10` for the whole workspace, and a leftover per-app pin causes
version warnings. Also delete the app-level `pnpm-lock.yaml` (and any
`node_modules` you moved in) — the root workspace owns a single lockfile and
installs every package together.

> If your module 3 project carried a `patches/` folder (e.g. a `class-transformer`
> patch) that its `package.json` no longer references under `pnpm.patchedDependencies`,
> it's inert — you can delete it. It won't affect the build either way.

```jsonc
// apps/api/package.json
{
  "name": "@node-course/api",
  // ...the rest stays the same
}
```

Make sure `apps/api/package.json` still has its `dev` script
(`"dev": "nest start --watch"` — it came over with the module 3 copy). Turbo's
`dev` task runs the `dev` script in each package, so the Part 1 checkpoint's
`pnpm dev` depends on it being there.

## Create the workspace

At the repo root, tell pnpm which folders are workspace packages:

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"

# pnpm 10 does not run dependencies' install scripts by default. Prisma needs its
# postinstall (to fetch its query engine), so allow it and its friends here.
onlyBuiltDependencies:
  - "@prisma/client"
  - "@prisma/engines"
  - "prisma"
  - "@scarf/scarf"
  - "sharp"
```

Add a root `package.json`. It is `private` (never published), owns the
`packageManager`, and its scripts just delegate to `turbo`:

```json
// package.json
{
  "name": "node-course-example4",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@10.15.1",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "generate:sdk": "turbo run generate:sdk",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "^2.5.8"
  }
}
```

Now add the Turborepo config. Each entry under `tasks` describes one script that
`turbo` can run across the workspace:

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "generate:openapi": {
      "cache": false,
      "outputs": ["../../packages/api-sdk/openapi.json"]
    },
    "generate:sdk": {
      "dependsOn": ["@node-course/api#generate:openapi"],
      "outputs": ["src/generated/**"]
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".next/**", "!.next/cache/**"]
    },
    "typecheck": {},
    "lint": {}
  }
}
```

A few things to notice:

-   `dev` is `persistent` (it never exits — it's a dev server) and is not cached.
-   `generate:sdk` **`dependsOn`** `@node-course/api#generate:openapi`: turbo will
    always make the API emit its OpenAPI spec *before* the SDK is generated. This
    is how we keep the client in sync with the contract.
-   `build` depends on `^build`, meaning "build everything I depend on first".

Add a root `.gitignore` so build output, dependencies and secrets stay out of git
(the generated SDK under `packages/api-sdk/src/generated` is committed on purpose,
so it isn't listed here):

```gitignore
# .gitignore
node_modules/
dist/
build/
.next/
.turbo/
apps/api/data/
.env
!.env.example
```

Install everything from the root:

```bash
pnpm install
```

> **pnpm 10 note.** pnpm 10 does not run dependencies' install scripts by default;
> the `onlyBuiltDependencies` list above allowlists the ones we need. Without it,
> pnpm prints `Ignored build scripts: … prisma …` and Prisma's engine is never
> fetched, so `db:push` later fails. You'll see the same message name-check `sharp`
> once you add the web app in Part 4 — it's already in the list above. If it ever
> flags a package you trust, add it to the list and reinstall, or run
> `pnpm approve-builds`.

> **Checkpoint.** Bring the API up through turbo. A fresh monorepo install has
> **not** generated a Prisma client yet, and the app needs both its database and
> that client to boot — so do this in order, from the repo root:
>
> ```bash
> # 1. start Postgres
> (cd apps/api && docker compose up -d)
>
> # 2. create apps/api/.env. In module 3 the DATABASE_URL lived only in docker.env
> #    (which configures the Postgres container); Prisma reads it from a .env at the
> #    app root. Put this line in apps/api/.env:
> #    DATABASE_URL="postgresql://root:root@localhost:5432/example?schema=public"
>
> # 3. push the schema — this also generates the Prisma client
> pnpm --filter @node-course/api db:push
>
> # 4. boot everything
> pnpm dev
> ```
>
> `pnpm dev` stays running in the foreground — leave it, and open a **second
> terminal** for any other commands (or stop it with Ctrl-C).
> Turbo lists the packages in scope, runs `dev` in each, and streams the API's
> Nest startup logs prefixed with `@node-course/api:dev:`; the process then stays
> up, waiting. That waiting-in-the-foreground state **is** success — the API
> should boot exactly like it did in module 3. If instead the command returns
> immediately with `No tasks were executed as part of this run.`, no package has a
> `dev` script — check that `apps/api/package.json` still has one (see "Move the
> API into `apps/api`" above). (`apps/api/.env` is
> git-ignored — commit an `apps/api/.env.example` with that same line so the next
> person knows what to create.) You now have a monorepo. On to the interesting part.

# Part 2 — Make the API describe itself

The whole point of "bringing it together" is that the frontend should never
guess what the API returns — it should **know**, in TypeScript. To get there,
the API needs to publish a complete, accurate **OpenAPI** description of itself.

NestJS + `@nestjs/swagger` already generate an OpenAPI document (that's what
powers the `/docs` page). But by default it doesn't know what fields your DTOs
contain, so the schemas come out **empty** — and a typed client generated from an
empty schema is useless. There are two ways to fill them in: enable the swagger
CLI plugin, or annotate the fields explicitly. We'll do it **explicitly** with
`@ApiProperty` — it makes exactly what ends up in the contract visible in the
code, and means you don't need the plugin at all.

## Annotate the DTOs

Add `@ApiProperty` (and `@ApiPropertyOptional`) to every contract field. This is
what fills the OpenAPI schemas — and, as a bonus, makes `/docs` far more useful.

```ts
// src/contracts/user.view.ts
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsString, IsUUID } from "class-validator";

@Exclude()
export class UserView {
  @ApiProperty({ format: "uuid" })
  @Expose()
  @IsUUID()
  public id: string;

  @ApiProperty()
  @Expose()
  @IsString()
  public name: string;

  @ApiProperty()
  @Expose()
  @IsEmail()
  public email: string;
}
```

Do the same for `UserBody`, `LoginBody` and `AccessTokenView`. For the optional
search parameter use `@ApiPropertyOptional`, so it shows up as an optional query
parameter:

```ts
// src/contracts/search.query.ts
import { ApiPropertyOptional } from "@nestjs/swagger";
// ...
@ApiPropertyOptional({ description: "Filter users by name or email" })
@Expose()
@IsString()
@IsOptional()
public search?: string;
```

## Give every endpoint a clean name

The generated SDK names its functions after each operation's `operationId`. By
default Nest produces names like `UserController_getList`. Set explicit,
readable ids in your `@ApiOperation` decorators:

```ts
@ApiOperation({ operationId: "listUsers", summary: "Search users" })
```

Do this for all endpoints: `login`, `createUser`, `listUsers`, `getUser`,
`updateUser`, `deleteUser`. These become the function names in the frontend.

## Honor the view contract

Module 3 taught the four steps of an endpoint, the last being **representation**:
_transform the handler output to a predefined view contract_. This matters even
more now: the OpenAPI schema you just documented with `@ApiProperty` promises the
client a clean `UserView`, so the **actual runtime response must match it**. If a
handler leaks the raw Prisma record (including the password hash), the generated
SDK is lying to the frontend.

You already have the machinery for this from Module 3: the `@Serialize(UserView)`
decorator plus the global `TransformInterceptor`. Because `UserView` is
`@Exclude()` with `@Expose()` on `id`/`name`/`email`, the interceptor projects
every response onto the view and drops everything else (like `password`), for
both single objects and arrays. So the handlers stay ignorant of the
representation layer and just return the raw record:

```ts
// src/controllers/users/handlers/getList.handler.ts
export const getList = async (search?: string) => {
  // ...build the `where` filter...
  return prisma.user.findMany({ where, orderBy: { createdAt: "desc" } });
};
```

Just make sure every user-returning endpoint carries `@Serialize(UserView)` in
the controller (you added these in Module 3):

```ts
@Get()
@Serialize(UserView)
async getList(@Query() query: SearchQuery): Promise<UserView[]> {
  return getList(query.search);
}
```

The same `@Serialize(UserView)` covers `create`, `get` and `update`. No
per-handler `plainToInstance(...)` is needed — the interceptor does the
transformation in one place.

## Emit the spec to a file

The `/docs` endpoint serves the spec at runtime, but the SDK generator needs it
as a **file on disk**. Add a small script that boots the app *without listening*,
builds the same Swagger document as `main.ts`, and writes it into the `api-sdk`
package:

```ts
// src/scripts/generate-openapi.ts
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "../app.module";

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("Node Course API")
    .setVersion("1.0")
    .addApiKey({ type: "apiKey", name: "x-auth", in: "header" }, "x-auth")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outPath = resolve(__dirname, "../../../../packages/api-sdk/openapi.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(document, null, 2));
  console.log(`OpenAPI spec written to ${outPath}`);
  await app.close();
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

> Note the `addApiKey(..., "x-auth")` and `setGlobalPrefix("api")` — these two
> must match `main.ts`, so the generated client knows the real URLs (`/api/...`)
> and the real auth header (`x-auth`). Cosmetic fields like the title and
> description don't affect the client, so they don't need to match exactly.

Wire it up as a script and run it:

```jsonc
// apps/api/package.json → scripts
"generate:openapi": "ts-node src/scripts/generate-openapi.ts",
```

```bash
pnpm --filter @node-course/api generate:openapi
```

> **Checkpoint.** Open `packages/api-sdk/openapi.json`. Under
> `components.schemas` you should now see `UserView`, `UserBody`, `LoginBody` and
> `AccessTokenView` **with their properties**, and each path should have a clean
> `operationId`. If the schemas are empty, your DTOs are missing `@ApiProperty`.

# Part 3 — Generate the typed SDK

Now we turn that `openapi.json` into a real, typed TypeScript client. This is the
package that "brings it together": it's generated from the backend and imported
by the frontend, so the two can never drift.

Create `packages/api-sdk`:

```json
// packages/api-sdk/package.json
{
  "name": "@node-course/api-sdk",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "generate:sdk": "openapi-ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hey-api/client-fetch": "^0.13.1"
  },
  "devDependencies": {
    "@hey-api/openapi-ts": "^0.99.0",
    "typescript": "^5.5.3"
  }
}
```

The `typecheck` script runs `tsc --noEmit`, which needs a `tsconfig.json`. Add
one — and note the **`DOM` lib**: the generated fetch client references browser
types like `Request`, `Response`, `Headers` and `FormData`, so without it
typechecking fails with dozens of "cannot find name" errors:

```json
// packages/api-sdk/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "openapi-ts.config.ts"]
}
```

Configure the generator. It reads `openapi.json` and writes the client into
`src/generated`:

```ts
// packages/api-sdk/openapi-ts.config.ts
import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi.json",
  output: { path: "./src/generated", clean: true },
  plugins: ["@hey-api/client-fetch"],
});
```

Generate it (from the root, so turbo emits the spec first thanks to the
`dependsOn` we set up):

```bash
pnpm install
pnpm generate:sdk
```

Look inside `packages/api-sdk/src/generated`. You'll find `types.gen.ts` (every
DTO as a TypeScript type) and `sdk.gen.ts` (a function per endpoint: `login`,
`listUsers`, `createUser`, …). These are **fully typed** from your API.

## Configure the client

The generated functions all use a shared `client`. We expose one helper to point
it at the API and tell it how to find the JWT. Because our protected endpoints
declare the `x-auth` security scheme in the spec, returning the token from `auth`
makes the client attach it as the `x-auth` header on exactly those calls — and
leave public calls (`login`, `createUser`) alone:

```ts
// packages/api-sdk/src/index.ts
import { client } from "./generated/client.gen";

export * from "./generated";
export { client };

export function configureApiClient(options: {
  baseUrl: string;
  getToken?: () => string | null | undefined;
}) {
  client.setConfig({
    baseUrl: options.baseUrl,
    auth: () => options.getToken?.() ?? undefined,
  });
}
```

> **Checkpoint.** `pnpm --filter @node-course/api-sdk typecheck` should pass, and
> the generated `UserView` type should read `{ id: string; name: string; email:
> string }`. You now have a typed client generated from your own API.

# Part 4 — The frontend

Time for the actual web app. We use **Next.js** with the App Router. Create
`apps/web` with this `package.json`:

```json
// apps/web/package.json
{
  "name": "@node-course/web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.1.1",
    "@node-course/api-sdk": "workspace:*",
    "@tanstack/react-query": "^5.101.2",
    "next": "^16.2.10",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.63.0",
    "zod": "^4.1.11"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.13",
    "@types/node": "^24.5.2",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "tailwindcss": "^4.1.13",
    "typescript": "^5.5.3"
  }
}
```

The key line is `"@node-course/api-sdk": "workspace:*"` — the frontend depends on
our generated SDK, straight from the workspace. Since the SDK ships as
TypeScript source, tell Next to transpile it:

```ts
// apps/web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@node-course/api-sdk"],
};

export default nextConfig;
```

Set up Tailwind (v4 needs only a PostCSS plugin and one import):

```js
// apps/web/postcss.config.mjs
const config = { plugins: ["@tailwindcss/postcss"] };
export default config;
```

```css
/* apps/web/src/app/globals.css */
@import "tailwindcss";
```

Point the SDK at your API with an env var:

```bash
# apps/web/.env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Add the TypeScript config. Two things matter: the `next` plugin, and the `@/*`
path alias (`@/…` → `src/…`) that every import below relies on:

```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

## Providers: TanStack Query + the SDK

Everything client-side needs a `QueryClient`, and the SDK needs to be configured
once. Do both in a client component. Notice `getToken` reads from
`localStorage` — that's where we'll keep the JWT:

```tsx
// apps/web/src/app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { configureApiClient } from "@node-course/api-sdk";
import { getToken } from "@/lib/auth";

configureApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  getToken,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

Now the root layout. It **imports the global stylesheet** — this is what actually
loads Tailwind; without this one import nothing on the site is styled — sets the
page metadata, and wraps everything in `<Providers>`:

```tsx
// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Node Course — User Admin",
  description: "Example product frontend for the Panenco Node course",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Storing the token

A small module owns the JWT. We keep it in `localStorage` for simplicity.

```ts
// apps/web/src/lib/auth.ts
const TOKEN_KEY = "token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
```

> **Security note.** `localStorage` is readable by any script on the page, so a
> cross-site-scripting (XSS) bug would expose the token. It's perfect for
> learning, but a production app usually stores the JWT in an **httpOnly cookie**
> the browser sends automatically and JavaScript can't read.

## Hooks: TanStack Query around the SDK

This is where the SDK and TanStack Query meet. Each hook calls a typed SDK
function, checks the `{ data, error }` result, and lets TanStack Query manage
loading/error/caching. After any mutation we `invalidateQueries` so the list
refetches automatically.

```ts
// apps/web/src/lib/api-hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  listUsers,
  login,
  updateUser,
  type UserBody,
} from "@node-course/api-sdk";

const USERS_KEY = ["users"];

export function useUsers(search: string) {
  return useQuery({
    queryKey: [...USERS_KEY, search],
    queryFn: async () => {
      const { data, error } = await listUsers({
        query: search ? { search } : undefined,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const { data, error } = await login({ body });
      if (error) throw error;
      return data!;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UserBody) => {
      const { data, error } = await createUser({ body });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UserBody }) => {
      const { data, error } = await updateUser({ path: { id }, body });
      if (error) throw error;
      return data!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await deleteUser({ path: { id } });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}
```

Notice the call shapes: a path param goes in `path` (`deleteUser({ path: { id } })`),
and `updateUser` takes **both** `path` and `body`. TypeScript enforces this —
it's all generated from the API.

> Look at the arguments: `listUsers({ query: { search } })`,
> `createUser({ body })`, `updateUser({ path: { id }, body })`. TypeScript knows
> the exact shape of each — because it was generated from your API. Rename a field
> in a DTO, regenerate, and the frontend stops compiling until you fix it. That's
> the payoff of the whole setup.

## UI building blocks

Before the pages, a handful of tiny presentational components styled with
Tailwind. Nothing clever — they just keep the pages readable and consistent.
First a one-line class-name helper:

```ts
// apps/web/src/lib/utils.ts
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
```

Then the primitives — `Button`, `Input`, `Label`, `Card`:

```tsx
// apps/web/src/components/ui/button.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-700",
  secondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost: "text-slate-600 hover:bg-slate-100",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
```

```tsx
// apps/web/src/components/ui/input.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
```

```tsx
// apps/web/src/components/ui/label.tsx
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1 block text-sm font-medium text-slate-700", className)}
      {...props}
    />
  );
}
```

```tsx
// apps/web/src/components/ui/card.tsx
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white shadow-sm",
        className
      )}
      {...props}
    />
  );
}
```

## The login page

A form with react-hook-form + zod. On success we store the token and redirect to
`/users`:

```tsx
// apps/web/src/app/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/api-hooks";
import { setToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof schema>;

function loginErrorMessage(error: unknown): string {
  // The SDK throws the API's error body ({ statusCode, message, ... }).
  // 401 means bad credentials; anything else is an unexpected server/network error.
  const statusCode = (error as { statusCode?: number } | null)?.statusCode;
  return statusCode === 401
    ? "Invalid email or password."
    : "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        setToken(data.token);
        router.replace("/users");
      },
    });
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full p-8">
        <h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-slate-500">
          Use a seeded account, e.g. john@example.com / password123
        </p>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          {loginMutation.isError && (
            <p className="text-sm text-red-600">
              {loginErrorMessage(loginMutation.error)}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
```

> **zod v4.** `z.email()` is the zod 4 spelling; in zod 3 this was
> `z.string().email()`. This module pins zod 4 (see `apps/web/package.json`).

## Guarding pages

Authenticated pages must bounce anonymous visitors to `/login`. Since our token
lives in `localStorage` (client-only), we guard in a `useEffect`. This isn't a
separate file — it's the pattern baked into the users page below (using an
`authChecked` state flag); here it is in isolation:

```tsx
useEffect(() => {
  if (!isAuthenticated()) router.replace("/login");
  else setAuthChecked(true);
}, [router]);

if (!authChecked) return null;
```

The root page does the same in reverse — redirect to `/users` if logged in,
`/login` if not:

```tsx
// apps/web/src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(isAuthenticated() ? "/users" : "/login");
  }, [router]);
  return null;
}
```

## The user form

Create and edit reuse one `UserForm` (react-hook-form + zod). It takes optional
`initialValues` (edit mode) and hands a typed `UserBody` back to its parent:

```tsx
// apps/web/src/components/user-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UserBody } from "@node-course/api-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type UserFormValues = z.infer<typeof schema>;

export function UserForm({
  initialValues,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: {
  initialValues?: { name: string; email: string };
  submitLabel: string;
  pending: boolean;
  onSubmit: (body: UserBody) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      password: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values))}
      className="space-y-4"
      noValidate
    >
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          The example API requires all fields (including password) on update.
        </p>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
```

> **A quirk to notice.** The example API's `UserBody` requires *all* fields
> (including `password`) on update, so the edit form asks for the password too. A
> real app would define a separate `UpdateUserBody` with optional fields — a nice
> exercise once you finish.

## The users page

This ties everything together: the auth guard, a search box (driving
`useUsers(search)`), the list, and Create / Edit / Delete via the hooks. On a
successful mutation TanStack Query invalidates the `["users"]` cache and the list
refreshes on its own. The create/edit form is shown in a modal:

```tsx
// apps/web/src/app/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserView } from "@node-course/api-sdk";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/lib/api-hooks";
import { clearToken, isAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserForm } from "@/components/user-form";

type Editing = { mode: "create" } | { mode: "edit"; user: UserView } | null;

export default function UsersPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Editing>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const usersQuery = useUsers(search);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  if (!authChecked) return null;

  const logout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="flex gap-2">
          <Button onClick={() => setEditing({ mode: "create" })}>
            New user
          </Button>
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>

      <Input
        placeholder="Search by name or email…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-4"
      />

      <Card className="divide-y divide-slate-100">
        {usersQuery.isLoading && (
          <p className="p-4 text-sm text-slate-500">Loading…</p>
        )}
        {usersQuery.isError && (
          <p className="p-4 text-sm text-red-600">Failed to load users.</p>
        )}
        {usersQuery.data?.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No users found.</p>
        )}
        {usersQuery.data?.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setEditing({ mode: "edit", user })}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                disabled={deleteUser.isPending}
                onClick={() => {
                  if (confirm(`Delete ${user.name}?`)) {
                    deleteUser.mutate(user.id);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </Card>

      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {editing.mode === "create" ? "New user" : "Edit user"}
            </h2>
            <UserForm
              initialValues={
                editing.mode === "edit"
                  ? { name: editing.user.name, email: editing.user.email }
                  : undefined
              }
              submitLabel={editing.mode === "create" ? "Create" : "Save"}
              pending={createUser.isPending || updateUser.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={(body) => {
                if (editing.mode === "create") {
                  createUser.mutate(body, { onSuccess: () => setEditing(null) });
                } else {
                  updateUser.mutate(
                    { id: editing.user.id, body },
                    { onSuccess: () => setEditing(null) }
                  );
                }
              }}
            />
          </Card>
        </div>
      )}
    </main>
  );
}
```

# Part 5 — Run the whole product

Make sure the API's database is running and seeded (from module 3):

```bash
cd apps/api
docker compose up -d
pnpm db:push
pnpm db:seed          # creates john@example.com / password123
cd ../..
```

Then, from the root, one command boots everything:

```bash
pnpm dev
```

-   API on <http://localhost:3000> (docs at `/docs`)
-   Web on <http://localhost:3001>

Open <http://localhost:3001>, log in with `john@example.com` / `password123`,
and manage your users. You just ran a full-stack product from a single command,
with the frontend talking to the backend through a client generated from the
backend itself.

## The contract loop

The one habit to internalize: **when the API contract changes, regenerate the
SDK.**

```bash
pnpm generate:sdk
```

Change a DTO, add a field, add an endpoint → run that command → the new types and
functions appear in the frontend immediately, and TypeScript points at every
place you need to update. That tight loop between backend and frontend is the
whole reason to keep them in one repo.

# Where to go next

You now have a complete product to extend. Some ideas:

-   Add a new entity (e.g. `Post`) end to end: Prisma model → NestJS
    CRUD → regenerate the SDK → new frontend pages. Feel the loop.
-   Add a proper `UpdateUserBody` so editing doesn't require the password.
-   Move the token from `localStorage` to an httpOnly cookie and fetch users in a
    Server Component.
-   Add optimistic updates with TanStack Query so the UI reacts instantly.

🚀 Happy coding!
