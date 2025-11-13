
# BizMgr — Invoicing & Receipts (Next.js + Prisma + Tailwind + Nebius AI + Auth.js)

**Includes**
- Invoices & payments with receipt issuance
- **PDF export** for invoices & receipts using `@react-pdf/renderer`
- **AI draft** (Nebius OpenAI‑compatible) and **Receipt OCR** (image URL)
- **Auth.js (NextAuth v5)** with **Resend magic links** + Prisma adapter
- Neon Postgres ready (free tier)

## Setup

```bash
cp .env.example .env
# Fill DATABASE_URL (Neon pooled), NEBIUS_API_KEY/BASE_URL, and Auth values:
# - AUTH_SECRET: openssl rand -hex 32
# - AUTH_URL: http://localhost:3000 (or your deployed URL)
# - RESEND_API_KEY: from https://resend.com/ (or replace provider)
# - EMAIL_FROM: your verified sender (e.g., no-reply@yourdomain.test)

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open http://localhost:3000 — all routes require sign-in; go to `/signin` to request a magic link.

## Notes
- **Neon**: use pooled connection with `sslmode=require` (see docs).
- **Nebius**: OpenAI‑compatible API (`/v1/models`, `/v1/chat/completions`).
- **Auth**: In dev, if email isn’t set, check server logs; Resend is recommended for quick setup.

## Routes
- `/signin` — magic link sign-in
- `/invoices`, `/invoices/new`, `/invoices/[id]` (+ pay API)
- `/receipts`, `/receipts/import`
- `/api/ai/draft`, `/api/ai/receipt`, `/api/ai/models`
- `/api/pdf/invoice/[id]`, `/api/pdf/receipt/[id]`
- `/api/auth/*` — Auth.js

## Next
- File uploads for OCR; email sending PDFs; roles & permissions; Sentry; scheduled reminders.
