"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Award,
  Wallet,
  Headphones,
  ShieldCheck,
  MapPin,
  Building2,
  Calendar,
  ArrowRight,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  Rocket,
} from "lucide-react";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const VALUES = [
  {
    icon: Award,
    title: "Profesional",
    text: "Tim ahli bersertifikat dengan pengalaman puluhan tahun di industri digital.",
  },
  {
    icon: Wallet,
    title: "Terjangkau",
    text: "Harga kompetitif dengan kualitas premium untuk semua skala bisnis, dari UMKM hingga korporasi.",
  },
  {
    icon: Headphones,
    title: "Dukungan 24/7",
    text: "Tim support siap membantu kapan pun Anda butuhkan, via WhatsApp, live chat, dan email.",
  },
  {
    icon: ShieldCheck,
    title: "Garansi",
    text: "Garansi layanan dan maintenance untuk ketenangan Anda, termasuk uptime 99.99%.",
  },
];

const STATS = [
  { value: "17+", label: "Tahun Beroperasi" },
  { value: "50rb+", label: "Klien Terlayani" },
  { value: "99.99%", label: "Uptime Server" },
  { value: "24/7", label: "Dukungan Teknis" },
];

const BRANCHES = [
  {
    city: "Jakarta",
    label: "Kantor Pusat",
    address:
      "Jl. Sudirman Kav. 52-53, Jakarta Selatan 12190, Indonesia",
    icon: Building2,
  },
  {
    city: "Tasikmalaya",
    label: "Kantor Cabang",
    address:
      "Perumahan Andalusia Garden Cluster Granada No.11, Mangkubumi, Kota Tasikmalaya, Jawa Barat",
    icon: MapPin,
  },
  {
    city: "Bandung",
    label: "Kantor Cabang",
    address:
      "Jln. Muararajeun Lama No.26, Kel. Cihaurgeulis, Cibeunying Kaler, Kota Bandung, Jawa Barat 40122",
    icon: MapPin,
  },
];

