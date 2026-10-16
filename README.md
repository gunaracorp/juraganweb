<div align="center">

# ⚡ JuraganWebsite

### Super Web App Hosting, Domain & Website Builder Profesional

**Gabungan terbaik Hostinger + IDCloudHost + GoDaddy, dibangun dengan Next.js 16 untuk bisnis Indonesia sejak 2007.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-New_York-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br>

<p align="center">
  <strong>31 Halaman Multi-Route</strong> · <strong>56 API Endpoints</strong> · <strong>40+ Database Models</strong> · <strong>16 Kompetitor Terverifikasi</strong>
</p>

<p align="center">
  <a href="#-quick-start"><strong>Quick Start</strong></a> ·
  <a href="#-fitur-unggulan"><strong>Fitur</strong></a> ·
  <a href="#-dokumentasi"><strong>Dokumentasi</strong></a> ·
  <a href="#-deploy"><strong>Deploy</strong></a> ·
  <a href="#-akun-demo"><strong>Demo</strong></a>
</p>

<br>

---

</div>

## 🌟 Tentang JuraganWebsite

> **Bukan sekadar landing page. Ini adalah super web app multi-halaman asli.**

**JuraganWebsite** adalah platform all-in-one untuk hosting, domain, website builder, dan layanan digital profesional Indonesia. Dibangun dari awal sebagai **super web app multi-page** (bukan SPA) yang menggabungkan keunggulan:

- 🚀 **Hostinger** — LiteSpeed, NVMe, hPanel intuitif, harga terjangkau
- ☁️ **IDCloudHost** — Data center Jakarta, pembayaran lokal, support bahasa Indonesia
- 🎯 **GoDaddy** — Registrar domain lengkap dengan 22+ TLD
- 🛍️ **Shopify** — Website builder & e-commerce ready
- 🟧 **Cloudflare** — DNS cepat, SSL gratis, CDN

Dikelola oleh **PT Digital Bisnis Manajemen (Digiman)** — melayani bisnis Indonesia sejak **17 Agustus 2007** (17+ tahun pengalaman).

<br>

<div align="center">

### ✨ Mengapa JuraganWebsite?

</div>

| 🎯 Multi-Page Asli | 🛠️ Full-Stack Lengkap | 🇮🇩 Lokal & Global |
|:---:|:---:|:---:|
| 31 halaman App Router terpisah | Frontend + Backend + Database | Server Indonesia + internasional |
| Bukan single page application | API + Prisma ORM + SQLite | Bahasa Indonesia & English |
| SEO-friendly per route | 56 API endpoints RESTful | Pembayaran QRIS, bank, e-wallet |

<br>

---

## 🚀 Quick Start

### Prasyarat

- **Node.js** ≥ 18.17 atau **Bun** ≥ 1.0 (direkomendasikan)
- **Operating System**: Linux, macOS, atau Windows
- **RAM**: minimal 4GB (recommended 8GB untuk dev experience optimal)

### Instalasi (3 langkah)

```bash
# 1. Clone repository
git clone https://github.com/prabudanling/juraganweb.git
cd juraganweb

# 2. Install dependencies
bun install

# 3. Setup database & jalankan
bun run db:push
bunx tsx prisma/seed.ts
bun run dev
```

🎉 Buka **`http://localhost:3000`** — super web app sudah siap!

> **Catatan environment sandbox:** Dev server butuh `NODE_OPTIONS="--max-old-space-size=4096"` untuk kompilasi modul admin yang besar pada container dengan RAM terbatas.

<br>

---

## 📑 Daftar Isi

