# Task 3a — Product Marketing Pages (Hosting / VPS / Cloud / WordPress / Email / SSL)

**Agent:** full-stack-developer
**Task:** Build 6 product marketing pages + 1 shared PricingTable component for JuraganWebsite multi-page Next.js 16 app. Each page is `"use client"`, wrapped in `<MarketingLayout>`, with Indonesian copy and the purple/gold brand system.

## Work Log

### Context loaded
- Read `worklog.md` (orchestrator + 3c agents): JuraganWebsite is a Next.js 16 + Prisma + shadcn/ui (New York) hosting/CMS clone. Brand = purple primary + gold accent (no indigo/blue).
- Read `marketing-layout.tsx`: `<MarketingLayout>` already wraps `QueryProvider` + sticky `SiteHeader` + `SiteFooter` (flex min-h-screen flex-col, main flex-1).
- Read `ui-helpers.tsx`: `Reveal` (framer-motion scroll wrapper) and `formatRupiah(n)` → "Rp 1.234.567".
- Read `cart-store.ts`: `useCart` Zustand store, `addItem(Omit<CartItem,"id">)`. Cart type union = `hosting|vps|cloud|domain|ssl|email|wordpress|service`.
- Read `api-client.ts`: `apiFetch(path, init?)` with /api ↔ /hosting-api auto-fallback.
- Read `api/packages/route.ts`: `GET /api/packages?category=<cat>` returns `{ ok, items: Package[] }` (features+specs already JSON.parsed by `parsePackage`).
- Read `public/services.tsx` for design language reference (Card hover translate-y, gradient brand badge, Reveal stagger).
- Read `globals.css` to confirm available utility classes: `bg-brand-gradient`, `gradient-text`, `bg-mesh`, `glass`, `glow-brand`, `animate-float`, `animate-float-slow`, color tokens `primary`/`gold`.
- Verified seed data shape: 3 hosting, 3 vps, 2 cloud, 2 wordpress, 2 email, 3 ssl packages. SSL packages use `billingCycle:"yearly"`.

### Files created

#### 1. `src/components/site/pricing-table.tsx` (shared)
- Exports `PricingTable({ category, title, subtitle })` client component.
- Uses `useQuery(["packages", category])` + `apiFetch('/packages?category=…')`.
- Auto-detects yearly-only categories (SSL): if every returned package has `billingCycle==="yearly"`, hides the monthly/yearly toggle and uses `/thn` label. Otherwise shows Tabs toggle (Bulanan / Tahunan with "Hemat" gold badge) and `/bln` or `/thn` label.
- Each pricing card: popular badge (gradient, star icon), name (nameId), description (descId), price formatted via `formatRupiah`, "hemat X%" badge when yearly + saving > 0 (computed from `price*12 - priceYearly`), "Pesan Sekarang" button that calls `addItem({ type: asCartType(category), name: nameId, packageSlug: slug, period: cycle==="monthly"?1:12, billingCycle: cycle, price, qty: 1 })` + sonner `toast.success("Ditambahkan ke keranjang", { description: "${nameId} — ${formatRupiah(price)} /bln" })`.
- Feature list with Check icons (matches `public/services.tsx` pattern).
- Specs rendered as outlined Badge chips with capitalized key + bold value (sliced to 6).
- Loading state: 3 shimmer Skeleton cards (Card + Skeleton from `@/components/ui/*`).
- Error state: dashed destructive-bordered panel with AlertCircle icon + retry Button calling `refetch()`.
- Empty state: dashed muted panel with Sparkles icon + "Paket akan segera hadir" copy.
- `asCartType()` helper validates category is a valid CartItem type, else falls back to `"service"`.
- Wrapped each card in `Reveal` with staggered delay (i * 0.06).

#### 2. `src/app/hosting/page.tsx` — Shared Hosting
- Hero: badge "Hosting #1 Indonesia" (Sparkles), h1 "Shared Hosting Cepat & Andal" with gradient-text on second part, animated blob backgrounds, CTAs "Lihat Paket" → #pricing (anchor), "Bandingkan Fitur" → #features, trust row (Setup instan / Garansi 30 hari / Server Indonesia / Domain gratis).
- `<PricingTable category="hosting" …/>`.
- Features grid (1/2/3 cols, 6 cards): LiteSpeed, cPanel, SSL Gratis, Backup Harian, 99.99% Uptime, Migrasi Gratis.
- FAQ accordion (5 Q&A): biaya setup, upgrade, migrasi, garansi, support 24/7.
- CTA band (gradient + bg-mesh overlay): "Sudah punya domain? Mari mulai hosting Anda sekarang." with buttons linking to `/domain` and `/cart`.

