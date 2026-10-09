"use client";

import Link from "next/link";
import {
  Sparkles, Wand2, Rocket, ArrowRight, Check, PenLine, Image as ImageIcon,
  Search, Layers, Globe, Code2, Bot, Brain, FileText, Zap, Star,
} from "lucide-react";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";

const STEPS = [
  {
    icon: PenLine,
    title: "1. Deskripsikan Bisnis Anda",
    desc: "Tuliskan deskripsi singkat tentang bisnis Anda — nama, jenis usaha, target pasar. AI kami akan memahami kebutuhan Anda.",
  },
  {
    icon: Bot,
    title: "2. AI Generate Website",
    desc: "Dalam hitungan menit, AI akan membuat struktur halaman, copywriting, gambar, dan layout yang siap pakai.",
  },
  {
    icon: Rocket,
    title: "3. Edit & Publish",
    desc: "Sesuaikan hasil generate dengan editor drag & drop. Klik Publish dan website langsung online.",
  },
];

const FEATURES = [
  {
    icon: PenLine,
    title: "AI Copywriting",
    desc: "AI menulis headline, paragraf, dan call-to-action yang menarik dalam bahasa Indonesia yang natural.",
  },
  {
    icon: ImageIcon,
    title: "AI Image Suggest",
    desc: "Saran gambar & ilustrasi yang relevan dengan bisnis Anda, langsung terintegrasi ke halaman.",
  },
  {
    icon: Search,
    title: "SEO Auto-Optimize",
    desc: "Meta tag, struktur heading, dan keyword otomatis dioptimalkan untuk mesin pencari.",
  },
  {
    icon: Layers,
    title: "Multi-Page Generate",
    desc: "AI membuat struktur website lengkap: beranda, tentang, layanan, kontak, dan blog — sekaligus.",
  },
  {
    icon: Globe,
    title: "Bahasa Indonesia",
    desc: "Dioptimalkan untuk konteks bisnis Indonesia — bahasa, budaya, dan lokalitas.",
  },
  {
    icon: Code2,
    title: "Export Code",
    desc: "Ekspor kode HTML/CSS bersih untuk hosting mandiri. Tidak terkunci di platform kami.",
  },
];

const PROMPTS = [
  {
    title: "Toko Kopi",
    prompt: "Buatkan website untuk kedai kopi modern bernama 'Kopi Senja' di Bandung. Sajikan menu kopi spesial, latte art, dan paket sarapan. Tone hangat & estetik.",
    tag: "Kuliner",
  },
  {
    title: "Jasa Renovasi",
    prompt: "Website company profile untuk kontraktor renovasi rumah 'Bangun Mandiri'. Tampilkan portofolio, layanan, dan testimoni klien. Tone profesional & terpercaya.",
    tag: "Jasa",
  },
  {
    title: "Toko Fashion",
    prompt: "Buat toko online fashion hijab 'Hijab Modis'. Tampilkan katalog produk, keranjang belanja, dan metode pembayaran. Tone feminin & modern.",
    tag: "E-commerce",
  },
  {
    title: "Kursus Online",
    prompt: "Landing page untuk kursus digital marketing 'Akademi Digital'. Tampilkan modul, harga, dan instruktur. Tone energik & inspiratif.",
    tag: "Pendidikan",
  },
];

