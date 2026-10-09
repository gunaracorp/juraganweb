"use client";

import Link from "next/link";
import {
  TerminalSquare,
  HardDrive,
  Camera,
  Boxes,
  Network,
  Rocket,
  Code2,
  Store,
  Gamepad2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Server,
  Clock,
  Cpu,
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
    icon: TerminalSquare,
    title: "Full Root Access",
    desc: "Akses root penuh via SSH. Install software apa pun, konfigurasi server sesuai kebutuhan Anda.",
  },
  {
    icon: HardDrive,
    title: "NVMe SSD Storage",
    desc: "Penyimpanan NVMe ultra cepat dengan throughput tinggi untuk I/O intensif dan loading instan.",
  },
  {
    icon: Camera,
    title: "Snapshot Gratis",
    desc: "Cadangkan VPS kapan saja dengan snapshot gratis. Restore hanya dalam hitungan menit.",
  },
  {
    icon: Boxes,
    title: "Multiple OS",
    desc: "Pilih Ubuntu, Debian, AlmaLinux, Rocky Linux, atau FreeBSD. Ganti OS kapan saja via panel.",
  },
  {
    icon: Network,
    title: "1 IPv4 Dedicated",
    desc: "Alamat IPv4 dedicated untuk setiap VPS, cocok untuk hosting aplikasi, VPN, atau game server.",
  },
  {
    icon: Rocket,
    title: "Instant Deploy",
    desc: "VPS aktif otomatis dalam < 60 detik setelah pembayaran. Tanpa tunggu manual, tanpa verifikasi.",
  },
];

const USE_CASES = [
  {
    icon: Code2,
    title: "Developer & Staging",
    desc: "Bangun, uji, dan deploy aplikasi dengan stack apa pun: Node.js, Docker, Python, Go, atau Rust.",
    tags: ["Docker", "CI/CD", "Staging"],
  },
  {
    icon: Store,
    title: "Production Web App",
    desc: "Host aplikasi produksi dengan performa tinggi dan kontrol penuh untuk traffic besar.",
    tags: ["Nginx", "Database", "Redis"],
  },
  {
    icon: Gamepad2,
    title: "Game Server",
    desc: "Jalankan server Minecraft, CS:GO, atau game multiplayer dengan latensi rendah.",
    tags: ["Minecraft", "CS:GO", "Low Latency"],
  },
  {
    icon: ShieldCheck,
    title: "VPN & Proxy",
    desc: "Pasang WireGuard, OpenVPN, atau proxy pribadi untuk koneksi aman dan anonim.",
    tags: ["WireGuard", "OpenVPN", "Private"],
  },
];

const FAQS = [
  {
    q: "Apa beda VPS KVM dengan shared hosting?",
    a: "VPS KVM memberikan sumber daya dedicated (CPU, RAM, storage) yang tidak dibagi dengan pengguna lain, plus akses root penuh untuk konfigurasi bebas. Shared hosting berbagi sumber daya dan lebih cocok untuk website sederhana tanpa custom konfigurasi.",
  },
  {
    q: "Berapa lama VPS aktif setelah bayar?",
    a: "VPS Anda aktif otomatis dalam waktu kurang dari 60 detik setelah pembayaran berhasil dikonfirmasi. Detail login SSH dan panel akan dikirim ke email Anda.",
  },
  {
    q: "Apakah saya bisa ganti sistem operasi?",
    a: "Tentu. Melalui panel kontrol VPS, Anda dapat reinstall OS kapan saja dengan pilihan Ubuntu, Debian, AlmaLinux, Rocky Linux, atau FreeBSD. Proses hanya butuh beberapa menit.",
  },
  {
    q: "Apakah bandwidth dihitung per visitor?",
    a: "Tidak. Bandwidth VPS kami adalah kuota bulanan (contoh: 1 TB/bulan). Selama total trafik tidak melebihi kuota, Anda tidak dikenakan biaya tambahan.",
  },
];

export default function VpsPage() {
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
                <Cpu className="size-3.5" /> VPS KVM Berkualitas
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                VPS dengan{" "}
                <span className="gradient-text">NVMe & Root Access</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
                Server virtual KVM dengan NVMe SSD ultra cepat, dedicated IPv4,
                dan akses root penuh. Deploy instan untuk developer, production,
                game server, hingga VPN pribadi.
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
                    Lihat Paket VPS <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="#use-cases">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Use Case VPS
                  </Button>
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" /> Aktif &lt; 60
                  detik
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <TerminalSquare className="size-3.5 text-primary" /> Full
                  root SSH
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <HardDrive className="size-3.5 text-primary" /> NVMe SSD
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Network className="size-3.5 text-primary" /> 1 IPv4 dedicated
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <PricingTable
        category="vps"
        title="Pilih Paket VPS KVM"
        subtitle="Sumber daya dedicated dengan teknologi KVM. Bayar bulanan atau hemat hingga 11% dengan paket tahunan."
      />

      {/* FEATURES */}
      <section
        id="features"
        className="relative bg-muted/30 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Keunggulan VPS
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Performa Dedicated, Kontrol Penuh
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Sumber daya tidak dibagi. Konfigurasi bebas. Skalabilitas tanpa
              batas.
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

      {/* USE CASES */}
      <section id="use-cases" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Use Case
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Cocok untuk Berbagai Kebutuhan
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Dari eksperimen developer hingga workload produksi skala besar.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {USE_CASES.map((u, i) => (
              <Reveal key={u.title} delay={i * 0.06} className="h-full">
                <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                  <CardContent className="flex h-full flex-col p-6 sm:flex-row sm:items-start sm:gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-brand-gradient group-hover:text-primary-foreground">
                      <u.icon className="size-6" />
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <h3 className="text-lg font-bold text-foreground">
                        {u.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {u.desc}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {u.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
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
                  Siap deploy server pertama Anda?
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-primary-foreground/80 sm:text-base">
                  Aktif otomatis dalam 60 detik. Tanpa kontrak, tanpa biaya
                  setup.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a href="#pricing">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full bg-background text-foreground shadow-md hover:bg-background/90 sm:w-auto"
                    >
                      <Rocket className="size-4" /> Mulai Sekarang
                    </Button>
                  </a>
                  <Link href="/cloud">
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                    >
                      Lihat Cloud Hosting <ArrowRight className="size-4" />
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
