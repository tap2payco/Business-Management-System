# Copilot instructions for this repository

Purpose: help an AI coding agent become productive quickly in this Next.js + Prisma app.

- **Big picture**: This is a Next.js (App Router) monolith that serves the web UI and a set of API routes under `src/app/api`. Data persistence is via Prisma (SQLite by default) in `prisma/`. PDF rendering uses Puppeteer + Handlebars templates in `templates/` and `src/lib/pdf-puppeteer.ts`. LLM integration is handled in `src/lib/llm.ts` and prefers Nebius (env keys begin with `NEBIUS_`) but falls back to OpenAI.

- **Key service boundaries**:
  - Frontend/pages and server components: `src/app/**` (App Router) and `src/components/**`.
  - API surface: `src/app/api/**` (includes auth, pdf, invoices, receipts, ai endpoints).
  - DB layer: `prisma/schema.prisma` + runtime access via `src/lib/prisma.ts` (shared PrismaClient singleton).
  - Auth: NextAuth v5 configured in `src/auth.ts` and mounted at `src/app/api/auth/[...nextauth]/route.ts` (Credentials provider, JWT session strategy). Tokens include `businessId` and `phone`.

- **How to run & common commands** (discoverable in `package.json`):
  - Install: `npm install` (or your package manager of choice).
  - Dev server: `npm run dev` (runs `next dev`).
  - Build: `npm run build` / `npm run start`.
  - Prisma: `npm run prisma:generate` and `npm run prisma:migrate` (migrations live under `prisma/migrations`).

- **Environment / integrations** (see `.env`):
  - `DATABASE_URL` (defaults to SQLite file: `file:./dev.db`).
  - AI: `NEBIUS_API_KEY`, `NEBIUS_BASE_URL`, `NEBIUS_DEFAULT_MODEL` (used by `src/lib/llm.ts`).
  - Auth: `AUTH_SECRET`, `AUTH_URL`, plus `RESEND_API_KEY` and `EMAIL_FROM` for email sending.

- **Project-specific conventions & patterns**:
  - `src/lib/prisma.ts` exports a singleton `prisma` instance — always import from `@/lib/prisma`.
  - Server logic often lives in `src/app/actions/*` and is invoked from server components / API routes.
  - API route files export standard HTTP handlers (`route.ts` / `route.tsx`). Example: `src/app/api/pdf/invoice/[id]/route.tsx`.
  - PDF templates: `templates/invoice.html` and `templates/receipt.html` are Handlebars templates used by `renderPdfFromTemplate` in `src/lib/pdf-puppeteer.ts`. The repository also contains helper scripts in `scripts/*.cjs` for offline PDF rendering.
  - LLM usage: `src/lib/llm.ts` initializes a provider at startup and exposes `llm`, `LLM_PROVIDER`, and `DEFAULT_LLM`. Validate models via `validateModel()` before calling model-listing endpoints.

- **Files to inspect first when making changes**:
  - `src/auth.ts` — NextAuth config and callbacks (important for any auth or session work).
  - `src/lib/prisma.ts` and `prisma/schema.prisma` — DB models and client usage.
  - `src/lib/llm.ts` — AI provider selection and environment keys.
  - `src/lib/pdf-puppeteer.ts`, `templates/*.html`, and `scripts/*` — PDF rendering flow.
  - `src/app/api/**` — the app's server APIs and their routing.

- **Testing & debugging notes (repo-specific)**:
  - There are no explicit test scripts in `package.json`; prefer running the app locally with `npm run dev` and exercising API routes.
  - Prisma migrations are committed in `prisma/migrations/` — use `npm run prisma:migrate` to apply migrations to `DATABASE_URL`.
  - Puppeteer runs with `--no-sandbox` in `pdf-puppeteer.ts` — CI or Docker environments may require additional Chrome dependencies.

- **Do / don't guidance for generated code changes**:
  - Do import the shared `prisma` from `@/lib/prisma` (avoid creating new PrismaClient instances).
  - Do prefer server components and route handlers for backend logic; check `src/app/actions` for examples.
  - Don't change the NextAuth callback shapes without updating `src/types/next-auth.d.ts` and `src/types/user.d.ts`.

If anything important is missing or you want the instructions expanded (examples, commands, or CI/deployment notes), tell me what to add and I'll iterate.
