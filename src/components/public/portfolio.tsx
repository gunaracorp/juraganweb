"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, ArrowUpRight, ImageOff } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/public/reveal";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { onImgError } from "@/lib/img-fallback";

interface ApiPortfolio {
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
}

// Cover image per slug fallback (Unsplash curated business/tech shots)
const COVER_BY_SLUG: Record<string, string> = {
  kopimaju:
    "https://images.unsplash.com/photo-1559525839-d9acfd79b9b4?auto=format&fit=crop&w=900&q=70",
  bumiproperty:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=70",
  sehatapp:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=70",
  modisabatik:
    "https://images.unsplash.com/photo-1606293459339-aa5fc622e3b9?auto=format&fit=crop&w=900&q=70",
  edukasiraya:
    "https://images.unsplash.com/photo-1503676263529-4b2c3a8e57d8?auto=format&fit=crop&w=900&q=70",
  nusantaratravel:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=70",
};

function PlaceholderImage({ alt }: { alt: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground"
      aria-hidden
    >
      <ImageOff className="size-8" />
      <span className="sr-only">{alt}</span>
    </div>
  );
}

export function Portfolio() {
  const { t, locale } = useTranslation();
  const [category, setCategory] = useState<string>("all");

  const { data, isLoading } = useQuery<ApiPortfolio[]>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const res = await apiFetch("/portfolio");
      const json = await res.json();
      return (json?.items ?? []) as ApiPortfolio[];
    },
    staleTime: 60_000,
  });

  const items = useMemo(() => {
    const fallback = t.portfolio.items.map((it) => ({
      id: `fallback-${it.slug}`,
      slug: it.slug,
      titleId: it.title,
      titleEn: it.title,
      descId: it.desc,
      descEn: it.desc,
      category: it.category,
      client: it.client,
      url: null,
      image: COVER_BY_SLUG[it.slug] ?? null,
      year: it.year,
      featured: false,
    })) as ApiPortfolio[];

    if (!data || data.length === 0) return fallback;
    // Ensure every item has an image — fall back to slug mapping
    return data.map((p) => ({
      ...p,
      image: p.image || COVER_BY_SLUG[p.slug] || null,
    }));
  }, [data, t.portfolio.items]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.category));
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    if (category === "all") return items;
    return items.filter((i) => i.category === category);
  }, [items, category]);

  return (
    <section id="portfolio" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {t.portfolio.tag}
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.portfolio.title}
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            {t.portfolio.subtitle}
          </p>
        </Reveal>

        {/* Category filter */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <FilterButton
            active={category === "all"}
            onClick={() => setCategory("all")}
          >
            {t.portfolio.all}
          </FilterButton>
          {categories.map((cat) => (
            <FilterButton
              key={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </FilterButton>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => {
                const title = locale === "id" ? item.titleId : item.titleEn;
                const desc = locale === "id" ? item.descId : item.descEn;
                return (
                  <motion.article
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={title}
                          loading="lazy"
                          onError={onImgError(item.client || title)}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <PlaceholderImage alt={title} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />

                      {/* Category badge */}
                      <Badge className="absolute left-3 top-3 border-0 bg-background/85 text-foreground backdrop-blur-md">
                        {item.category}
                      </Badge>

                      {/* Year badge */}
                      <span className="absolute right-3 top-3 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-bold text-primary-foreground backdrop-blur-md">
                        {item.year}
                      </span>

                      {/* Hover overlay content */}
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="translate-y-2 text-sm text-white/90 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          {desc}
                        </p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex translate-y-2 items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-white/25 group-hover:translate-y-0 group-hover:opacity-100"
                          >
                            <ExternalLink className="size-3" />
                            {t.portfolio.visitSite}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div>
                        <h3 className="text-base font-bold text-foreground">
                          {title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t.portfolio.client}:{" "}
                          <span className="font-medium text-foreground/80">
                            {item.client}
                          </span>
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-primary"
                        aria-label={t.portfolio.viewProject}
                        onClick={() =>
                          item.url
                            ? window.open(item.url, "_blank", "noopener")
                            : undefined
                        }
                      >
                        <ArrowUpRight className="size-4" />
                      </Button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function FilterButton({
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