const TEAM = [
  { name: "Ahmad Fadli", role: "Founder & CEO", color: "from-primary to-gold" },
  { name: "Siti Rahmawati", role: "CTO", color: "from-gold to-primary" },
  { name: "Budi Santoso", role: "Head of Engineering", color: "from-primary to-purple-500" },
  { name: "Dewi Lestari", role: "Creative Director", color: "from-purple-500 to-gold" },
  { name: "Rizki Pratama", role: "Lead Developer", color: "from-gold to-purple-500" },
  { name: "Maya Sari", role: "Customer Success", color: "from-primary to-gold" },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-mesh py-16 sm:py-24">
        <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              Tentang Kami
            </span>
            <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Tentang <span className="gradient-text">JuraganWebsite</span>
            </h1>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Membangun jejak digital Indonesia sejak 2007. PT Digital Bisnis
              Manajemen (Digiman) hadir sebagai pelopor layanan website
              profesional yang dipercaya UMKM hingga korporasi.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Timeline card */}
            <Reveal>
              <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-mesh p-8 shadow-sm sm:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="inline-flex items-baseline gap-1"
                  >
                    <span className="bg-gradient-to-r from-primary to-gold bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl">
                      2007
                    </span>
                  </motion.div>
                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    Berdiri Sejak 17 Agustus 2007
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          PT Digital Bisnis Manajemen (Digiman)
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Parent Company
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                        <MapPin className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Jakarta, Indonesia
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Headquarters
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Calendar className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          17+ Tahun Pengalaman
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Trusted experience since 2007
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Story text */}
            <Reveal delay={0.1}>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  Cerita Kami
                </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  Dari Startup Kecil Menjadi Mitra Digital Ribuan Bisnis
                </h2>
                <div className="mt-5 space-y-4 text-pretty text-sm text-muted-foreground sm:text-base">
                  <p>
                    JuraganWebsite lahir pada tahun 2007 di Jakarta sebagai
                    respon atas kebutuhan UMKM Indonesia akan kehadiran online
                    yang profesional dan terjangkau. Berawal dari tim kecil
                    dengan visi besar, kami percaya bahwa setiap bisnis — besar
                    maupun kecil — berhak punya website berkualitas.
                  </p>
                  <p>
                    Di bawah payung <strong className="text-foreground">PT Digital Bisnis Manajemen (Digiman)</strong>,
                    kami berkembang menjadi penyedia layanan website terpadu:
                    pembuatan website, hosting, domain, aplikasi web, hingga
                    digital marketing. Lebih dari 50.000 klien telah mempercayakan
                    kebutuhan digitalnya kepada kami.
                  </p>
                  <p>
                    Kini, dengan tiga kantor cabang di Jakarta, Tasikmalaya, dan
                    Bandung, kami terus berkomitmen mengembangkan ekosistem
                    digital Indonesia dengan teknologi terkini, harga yang adil,
                    dan dukungan pelanggan yang sungguh-sungguh.
                  </p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    "Pelayanan tulus & transparan",
                    "Teknologi terkini & aman",
                    "Harga adil untuk semua skala",
                    "Dukungan teknis 24/7",
                  ].map((point) => (
                    <div
                      key={point}
                      className="flex items-start gap-2 text-sm text-foreground/90"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <Card className="group h-full border-primary/20 transition-shadow hover:shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <Target className="size-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-foreground sm:text-2xl">
                    Misi Kami
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    Memberdayakan setiap bisnis Indonesia untuk go-digital dengan
                    website berkualitas, harga terjangkau, dan dukungan teknis
                    24/7. Kami percaya transformasi digital dimulai dari satu
                    website yang dibuat dengan benar.
                  </p>
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={0.1}>
              <Card className="group h-full border-gold/30 transition-shadow hover:shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold transition-transform group-hover:scale-110">
                    <Eye className="size-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-foreground sm:text-2xl">
                    Visi Kami
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    Menjadi penyedia layanan website No.1 di Indonesia yang
                    dipercaya oleh UMKM hingga korporasi besar, serta ikut
                    mengakselerasi ekonomi digital nasional melalui produk dan
                    layanan yang inovatif.
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Nilai-Nilai <span className="gradient-text">Kami</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Empat pilar yang menjadi pegangan setiap layanan yang kami
              berikan.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => {
              const Icon = value.icon;
              return (
                <Reveal key={value.title} delay={i * 0.08}>
                  <Card className="group h-full border-border/80 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-gold/15 text-primary transition-all group-hover:from-primary group-hover:to-gold group-hover:text-primary-foreground">
                        <Icon className="size-6" />
                      </div>
                      <h4 className="mt-4 text-base font-bold text-foreground">
                        {value.title}
                      </h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {value.text}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-border bg-mesh">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.05}>
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <p className="bg-gradient-to-r from-primary to-gold bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Branch offices */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <MapPin className="size-3.5" />
              Kantor Kami
            </span>
            <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
              Tiga Kantor, Satu Komitmen
            </h2>
            <p className="mt-3 text-muted-foreground">
              Hadir di tiga kota besar Indonesia untuk melayani Anda lebih dekat.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {BRANCHES.map((branch, i) => {
              const Icon = branch.icon;
              return (
                <Reveal key={branch.city} delay={i * 0.08}>
                  <Card className="group h-full border-border/80 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                        <Icon className="size-6" />
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {branch.label}
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-foreground">
                        {branch.city}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {branch.address}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team preview */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Users className="size-3.5" />
              Tim Kami
            </span>
            <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
              Orang-Orang di Balik <span className="gradient-text">JuraganWebsite</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tim profesional yang berdedikasi menghadirkan solusi digital
              terbaik untuk Anda.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {TEAM.map((member, i) => (
              <Reveal key={member.name} delay={i * 0.05}>
                <div className="group flex flex-col items-center text-center">
                  <div className="relative">
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${member.color} text-2xl font-extrabold text-primary-foreground shadow-md transition-transform group-hover:scale-105`}
                      aria-hidden
                    >
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background ring-1 ring-border">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-foreground">
                    {member.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {member.role}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-mesh p-8 text-center shadow-md sm:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gold/20 blur-3xl" />
              <div className="relative">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Rocket className="size-6" />
                </div>
                <h2 className="text-balance text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                  Siap memulai perjalanan digital Anda?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                  Bergabung dengan ribuan bisnis yang telah mempercayakan
                  kebutuhan digitalnya kepada JuraganWebsite. Konsultasi gratis,
                  tanpa komitmen.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/contact">
                    <Button
                      type="button"
                      size="lg"
                      className="bg-brand-gradient text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95"
                    >
                      Hubungi Kami
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <Link href="/portfolio">
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="border-primary/30 text-foreground hover:bg-primary/10"
                    >
                      <Clock className="size-4" />
                      Lihat Portofolio
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
