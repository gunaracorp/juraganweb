"use client";

import Link from "next/link";
import {
  Lock,
  Globe,
  BadgeCheck,
  ShieldCheck,
  Zap,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Clock,
  Award,
  Check,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { PricingTable } from "@/components/site/pricing-table";
import { Reveal } from "@/components/site/ui-helpers";

const FEATURES: {
  icon: LucideIcon;
  title: string;
  desc: string;
}[] = [
  {
    icon: Lock,
    title: "256-bit Encryption",
    desc: "Enkripsi AES-256 bit yang sama dengan bank dan militer. Data pengguna terlindungi saat transmisi.",
  },
  {
    icon: Globe,
    title: "Browser Trust",
    desc: "Sertifikat diakui semua browser utama: Chrome, Firefox, Safari, Edge. Tanpa peringatan keamanan.",
  },
  {
    icon: BadgeCheck,
    title: "Site Seal",
    desc: "Tampilkan seal kepercayaan di website Anda untuk meningkatkan kepercayaan pengunjung dan konversi.",
  },
  {
    icon: Award,
    title: "Warranty Garansi",
    desc: "Garansi keamanan hingga $1.000.000 (tergantung jenis sertifikat) sebagai jaminan perlindungan.",
  },
  {
    icon: Zap,
    title: "Penerbitan Cepat",
    desc: "SSL DV terbit dalam < 10 menit. Wildcard dalam beberapa jam. EV dengan verifikasi 1-3 hari kerja.",
  },
  {
    icon: RefreshCw,
    title: "Auto-Renew",
    desc: "Perpanjangan otomatis sebelum masa aktif habis. Tidak ada lagi website yang kehilangan gembok hijau.",
  },
];

interface CompareRow {
  feature: string;
  dv: string;
  wildcard: string;
  ev: string;
}

const COMPARE: CompareRow[] = [
  { feature: "Jenis Validasi", dv: "Domain (DV)", wildcard: "Domain (DV)", ev: "Extended (EV)" },
  { feature: "Wildcard Subdomain", dv: "Tidak", wildcard: "Ya (unlimited)", ev: "Tidak" },
  { feature: "Verifikasi Perusahaan", dv: "Tidak", wildcard: "Tidak", ev: "Ya" },
  { feature: "Waktu Penerbitan", dv: "< 10 menit", wildcard: "Beberapa jam", ev: "1-3 hari kerja" },
  { feature: "Garansi", dv: "$10.000", wildcard: "$100.000", ev: "$1.000.000" },
  { feature: "Green Bar", dv: "Tidak", wildcard: "Tidak", ev: "Ya" },
  { feature: "Site Seal", dv: "Ya", wildcard: "Ya", ev: "Ya (premium)" },
  { feature: "Masa Aktif", dv: "1 tahun", wildcard: "1 tahun", ev: "1 tahun" },
];

const FAQS = [
  {
    q: "Apa itu SSL Certificate dan mengapa wajib?",
    a: "SSL (Secure Sockets Layer) adalah protokol enkripsi yang mengamankan data yang dikirim antara browser pengunjung dan server website Anda. SSL wajib karena melindungi data sensitif (login, kartu kredit, formulir), meningkatkan ranking Google, dan menghindari peringatan 'Tidak Aman' di browser.",
  },
  {
    q: "Berapa lama proses penerbitan SSL?",
    a: "Tergantung jenis sertifikat. SSL Domain Validation (DV) terbit dalam kurang dari 10 menit. SSL Wildcard umumnya 1-4 jam karena verifikasi domain. SSL Extended Validation (EV) memerlukan verifikasi dokumen perusahaan, biasanya 1-3 hari kerja.",
  },
  {
    q: "Apakah SSL bisa untuk subdomain?",
    a: "SSL standar hanya melindungi satu domain utama (contoh: namabisnis.com dan www.namabisnis.com). Untuk melindungi unlimited subdomain (mail.namabisnis.com, blog.namabisnis.com, dll), gunakan paket SSL Wildcard.",
  },
  {
    q: "Apakah ada garansi keamanan?",
    a: "Ya. Setiap sertifikat dilindungi garansi dari penerbit: $10.000 untuk DV, $100.000 untuk Wildcard, dan $1.000.000 untuk EV. Garansi berlaku jika terjadi kebocoran data akibat kerentanan SSL penerbit.",
  },
  {
    q: "Bagaimana cara pemasangan SSL?",
    a: "Untuk hosting JuraganWebsite, SSL Let's Encrypt gratis terpasang otomatis. Untuk SSL berbayar, tim kami akan membantu instalasi gratis via tiket. Anda juga dapat memasang sendiri melalui cPanel dengan panduan kami.",
  },
];

export default function SslPage() {
  return (
    <MarketingLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-mesh py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 top-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl animate-float-slow" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-float" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <ShieldCheck className="size-3.5" /> SSL Certificate
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                SSL Certificate untuk{" "}
                <span className="gradient-text">Keamanan Website</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
                Lindungi data pengunjung dengan enkripsi 256-bit, tingkatkan
                ranking SEO, dan tampilkan gembok hijau di browser. Penerbitan
                cepat, auto-renew, dan garansi hingga $1 juta.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="#pricing">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90 sm:w-auto"
                  >
                    Lihat Paket SSL <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="#compare">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Bandingkan SSL
                  </Button>
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="size-3.5 text-primary" /> 256-bit encryption
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" /> Terbit &lt; 10 menit
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Award className="size-3.5 text-primary" /> Garansi $1jt
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="size-3.5 text-primary" /> Auto-renew
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <PricingTable
        category="ssl"
        title="Pilih Paket SSL Certificate"
        subtitle="Harga tahunan. Tersedia DV, Wildcard, dan EV dengan garansi hingga $1 juta."
      />

      {/* FEATURES */}
      <section
        id="features"
        className="relative bg-muted/30 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Keunggulan SSL
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Keamanan Berstandar Industri
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Enkripsi kelas bank dan militer untuk website bisnis Anda.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05} className="h-full">
                <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-brand-gradient group-hover:text-primary-foreground">
                      <f.icon className="size-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section id="compare" className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Perbandingan
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Bandingkan Jenis SSL
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Pilih SSL yang sesuai kebutuhan: dari blog pribadi hingga
              enterprise.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <Card className="overflow-hidden border-primary/20">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="h-12 px-4 text-sm font-semibold">
                        Fitur
                      </TableHead>
                      <TableHead className="h-12 px-4 text-center text-sm font-semibold">
                        SSL Domain (DV)
                      </TableHead>
                      <TableHead className="h-12 px-4 text-center text-sm font-semibold">
                        SSL Wildcard
                      </TableHead>
                      <TableHead className="h-12 px-4 text-center text-sm font-semibold">
                        SSL EV
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {COMPARE.map((row) => (
                      <TableRow key={row.feature}>
                        <TableCell className="px-4 py-3 text-sm font-medium text-foreground">
                          {row.feature}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-muted-foreground">
                          {row.dv}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-muted-foreground">
                          {row.wildcard}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center text-sm text-muted-foreground">
                          {row.ev}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell className="px-4 py-4 text-sm font-bold text-foreground">
                        Cocok untuk
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center text-xs text-muted-foreground">
                        Blog, portofolio, landing page
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center text-xs text-muted-foreground">
                        Multi-subdomain, agency
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center text-xs text-muted-foreground">
                        E-commerce, finance, enterprise
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.15} className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" /> Semua sertifikat:
              256-bit encryption
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-primary" /> Browser trust global
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" /> Auto-renew aktif
            </span>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              FAQ
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Pertanyaan yang Sering Diajukan
            </h2>
          </Reveal>
          <div className="mt-10">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center shadow-xl sm:p-12">
              <div className="pointer-events-none absolute inset-0 bg-mesh opacity-20" />
              <div className="relative">
                <h2 className="text-balance text-2xl font-extrabold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
                  Amankan website Anda dengan SSL hari ini.
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-primary-foreground/80 sm:text-base">
                  Dari Rp 25.000/tahun. Penerbitan cepat, garansi hingga $1
                  juta, dan auto-renew tanpa repot.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a href="#pricing">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full bg-background text-foreground shadow-md hover:bg-background/90 sm:w-auto"
                    >
                      <ShieldCheck className="size-4" /> Pilih SSL
                    </Button>
                  </a>
                  <Link href="/hosting">
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                    >
                      Lihat Hosting <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  );
}
