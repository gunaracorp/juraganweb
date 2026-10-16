# Task ID: competitors
**Agent:** full-stack-developer  
**Task:** Build competitor comparison feature — `/compare` page + `/providers/[slug]` detail page + nav updates for JuraganWebsite (Indonesian Hostinger + IDCloudHost clone).

## Files Created

1. **`src/app/compare/page.tsx`** — Competitor comparison page
   - `"use client"` + `<MarketingLayout>` wrapper.
   - Hero: badge "Riset Pasar 2025-2026", h1 with `gradient-text` "Perbandingan 16 Provider Hosting & Domain Terbesar", subtitle mentioning all 16 providers (10 global + 6 Indonesia).
   - Region filter Tabs: Semua (all) / Global (global) / Indonesia (indonesia). `useState` controls `region`, `useQuery(["competitors", region])` refetches on tab change.
   - Comparison Table (shadcn `Table` inside `overflow-x-auto` + `min-w-[1100px]`): columns = Provider (logo + name + country), Region (badge), Tipe (badge), Berdiri, Pelanggan, Pangsa Pasar, Harga Mulai, Uptime, Rating (5-star with `fill-amber-400`), Aksi (link to `/providers/[slug]`). `popular` rows highlighted with `bg-primary/[0.04]` and "Populer" gold badge.
   - "Mengapa JuraganWebsite?" 3-card band: Harga Lokal Terjangkau (Rp 14.900/bln), Support Bahasa Indonesia 24/7, Kombinasi Global + Lokal. CTAs → /hosting and /domain.
   - Quick stats band (4 stats): 16 provider dianalisis, 10+6 Global + Indonesia, Server ID, 30 hari garansi.
   - FAQ accordion (5 Q&A in Indonesian, shadcn `Accordion`).
   - CTA band at bottom with 6 JuraganWebsite advantages list, CTAs → /hosting, /domain, WhatsApp.

2. **`src/app/providers/[slug]/page.tsx`** — Provider detail page
   - `"use client"`. Wraps inner component in `<MarketingLayout>`.
   - `useParams<{ slug: string }>()` from `next/navigation` to read slug.
   - `useQuery(["competitor", slug])` fetches `/api/competitors?slug=<slug>`. Loading skeleton + not-found UI (AlertCircle icon + link back to /compare).
   - Second `useQuery(["competitors", "all"])` fetches all providers for the sidebar.
   - Hero: large emoji logo in `bg-brand-gradient` circle, name, region/type/popular badges, hostname link to `url` (external), 5-star rating, "Kunjungi Website" external button (target=_blank rel=noopener noreferrer), "Bandingkan dengan JuraganWebsite" button → /hosting.
   - Quick stats grid (6 cards, lucide icons): Berdiri, Pelanggan, Pangsa Pasar, Harga Mulai, Uptime, Data Center.
   - Pros/Cons two-column: green Check icons for pros, red X icons for cons.
   - Features section: grid of feature badges.
   - Description paragraph in styled card with Separator.
   - "Bandingkan dengan JuraganWebsite" CTA band with 6 generic JuraganWebsite advantages and "Lihat Paket Hosting" button → /hosting.
   - Back to /compare link + external "Kunjungi {name}" link.
   - Sticky desktop sidebar "Provider Lainnya": filters others by same region (excludes current), takes 5, shows as small clickable cards linking to their detail pages. "Lihat Semua Provider" button → /compare.

## Files Edited

3. **`src/components/site/site-header.tsx`** — added `/compare` ("Bandingkan") to `MAIN_LINKS` between "Harga" and "Blog"; added "Bandingkan Provider" link to mobile Sheet menu "Perusahaan" section after "Harga".

4. **`src/components/site/site-footer.tsx`** — added `{ href: "/compare", label: "Bandingkan Provider" }` to `COMPANY_LINKS` array.

## Tech Notes

- Used `apiFetch` from `@/lib/api-client` (auto-switches /api vs /hosting-api).
- Used TanStack Query `useQuery` (QueryProvider is in root layout — available everywhere via MarketingLayout's own QueryProvider wrapper too).
- Stars component: `Math.round(rating)` full stars + faint empty stars; reusable with size prop.
- Indonesian copy throughout. Purple `primary` + gold `accent` brand. NO indigo/blue. Uses `bg-brand-gradient`, `gradient-text`, `bg-mesh`, `glass` utility classes.
- Mobile-first responsive: table has `overflow-x-auto` with `min-w-[1100px]`, sticky sidebar collapses on mobile, hero/text stacks vertically on small screens.
- `Reveal` from `@/components/site/ui-helpers` for scroll animations on all sections.

## Lint & Type Check
- `bun run lint` → 0 errors in any of my files (project-wide lint passes).
- `bunx tsc --noEmit` → 0 errors in any of my files (pre-existing TS errors in `admin-testimonials-manager.tsx`, `theme-provider.tsx`, `i18n.ts` are out of scope).

## Runtime Verification
- Found dev server had stale PrismaClient instance (cached on `globalThis.prisma`) from before `Competitor` model was added to `prisma/schema.prisma`. API was returning 500 ("Cannot read properties of undefined (reading 'findMany')") because the cached PrismaClient class didn't have the competitor delegate.
- Verified by direct test (`node ./test-prisma.cjs`) that the regenerated @prisma/client on disk DOES have the competitor delegate and the database IS seeded (returned `amazon-aws` row).
- Restarted dev server (next-server had been killed, system didn't auto-restart it). After restart, all 3 endpoints work:
  - `GET /api/competitors?region=all` → 200, returns 16 Competitor items (verified by JSON inspection).
  - `GET /compare` → 200, contains hero + region tabs + table + Why-JuraganWebsite band + FAQ + CTA band.
  - `GET /providers/amazon-aws` → 200, contains hero with AWS data + quick stats + pros/cons + features + description + JuraganWebsite CTA + provider-others sidebar.
  - `GET /providers/niagahoster` → 200, same structure with Niagahoster data + sidebar showing 5 other Indonesian providers.

## Scope Adherence
- Did NOT touch any other files outside my scope (only the 2 nav files + 2 new page files as authorized).
- Did NOT create `layout.tsx` in any route folder.
- Did NOT use `Math.round` for half-stars (acceptable simpler approach per task spec).
