"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Briefcase,
  Users,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { apiFetch } from "@/lib/api-client";
import { onImgError } from "@/lib/img-fallback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PortfolioItem {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  category: string;
  client: string;
  url: string | null;
  image: string | null;
  year: number;
  featured: boolean;
  status: string;
  createdAt: string;
}

export default function PortfolioPage() {
  const [category, setCategory] = useState<string>("all");

  const { data, isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const res = await apiFetch("/portfolio");
      const json = await res.json();
      return (json?.items ?? []) as PortfolioItem[];
    },
    staleTime: 60_000,
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((i) => set.add(i.category));
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (category === "all") return data;
    return data.filter((i) => i.category === category);
  }, [data, category]);

  const stats = useMemo(() => {
    const count = data?.length ?? 0;
    const clients = new Set(data?.map((i) => i.client)).size;
    const years = new Set(data?.map((i) => i.year)).size;
    return { count, clients, years };
  }, [data]);

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
              Portofolio
            </span>
            <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Portofolio <span className="gradient-text">Karya Kami</span>
            </h1>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Ratusan proyek website dan aplikasi berhasil kami selesaikan untuk
              klien dari berbagai industri di seluruh Indonesia.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <StatItem
              icon={Briefcase}
              value={`${stats.count}+`}
              label="Proyek Selesai"
            />
            <StatItem
              icon={Users}
              value={`${stats.clients}+`}
              label="Klien Puas"
            />
            <StatItem
              icon={CalendarDays}
              value={`${stats.years}+`}
              label="Tahun Pengalaman"
            />
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <FilterChip
                active={category === "all"}
                onClick={() => setCategory("all")}
              >
                Semua Kategori
              </FilterChip>
              {categories.map((cat) => (
                <FilterChip
                  key={cat}
                  active={category === cat}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </FilterChip>
              ))}
            </div>
          </Reveal>

          {/* Grid */}
          {isLoading ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Belum ada proyek pada kategori ini.
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((item) => (
                  <PortfolioCard key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
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
                <h2 className="text-balance text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                  Punya proyek website atau aplikasi?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                  Konsultasikan kebutuhan Anda dengan tim kami. Konsultasi
                  gratis, tanpa komitmen. Wujudkan ide digital Anda bersama
                  JuraganWebsite.
                </p>
                <Link href="/contact" className="mt-6 inline-block">
                  <Button
                    type="button"
                    size="lg"
                    className="bg-brand-gradient text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95"
                  >
                    Mulai proyekmu
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-4 py-8 sm:py-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <div className="text-left">
        <p className="text-2xl font-extrabold text-foreground sm:text-3xl">
          {value}
        </p>
        <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-brand-gradient text-primary-foreground shadow-md"
          : "border border-border bg-background text-foreground/80 hover:border-primary/40 hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.titleId}
            loading="lazy"
            onError={onImgError(item.client || item.titleId)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-gold/30">
            <span className="text-5xl font-extrabold text-primary-foreground/90">
              {(item.titleId || "JW").slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
        <Badge className="absolute left-3 top-3 border-0 bg-background/85 text-foreground backdrop-blur-md">
          {item.category}
        </Badge>
        <span className="absolute right-3 top-3 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-bold text-primary-foreground backdrop-blur-md">
          {item.year}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="translate-y-2 text-sm text-white/90 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {item.descId}
          </p>
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex translate-y-2 items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-white/25 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <ExternalLink className="size-3" />
              Kunjungi Website
            </a>
          ) : null}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-base font-bold text-foreground">
            {item.titleId}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Klien:{" "}
            <span className="font-medium text-foreground/80">
              {item.client}
            </span>
          </p>
        </div>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kunjungi website"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10"
          >
            <ArrowUpRight className="size-4" />
          </a>
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground">
            <ArrowUpRight className="size-4" />
          </span>
        )}
      </div>
    </motion.article>
  );
}
