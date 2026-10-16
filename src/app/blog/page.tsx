"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowRight,
  Search,
  Eye,
  Clock,
  User,
  MessageSquare,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal, formatRupiah } from "@/components/site/ui-helpers";
import { apiFetch } from "@/lib/api-client";
import { onImgError } from "@/lib/img-fallback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  excerptId: string;
  excerptEn: string;
  contentId: string;
  contentEn: string;
  category: string;
  tags: string;
  coverImage: string | null;
  author: string;
  featured: boolean;
  published: boolean;
  views: number;
  createdAt: string;
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "dd MMM yyyy", { locale: idLocale });
  } catch {
    return dateStr;
  }
}

export default function BlogListPage() {
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<Post[]>({
    queryKey: ["posts", "published"],
    queryFn: async () => {
      const res = await apiFetch("/posts?published=true");
      const json = await res.json();
      return (json?.posts ?? []) as Post[];
    },
    staleTime: 60_000,
  });

  const featuredPost = useMemo(
    () => data?.find((p) => p.featured) ?? null,
    [data],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.titleId.toLowerCase().includes(q) ||
        p.excerptId.toLowerCase().includes(q) ||
        p.titleEn.toLowerCase().includes(q)
      );
    });
  }, [data, category, search]);

  const restPosts = useMemo(() => {
    if (!featuredPost) return filtered;
    return filtered.filter((p) => p.id !== featuredPost.id);
  }, [filtered, featuredPost]);

  const showFeatured = featuredPost && category === "all" && !search.trim();

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
              Blog &amp; Insight
            </span>
            <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Blog &amp; Artikel <span className="gradient-text">Digital</span>
            </h1>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Tips, tutorial, dan tren terbaru seputar website, hosting, digital
              marketing, dan bisnis online untuk membantu Anda tumbuh.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured banner */}
      {isLoading ? null : showFeatured && featuredPost ? (
        <section className="relative -mt-8 pb-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group relative grid cursor-pointer overflow-hidden rounded-3xl border border-border bg-card shadow-lg transition-all hover:shadow-2xl lg:grid-cols-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                  {featuredPost.coverImage ? (
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.titleId}
                      onError={onImgError(featuredPost.titleId)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-gold/30">
                      <span className="text-5xl font-extrabold text-primary-foreground/90">
                        JW
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:bg-gradient-to-r" />
                  <Badge className="absolute left-4 top-4 gap-1.5 border-0 bg-primary text-primary-foreground">
                    <Sparkles className="size-3" />
                    Pilihan Editor
                  </Badge>
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <Badge className="w-fit border-0 bg-primary/10 text-primary">
                    {featuredPost.category}
                  </Badge>
                  <h2 className="mt-3 text-balance text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl">
                    {featuredPost.titleId}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-pretty text-sm text-muted-foreground sm:text-base">
                    {featuredPost.excerptId}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="size-3.5 text-primary" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" />
                      {estimateReadTime(featuredPost.contentId)} menit baca
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="size-3.5 text-primary" />
                      {featuredPost.views} dilihat
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="size-3.5 text-primary" />
                      {formatDate(featuredPost.createdAt)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    className="mt-6 w-fit bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
                  >
                    Baca selengkapnya
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Filters + Search */}
      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
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
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari artikel..."
                  className="pl-9"
                  aria-label="Cari artikel"
                />
              </div>
            </div>
          </Reveal>

          {/* Grid */}
          {isLoading ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
              ))}
            </div>
          ) : restPosts.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Tidak ada artikel yang ditemukan. Coba ubah filter atau kata
                kunci pencarian.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restPosts.map((post, i) => (
                <Reveal key={post.id} delay={i * 0.05}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <NewsletterBox />
        </div>
      </section>

      {/* Hidden helper to keep formatRupiah import for parity */}
      <span className="sr-only">{formatRupiah(0)}</span>
    </MarketingLayout>
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

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.titleId}
            loading="lazy"
            onError={onImgError(post.titleId)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-gold/30">
            <span className="text-4xl font-extrabold text-primary-foreground/90">
              {(post.titleId || "JW").slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <Badge className="absolute left-3 top-3 border-0 bg-background/85 text-foreground backdrop-blur-md">
          {post.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-primary">
          {post.titleId}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {post.excerptId}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="size-3.5 text-primary" />
            <span className="line-clamp-1">{post.author}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="size-3.5 text-primary" />
            {post.views}
          </span>
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Baca selengkapnya
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const subscribe = useMutation({
    mutationFn: async (mail: string) => {
      const res = await apiFetch("/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Terima kasih sudah berlangganan newsletter!");
      setEmail("");
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    },
    onError: () => toast.error("Gagal berlangganan. Coba lagi."),
  });

  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-mesh p-8 shadow-md sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative grid items-center gap-6 lg:grid-cols-2">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="size-6" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
              Berlangganan Newsletter
            </h3>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Dapatkan tips, tutorial, dan penawaran eksklusif langsung di email
              Anda. Gratis, tanpa spam.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              subscribe.mutate(email);
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@anda.com"
              required
              className="bg-background"
              aria-label="Email newsletter"
            />
            <Button
              type="submit"
              disabled={subscribe.isPending || done}
              className="shrink-0 bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
            >
              {done ? (
                <>
                  <Check className="size-4" /> Berhasil
                </>
              ) : subscribe.isPending ? (
                "Mengirim..."
              ) : (
                "Daftar Gratis"
              )}
            </Button>
          </form>
        </div>
      </div>
    </Reveal>
  );
}