#### 3. `src/app/vps/page.tsx` — VPS Cloud Server
- Hero: badge "VPS KVM Berkualitas" (Cpu), h1 "VPS dengan NVMe & Root Access", trust row (Aktif < 60 detik / Full root SSH / NVMe SSD / 1 IPv4 dedicated).
- `<PricingTable category="vps" …/>`.
- Features (6): Full Root Access, NVMe SSD, Snapshot, Multiple OS, 1 IPv4 Dedicated, Instant Deploy.
- Use-case cards (4 in 2-col grid): Developer & Staging, Production Web App, Game Server, VPN & Proxy. Each with tags chips (Docker/CI/CD/Staging, Nginx/Database/Redis, Minecraft/CS:GO/Low Latency, WireGuard/OpenVPN/Private).
- FAQ (4 Q&A): beda VPS KVM vs shared hosting, lama aktivasi, ganti OS, bandwidth.
- CTA band → #pricing + `/cloud` cross-link.

#### 4. `src/app/cloud/page.tsx` — Cloud Hosting
- Hero: badge "Cloud Hosting Managed" (Cloud), h1 "Cloud Hosting dengan Auto-Scaling", trust row (Auto-scaling / 99.99% SLA / Fully managed / Load balancer).
- `<PricingTable category="cloud" …/>`.
- Features (6): Auto-Scaling, 99.99% SLA Uptime, Fully Managed, Daily Backup, Load Balancer, Priority Support.
- "Cara kerja cloud" 3-step diagram (Traffic Masuk → Auto-Scaling → Website Cepat & Stabil) with numbered cards + ArrowRight between cards on desktop, icons in gradient square.
- FAQ (4 Q&A): beda cloud vs shared, fully managed, cara kerja auto-scaling, SLA uptime.
- CTA band → #pricing + `/vps` cross-link ("Butuh root? Lihat VPS").

#### 5. `src/app/wordpress/page.tsx` — WordPress Hosting
- Hero: badge "WordPress Hosting" (Sparkles), h1 "WordPress Hosting Dioptimasi LiteSpeed", trust row (LiteSpeed + LSCache / 1-click install / Staging / Auto SSL).
- `<PricingTable category="wordpress" …/>`.
- Features (6): LiteSpeed Cache, 1-Click WordPress Install, Staging Environment, Auto SSL, WP-CLI Tersedia, Backup Harian.
- "Mengapa WordPress di JuraganWebsite" section (6 cards): Performa Teruji, Skalabilitas Mudah, Keamanan Berlapis, Dukungan Pakar WP, Update Otomatis, Tema & Plugin Gratis.
- FAQ (5 Q&A): migrasi WordPress, WooCommerce, staging gratis, batas plugin, keamanan WP.
- CTA band → #pricing + `/hosting` cross-link.

#### 6. `src/app/email/page.tsx` — Email Bisnis
- Hero: badge "Email Bisnis" (Mail), h1 "Email Profesional dengan Domain Sendiri", trust row (@domain sendiri / Anti-spam & anti-virus / Kalender tim / Mobile sync).
- `<PricingTable category="email" …/>`.
- Features (6): Webmail Modern, Anti-Spam & Anti-Virus, Kalender Bersama, Kontak & Address Book, IMAP/POP3/SMTP, Mobile Sync.
- "Cara kerja email bisnis" 3-step diagram (Daftarkan Domain → Buat Akun Email → Mulai Berkirim Email) with numbered cards + ArrowRight between cards on desktop.
- FAQ (5 Q&A): perlu domain dulu, Outlook/Thunderbird, kapasitas mailbox, anti-spam/virus, sync ke HP.
- CTA band → #pricing + `/domain` cross-link.

#### 7. `src/app/ssl/page.tsx` — SSL Certificate
- Hero: badge "SSL Certificate" (ShieldCheck), h1 "SSL Certificate untuk Keamanan Website", trust row (256-bit encryption / Terbit < 10 menit / Garansi $1jt / Auto-renew).
- `<PricingTable category="ssl" …/>` — auto-detected yearly-only mode (no toggle, `/thn` label).
- Features (6): 256-bit Encryption, Browser Trust, Site Seal, Warranty Garansi, Penerbitan Cepat, Auto-Renew.
- **Comparison table** (shadcn `Table`): 8 rows × 4 cols (Fitur / SSL DV / Wildcard / EV) covering Jenis Validasi, Wildcard, Verifikasi Perusahaan, Waktu Penerbitan, Garansi, Green Bar, Site Seal, Masa Aktif + final "Cocok untuk" row with use-case summaries. Plus trust row below ("Semua sertifikat: 256-bit encryption / Browser trust global / Auto-renew aktif").
- FAQ (5 Q&A): apa itu SSL, lama penerbitan, subdomain support, garansi keamanan, cara pemasangan.
- CTA band → #pricing + `/hosting` cross-link.

