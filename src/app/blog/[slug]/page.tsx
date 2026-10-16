"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  User,
  MessageSquare,
  Check,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { apiFetch } from "@/lib/api-client";
import { onImgError } from "@/lib/img-fallback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
    return format(new Date(dateStr), "dd MMMM yyyy", { locale: idLocale });
  } catch {
    return dateStr;
  }
}

/* ---------- markdown-ish renderer ----------
 * Rules:
 *  - split content by \n
 *  - `## ` → <h2>, `### ` → <h3>, `#### ` → <h4>
 *  - lines starting with `- ` or `* ` → grouped into <ul>
 *  - blank lines separate paragraphs
 *  - inline `code` rendered as <code>
 */
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderContent(content: string): React.ReactNode[] {
  const lines = content.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines
    if (!line || !line.trim()) {
      i++;
      continue;
    }

    // Heading
    if (line.startsWith("#### ")) {
      out.push(
        <h4 key={key++} className="mt-8 text-lg font-bold text-foreground">
          {renderInline(line.slice(5))}
        </h4>,
      );
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      out.push(
        <h3 key={key++} className="mt-8 text-xl font-bold text-foreground sm:text-2xl">
          {renderInline(line.slice(4))}
        </h3>,
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(
        <h2 key={key++} className="mt-10 text-2xl font-bold text-foreground sm:text-3xl">
          {renderInline(line.slice(3))}
        </h2>,
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      out.push(
        <h1 key={key++} className="mt-10 text-3xl font-bold text-foreground sm:text-4xl">
          {renderInline(line.slice(2))}
        </h1>,
      );
      i++;
      continue;
    }

    // Fenced code block ``` ... ```
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      out.push(
        <pre
          key={key++}
          className="mt-6 overflow-x-auto rounded-xl border border-border bg-muted/50 p-4 text-sm"
        >
          <code className="font-mono text-foreground/90">
            {codeLines.join("\n")}
          </code>
        </pre>,
      );
      continue;
    }

    // List items
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (
        i < lines.length &&
        /^\s*[-*]\s+/.test(lines[i])
      ) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      out.push(
        <ul
          key={key++}
          className="mt-4 list-disc space-y-2 pl-6 text-sm text-foreground/90 sm:text-base"
        >
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list items
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (
        i < lines.length &&
        /^\s*\d+\.\s+/.test(lines[i])
      ) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      out.push(
        <ol
          key={key++}
          className="mt-4 list-decimal space-y-2 pl-6 text-sm text-foreground/90 sm:text-base"
        >
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph: gather consecutive non-empty plain lines
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith("```")
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(
      <p
        key={key++}
        className="mt-4 text-sm leading-relaxed text-foreground/90 sm:text-base"
      >
        {renderInline(para.join(" "))}
      </p>,
    );
  }

  return out;
}

/* ---------- comment form schema ---------- */
const commentSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }),
  content: z.string().min(5, { message: "Komentar minimal 5 karakter" }),
});

