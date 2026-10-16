# Task 3b — full-stack-developer

## Task
Build 6 marketing pages for JuraganWebsite (a Hostinger + IDCloudHost clone in Indonesian):
- `/domain` — domain search + TLD pricing table + transfer section + CTA band
- `/pricing` — pricing tabs (Hosting/WordPress/VPS/Cloud/Email/SSL/Domain) + FAQ
- `/website-builder` — marketing landing + 3-step + features + template showcase + FAQ
- `/ai-builder` — AI website builder marketing + 3-step + features + prompt examples + FAQ
- `/knowledge` — list + search + category filter + featured + newsletter subscribe
- `/knowledge/[slug]` — article detail (client component, useParams, markdown-ish renderer, related sidebar, thumbs up/down)

## Work Log
- Read shared worklog and verified MarketingLayout / ui-helpers / cart-store / api-client / API routes (domains/check, domains/tlds, knowledge, packages, subscribers) — all in place from prior install.
- Confirmed brand color utility classes exist in `globals.css`: `bg-brand-gradient`, `gradient-text`, `bg-mesh`, `glass`, `glow-brand`, `animate-float`, `animate-float-slow`, `bg-gold/15 text-gold-foreground`. No indigo/blue used in any of my files.
- Created `src/app/domain/page.tsx` — domain search form (Input + Button) calling `/api/domains/check`, result card with available/dipakai badge, promo strikethrough price, "Tambah ke Keranjang" button via `addItem({type:"domain", name, domain, period:1, billingCycle:"yearly", price, qty:1})`, plus "Cek domain lain" suggestion list using `Promise.all` batch over `.id/.web.id/.xyz/.online/.store/.co.id`, plus responsive shadcn `Table` with TLD pricing fetched from `/api/domains/tlds`, filter tabs (popular/geo/business/tech/sale), populer/promo badges, transfer section (3-step), CTA band.
- Created `src/app/pricing/page.tsx` — Tabs (Hosting/WordPress/VPS/Cloud/Email/SSL/Domain). Each non-domain tab fetches `/api/packages?category=<cat>` and renders pricing cards (1/2/3 grid) with name, formatted price (`formatRupiah`), billing cycle label, features list with Check, "Pesan Sekarang" button that adds to cart with toast + link /cart, popular cards highlighted with ring + crown badge. Domain tab shows compact TLD table from `/api/domains/tlds`. FAQ accordion at bottom (6 Q&As).
- Created `src/app/website-builder/page.tsx` — Hero "Bangun Website Tanpa Coding" with phone-frame mockup illustration; "Cara kerja" 3-step (Pilih template → Customize → Publish); Features grid (Drag & drop, 200+ template, Mobile responsive, SEO ready, E-commerce ready, Free hosting); Template showcase (6 placeholder cards with gradient backgrounds: Business, Portfolio, Toko Online, Restoran, Blog, Landing Page); single "Gratis mulai" CTA band → /register; FAQ (6 Q&As).
- Created `src/app/ai-builder/page.tsx` — Hero "Bangun Website dengan AI dalam Menit" with AI prompt mockup illustration; "Cara kerja" 3-step (Deskripsikan bisnis → AI generate → Edit & publish); Features (AI copywriting, AI image suggest, SEO auto-optimize, Multi-page generate, Bahasa Indonesia, Export code); "Contoh prompt" cards (4 example prompts in Indonesian: Toko Kopi, Jasa Renovasi, Toko Fashion, Kursus Online); CTA "Coba AI Builder Gratis" → /register; FAQ (6 Q&As).
- Created `src/app/knowledge/page.tsx` — Hero "Pusat Bantuan & Tutorial"; client-side search Input filtering by title/excerpt; category filter chips derived from article list; article grid cards (titleId, excerptId, category badge, "Baca selengkapnya" → `/knowledge/[slug]`); Featured articles section at top (when `featured:true`); Newsletter subscribe box (email + subscribe button → POST `/api/subscribers`, toast success/error). Includes CAT_LABELS map for nicer Indonesian category labels.
- Created `src/app/knowledge/[slug]/page.tsx` — Client component page that reads `useParams<{slug}>()`, fetches `/api/knowledge?slug=<slug>` via useQuery with slug as key. Renders: breadcrumb, category badge, title (titleId), excerpt, content (contentId) using a simple markdown renderer that splits on `\n` and styles `## ` → h2, `### ` → h3, else paragraph. Sidebar "Artikel Terkait" (fetch /api/knowledge, filter same category, exclude current, take 4). "Apakah membantu?" thumbs up/down buttons with toast "Terima kasih atas feedback". Back-to-list link. Loading skeleton, not-found card. Sticky sidebar.
- Used `Reveal` for scroll animations on all pages; consistent use of `bg-mesh` hero background, `bg-brand-gradient` for CTAs, `text-gold-foreground` accents, `bg-card/40` for alternating sections.
- Indonesian copy throughout all pages (headlines, button labels, FAQ answers, prompt examples).
- All pages `"use client"` + wrapped in `<MarketingLayout>`. No layout.tsx created in route folders. Mobile-first responsive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- Verified: `bunx tsc --noEmit` → no TypeScript errors in any of my 6 files. `bun run lint` → no ESLint errors in any of my 6 files (the 11 lint errors that remain are pre-existing in other agents' files: `src/app/client/*` and `src/components/site/site-header.tsx` — out of my scope).
- Did NOT touch root `page.tsx`, `layout.tsx`, /admin, /api routes, or any other agents' files.

## Files Created
1. `/home/z/my-project/src/app/domain/page.tsx` — domain search + alt-domain suggestions + TLD pricing table with category tabs + transfer 3-step + CTA band.
2. `/home/z/my-project/src/app/pricing/page.tsx` — pricing tabs for 6 service categories (fetch /api/packages) + compact domain TLD table + FAQ accordion.
3. `/home/z/my-project/src/app/website-builder/page.tsx` — website builder marketing landing with hero mockup, 3-step process, features grid, 6 template showcase cards, CTA, FAQ.
4. `/home/z/my-project/src/app/ai-builder/page.tsx` — AI website builder marketing with AI prompt mockup, 3-step process, features grid, 4 example prompts, CTA, FAQ.
5. `/home/z/my-project/src/app/knowledge/page.tsx` — knowledge base list with client-side search, category chips, featured + regular grid, newsletter subscribe.
6. `/home/z/my-project/src/app/knowledge/[slug]/page.tsx` — article detail with useParams, markdown-ish renderer (## h2 / ### h3 / paragraph), related sidebar, thumbs up/down feedback.

## Stage Summary
- 6 pages built and committed; TypeScript + ESLint pass for all 6.
- All pages consume the existing API routes (`/api/domains/check`, `/api/domains/tlds`, `/api/packages`, `/api/knowledge`, `/api/subscribers`) and the existing `useCart` store with `addItem({ type:"domain", name, domain, period:1, billingCycle:"yearly", price, qty:1 })`.
- Brand consistency maintained: purple primary + gold accent only, NO indigo/blue; `bg-brand-gradient`, `gradient-text`, `bg-mesh`, `glass` utility classes used throughout.
- All copy in Bahasa Indonesia; mobile-first responsive layouts with `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` pattern.
- Sticky footer handled by shared `MarketingLayout` (flex min-h-screen flex-col + main flex-1).
- Domain & package prices auto-sync from DB via existing API endpoints — no hardcoded prices.
- Knowledge article detail uses client-side `useParams()` per Next.js 16 client component pattern; simple custom markdown renderer (no external markdown lib needed).
