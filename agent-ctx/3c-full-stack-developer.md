# Task 3c — full-stack-developer — Content pages (blog, portfolio, about, contact)

## Scope
Build 5 NEW standalone multi-page routes for JuraganWebsite (Next.js 16 App Router).
Each page is `"use client"`, wrapped in `<MarketingLayout>`, fetches its own data
via `apiFetch` + TanStack Query, and renders Indonesian copy.

## Files Created

### 1. `src/app/blog/page.tsx` — Blog list
- Hero "Blog & Artikel Digital" (purple+gold gradient text, bg-mesh, glow blobs).
- Featured post banner (only when `featured:true` exists and no filter/search active)
  — large card with cover image, "Pilihan Editor" badge, category, title (titleId),
  excerpt, author + read time + views + date, "Baca selengkapnya" button → `/blog/[slug]`.
- Category filter chips derived from posts' `category` field (Semua Kategori default).
- Search Input (client-side filter by titleId / excerptId / titleEn).
- Article grid (responsive 1/2/3 cols): cover image (with `onImgError` gradient fallback),
  category badge, title, excerpt, author + views, "Baca selengkapnya" link.
- Newsletter subscribe box at bottom (POST `/api/subscribers`, sonner toast).
- Skeleton loading state + empty state.

### 2. `src/app/blog/[slug]/page.tsx` — Blog detail
- Client component. Reads `slug` via `useParams()`.
- Fetches `/api/posts?slug=<slug>` via `useQuery` (uses `json.post` shape per actual API).
- Not-found UI with link back to `/blog` if post missing.
- On mount + slug change: fire-and-forget `POST /api/posts/view { slug }` to increment views.
- Cover image hero, category badge, title (titleId), excerpt, meta row
  (author + date + views + read time).
- Custom **markdown-ish renderer** (`renderContent`): split by `\n`,
  - `# ` → `<h1>`, `## ` → `<h2>`, `### ` → `<h3>`, `#### ` → `<h4>`
  - `- ` / `* ` items grouped into `<ul>`
  - `\d+. ` items grouped into `<ol>`
  - ```` ``` ```` fenced blocks → `<pre><code>`
  - inline `` `code` `` → `<code>`
  - else paragraph (consecutive non-empty plain lines merged).
- Sidebar (sticky on desktop `lg:sticky lg:top-24`): "Artikel Terkait" card (same category,
  exclude current, take 4) + newsletter subscribe box.
- "Tinggalkan Komentar" form (react-hook-form + zod): name, email, message →
  `POST /api/comments { postId, name, email, content }` (uses `post.id` as postId);
  sonner toast "Komentar menunggu moderasi".
- Back to `/blog` link at top.
- Tags row if `post.tags` present.

### 3. `src/app/portfolio/page.tsx` — Portfolio list
- Hero "Portofolio Karya Kami".
- Stats counter band (jumlah proyek, klien unik, tahun) derived from data.
- Category filter chips derived from items (Web App / Company Profile / E-Commerce / ...).
- Portfolio grid: image (with gradient fallback), category badge, year badge,
  title (titleId), client + year, "Lihat Proyek" icon link,
  "Kunjungi Website" external link button (only if `url` exists).
- CTA "Mulai proyekmu" → `/contact`.

### 4. `src/app/about/page.tsx` — About
- Hero "Tentang JuraganWebsite".
- Story section: 2007 timeline card (gradient 2007 number, parent company, Jakarta HQ,
  17+ years) + story text (PT Digital Bisnis Manajemen / Digiman history).
- Mission + Vision cards (Target + Eye icons).
- 4 value cards: Profesional, Terjangkau, Dukungan 24/7, Garansi.
- Stats band (17+ tahun, 50rb+ klien, 99.99% uptime, 24/7 support).
- 3 branch office cards (Jakarta pusat, Tasikmalaya, Bandung).
- Team preview: 6 placeholder cards with initials avatar (gradient).
- CTA band (Rocket icon, "Hubungi Kami" + "Lihat Portofolio" buttons).

### 5. `src/app/contact/page.tsx` — Contact
- Hero "Hubungi Kami".
- Two-column layout:
  - Left: 4 InfoCards (address, phone, email, hours), social row (5 icons),
    branch offices card (Tasikmalaya + Bandung), OpenStreetMap iframe.
  - Right: Card with react-hook-form + zod contact form (name, email, phone, subject,
    message). Submit → `POST /api/messages`, sonner toast success, reset form.
    Inline newsletter subscribe box below form (POST `/api/subscribers`).

## Implementation Notes
- All 5 pages use `<MarketingLayout>` wrapper → sticky header + footer, `main flex-1`.
- All `"use client"` + use TanStack Query `useQuery` for data fetching
  (QueryProvider is inside MarketingLayout).
- API response shapes matched to actual `/api/posts/route.ts` and `/api/portfolio/route.ts`:
  - `GET /api/posts?published=true` → `{ ok, posts: Post[] }`
  - `GET /api/posts?slug=<slug>` → `{ ok, post: Post }`
  - `GET /api/portfolio` → `{ ok, items: Portfolio[] }`
- Image fallback: `onImgError(label)` from `@/lib/img-fallback` (gradient + initials).
- No indigo/blue colors. Used `bg-brand-gradient`, `gradient-text`, `bg-mesh`,
  `from-primary to-gold` utilities throughout.
- Mobile-first responsive design with `sm:` / `lg:` breakpoints.
- Indonesian copy throughout (titleId/excerptId/contentId fields).
- Lucide-react icons.
- `Reveal` from `@/components/site/ui-helpers` used for scroll animations.
- For `[slug]` dynamic route: used `useParams()` from `next/navigation` (no layout.tsx
  created in route folder).
- DID NOT touch `src/app/page.tsx`, `src/components/public/*`, `src/components/site/*`
  (other than my own page.tsx files which don't modify shared code).
- DID NOT import any `@/components/public/*` SPA components.

## Verification
- `bun run lint` → 0 errors in my 5 new files. (10 pre-existing errors in
  `/cart`, `/checkout`, `/client/*`, `site-header.tsx` are NOT in scope — left untouched
  per task instructions "fix any errors in YOUR files only".)
- Dev log shows clean 200 responses, no compile errors related to my routes.
- All API calls go through `apiFetch` which auto-switches between `/api/*` (Next.js)
  and `/hosting-api/*` (cPanel static export) per the existing adapter.

## Stage Summary
5 production-ready content pages delivered: `/blog`, `/blog/[slug]`, `/portfolio`,
`/about`, `/contact`. Each is a self-contained client component fetching its own data,
styled consistently with the purple+gold JuraganWebsite design system, fully
responsive, with Indonesian copy and proper image fallback handling. Lint passes
cleanly for all new files. Multi-page architecture is now live alongside the existing
single-page admin SPA homepage.
