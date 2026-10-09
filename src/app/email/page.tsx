"use client";

import Link from "next/link";
import {
  Mail,
  ShieldCheck,
  Calendar,
  BookUser,
  Server,
  Smartphone,
  ArrowRight,
  Sparkles,
  Globe,
  UserPlus,
  Inbox,
  Clock,
  CloudOff,
  Cloud,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { PricingTable } from "@/components/site/pricing-table";
import { Reveal } from "@/components/site/ui-helpers";

const FEATURES = [
  {
    icon: Mail,
    title: "Webmail Modern",
    desc: "Akses email dari browser dengan antarmuka modern, cepat, dan ringan. Mendukung filter dan label otomatis.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Spam & Anti-Virus",
    desc: "Filter spam canggih dengan akurasi tinggi dan scanning virus otomatis pada setiap email masuk dan keluar.",
  },
  {
    icon: Calendar,
    title: "Kalender Bersama",
    desc: "Kelola jadwal, atur meeting, dan share kalender dengan tim. Sinkron real-time antar akun dan device.",
  },
  {
    icon: BookUser,
    title: "Kontak & Address Book",
    desc: "Simpan kontak dengan detail lengkap, grup, dan share address book dengan kolega untuk kolaborasi tim.",
  },
  {
    icon: Server,
    title: "IMAP / POP3 / SMTP",
    desc: "Dukungan protokol standar untuk semua email client: Outlook, Thunderbird, Apple Mail, dan lainnya.",
  },
  {
    icon: Smartphone,
    title: "Mobile Sync",
    desc: "Sinkron email, kontak, dan kalender ke smartphone Anda via ActiveSync atau CardDAV/CalDAV.",
  },
];

const HOW_IT_WORKS = [
  {
    icon: Globe,
    title: "Daftarkan Domain",
    desc: "Miliki domain sendiri seperti namabisnis.com, atau gunakan domain yang sudah Anda miliki.",
  },
  {
    icon: UserPlus,
    title: "Buat Akun Email",
    desc: "Tambah akun email seperti nama@namabisnis.com untuk seluruh tim Anda melalui panel mudah.",
  },
  {
    icon: Inbox,
    title: "Mulai Berkirim Email",
    desc: "Akses melalui webmail atau aplikasi favorit (Outlook, Gmail app, Apple Mail) di semua perangkat.",
  },
];

const FAQS = [
  {
    q: "Apakah saya perlu punya domain dulu?",
    a: "Ya, email bisnis memerlukan domain aktif. Anda bisa mendaftar domain baru di JuraganWebsite atau menggunakan domain yang sudah Anda miliki dari provider lain. Kami akan membantu konfigurasi DNS-nya.",
  },
  {
    q: "Bisa pakai Outlook atau Thunderbird?",
    a: "Tentu. Layanan email kami mendukung protokol standar IMAP, POP3, dan SMTP. Panduan konfigurasi otomatis tersedia untuk Outlook, Thunderbird, Apple Mail, Windows Mail, dan aplikasi mobile.",
  },
  {
    q: "Berapa kapasitas mailbox per akun?",
    a: "Kapasitas bervariasi sesuai paket, mulai 10 GB hingga 30 GB per akun. Anda juga dapat upgrade kapasitas atau menambah akun kapan saja melalui Client Area.",
  },
  {
    q: "Apakah email saya aman dari spam dan virus?",
    a: "Ya. Semua email masuk dan keluar melalui filter anti-spam dan anti-virus berlapis. Tersedia juga DKIM, SPF, dan DMARC untuk autentikasi pengirim agar email Anda tidak terblokir atau masuk spam.",
  },
  {
    q: "Bisa sync ke HP Android atau iPhone?",
    a: "Ya. Email, kontak, dan kalender dapat disinkronkan ke smartphone melalui ActiveSync, IMAP, CardDAV, dan CalDAV. Pengaturan otomatis tersedia untuk sebagian besar perangkat.",
  },
];

export default function EmailPage() {
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
                <Mail className="size-3.5" /> Email Bisnis
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Email Profesional dengan{" "}
                <span className="gradient-text">Domain Sendiri</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
                Bangun kredibilitas bisnis dengan email @namabisnis.com.
                Webmail modern, anti-spam canggih, kalender bersama, dan sinkron
                ke semua perangkat.
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
                    Lihat Paket Email <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="#how">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Cara Kerja Email
                  </Button>
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5 text-primary" /> @domain sendiri
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" /> Anti-spam &
                  anti-virus
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" /> Kalender tim
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone className="size-3.5 text-primary" /> Mobile sync
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <PricingTable
        category="email"
        title="Pilih Paket Email Bisnis"
        subtitle="Email profesional dengan kapasitas besar. Bayar bulanan atau hemat hingga 10% paket tahunan."
      />

      {/* FEATURES */}
      <section
        id="features"
        className="relative bg-muted/30 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Keunggulan Email Bisnis
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Email Bisnis Lengkap & Aman
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Semua fitur kolaborasi tim dalam satu paket terjangkau.
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

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Cara Kerja Email Bisnis
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Mulai dalam 3 Langkah
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Dari domain hingga email aktif, hanya butuh beberapa menit.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08} className="relative">
                <Card className="relative h-full overflow-hidden border-primary/20">
                  <CardContent className="flex h-full flex-col items-center p-8 text-center">
                    <span className="absolute right-4 top-3 text-5xl font-extrabold text-primary/10">
                      {i + 1}
                    </span>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-lg">
                      <step.icon className="size-8" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-primary md:block">
                    <ArrowRight className="size-6" />
                  </div>
                )}
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" /> Aktif &lt; 5 menit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Cloud className="size-3.5 text-primary" /> Cloud-based
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CloudOff className="size-3.5 text-primary" /> Bekerja offline
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
                  Bangun kredibilitas bisnis dengan email profesional.
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-primary-foreground/80 sm:text-base">
                  Mulai dari Rp 19.900/bulan. Sudah termasuk domain gratis*
                  untuk paket tahunan.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a href="#pricing">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full bg-background text-foreground shadow-md hover:bg-background/90 sm:w-auto"
                    >
                      <Mail className="size-4" /> Pilih Paket Email
                    </Button>
                  </a>
                  <Link href="/domain">
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                    >
                      <Globe className="size-4" /> Cari Domain{" "}
                      <ArrowRight className="size-4" />
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
