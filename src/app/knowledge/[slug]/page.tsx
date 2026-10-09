"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ChevronRight, Loader2, ThumbsUp, ThumbsDown, BookOpen, Clock,
  Eye, AlertCircle, Home,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Article {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  contentId: string;
  contentEn: string;
  excerptId: string;
  excerptEn: string;
  category: string;
  tags: string;
  views: number;
  helpful: number;
  featured: boolean;
  published: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
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

interface Block {
  type: "h2" | "h3" | "p";
  text: string;
}

function renderMarkdown(content: string): Block[] {
  if (!content) return [];
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length > 0) {
      const joined = buffer.join(" ").trim();
      if (joined) blocks.push({ type: "p", text: joined });
      buffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("### ")) {
      flush();
      blocks.push({ type: "h3", text: line.slice(4).trim() });
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
    } else if (line === "" ) {
      flush();
    } else {
      buffer.push(line);
    }
  }
  flush();
  return blocks;
}

export default function ArticleDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const { data, isLoading, isError } = useQuery<{ ok: boolean; item: Article }>({
    queryKey: ["knowledge", slug],
    queryFn: async () => {
      const res = await apiFetch(`/knowledge?slug=${encodeURIComponent(slug || "")}`);
      if (!res.ok) throw new Error("Artikel tidak ditemukan");
      return res.json();
    },
    enabled: !!slug,
  });

  const article = data?.item;

  const { data: relatedData } = useQuery<{ ok: boolean; items: Article[] }>({
    queryKey: ["knowledge-related", article?.category, article?.id],
    queryFn: async () => {
      const res = await apiFetch(`/knowledge?category=${encodeURIComponent(article?.category || "")}`);
      if (!res.ok) throw new Error("Gagal memuat terkait");
      return res.json();
    },
    enabled: !!article,
  });

  const related = useMemo(() => {
    if (!relatedData?.items || !article) return [];
    return relatedData.items.filter((a) => a.id !== article.id).slice(0, 4);
  }, [relatedData, article]);

  const blocks = useMemo(() => (article ? renderMarkdown(article.contentId) : []), [article]);

  const onFeedback = (kind: "up" | "down") => {
    toast.success(kind === "up" ? "Terima kasih atas feedback!" : "Terima kasih, kami akan perbaiki.");
  };

  return (
    <MarketingLayout>
      <article className="py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Reveal>
            <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/" className="inline-flex items-center gap-1 hover:text-primary">
                <Home className="size-3.5" /> Beranda
              </Link>
              <ChevronRight className="size-3.5" />
              <Link href="/knowledge" className="hover:text-primary">Bantuan</Link>
              <ChevronRight className="size-3.5" />
              <span className="line-clamp-1 font-medium text-foreground">
                {article?.titleId || "Memuat..."}
              </span>
            </nav>
          </Reveal>

          {isLoading && (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
              <div>
                <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
                <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="mt-8 space-y-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="h-3 w-full animate-pulse rounded bg-muted" />
                  ))}
                </div>
              </div>
              <div>
                <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                <div className="mt-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isLoading && isError && (
            <Card className="mt-10 border-dashed border-border bg-card/50">
              <CardContent className="p-12 text-center">
                <AlertCircle className="mx-auto size-10 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-bold text-foreground">Artikel tidak ditemukan</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Artikel yang Anda cari mungkin sudah dihapus atau URL salah.
                </p>
                <Link href="/knowledge" className="mt-6 inline-block">
                  <Button>
                    <ArrowLeft className="size-4" /> Kembali ke Pusat Bantuan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && article && (
            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
              {/* Main content */}
              <div>
                <Reveal>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary/15 text-primary">
                      {CAT_LABELS[article.category] || article.category}
                    </Badge>
                    {article.featured && (
                      <Badge className="bg-gold/15 text-gold-foreground">Pilihan</Badge>
                    )}
                  </div>
                  <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    {article.titleId}
                  </h1>
                  {article.excerptId && (
                    <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
                      {article.excerptId}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="size-3.5 text-primary" /> {article.author || "Tim JuraganWebsite"}
                    </span>
                    {article.createdAt && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {new Date(article.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="size-3.5" /> {article.views || 0} kali dibaca
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={0.05}>
                  <div className="mt-8 max-w-none">
                    {blocks.length === 0 && (
                      <p className="text-sm italic text-muted-foreground">
                        Konten artikel belum tersedia.
                      </p>
                    )}
                    {blocks.map((b, i) => {
                      if (b.type === "h2") {
                        return (
                          <h2
                            key={i}
                            className="mt-10 border-b border-border pb-2 text-2xl font-extrabold tracking-tight text-foreground"
                          >
                            {b.text}
                          </h2>
                        );
                      }
                      if (b.type === "h3") {
                        return (
                          <h3
                            key={i}
                            className="mt-6 text-lg font-bold text-foreground"
                          >
                            {b.text}
                          </h3>
                        );
                      }
                      return (
                        <p key={i} className="mt-3 text-pretty text-[15px] leading-relaxed text-foreground/90">
                          {b.text}
                        </p>
                      );
                    })}
                  </div>
                </Reveal>

                {/* Feedback */}
                <Reveal delay={0.1}>
                  <div className="mt-12 rounded-2xl border border-border bg-card/60 p-6 text-center">
                    <p className="text-sm font-semibold text-foreground">Apakah artikel ini membantu?</p>
                    <div className="mt-4 flex justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFeedback("up")}
                        className="gap-2 hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-600"
                      >
                        <ThumbsUp className="size-4" /> Ya, membantu
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFeedback("down")}
                        className="gap-2 hover:border-rose-500/40 hover:bg-rose-500/5 hover:text-rose-600"
                      >
                        <ThumbsDown className="size-4" /> Tidak
                      </Button>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.15}>
                  <div className="mt-8 flex justify-start">
                    <Link href="/knowledge">
                      <Button variant="ghost">
                        <ArrowLeft className="size-4" /> Kembali ke Pusat Bantuan
                      </Button>
                    </Link>
                  </div>
                </Reveal>
              </div>

              {/* Sidebar */}
              <aside className="lg:sticky lg:top-20 lg:self-start">
                {related.length > 0 && (
                  <Card className="border-border bg-background shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-4 text-primary" />
                        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
                          Artikel Terkait
                        </h2>
                      </div>
                      <ul className="mt-4 space-y-3">
                        {related.map((r) => (
                          <li key={r.id}>
                            <Link
                              href={`/knowledge/${r.slug}`}
                              className="group flex flex-col gap-1 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/40"
                            >
                              <span className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                                {r.titleId}
                              </span>
                              {r.excerptId && (
                                <span className="line-clamp-2 text-xs text-muted-foreground">
                                  {r.excerptId}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card className="mt-5 border-border bg-brand-gradient shadow-sm">
                  <CardContent className="p-5 text-primary-foreground">
                    <h3 className="text-sm font-bold">Butuh Bantuan?</h3>
                    <p className="mt-2 text-xs text-primary-foreground/90">
                      Tim support kami siap membantu 24/7 melalui WhatsApp atau email.
                    </p>
                    <Link href="/contact" className="mt-3 block">
                      <Button size="sm" variant="secondary" className="w-full">Hubungi Support</Button>
                    </Link>
                  </CardContent>
                </Card>
              </aside>
            </div>
          )}
        </div>
      </article>
    </MarketingLayout>
  );
}