### Design rules respected
- All 7 files begin with `"use client"`.
- All 6 pages default-export a component wrapped in `<MarketingLayout>{children}</MarketingLayout>`.
- NO layout.tsx created in route folders.
- NO indigo/blue. Used `bg-brand-gradient`, `gradient-text`, `bg-mesh`, `glow-brand`, `bg-primary/10`, `text-primary`, `bg-gold/15`, `text-gold-foreground` from existing globals.css tokens.
- Mobile-first responsive: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for features, `sm:flex-row` for hero CTA stacks, `md:grid-cols-3` + ArrowRight connector hidden on mobile (`hidden md:block`).
- Every section header + feature card + step card wrapped in `Reveal` for scroll-reveal animations.
- Used shadcn `Card`, `CardContent`, `Button`, `Badge`, `Tabs`/`TabsList`/`TabsTrigger`, `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent`, `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`, `Skeleton`.
- lucide-react icons throughout (no custom SVGs).
- Indonesian copy only.
- Sticky footer handled by `MarketingLayout` (flex min-h-screen flex-col + main flex-1).

### Verification
- Ran `bunx eslint src/components/site/pricing-table.tsx src/app/hosting/page.tsx src/app/vps/page.tsx src/app/cloud/page.tsx src/app/wordpress/page.tsx src/app/email/page.tsx src/app/ssl/page.tsx` → exit 0, no output (clean).
- `bun run lint` (full project) → 8 pre-existing errors in files OUTSIDE my scope (`cart/page.tsx`, `checkout/page.tsx`, `client/domains/page.tsx`, `client/invoices/page.tsx`, `client/page.tsx`, `client/profile/page.tsx`, `client/services/page.tsx`, `client/tickets/page.tsx`, `site/site-header.tsx`) — all from `react-hooks/set-state-in-effect` rule (hydrated pattern), which I did not introduce and was instructed not to fix outside my scope.
- dev.log shows clean 200 responses, no compile errors after file writes.
- Did NOT touch src/app/page.tsx, src/app/layout.tsx, /admin, /api, public/services.tsx, or any pre-existing component outside my scope. No layout.tsx created in route folders.

## Stage Summary

7 production-ready files delivered, all lint-clean:

| # | File | Description |
|---|------|-------------|
| 1 | `src/components/site/pricing-table.tsx` | Shared PricingTable component — TanStack Query fetch, monthly/yearly Tabs toggle (auto-detects yearly-only SSL), skeleton/error/empty states, "Pesan Sekarang" → addItem + sonner toast, formatRupiah, "hemat X%" badge, spec chips. |
| 2 | `src/app/hosting/page.tsx` | Shared Hosting page — hero, PricingTable, 6 features, 5 FAQ, CTA → /domain. |
| 3 | `src/app/vps/page.tsx` | VPS Cloud Server page — hero, PricingTable, 6 features, 4 use-cases, 4 FAQ, CTA. |
| 4 | `src/app/cloud/page.tsx` | Cloud Hosting page — hero, PricingTable, 6 features, 3-step "cara kerja cloud" diagram, 4 FAQ, CTA. |
| 5 | `src/app/wordpress/page.tsx` | WordPress Hosting page — hero, PricingTable, 6 features, 6 "mengapa WP" cards, 5 FAQ, CTA. |
| 6 | `src/app/email/page.tsx` | Email Bisnis page — hero, PricingTable, 6 features, 3-step "cara kerja email" diagram, 5 FAQ, CTA. |
| 7 | `src/app/ssl/page.tsx` | SSL Certificate page — hero, PricingTable (yearly-only), 6 features, DV/Wildcard/EV comparison Table, 5 FAQ, CTA. |

Every page is self-contained, uses `useCart` for "Pesan Sekarang" → add to cart with sonner toast, and renders consistently within the purple/gold JuraganWebsite design system. The PricingTable is fully reusable for any category that the `/api/packages?category=` endpoint serves. Mobile-first responsive throughout, sticky footer via MarketingLayout, no indigo/blue, scroll-reveal animations via Reveal.
