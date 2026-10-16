"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS as enLocale } from "date-fns/locale";
import { ArrowRight, Clock, Eye, User } from "lucide-react";
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

// Fallback cover images by category
const COVER_BY_CATEGORY: Record<string, string> = {
  Umum: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=900&q=70",
  Tutorial:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=70",
  "Digital Marketing":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=70",
  "Web Development":
    "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=900&q=70",
  Bisnis:
    "https://images.unsplash.com/photo-1556745757-8d76bdb6989f?auto=format&fit=crop&w=900&q=70",
};

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=70";

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(dateStr: string, locale: "id" | "en"): string {
  try {
    return format(new Date(dateStr), "dd MMM yyyy", {
      locale: locale === "id" ? idLocale : enLocale,
    });
  } catch {
    return dateStr;
  }
}

function PostCard({
  post,
  onOpen,
  featured = false,
}: {
  post: ApiPost;
  onOpen: (slug: string) => void;
  featured?: boolean;
}) {
  const { t, locale } = useTranslation();
  const title = locale === "id" ? post.titleId : post.titleEn;
  const excerpt = locale === "id" ? post.excerptId : post.excerptEn;
  const content = locale === "id" ? post.contentId : post.contentEn;
  const cover =
    post.coverImage ||
    COVER_BY_CATEGORY[post.category] ||
    DEFAULT_COVER;

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="group relative grid cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-xl lg:grid-cols-2"
        onClick={() => onOpen(post.slug)}
      >
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
          <img
            src={cover}
            alt={title}
            onError={onImgError(title)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:bg-gradient-to-r" />
          <Badge className="absolute left-4 top-4 border-0 bg-primary text-primary-foreground">
            {post.category}
          </Badge>
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <h3 className="text-balance text-2xl font-bold text-foreground sm:text-3xl">
            {title}
          </h3>
          <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
            {excerpt}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-primary" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              {estimateReadTime(content)} {t.blog.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5 text-primary" />
              {post.views} {t.blog.views}
            </span>
          </div>
          <Button
            type="button"
            className="mt-6 w-fit"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(post.slug);
            }}
          >
            {t.blog.readMore}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
      onClick={() => onOpen(post.slug)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={cover}
          alt={title}
          loading="lazy"
          onError={onImgError(title)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <Badge className="absolute left-3 top-3 border-0 bg-background/85 text-foreground backdrop-blur-md">
          {post.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(post.createdAt, locale)}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-base font-bold text-foreground">
          {title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="size-3.5 text-primary" />
            <span className="line-clamp-1">{post.author}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" />
            {estimateReadTime(content)} {t.blog.readTime}
          </span>
        </div>
        <Button
          type="button"
          variant="link"
          className="mt-2 h-auto justify-start p-0 text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(post.slug);
          }}
        >
          {t.blog.readMore}
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </motion.article>
  );
}

export function Blog() {
  const { t } = useTranslation();
  const setActivePostSlug = useAppStore((s) => s.setActivePostSlug);

  const { data, isLoading } = useQuery<ApiPost[]>({
    queryKey: ["posts", "published"],
    queryFn: async () => {
      const res = await apiFetch("/posts?published=true");
      const json = await res.json();
      return (json?.posts ?? []) as ApiPost[];
    },
    staleTime: 60_000,
  });

  const posts = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Featured first, then by createdAt desc
    const sorted = [...data].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
    const featuredIdx = sorted.findIndex((p) => p.featured);
    if (featuredIdx > 0) {
      const [f] = sorted.splice(featuredIdx, 1);
      sorted.unshift(f);
    }
    return sorted.slice(0, 6);
  }, [data]);

  const featuredPost = posts.find((p) => p.featured) ?? posts[0] ?? null;
  const restPosts = posts.filter((p) => p.id !== featuredPost?.id);

  return (
    <section id="blog" className="relative bg-mesh py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {t.blog.tag}
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.blog.title}
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            {t.blog.subtitle}
          </p>
        </Reveal>

        {isLoading ? (
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl lg:col-span-2" />
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
            <p className="text-sm text-muted-foreground">{t.admin.common.noData}</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featuredPost && (
              <div className="mt-12">
                <PostCard
                  post={featuredPost}
                  onOpen={(slug) => setActivePostSlug(slug)}
                  featured
                />
              </div>
            )}

            {/* Grid of remaining posts */}
            {restPosts.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {restPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onOpen={(slug) => setActivePostSlug(slug)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