type CommentValues = z.infer<typeof commentSchema>;

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = (params?.slug as string) ?? "";

  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ["post", slug],
    queryFn: async () => {
      const res = await apiFetch(`/posts?slug=${encodeURIComponent(slug)}`);
      const json = await res.json();
      return json?.post as Post;
    },
    enabled: !!slug,
  });

  const { data: allPosts } = useQuery<Post[]>({
    queryKey: ["posts", "published"],
    queryFn: async () => {
      const res = await apiFetch("/posts?published=true");
      const json = await res.json();
      return (json?.posts ?? []) as Post[];
    },
  });

  // Fire-and-forget view increment on slug change
  useEffect(() => {
    if (!slug) return;
    apiFetch("/posts/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {
      // ignore — fire-and-forget
    });
  }, [slug]);

  // Scroll to top on slug change
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [slug]);

  const relatedPosts = useMemo(() => {
    if (!allPosts || !post) return [];
    return allPosts
      .filter((p) => p.id !== post.id && p.category === post.category)
      .slice(0, 4);
  }, [allPosts, post]);

  if (isLoading) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-6 h-10 w-2/3" />
          <Skeleton className="mt-6 aspect-[16/9] w-full rounded-2xl" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-4/6" />
        </div>
      </MarketingLayout>
    );
  }

  if (!post) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageSquare className="size-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Artikel tidak ditemukan
          </h1>
          <p className="mt-3 text-muted-foreground">
            Maaf, artikel yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link href="/blog" className="mt-6 inline-block">
            <Button type="button" className="bg-brand-gradient text-primary-foreground">
              <ArrowLeft className="size-4" />
              Kembali ke Blog
            </Button>
          </Link>
        </div>
      </MarketingLayout>
    );
  }

  const content = post.contentId || post.contentEn || "";

  return (
    <MarketingLayout>
      <article className="relative py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Reveal>
            <Link href="/blog">
              <Button
                type="button"
                variant="ghost"
                className="text-foreground/80 hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Kembali ke Blog
              </Button>
            </Link>
          </Reveal>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
            {/* Main content */}
            <div className="min-w-0">
              {/* Header */}
              <Reveal>
                <Badge className="border-0 bg-primary/10 text-primary">
                  {post.category}
                </Badge>
                <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {post.titleId}
                </h1>
                <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
                  {post.excerptId}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User className="size-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {post.author}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-4 text-primary" />
                    {formatDate(post.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="size-4 text-primary" />
                    {post.views} kali dilihat
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4 text-primary" />
                    {estimateReadTime(content)} menit baca
                  </span>
                </div>
              </Reveal>

              {/* Cover image */}
              <Reveal delay={0.05}>
                <div className="mt-6 overflow-hidden rounded-2xl border border-border shadow-md">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.titleId}
                      onError={onImgError(post.titleId)}
                      className="aspect-[16/9] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-primary/30 to-gold/30">
                      <span className="text-6xl font-extrabold text-primary-foreground/90">
                        JW
                      </span>
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Content body */}
              <Reveal delay={0.1}>
                <div className="mt-8">{renderContent(content)}</div>
              </Reveal>

              {/* Tags */}
              {post.tags ? (
                <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
                  {post.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-primary/30 text-primary"
                      >
                        #{tag}
                      </Badge>
                    ))}
                </div>
              ) : null}

              {/* Comment form */}
              <CommentSection postId={post.id} />
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <Reveal delay={0.1}>
                <div className="space-y-6">
                  {/* Related posts */}
                  {relatedPosts.length > 0 ? (
                    <Card className="border-primary/20">
                      <CardContent className="p-5">
                        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                          <Sparkles className="size-4 text-primary" />
                          Artikel Terkait
                        </h3>
                        <div className="mt-4 space-y-4">
                          {relatedPosts.map((rp) => (
                            <Link
                              key={rp.id}
                              href={`/blog/${rp.slug}`}
                              className="group flex gap-3"
                            >
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                                {rp.coverImage ? (
                                  <img
                                    src={rp.coverImage}
                                    alt={rp.titleId}
                                    loading="lazy"
                                    onError={onImgError(rp.titleId)}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-gold/30 text-xs font-bold text-primary-foreground/90">
                                    {(rp.titleId || "JW").slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                                  {rp.titleId}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {formatDate(rp.createdAt)} • {rp.views} dilihat
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  {/* Newsletter */}
                  <SidebarNewsletter />
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </article>
    </MarketingLayout>
  );
}

/* ---------- comment section ---------- */
function CommentSection({ postId }: { postId: string }) {
  const form = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { name: "", email: "", content: "" },
  });

  const submitComment = useMutation({
    mutationFn: async (values: CommentValues) => {
      const res = await apiFetch("/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          name: values.name,
          email: values.email,
          content: values.content,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit comment");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Komentar menunggu moderasi. Terima kasih atas partisipasi Anda!");
      form.reset();
    },
    onError: () => {
      toast.error("Gagal mengirim komentar. Silakan coba lagi.");
    },
  });

  return (
    <section className="mt-12">
      <Reveal>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h3 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
            <MessageSquare className="size-5 text-primary" />
            Tinggalkan Komentar
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pendapat Anda sangat berarti. Komentar akan dimoderasi sebelum
            ditampilkan.
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => submitComment.mutate(v))}
              className="mt-6 space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Nama</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@contoh.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Komentar</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Tulis komentar Anda..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={submitComment.isPending}
                className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
              >
                <Send className="size-4" />
                {submitComment.isPending ? "Mengirim..." : "Kirim Komentar"}
              </Button>
            </form>
          </Form>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- sidebar newsletter ---------- */
function SidebarNewsletter() {
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
      toast.success("Terima kasih sudah berlangganan!");
      setEmail("");
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    },
    onError: () => toast.error("Gagal berlangganan. Coba lagi."),
  });

  return (
    <Card className="overflow-hidden border-primary/20 bg-mesh">
      <CardContent className="p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="size-5" />
        </div>
        <h3 className="mt-3 text-base font-bold text-foreground">
          Berlangganan Newsletter
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Dapatkan artikel terbaru langsung di email Anda.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            subscribe.mutate(email);
          }}
          className="mt-3 space-y-2"
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
            className="w-full bg-brand-gradient text-primary-foreground"
          >
            {done ? (
              <>
                <Check className="size-4" /> Berhasil
              </>
            ) : subscribe.isPending ? (
              "Mengirim..."
            ) : (
              "Daftar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
