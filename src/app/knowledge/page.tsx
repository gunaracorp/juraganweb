"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Search, LifeBuoy, BookOpen, ArrowRight, Mail, Check, Loader2,
  Star, ChevronRight, HelpCircle, Sparkles, Mailbox,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Article {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  excerptId: string;
  excerptEn: string;
  category: string;
  tags: string;
  views: number;
  helpful: number;
  featured: boolean;
  published: boolean;
}

const CAT_LABELS: Record<string, string> = {
  general: "Umum",
  hosting: "Hosting",
  domain: "Domain",
  vps: "VPS & Cloud",
  email: "Email Bisnis",
  ssl: "SSL & Keamanan",
  wordpress: "WordPress",
  billing: "Pembayaran",
  account: "Akun & Keamanan",
  migration: "Migrasi",
  tutorial: "Tutorial",
  faq: "FAQ",
};

export default function KnowledgePage() {
  return (
    <MarketingLayout>
      <Hero />
      <ArticlesSection />
      <NewsletterSection />
      <CtaBand />
    </MarketingLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
      <div className="pointer-events-none absolute -left-20 top-10 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-20 bottom-10 -z-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl animate-float-slow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge className="mb-6 border-primary/20 bg-primary/10 text-primary">
            <LifeBuoy className="mr-1 size-3" /> Pusat Bantuan
          </Badge>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            Pusat <span className="gradient-text">Bantuan & Tutorial</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Temukan jawaban atas pertanyaan Anda, pelajari tutorial lengkap, dan dapatkan panduan praktis
            untuk mengelola layanan JuraganWebsite Anda.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ArticlesSection() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  const { data, isLoading } = useQuery<{ ok: boolean; items: Article[] }>({
    queryKey: ["knowledge-list"],
    queryFn: async () => {
      const res = await apiFetch("/knowledge");
      if (!res.ok) throw new Error("Gagal memuat artikel");
      return res.json();
    },
  });

  const items = data?.items ?? [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => set.add(it.category || "general"));
    return Array.from(set);
  }, [items]);

  const featured = useMemo(
    () => items.filter((a) => a.featured),
    [items],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((a) => {
      if (activeCat !== "all" && a.category !== activeCat) return false;
      if (!q) return true;
      return (
        a.titleId.toLowerCase().includes(q) ||
        a.excerptId.toLowerCase().includes(q) ||
        a.titleEn.toLowerCase().includes(q)
      );
    });
  }, [items, search, activeCat]);

  const filteredFeatured = activeCat === "all" && !search ? featured : [];

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search */}
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari artikel atau tutorial..."
                className="h-12 pl-12 shadow-sm"
                aria-label="Cari artikel"
              />
            </div>
          </div>
        </Reveal>

        {/* Category chips */}
        <Reveal delay={0.05} className="mt-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCat("all")}
              className={
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors " +
                (activeCat === "all"
                  ? "border-primary bg-brand-gradient text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5")
              }
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCat(c)}
                className={
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors " +
                  (activeCat === c
                    ? "border-primary bg-brand-gradient text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5")
                }
              >
                {CAT_LABELS[c] || c}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Loading */}
        {isLoading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-6">
                  <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Featured */}
        {!isLoading && filteredFeatured.length > 0 && (
          <div className="mt-12">
            <Reveal>
              <div className="mb-5 flex items-center gap-2">
                <Star className="size-5 text-gold" />
                <h2 className="text-xl font-bold text-foreground">Artikel Pilihan</h2>
              </div>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredFeatured.slice(0, 2).map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i * 0.08, 0.3)}>
                  <FeaturedCard article={a} />
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* All articles */}
        {!isLoading && (
          <div className="mt-12">
            <Reveal>
              <div className="mb-5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">
                    {search || activeCat !== "all" ? "Hasil Pencarian" : "Semua Artikel"}
                  </h2>
                </div>
                <span className="text-sm text-muted-foreground">{filtered.length} artikel</span>
              </div>
            </Reveal>

            {filtered.length === 0 ? (
              <Card className="border-dashed border-border bg-card/50">
                <CardContent className="p-12 text-center">
                  <HelpCircle className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    Tidak ada artikel yang cocok dengan pencarian Anda.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearch("");
                      setActiveCat("all");
                    }}
                  >
                    Reset filter
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((a, i) => (
                  <Reveal key={a.id} delay={Math.min(i * 0.05, 0.4)}>
                    <ArticleCard article={a} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedCard({ article }: { article: Article }) {
  return (
    <Card className="group h-full overflow-hidden border-primary/30 bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex items-center gap-2">
          <Badge className="bg-gold/15 text-gold-foreground">
            <Sparkles className="mr-1 size-3" /> Pilihan
          </Badge>
          <Badge variant="outline" className="border-primary/30 text-primary">
            {CAT_LABELS[article.category] || article.category}
          </Badge>
        </div>
        <h3 className="mt-4 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
          {article.titleId}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {article.excerptId || "Baca artikel lengkap untuk mempelajari lebih lanjut."}
        </p>
        <Link
          href={`/knowledge/${article.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          Baca selengkapnya <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="group flex h-full flex-col border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="border-primary/30 text-primary">
            {CAT_LABELS[article.category] || article.category}
          </Badge>
          {article.featured && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gold-foreground">
              <Star className="size-3 fill-gold text-gold" /> Pilihan
            </span>
          )}
        </div>
        <h3 className="mt-3 line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-primary">
          {article.titleId}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {article.excerptId || "Baca artikel lengkap untuk mempelajari lebih lanjut."}
        </p>
        <Link
          href={`/knowledge/${article.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          Baca selengkapnya <ChevronRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");

  const subscribe = useMutation({
    mutationFn: async (e: string) => {
      const res = await apiFetch("/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      });
      if (!res.ok) throw new Error("Gagal berlangganan");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Berhasil berlangjangan! Cek email Anda untuk konfirmasi.");
      setEmail("");
    },
    onError: () => toast.error("Gagal berlangganan. Coba lagi nanti."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!v || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
      toast.error("Masukkan email yang valid");
      return;
    }
    subscribe.mutate(v);
  };

  return (
    <section className="border-t border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-background p-8 shadow-sm sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-gold/15 blur-3xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-2">
              <div>
                <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">
                  <Mailbox className="mr-1 size-3" /> Newsletter
                </Badge>
                <h2 className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Dapatkan Tips & Promo Terbaru
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Berlangganan newsletter kami untuk menerima tutorial hosting, tips bisnis online,
                  dan promo eksklusif langsung ke email Anda.
                </p>
              </div>
              <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@bisnisanda.com"
                    className="h-12 pl-10"
                    aria-label="Email Anda"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={subscribe.isPending}
                  className="h-12 bg-brand-gradient text-primary-foreground"
                >
                  {subscribe.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Mengirim...
                    </>
                  ) : (
                    <>
                      <Check className="size-4" /> Berlangganan
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center shadow-xl sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-gold/20 blur-3xl" />
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
              Tidak Menemukan Jawaban?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/90">
              Tim support kami siap membantu 24/7. Hubungi kami via WhatsApp, email, atau live chat.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="shadow-md">
                  <LifeBuoy className="size-4" /> Hubungi Support
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Lihat Harga <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