const FAQS = [
  {
    q: "Apakah AI Builder benar-benar membuat website lengkap?",
    a: "Ya. AI Builder kami akan membuat struktur multi-page (beranda, tentang, layanan, kontak), menulis copywriting, memilih gambar relevan, dan menyusun layout. Anda tinggal meninjau dan menyesuaikan jika diperlukan.",
  },
  {
    q: "Berapa lama proses generate website dengan AI?",
    a: "Rata-rata 2-5 menit untuk membuat struktur website lengkap. Anda kemudian bebas mengedit dan menyesuaikan setiap detail menggunakan editor drag & drop kami.",
  },
  {
    q: "Apakah bahasa Indonesianya natural?",
    a: "Ya. AI kami dioptimalkan untuk bahasa Indonesia formal dan semi-formal yang natural, dengan pemahaman konteks bisnis lokal. Anda juga bisa request tone tertentu (profesional, santai, formal, kreatif).",
  },
  {
    q: "Apakah saya tetap bisa edit hasil AI?",
    a: "Tentu saja. Hasil generate AI sepenuhnya dapat diedit menggunakan drag & drop editor kami. Anda bisa mengganti teks, gambar, warna, layout, menambah/menghapus bagian — semua bebas.",
  },
  {
    q: "Apakah gambar yang dihasilkan bebas royalti?",
    a: "Ya. Gambar yang disarankan AI berasal dari library bebas royalti (Unsplash, Pexels) atau dihasilkan oleh AI image generator. Anda bebas menggunakannya untuk keperluan komersial.",
  },
  {
    q: "Berapa biaya AI Builder?",
    a: "AI Builder tersedia gratis untuk semua pengguna JuraganWebsite. Anda bisa membuat hingga 3 website AI per bulan secara gratis. Untuk penggunaan lebih intensif, tersedia paket premium dengan harga terjangkau.",
  },
];

