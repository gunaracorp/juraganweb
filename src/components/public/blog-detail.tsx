"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { id as idLocale, enUS as enLocale } from "date-fns/locale";
import {
  ArrowLeft,
  Clock,
  Eye,
  User,
  Calendar,
  Share2,
  Link2,
  Facebook,
  Twitter,
  MessageCircle,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/public/reveal";
import { apiFetch } from "@/lib/api-client";
import { onImgError } from "@/lib/img-fallback";

interface ApiPost {
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
  updatedAt: string;
}

const COVER_BY_CATEGORY: Record<string, string> = {
  Umum: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1200&q=70",
  Tutorial:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=70",
  "Digital Marketing":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=70",
  "Web Development":
    "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=70",
  Bisnis:
    "https://images.unsplash.com/photo-1556745757-8d76bdb6989f?auto=format&fit=crop&w=1200&q=70",
};

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=70";

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(dateStr: string, locale: "id" | "en"): string {
  try {
    return format(new Date(dateStr), "dd MMMM yyyy", {
      locale: locale === "id" ? idLocale : enLocale,
    });
  } catch {
    return dateStr;
  }
}

export function BlogDetail({ slug }: { slug: string }) {
  const { t, locale } = useTranslation();
  const setActivePostSlug = useAppStore((s) => s.setActivePostSlug);
  const [copied, setCopied] = useState(false);

  // Fetch single post
  const { data: post, isLoading } = useQuery<ApiPost>({
    queryKey: ["post", slug],
    queryFn: async () => {
      const res = await apiFetch(`/posts?slug=${encodeURIComponent(slug)}`);
      const json = await res.json();
      return json?.post as ApiPost;
    },
    enabled: !!slug,
  });

  // Fetch related posts (for sidebar / below)
  const { data: allPosts } = useQuery<ApiPost[]>({
    queryKey: ["posts", "published"],
    queryFn: async () => {
      const res = await apiFetch("/posts?published=true");
      const json = await res.json();
      return (json?.posts ?? []) as ApiPost[];
    },
  });

  // Increment view count on mount (fire once)
  const viewMutation = useMutation({
    mutationFn: async () => {
      await apiFetch("/posts/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
    },
  });

  useEffect(() => {
    if (slug) viewMutation.mutate();
  }, [slug]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const relatedPosts = useMemo(() => {
    if (!allPosts || !post) return [];
    return allPosts
      .filter((p) => p.id !== post.id && p.category === post.category)
      .slice(0, 3);
  }, [allPosts, post]);

  const handleShare = (channel: "wa" | "fb" | "tw" | "copy") => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = post
      ? locale === "id"
        ? post.titleId
        : post.titleEn
      : "JuraganWebsite";
    const enc = encodeURIComponent;
    switch (channel) {
      case "wa":
        window.open(
          `https://wa.me/?text=${enc(title + " " + url)}`,
          "_blank",
          "noopener",
        );
        break;
      case "fb":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
          "_blank",
          "noopener",
        );
        break;
      case "tw":
        window.open(
          `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
          "_blank",
          "noopener",
        );
        break;
      case "copy":
        navigator.clipboard
          .writeText(url)
          .then(() => {
            setCopied(true);
            toast.success("Link disalin!");
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => toast.error("Gagal menyalin link"));
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-6 h-10 w-2/3" />
        <Skeleton className="mt-6 aspect-[16/9] w-full rounded-2xl" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <Skeleton className="mt-2 h-4 w-4/6" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-20 text-center sm:px-6 lg:px-8">
        <p className="text-base text-muted-foreground">
          {t.admin.common.noData}
        </p>
        <Button
          type="button"
          className="mt-6"
          onClick={() => setActivePostSlug(null)}
        >
          <ArrowLeft className="size-4" />
          {t.blog.backToBlog}
        </Button>
      </div>
    );
  }

  const title = locale === "id" ? post.titleId : post.titleEn;
  const excerpt = locale === "id" ? post.excerptId : post.excerptEn;
  const content = locale === "id" ? post.contentId : post.contentEn;
  const cover =
    post.coverImage || COVER_BY_CATEGORY[post.category] || DEFAULT_COVER;

  return (
    <article className="relative pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActivePostSlug(null)}
            className="text-foreground/80 hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t.blog.backToBlog}
          </Button>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <Badge className="border-0 bg-primary text-primary-foreground">
            {post.category}
          </Badge>
          <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            {excerpt}
          </p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-4 text-primary" />
              <span className="font-medium text-foreground">{post.author}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4 text-primary" />
              {formatDate(post.createdAt, locale)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-4 text-primary" />
              {post.views} {t.blog.views}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-primary" />
              {estimateReadTime(content)} {t.blog.readTime}
            </span>
          </div>
        </motion.header>

        {/* Cover image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 overflow-hidden rounded-2xl border border-border shadow-md"
        >
          <img
            src={cover}
            alt={title}
            onError={onImgError(title)}
            className="aspect-[16/9] w-full object-cover"
          />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-sm sm:prose-base mt-8 max-w-none text-foreground/90 prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground prose-img:rounded-xl"
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </motion.div>

        {/* Share buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6"
        >
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Share2 className="size-4 text-primary" />
            {t.blog.shareArticle}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <ShareButton onClick={() => handleShare("wa")} label="WhatsApp">
              <MessageCircle className="size-4" />
            </ShareButton>
            <ShareButton onClick={() => handleShare("fb")} label="Facebook">
              <Facebook className="size-4" />
            </ShareButton>
            <ShareButton onClick={() => handleShare("tw")} label="Twitter / X">
              <Twitter className="size-4" />
            </ShareButton>
            <ShareButton onClick={() => handleShare("copy")} label="Copy link">
              {copied ? (
                <Check className="size-4 text-primary" />
              ) : (
                <Link2 className="size-4" />
              )}
            </ShareButton>
          </div>
        </motion.div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <Reveal>
              <h2 className="text-2xl font-bold text-foreground">
                {t.blog.relatedPosts}
              </h2>
            </Reveal>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => {
                const rTitle = locale === "id" ? rp.titleId : rp.titleEn;
                const rExcerpt = locale === "id" ? rp.excerptId : rp.excerptEn;
                const rCover =
                  rp.coverImage ||
                  COVER_BY_CATEGORY[rp.category] ||
                  DEFAULT_COVER;
                return (
                  <motion.article
                    key={rp.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => setActivePostSlug(rp.slug)}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={rCover}
                        alt={rTitle}
                        loading="lazy"
                        onError={onImgError(rTitle)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <Badge className="absolute left-3 top-3 border-0 bg-background/85 text-foreground backdrop-blur-md">
                        {rp.category}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-base font-bold text-foreground">
                        {rTitle}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {rExcerpt}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {formatDate(rp.createdAt, locale)}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function ShareButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground/80 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
    >
      {children}
    </button>
  );
}