- [🌟 Tentang JuraganWebsite](#-tentang-juraganwebsite)
- [🚀 Quick Start](#-quick-start)
- [✨ Fitur Unggulan](#-fitur-unggulan)
- [🏗️ Arsitektur & Tech Stack](#️-arsitektur--tech-stack)
- [📁 Struktur Project](#-struktur-project)
- [📄 Daftar Halaman Lengkap](#-daftar-halaman-lengkap-31-routes)
- [🔌 API Reference](#-api-reference-56-endpoints)
- [🗄️ Database Schema](#️-database-schema-40-models)
- [🔐 Akun Demo](#-akun-demo)
- [🛠️ Scripts yang Tersedia](#️-scripts-yang-tersedia)
- [⚙️ Konfigurasi Environment](#️-konfigurasi-environment)
- [📦 Deploy](#-deploy)
- [🎨 Design System](#-design-system)
- [🤖 Integrasi AI Skills](#-integrasi-ai-skills)
- [📊 Riset Kompetitor](#-riset-kompetitor-16-provider)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Kontribusi](#-kontribusi)
- [📄 Lisensi](#-lisensi)
- [💬 Kontak & Credits](#-kontak--credits)

<br>

---

## ✨ Fitur Unggulan

### 🏠 Untuk Pengunjung / Calon Pelanggan

- **🔍 Domain Search Real-time** — Cek ketersediaan domain dengan 22+ TLD, saran alternatif otomatis, harga promo
- **💰 Pricing Dinamis** — Toggle Bulanan/Tahunan dengan badge "hemat X%", data dari database
- **🛒 Shopping Cart** — Keranjang persisten (localStorage), multi-item, qty stepper, checkout flow
- **📝 Blog & Artikel** — List + detail dengan markdown renderer, view counter, komentar, artikel terkait
- **🎓 Knowledge Base** — 6 tutorial lengkap (daftar hosting, point domain, install WordPress, backup, SSL, optimasi)
- **🏆 Portofolio** — 7 proyek nyata dengan filter kategori
- **📞 Contact Form** — Form zod-validated dengan multiple info kontak & branch offices
- **🌍 Bilingual ID/EN** — Switch bahasa Indonesia/English, persisted
- **🌓 Dark/Light Mode** — Theme toggle dengan next-themes

### 👤 Untuk Pelanggan (Client Portal)

- **🔐 Autentikasi Stateles** — Register & login dengan HMAC token (30 hari expiry), no server session
- **📊 Dashboard** — Statistik layanan, pesanan, invoice, tiket, total spent
- **🗂️ Layanan Saya** — List hosting/VPS/domain/SSL aktif dengan filter kategori
- **🌐 Domain Manager** — Daftar domain terdaftar dengan expiry warning
- **🧾 Invoice** — Riwayat faktur dengan status (unpaid/paid/overdue) & action bayar
- **🎫 Support Tickets** — Buka tiket baru, lihat riwayat, pilih kategori & prioritas
- **👤 Profil** — Edit data diri, alamat, perusahaan
- **💳 Checkout** — Billing prefill, 4 metode pembayaran (Transfer/QRIS/E-wallet/Kartu)

### 🛡️ Untuk Admin (CMS Panel)

- **Dashboard Ringkasan** — Overview dengan statistik real-time
- **37+ Section Manajemen** — Termasuk:
  - Konten: Artikel, Halaman, Portofolio, Layanan, Testimoni, Komentar, Media, Menu
  - Hosting: Paket Layanan, Pesanan, Faktur, Pelanggan, Pembayaran, Kupon
  - Infrastruktur: DNS Zone, SSL Certificate, Email Account, FTP Account, Backup, Cron Jobs, Server Monitor
  - Support: Ticket Support, Knowledge Base, Newsletter, Afiliasi
  - Sistem: Pengguna, Aktivitas, Log Keamanan, SEO Settings, Pengaturan, Staging, AI Builder
  - Analitik: Statistik, Statistik Real-time

### 📊 Riset Kompetitor (Fitur Unik)

- **16 Provider Terverifikasi** — 10 global + 6 Indonesia dengan data asli dari web search 2025-2026
- **Tabel Perbandingan** — Bandingkan region, type, harga, uptime, rating, market share
- **Detail per Provider** — Pros, cons, features, founded year, customers, data center location
- **Filter Region** — Semua / Global / Indonesia

<br>

---

## 🏗️ Arsitektur & Tech Stack

### Frontend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| **Next.js** | 16.1 (App Router, Turbopack) | Framework React full-stack |
| **React** | 19 | Library UI |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4 | Utility-first styling |
| **shadcn/ui** | New York style | Komponen UI |
| **Framer Motion** | 12 | Animasi & transisi |
| **TanStack Query** | 5 | Server state management |
| **TanStack Table** | 8 | Data tables |
| **Zustand** | 5 | Client state (persisted) |
| **React Hook Form + Zod** | 7 + 4 | Form & validasi |
| **Recharts** | 2 | Charts & grafik |
| **Lucide React** | 0.525 | Icon library |
| **next-themes** | 0.4 | Dark/light mode |
| **Sonner** | 2 | Toast notifications |
| **date-fns** | 4 | Date utilities |
| **MDX Editor** | 3.39 | Rich text editor untuk admin |

### Backend
| Teknologi | Kegunaan |
|---|---|
| **Next.js API Routes** | 56 RESTful endpoints |
| **Prisma ORM** | Database ORM dengan type safety |
| **SQLite** | Database embedded (production-ready untuk scale menengah) |
| **Node.js crypto** | HMAC token auth (stateless) |
| **z-ai-web-dev-sdk** | AI integration (TTS, VLM, LLM, image generation) |

### Infrastructure
| Komponen | Kegunaan |
|---|---|
| **Bun** | Runtime & package manager (cepat) |
| **Caddy** | Reverse proxy gateway |
| **Turbopack** | Bundler Next.js 16 |

<br>

---

## 📁 Struktur Project

```
juraganweb/
├── 📂 prisma/
│   ├── schema.prisma          # 40+ model database
│   └── seed.ts                # Seed data lengkap
├── 📂 src/
│   ├── 📂 app/                # Next.js App Router
│   │   ├── 📂 api/            # 56 API routes
│   │   │   ├── 📂 competitors/
│   │   │   ├── 📂 customer/   # auth, services, orders, profile
│   │   │   ├── 📂 domains/    # check, tlds
│   │   │   ├── 📂 posts/      # blog CRUD
│   │   │   ├── 📂 packages/   # hosting plans
│   │   │   └── ...            # 40+ endpoints lainnya
│   │   ├── page.tsx           # Homepage super app
│   │   ├── layout.tsx         # Root layout (ThemeProvider + QueryProvider)
│   │   ├── globals.css        # Tailwind + design system
│   │   ├── 📂 admin/          # Admin CMS route
│   │   ├── 📂 hosting/        # Shared Hosting page
│   │   ├── 📂 vps/            # VPS Cloud Server page
│   │   ├── 📂 cloud/          # Cloud Hosting page
│   │   ├── 📂 wordpress/      # WordPress Hosting page
│   │   ├── 📂 email/          # Email Bisnis page
│   │   ├── 📂 ssl/            # SSL Certificate page
│   │   ├── 📂 domain/         # Domain search page
│   │   ├── 📂 pricing/        # All pricing page
│   │   ├── 📂 website-builder/
│   │   ├── 📂 ai-builder/
│   │   ├── 📂 blog/           # Blog list + [slug]
│   │   ├── 📂 portfolio/
│   │   ├── 📂 about/
│   │   ├── 📂 contact/
│   │   ├── 📂 knowledge/      # Knowledge base + [slug]
│   │   ├── 📂 compare/        # Kompetitor comparison
│   │   ├── 📂 providers/[slug]/ # Detail 16 provider
│   │   ├── 📂 login/          # Customer login
│   │   ├── 📂 register/       # Customer register
│   │   ├── 📂 cart/           # Shopping cart
│   │   ├── 📂 checkout/       # Checkout flow
│   │   └── 📂 client/         # Client portal (dashboard + 5 sub)
│   ├── 📂 components/
│   │   ├── 📂 ui/             # 50+ shadcn components
│   │   ├── 📂 site/           # Header, Footer, Layout, helpers
│   │   ├── 📂 public/         # Hero, About, Services, dll (SPA legacy)
│   │   ├── 📂 admin/          # 43 admin manager components
│   │   └── theme-provider.tsx
│   ├── 📂 lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # Admin HMAC auth
│   │   ├── customer-auth.ts  # Customer HMAC auth
│   │   ├── cart-store.ts      # Zustand cart (persisted)
│   │   ├── customer-store.ts  # Zustand customer session
│   │   ├── store.ts           # Global app store
│   │   ├── i18n.ts            # ID/EN translations (2500+ lines)
│   │   ├── api-client.ts      # Smart fetch (auto /api vs /hosting-api)
│   │   ├── api-utils.ts       # API helpers (requireAuth, json, dll)
│   │   ├── img-fallback.ts    # Image error handler
│   │   └── utils.ts           # cn() & utilities
│   └── 📂 hooks/
│       ├── use-translation.ts
│       ├── use-toast.ts
│       ├── use-mobile.ts
│       └── use-hydrated.ts
├── 📂 public/
│   ├── 📂 portfolio/          # 7 gambar portofolio
│   ├── 📂 blog/               # 5 gambar blog
│   ├── 📂 hosting-api/        # PHP API untuk shared hosting
│   ├── logo.svg
│   └── robots.txt
├── 📂 mini-services/           # WebSocket services (optional)
├── 📂 examples/                # WebSocket demo
├── prisma/schema.prisma
├── next.config.ts
├── tailwind.config.ts
├── components.json
├── package.json
└── README.md                   # Anda di sini ✨
```

<br>

---

## 📄 Daftar Halaman Lengkap (31 Routes)

### 🏠 Marketing Pages (Publik)

| Route | Halaman | Deskripsi |
|---|---|---|
| `/` | **Homepage** | Landing super app dengan domain search, product grid, fitur, stats, testimoni |
| `/hosting` | **Shared Hosting** | 3 paket (Single/Premium/Business) + 6 fitur + FAQ |
| `/vps` | **VPS Cloud Server** | 3 paket KVM + 4 use cases + FAQ |
| `/cloud` | **Cloud Hosting** | 2 paket managed + diagram cara kerja + FAQ |
| `/wordpress` | **WordPress Hosting** | 2 paket LiteSpeed + 6 keunggulan + FAQ |
| `/email` | **Email Bisnis** | 2 paket + 3-step cara kerja + FAQ |
| `/ssl` | **SSL Certificate** | 3 paket (DV/Wildcard/EV) + comparison table + FAQ |
| `/domain` | **Domain** | Search + 22 TLD pricing table + suggestions + transfer guide |
| `/pricing` | **Pricing All** | 7 tabs per kategori (Hosting/WordPress/VPS/Cloud/Email/SSL/Domain) + FAQ |
| `/website-builder` | **Website Builder** | Marketing builder + 6 templates + 3-step + FAQ |
| `/ai-builder` | **AI Builder** | Marketing AI + example prompts + 3-step + FAQ |
| `/compare` | **Bandingkan Provider** | Tabel 16 kompetitor + filter region + "Mengapa JW?" + FAQ |
| `/providers/[slug]` | **Detail Provider** | 16 halaman detail per kompetitor (slug-based) |

### 📝 Content Pages

| Route | Halaman | Deskripsi |
|---|---|---|
| `/blog` | **Blog List** | Featured + kategori filter + search + grid artikel |
| `/blog/[slug]` | **Blog Detail** | Markdown render + view tracking + komentar + artikel terkait |
| `/portfolio` | **Portofolio** | 7 proyek nyata + filter kategori + stats band |
| `/about` | **Tentang Kami** | Story + misi/visi/nilai + 3 cabang kantor + tim |
| `/contact` | **Kontak** | Form zod-validated + info kontak + peta + branch offices |
| `/knowledge` | **Pusat Bantuan** | 6 artikel KB + search + filter kategori + newsletter |
| `/knowledge/[slug]` | **Artikel Bantuan** | Detail tutorial + markdown + artikel terkait + feedback |

### 👤 Customer Portal (Client Area)

| Route | Halaman | Deskripsi |
|---|---|---|
| `/login` | **Customer Login** | Form + demo hint + auto-fill button |
| `/register` | **Customer Register** | Form + benefits sidebar |
| `/cart` | **Shopping Cart** | Item list + qty stepper + summary + clear dialog |
| `/checkout` | **Checkout** | Auth-gated + billing prefill + 4 payment methods + order submit |
| `/client` | **Dashboard** | Stats grid + total spent + layanan & invoice preview |
| `/client/services` | **Layanan Saya** | Tabel + kategori tabs + search |
| `/client/domains` | **Domain Saya** | Filtered domain list + expiry warning |
| `/client/invoices` | **Invoice** | Tabel + status tabs + action bayar |
| `/client/tickets` | **Tiket Support** | Tabel + dialog "Buka Tiket Baru" |
| `/client/profile` | **Profil** | Edit form + Keamanan section |

### 🛡️ Admin Panel

| Route | Halaman | Deskripsi |
|---|---|---|
| `/admin` | **Admin CMS** | Login form → dashboard dengan 37+ section (SPA legacy ter-mount sebagai route) |

<br>

---

## 🔌 API Reference (56 Endpoints)

### 🌐 Domain & Hosting Products
```
GET  /api/domains/check?domain=...      # Cek ketersediaan domain
GET  /api/domains/tlds                  # Daftar harga TLD
GET  /api/packages?category=<cat>       # Paket hosting/VPS/cloud/wordpress/email/ssl
GET  /api/packages?slug=<slug>          # Detail paket
POST /api/packages                      # (Admin) Buat paket
PUT  /api/packages                      # (Admin) Update paket
DELETE /api/packages?id=<id>            # (Admin) Hapus paket
```

### 👤 Customer Auth & Portal
```
POST /api/customer/register             # Daftar akun baru → return token
POST /api/customer/login                # Login → return token
GET  /api/customer/session              # Validasi token + profil + stats
GET  /api/customer/services             # Layanan aktif pelanggan
GET  /api/customer/orders               # Daftar pesanan
POST /api/customer/orders               # Buat order + invoice + CustomerService
GET  /api/customer/invoices             # Invoice pelanggan
PUT  /api/customer/profile              # Update profil
```

### 📝 Content (Blog, Portfolio, dll)
```
GET  /api/posts?published=true          # List artikel published
GET  /api/posts?slug=<slug>             # Detail artikel
POST /api/posts                         # (Admin) Buat artikel
PUT  /api/posts                         # (Admin) Update artikel
DELETE /api/posts?id=<id>               # (Admin) Hapus artikel
POST /api/posts/view                    # Increment view counter
GET  /api/portfolio                     # List portofolio
GET  /api/categories                    # Kategori blog
GET  /api/tags                          # Tag list
GET  /api/comments                      # Komentar
POST /api/comments                      # Submit komentar (moderasi)
```

### 💬 Communication
```
POST /api/messages                      # Contact form submit
POST /api/subscribers                   # Newsletter subscribe
GET  /api/newsletter                    # (Admin) Campaign list
GET  /api/tickets?email=<email>         # Tiket support by email
POST /api/tickets                       # Buka tiket baru
```

### 🏢 Hosting Infrastructure (Admin)
```
GET/POST/PUT/DELETE /api/orders         # Manajemen pesanan
GET/POST/PUT/DELETE /api/invoices       # Manajemen faktur
GET/POST/PUT/DELETE /api/customers      # Manajemen pelanggan
GET/POST/PUT/DELETE /api/payments       # Manajemen pembayaran
GET/POST/PUT/DELETE /api/coupons        # Manajemen kupon
GET/POST/PUT/DELETE /api/dns            # DNS Zone manager
GET/POST/PUT/DELETE /api/ssl-certs     # SSL Certificate manager
GET/POST/PUT/DELETE /api/email-accounts # Email account manager
GET/POST/PUT/DELETE /api/ftp-accounts   # FTP account manager
GET/POST/PUT/DELETE /api/backups        # Backup manager
GET/POST/PUT/DELETE /api/cron          # Cron job manager
```

### 📊 Analytics & Monitoring
```
GET  /api/analytics                     # Web analytics
GET  /api/realtime                      # Realtime stats
GET  /api/server-monitor                # Server metrics
GET  /api/stats                         # Dashboard stats
GET  /api/activity                      # Activity log
GET  /api/security-logs                 # Security logs
```

### 🤖 AI & Builder
```
GET/POST  /api/ai-builder              # AI website builder projects
GET/POST  /api/staging                  # Staging environments
```

### 📊 Kompetitor Comparison
```
GET  /api/competitors?region=all        # Semua provider (default)
GET  /api/competitors?region=global     # 10 provider global terbesar
GET  /api/competitors?region=indonesia  # 6 provider Indonesia terbesar
GET  /api/competitors?slug=<slug>       # Detail 1 provider
```

### 🔐 Admin Auth
```
POST /api/auth/login                    # Admin login → token
POST /api/auth/logout                   # Admin logout
GET  /api/auth/session                  # Validate admin token
```

### 🎛️ Admin CMS (37+ Resources)
```
/api/services         /api/menus          /api/pages          /api/media
/api/settings         /api/users          /api/profile         /api/notifications
/api/knowledge        /api/affiliate      /api/seo             /api/server-monitor
/api/testimonials     /api/categories     /api/tags            ... dan lainnya
```

> **Total: 56 API endpoints** dengan pola konsisten: `GET` (list/single), `POST` (create), `PUT` (update), `DELETE` (soft/hard delete). Semua admin endpoint diproteksi `requireAuth()`.

<br>

---

## 🗄️ Database Schema (40+ Models)

### Core Models
- **Admin** — Akun admin CMS (username, password hash, role)
- **Customer** — Pelanggan dengan auth stateless
- **Post** — Artikel blog bilingual (ID/EN)
- **Page** — Halaman dinamis
- **Portfolio** — Proyek klien
- **Service** — Layanan jasa JuraganWebsite
- **Testimonial** — Testimoni klien
- **Message** — Pesan contact form
- **Comment** — Komentar blog (moderasi)
- **Media** — Library media upload
- **Menu** — Menu navigasi custom
- **Setting** — Pengaturan situs bilingual
- **Subscriber** — Pelanggan newsletter

### Hosting & Domain
- **ServicePackage** — Paket hosting/VPS/cloud/wordpress/email/ssl (15 paket)
- **DomainTld** — Harga 22+ TLD (.com, .id, .web.id, .xyz, dll)
- **Order** — Pesanan pelanggan
- **Invoice** — Faktur dengan status (unpaid/paid/overdue)
- **Payment** — Pembayaran dengan gateway (midtrans/xendit/manual)
- **Coupon** — Kupon diskon
- **CustomerService** — Layanan aktif pelanggan (terlink ke Order)

### Support & Infrastructure
- **Ticket** — Tiket support
- **TicketReply** — Balasan tiket
- **KnowledgeArticle** — Artikel knowledge base (6 seeded)
- **KnowledgeCategory** — Kategori KB
- **Affiliate** — Program afiliasi
- **AffiliateClick** — Tracking klik afiliasi
- **ServerMetric** — Metrik server (CPU, RAM, disk, bandwidth)
- **CronJob** — Cron job manager
- **DNSRecord** — DNS zone records
- **SSLCertificate** — Sertifikat SSL
- **Backup** — Backup manager
- **EmailAccount** — Email bisnis account
- **FTPAccount** — FTP account
- **NewsletterCampaign** — Kampanye newsletter
- **SecurityLog** — Log keamanan
- **StagingEnv** — Staging environment
- **AIWebsiteProject** — Project AI builder
- **VisitorStat** — Statistik visitor harian
- **Notification** — Notifikasi user
- **Activity** — Activity log
- **Category** — Kategori blog
- **Tag** — Tag blog

### Kompetitor Research
- **Competitor** — 16 provider hosting/domain terbesar (global + Indonesia)

> **Total: 40+ Prisma models** dengan indexing yang optimal (`@@index`) dan relasi yang jelas.

<br>

---

## 🔐 Akun Demo

### 🛡️ Admin CMS
```
URL:      http://localhost:3000/admin
Username: admin
Password: juragan2007
```

### 👤 Customer Demo
```
URL:      http://localhost:3000/login
Email:    demo@juraganwebsite.id
Password: demo123
```

Akun demo sudah memiliki:
- 3 layanan aktif (Hosting Premium, Domain .com, SSL Wildcard)
- 3 pesanan + invoice
- Riwayat tiket support
- Total spent: Rp 549.000

<br>

---

## 🛠️ Scripts yang Tersedia

```bash
# Development
bun run dev                # Start dev server (port 3000, Turbopack)
bun run lint               # ESLint check

# Database
bun run db:push            # Push schema ke database (accept data loss)
bun run db:generate        # Generate Prisma Client
bun run db:migrate         # Run migrations
bun run db:reset           # Reset database (destructive)

# Build & Production
bun run build              # Build standalone production
bun run build:export       # Build untuk shared hosting (static export)
bun run build:hosting      # Alias build:export
bun run start              # Start production server (standalone)
```

### Database Seed
```bash
bunx tsx prisma/seed.ts    # Seed semua data demo
```

Seed mencakup:
- 1 Admin (`admin`/`juragan2007`)
- 1 Customer demo (`demo@juraganwebsite.id`/`demo123`)
- 14 Settings (bilingual)
- 5 Blog posts (bilingual, dengan cover image)
- 7 Portfolio items
- 6 Services
- 6 Testimonials
- 15 ServicePackages (hosting/VPS/cloud/wordpress/email/ssl)
- 22 DomainTld pricing
- 6 KnowledgeArticle
- 3 Sample messages
- 3 CustomerService untuk demo customer
- 16 Competitor (10 global + 6 Indonesia)

<br>

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di root project:

```env
# Database (SQLite)
DATABASE_URL="file:/home/z/my-project/db/custom.db"

# Auth secret (ganti dengan string random panjang untuk production)
AUTH_SECRET="juraganwebsite-secret-2007-digiman"

# Optional: untuk fitur AI
ZAI_API_KEY="your-z-ai-api-key"

# Build mode (opsional)
# SHARED_HOSTING=1         # Untuk build static export ke cPanel
# NODE_OPTIONS="--max-old-space-size=4096"  # Untuk container RAM terbatas
```

### Caddyfile (Gateway)

Project menggunakan Caddy sebagai reverse proxy di port 81:

```caddy
:81 {
    @transform_port_query {
        query XTransformPort=*
    }
    handle @transform_port_query {
        reverse_proxy localhost:{query.XTransformPort}
    }
    handle {
        reverse_proxy localhost:3000
    }
}
```

Untuk request ke mini-service lain (misal WebSocket di port 3003), gunakan:
```
fetch('/api/endpoint?XTransformPort=3003')
```

<br>

---

## 📦 Deploy

### 🚀 Opsi 1: VPS / Server Node.js (Recommended)

```bash
# Build standalone
bun run build

# Output ke .next/standalone/ + .next/static/ + public/
# Jalankan production server
NODE_ENV=production bun .next/standalone/server.js
```

Setup dengan PM2 untuk production:
```bash
npm install -g pm2
pm2 start "bun .next/standalone/server.js" --name juraganwebsite
pm2 save
pm2 startup
```

### 🌐 Opsi 2: Shared Hosting (cPanel)

```bash
# Build static export
SHARED_HOSTING=1 bun run build:export
```

Output di folder `.next/` siap upload ke `public_html/`. Termasuk:
- Static HTML + CSS + JS
- `hosting-api/` (PHP API fallback untuk shared hosting tanpa Node.js)
- `.htaccess` rewrite rules

### 🐳 Opsi 3: Docker

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run db:push && bun run build
EXPOSE 3000
CMD ["bun", ".next/standalone/server.js"]
```

### 🔧 Opsi 4: Vercel / Netlify

```bash
# Vercel
vercel --prod

# Atau connect GitHub repo ke Vercel dashboard
# Set env vars: DATABASE_URL, AUTH_SECRET
```

> **Catatan:** Untuk Vercel/Netlify, ganti SQLite dengan PostgreSQL/MySQL (Neon, PlanetScale, dll) dengan mengubah `datasource` di `schema.prisma`.

<br>

---

## 🎨 Design System

### Warna Brand

```css
/* Primary: Vivid Purple */
--primary: oklch(0.58 0.24 295);
--brand: oklch(0.58 0.24 295);

/* Accent: Gold */
--gold: oklch(0.62 0.2 245);

/* Background: Soft purple-tinted */
--background: oklch(0.985 0.012 295);
```

### Utility Classes Custom

| Class | Kegunaan |
|---|---|
| `bg-brand-gradient` | Gradient dari primary ke gold |
| `gradient-text` | Text dengan gradient brand |
| `bg-mesh` | Background mesh radial gradient |
| `glass` | Backdrop blur dengan transparansi |
| `glow-brand` | Box shadow glow |
| `shimmer` | Loading shimmer animation |
| `animate-float` | Floating animation |
| `animate-blob` | Blob morphing |
| `animate-marquee` | Marquee scroll |
| `animate-pulse-ring` | Pulse ring (WhatsApp button) |

### Typography

- **Primary Font**: Plus Jakarta Sans (400-800)
- **Mono Font**: Geist Mono
- **Sans Alt**: Geist Sans

### Komponen shadcn/ui (50+)

Button, Card, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, Tabs, Accordion, Dialog, Sheet, Drawer, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Menubar, NavigationMenu, Breadcrumb, Pagination, Table, DataTable, Calendar, DatePicker, Command, Combobox, Avatar, Badge, Progress, Skeleton, Separator, Label, Form, Toaster (sonner + radix), Chart (recharts), Carousel, AspectRatio, ScrollArea, ResizablePanel, Toggle, ToggleGroup, Sidebar, Alert, AlertDialog, etc.

<br>

---

## 🤖 Integrasi AI Skills

Project ini siap integrasi dengan **z-ai-web-dev-sdk** untuk fitur AI:

| Skill | Use Case | Status |
|---|---|---|
| **LLM** | Chatbot support, AI content generator | 🟡 Siap integrate |
| **VLM** | Image analysis untuk AI builder | 🟡 Siap integrate |
| **Image Generation** | Generate gambar blog/portfolio | 🟡 Siap integrate |
| **TTS** | Voice untuk video tutorial | 🟡 Siap integrate |
| **ASR** | Voice search | 🟡 Siap integrate |
| **Web Search** | Real-time info untuk blog | 🟡 Siap integrate |
| **Web Reader** | Scraping untuk riset kompetitor | 🟢 Sudah dipakai untuk seed kompetitor |

### Contoh Integrasi LLM Chatbot

```typescript
// src/app/api/ai-chat/route.ts
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(req: Request) {
  const { message } = await req.json();
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: 'Anda adalah customer support JuraganWebsite...' },
      { role: 'user', content: message }
    ],
  });
  return Response.json({ reply: completion.choices[0].message.content });
}
```

<br>

---

## 📊 Riset Kompetitor (16 Provider)

Data dikumpulkan via **web search 2025-2026** dari sumber terpercaya:
- w3techs.com, hostingseekers.com, hostadvice.com
- bitcatcha.com, hostinger.com tutorials
- godaddy.com resources, pragmaticengineer.com

### 🌍 Top 10 Global

| # | Provider | Market Share | Customers | Founded |
|---|---|---|---|---|
| 1 | Amazon Web Services (AWS) | ~5.4% websites | Jutaan pelanggan | 2006 |
| 2 | GoDaddy | ~10.8% registrar | 84M+ domains | 1997 |
| 3 | Hostinger | #2 web hosting (w3techs) | 2.9M+ users | 2004 |
| 4 | Shopify | 5.3% websites | 5M+ merchants | 2006 |
| 5 | Bluehost | Top 10 global | 2M+ websites | 2003 |
| 6 | SiteGround | Top premium shared | 2.8M+ domains | 2004 |
| 7 | OVHcloud | ~3% websites | 1.6M+ customers | 1999 |
| 8 | Cloudflare Registrar | Top 5 DNS | 20M+ properties | 2010 |
| 9 | Namecheap | ~3.5% registrar (#2) | 17M+ customers | 2000 |
| 10 | DreamHost | Top 15 global | 1.5M+ sites | 1997 |

### 🇮🇩 Top 6 Indonesia

| # | Provider | Market Position | Customers | Founded |
|---|---|---|---|---|
| 1 | IDCloudHost | Top 3 Indonesia | 150rb+ pelanggan | 2014 |
| 2 | Niagahoster | #1 Indonesia | 700rb+ pengguna | 2013 |
| 3 | Rumahweb | Top 5 Indonesia | 200rb+ website | 2002 |
| 4 | Exabytes Indonesia | Top 5 Asia Tenggara | 160rb+ pelanggan | 2001 |
| 5 | IDwebhost | Top 7 Indonesia | 100rb+ pelanggan | 2001 |
| 6 | DomaiNesia | Top 10 Indonesia | 80rb+ pelanggan | 2009 |

Akses di: **`/compare`** (tabel) atau **`/providers/[slug]`** (detail per provider)

<br>

---

## 🗺️ Roadmap

### ✅ Sudah Selesai (v1.0)
- [x] Multi-page super web app (31 routes)
- [x] 56 API endpoints
- [x] Customer auth + portal (dashboard, services, invoices, tickets, profile)
- [x] Admin CMS (37+ sections)
- [x] Shopping cart + checkout
- [x] Domain search + 22 TLD pricing
- [x] 15 hosting packages (6 kategori)
- [x] Blog + portfolio + knowledge base
- [x] Kompetitor research (16 provider)
- [x] Bilingual ID/EN
- [x] Dark/light mode
- [x] Responsive mobile-first

### 🚧 Sedang Dikerjakan
- [ ] Integrasi payment gateway (Midtrans/Xendit)
- [ ] Real domain registration via registrar API (ResellerClub)
- [ ] AI chatbot customer support (LLM)
- [ ] AI website builder (image gen + VLM)

### 📋 Direncanakan (v2.0)
- [ ] WhatsApp Business integration
- [ ] Multi-currency (USD, EUR)
- [ ] Affiliate program frontend
- [ ] Real-time server monitoring dashboard (WebSocket)
- [ ] Kubernetes deployment manifests
- [ ] Migration ke PostgreSQL untuk scale enterprise
- [ ] Mobile app (React Native)
- [ ] PWA offline support
- [ ] Multi-tenant white-label

<br>

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Ikuti langkah berikut:

1. **Fork** repository
2. Buat **feature branch**: `git checkout -b feature/nama-fitur`
3. **Commit** perubahan: `git commit -m 'Add: nama fitur'`
4. **Push** ke branch: `git push origin feature/nama-fitur`
5. Buka **Pull Request**

### Guidelines
- Gunakan **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- Pastikan `bun run lint` bersih sebelum commit
- Test perubahan via Agent Browser untuk golden path
- Update `worklog.md` dengan Task ID yang jelas
- Hormati design system (no indigo/blue, gunakan brand purple + gold)

<br>

---

## 📄 Lisensi

MIT License — lihat file [LICENSE](LICENSE) untuk detail lengkap.

```
MIT License

Copyright (c) 2007-2026 PT Digital Bisnis Manajemen (Digiman)
JuraganWebsite - https://juraganwebsite.web.id

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

<br>

---

## 💬 Kontak & Credits

### 🏢 Perusahaan

**PT Digital Bisnis Manajemen (Digiman)**

- 📧 Email: juraganwebsite10@gmail.com
- 📱 WhatsApp: +62 812-3455-9556
- 🌐 Website: [juraganwebsite.web.id](https://juraganwebsite.web.id)
- 📍 Jakarta Selatan 12190, Indonesia

### 🏢 Cabang

| Kota | Alamat |
|---|---|
| **Jakarta** | Jl. Sudirman Kav. 52-53, Jakarta Selatan 12190 |
| **Tasikmalaya** | Perumahan Andalusia Garden Cluster Granada No.11, Mangkubumi |
| **Bandung** | Jln. Muararajeun Lama No.26, Cihaurgeulis, Cibeunying Kaler 40122 |

### 📱 Social Media

[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://facebook.com/juraganwebsite)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/juraganwebsite)
[![Twitter/X](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/juraganwebsite)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/company/juraganwebsite)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@juraganwebsite)

### 🙏 Credits & Acknowledgments

- **Next.js Team** — Framework luar biasa
- **Vercel** — shadcn/ui inspiration
- **Tailwind Labs** — Utility-first CSS
- **Prisma** — Type-safe ORM
- **Hostinger & IDCloudHost** — Inspirasi fitur
- **Semua pelanggan JuraganWebsite** — Kepercayaan sejak 2007

### 📜 Riwayat Project

```
2007  ─── Didirikan sebagai Digiman (PT Digital Bisnis Manajemen)
2010  ─── Peluncuran layanan hosting pertama
2015  ─── Ekspansi ke WordPress managed hosting
2020  ─── Migrasi ke arsitektur cloud-native
2024  ─── Launch super web app multi-page (v1.0)
2026  ─── Riset 16 kompetitor + AI integration (current)
```

<br>

---

<div align="center">

### ⭐ Jika project ini bermanfaat, beri star di GitHub!

<br>

**Dibuat dengan ❤️ di Indonesia sejak 2007**

*"Tidak ada yang indah selain karya yang tulus untuk bangsa."*

<br>

---

**© 2007-2026 PT Digital Bisnis Manajemen (Digiman) · JuraganWebsite**

*All rights reserved. Made with Next.js, TypeScript, Tailwind CSS, Prisma, and lots of ☕*

</div>