export default function AiBuilderPage() {
  return (
    <MarketingLayout>
      <Hero />
      <Steps />
      <Features />
      <PromptShowcase />
      <CtaBand />
      <Faq />
      <FinalCta />
    </MarketingLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
      <div className="pointer-events-none absolute -left-20 top-20 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-20 bottom-10 -z-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl animate-float-slow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="text-center lg:text-left">
            <Badge className="mb-6 border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="mr-1 size-3" /> AI Website Builder
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Bangun Website dengan <span className="gradient-text">AI dalam Menit</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg lg:mx-0">
              Cukup deskripsikan bisnis Anda, biarkan AI membuat website profesional lengkap dengan
              copywriting, gambar, dan struktur halaman. Tanpa coding, tanpa ribet.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="/register">
                <Button size="lg" className="bg-brand-gradient text-primary-foreground shadow-lg">
                  <Wand2 className="size-4" /> Coba AI Builder Gratis
                </Button>
              </Link>
              <Link href="#cara-kerja">
                <Button size="lg" variant="outline">
                  <Brain className="size-4" /> Lihat Cara Kerja
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-2"><Check className="size-4 text-primary" /> Gratis 3 web/bulan</div>
              <div className="flex items-center gap-2"><Check className="size-4 text-primary" /> Bahasa Indonesia</div>
              <div className="flex items-center gap-2"><Check className="size-4 text-primary" /> Multi-page</div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative mx-auto max-w-md">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                  <Brain className="size-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">AI Builder Prompt</span>
                </div>
                <div className="space-y-3 p-5">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <div className="text-xs font-medium text-muted-foreground">Prompt Anda:</div>
                    <div className="mt-1 text-sm text-foreground">
                      &quot;Buatkan website kedai kopi modern di Bandung...&quot;
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex size-2 animate-pulse rounded-full bg-primary" />
                    AI sedang men-generate website...
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: FileText, label: "Menulis copywriting", grad: "from-violet-500 to-purple-500" },
                      { icon: ImageIcon, label: "Memilih gambar", grad: "from-rose-500 to-orange-400" },
                      { icon: Layers, label: "Menyusun 5 halaman", grad: "from-amber-500 to-rose-500" },
                      { icon: Search, label: "Optimasi SEO", grad: "from-emerald-500 to-teal-500" },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                        <span className={`flex size-6 items-center justify-center rounded bg-gradient-to-br ${step.grad} text-white`}>
                          <step.icon className="size-3.5" />
                        </span>
                        <span className="text-xs font-medium text-foreground">{step.label}</span>
                        <Check className="ml-auto size-3.5 text-emerald-500" />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-brand-gradient p-3 text-center text-primary-foreground">
                    <Rocket className="mx-auto size-5" />
                    <div className="mt-1 text-xs font-bold">Website siap publish!</div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-4 -top-4 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground shadow-lg">
                <Sparkles className="size-3" /> AI Powered
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section id="cara-kerja" className="border-y border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">Cara Kerja</Badge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Dari Deskripsi Jadi Website <span className="gradient-text">dalam 3 Langkah</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tidak perlu coding. Tidak perlu desain. Cukup deskripsikan, sisanya biarkan AI yang kerjakan.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <Card className="group relative h-full overflow-hidden border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-md transition-transform group-hover:scale-110">
                    <s.icon className="size-7" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-primary/40 sm:block" />
                )}
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 border-gold/20 bg-gold/10 text-gold-foreground">Fitur AI</Badge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Kekuatan AI yang <span className="gradient-text">Memahami Bisnis Anda</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Lebih dari sekadar template. AI kami belajar dari jutaan website profesional untuk menghasilkan konten terbaik.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={Math.min(i * 0.08, 0.4)}>
              <Card className="h-full border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromptShowcase() {
  return (
    <section className="border-t border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">Contoh Prompt</Badge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Inspirasi Prompt untuk <span className="gradient-text">Memulai</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Mulai dari contoh berikut atau tulis prompt sendiri. Semakin detail deskripsi, semakin akurat hasil AI.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {PROMPTS.map((p, i) => (
            <Reveal key={p.title} delay={Math.min(i * 0.08, 0.3)}>
              <Card className="group h-full border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground shadow">
                        <PenLine className="size-4" />
                      </span>
                      <h3 className="text-base font-bold text-foreground">{p.title}</h3>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary">{p.tag}</Badge>
                  </div>
                  <p className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-sm italic text-muted-foreground">
                    &quot;{p.prompt}&quot;
                  </p>
                  <Link
                    href="/register"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Coba prompt ini <ArrowRight className="size-3" />
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 shadow-xl sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-gold/20 blur-3xl" />
            <div className="grid items-center gap-6 sm:grid-cols-2">
              <div>
                <Badge className="mb-4 border-primary-foreground/30 bg-primary-foreground/15 text-primary-foreground">
                  <Zap className="mr-1 size-3" /> Gratis 3 Web/Bulan
                </Badge>
                <h2 className="text-balance text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
                  Coba AI Builder Sekarang
                </h2>
                <p className="mt-3 text-primary-foreground/90">
                  Tanpa kartu kredit. Tanpa instalasi. Cukup daftar, tulis deskripsi, dan dapatkan website profesional dalam menit.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/register">
                    <Button size="lg" variant="secondary" className="shadow-md">
                      <Wand2 className="size-4" /> Mulai Gratis Sekarang
                    </Button>
                  </Link>
                  <Link href="/website-builder">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    >
                      Builder Manual
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, label: "Generate dalam menit" },
                  { icon: Brain, label: "AI copywriting" },
                  { icon: Globe, label: "Bahasa Indonesia" },
                  { icon: Star, label: "Multi-page lengkap" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 rounded-xl bg-white/10 p-4 text-primary-foreground backdrop-blur-sm">
                    <Icon className="size-5 shrink-0" />
                    <span className="text-sm font-semibold">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-t border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">FAQ</Badge>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pertanyaan Seputar AI Builder
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-8">
          <Card className="border-border bg-background shadow-sm">
            <CardContent className="p-2 sm:p-4">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="px-3 text-left text-base font-semibold text-foreground">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-3 text-sm text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Siap Bangun Website dengan <span className="gradient-text">Kekuatan AI?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Bergabung dengan ribuan pemilik bisnis yang sudah membuat website profesional dengan AI Builder kami.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="bg-brand-gradient text-primary-foreground shadow-lg">
                <Wand2 className="size-4" /> Coba AI Builder Gratis
              </Button>
            </Link>
            <Link href="/website-builder">
              <Button size="lg" variant="outline">
                <Rocket className="size-4" /> Builder Manual
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
