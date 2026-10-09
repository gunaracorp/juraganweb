
---
Task ID: install-juraganweb
Agent: Main Orchestrator (Z.ai)
Task: Install project dari GitHub repo https://github.com/prabudanling/juraganweb ke project Next.js yang sudah ada

Work Log:
- Cloned repo ke /tmp/juraganweb dan inspeksi struktur: JuraganWebsite = CMS + web hosting panel kelas WordPress (Next.js 16 + Prisma + shadcn/ui + Tailwind 4)
- Bandingkan package.json — dependencies 100% identik dengan project existing, jadi tidak perlu install package baru
- Copy seluruh source code dari repo ke /home/z/my-project:
  - prisma/ (schema.prisma dengan 40+ model + seed.ts)
  - src/lib/ (auth, store, i18n, api-client, api-utils, db, img-fallback, utils)
  - src/hooks/ (use-translation)
  - src/components/ (theme-provider, providers, admin/ 43 files, public/ 12 files)
  - src/app/ (page.tsx, layout.tsx, globals.css, 46 API routes)
  - public/ (portfolio 7 images, blog 5 images, hosting-api 45 PHP endpoints, logo.svg, robots.txt)
  - config: next.config.ts, tailwind.config.ts, postcss.config.mjs, components.json
- Jalankan `bunx prisma generate` — Prisma Client v6.19.2 generated
- Jalankan `bun run db:push` — database schema tersinkron (SQLite)
- Jalankan `bunx tsx prisma/seed.ts` — seed selesai (1 admin, 14 settings, 5 posts, 7 portfolio, 6 services, 6 testimonials, 3 messages)
- Jalankan `bun run lint` — bersih, no errors
- Dev server auto-restart setelah deteksi perubahan next.config.ts
- Verifikasi Agent Browser (golden path):
  - Public site render lengkap: Header, Hero, About, Services, Portfolio, Blog, Testimonials, Contact, Footer
  - Data DB→API→UI: testimonials, portfolio, posts, services semua 200 OK
  - Admin login (admin/juragan2007) berhasil → dashboard "Ringkasan" dengan 37+ section sidebar
  - Admin > Artikel section menampilkan 5 post bilingual ID/EN dari DB
  - Contact form: zod validation blokir submit tanpa field "Subjek" (perilaku benar), setelah diisi lengkap → POST /api/messages → pesan tersimpan di DB (status: new) + success toast
  - No console errors
  - Mobile responsive (390px): header collapse ke hamburger menu, footer hadir di bawah
  - Sticky footer: layout `flex min-h-screen flex-col` + `flex-1` main (pattern yang benar)

Stage Summary:
- JuraganWebsite berhasil ter-install dan berjalan di http://localhost:3000
- Admin login: username `admin` password `juragan2007`
- Akses admin: klik tombol "CMS Admin" di header, atau URL `/#admin` / `/?view=admin`
- Database: 1 admin, 14 settings, 5 blog posts, 7 portfolio, 6 services, 6 testimonials, 3+ messages
- Lint bersih, no runtime errors, full-stack read & write path terverifikasi end-to-end
