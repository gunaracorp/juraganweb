"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Mail,
  MailOpen,
  MessageSquare,
  Pencil,
  Plus,
  Settings as SettingsIcon,
  Sparkles,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { slugify, getCurrentUser } from "./_utils";
import type { SectionKey } from "./admin-layout";

interface Stats {
  posts: number;
  pages: number;
  portfolio: number;
  newMessages: number;
  subscribers: number;
  pendingComments: number;
  media: number;
  users: number;
}

interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  status: string;
  createdAt: string;
}

interface PostItem {
  id: string;
  titleId: string;
  titleEn: string;
  published: boolean;
  status: string;
  createdAt: string;
  views: number;
  category?: string;
  slug?: string;
}

interface PageItem {
  id: string;
  titleId: string;
  titleEn: string;
  status: string;
  createdAt: string;
}

interface CommentItem {
  id: string;
  postId: string;
  name: string;
  email: string;
  content: string;
  status: string;
  createdAt: string;
  post?: { titleId: string; titleEn: string; slug: string } | null;
}

interface ActivityItem {
  id: string;
  userName: string;
  action: string;
  entity: string;
  entityTitle: string | null;
  createdAt: string;
}

interface Analytics {
  stats: Stats;
  topPosts?: PostItem[];
  recentPosts?: PostItem[];
  recentPages?: PageItem[];
  recentMessages?: MessageItem[];
  recentComments?: CommentItem[];
  activities?: ActivityItem[];
}

/** A small count-up animation hook driven by requestAnimationFrame. */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = target;
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  delay,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  trend: string;
  delay: number;
  accent: "primary" | "gold" | "rose" | "emerald";
}) {
  const animated = useCountUp(value);
  const accentMap = {
    primary: "from-primary/15 to-primary/5 text-primary",
    gold: "from-gold/20 to-gold/5 text-gold",
    emerald: "from-primary/20 to-transparent text-primary",
    rose: "from-destructive/15 to-destructive/5 text-destructive",
  } as const;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group relative overflow-hidden border-border/60 transition-shadow hover:shadow-md">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-70 transition-opacity group-hover:opacity-100",
            accentMap[accent],
          )}
        />
        <CardContent className="relative flex items-start justify-between p-5">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">
              {animated.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">{trend}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/60 p-2.5 backdrop-blur">
            <Icon className="size-5 text-primary" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WidgetCard({
  title,
  icon: Icon,
  onSeeAll,
  children,
  className,
}: {
  title: string;
  icon: LucideIcon;
  onSeeAll?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const { t, locale } = useTranslation();
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
        {onSeeAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSeeAll}
            className="text-primary hover:text-primary"
          >
            {locale === "id" ? "Lihat semua" : "View all"}
            <ArrowRight className="size-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}

const ACTION_ICON: Record<string, LucideIcon> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
  published: ArrowUpRight,
  unpublished: X,
  login: CheckCircle2,
  logout: X,
  uploaded: ArrowUpRight,
  replied: MessageSquare,
  approved: Check,
};

export function AdminOverview({
  onNavigate,
}: {
  onNavigate: (s: SectionKey) => void;
}) {
  const { t, locale } = useTranslation();
  const adminToken = useAppStore((s) => s.adminToken);
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  // Use the unified analytics endpoint as the data source.
  const { data: aData, isLoading: aLoading } = useQuery({
    queryKey: ["admin-analytics-overview"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/analytics");
      if (!res.ok)
        return {
          stats: { posts: 0, pages: 0, portfolio: 0, newMessages: 0, subscribers: 0, pendingComments: 0, media: 0, users: 0 },
          topPosts: [],
          recentMessages: [],
          recentComments: [],
          activities: [],
        } as Analytics;
      const json = await res.json().catch(() => null);
      return (json ?? {}) as Analytics;
    },
    enabled: !!adminToken,
  });

  const stats = aData?.stats ?? {
    posts: 0,
    pages: 0,
    portfolio: 0,
    newMessages: 0,
    subscribers: 0,
    pendingComments: 0,
    media: 0,
    users: 0,
  };

  const topPosts = (aData?.topPosts ?? []).slice(0, 5);
  const recentMessages = (aData?.recentMessages ?? []).slice(0, 3);
  const recentComments = (aData?.recentComments ?? []).slice(0, 3);
  const activities = (aData?.activities ?? []).slice(0, 5);

  // Quick Draft widget
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const quickDraftMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          titleId: draftTitle,
          titleEn: draftTitle,
          excerptId: draftContent.slice(0, 140),
          excerptEn: draftContent.slice(0, 140),
          contentId: draftContent,
          contentEn: draftContent,
          category: "Umum",
          tags: "",
          coverImage: "",
          author: user?.name || "Admin",
          featured: false,
          published: false,
          status: "draft",
          slug: slugify(draftTitle) || `draft-${Date.now()}`,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("create failed");
      return json;
    },
    onSuccess: () => {
      toast.success(
        locale === "id" ? "Draft disimpan" : "Draft saved",
      );
      setDraftTitle("");
      setDraftContent("");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menyimpan draft" : "Failed to save draft");
    },
  });

  // Comment quick actions
  const commentActionMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: string;
    }) => {
      const res = await fetchWithAuth("/api/comments", {
        method: "PUT",
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("update failed");
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
  });

  const atAGlance: { label: string; count: number; section: SectionKey; icon: LucideIcon }[] = [
    { label: t.admin.dashboard.posts, count: stats.posts, section: "posts", icon: FileText },
    { label: t.admin.dashboard.pages, count: stats.pages, section: "pages", icon: FileText },
    { label: t.admin.dashboard.portfolio, count: stats.portfolio, section: "portfolio", icon: Briefcase },
    { label: t.admin.dashboard.media, count: stats.media, section: "media", icon: BarChart3 },
    { label: t.admin.dashboard.users, count: stats.users, section: "users", icon: Users },
  ];

  const quickActions: {
    label: string;
    icon: LucideIcon;
    section: SectionKey;
  }[] = [
    { label: t.admin.posts.addNew, icon: Plus, section: "posts" },
    { label: t.admin.pages.addNew, icon: Plus, section: "pages" },
    { label: t.admin.portfolio.addNew, icon: Plus, section: "portfolio" },
    { label: t.admin.dashboard.messages, icon: Mail, section: "messages" },
    { label: t.admin.dashboard.settings, icon: SettingsIcon, section: "settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-gold/5 to-transparent p-5 sm:p-6"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            {t.admin.dashboard.welcome}, {user?.name || "Admin"} 👋
          </div>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">
            {locale === "id"
              ? "Semua Sistem Aktif & Berjalan"
              : "All Systems Active & Running"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? "Kelola artikel, halaman, portofolio, layanan, komentar, menu, media, dan pengaturan website dari satu dashboard."
              : "Manage posts, pages, portfolio, services, comments, menus, media, and website settings from one dashboard."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary">
              <CheckCircle2 className="size-3" />
              {locale === "id" ? "Database online" : "Database online"}
            </Badge>
            <Badge className="bg-gold/15 text-gold">
              <CheckCircle2 className="size-3" />
              {locale === "id" ? "API sehat" : "API healthy"}
            </Badge>
            <Badge className="bg-primary/10 text-primary">
              <Clock className="size-3" />
              {locale === "id" ? "Sesi aktif" : "Session active"}
            </Badge>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-8 -right-4 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
        <div className="pointer-events-none absolute -top-8 -left-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {aLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[124px] w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={FileText}
              label={t.admin.dashboard.stats.totalPosts}
              value={stats.posts}
              trend={locale === "id" ? "Artikel blog" : "Blog posts"}
              delay={0.05}
              accent="primary"
            />
            <StatCard
              icon={FileText}
              label={t.admin.dashboard.stats.totalPages}
              value={stats.pages}
              trend={locale === "id" ? "Halaman website" : "Site pages"}
              delay={0.12}
              accent="gold"
            />
            <StatCard
              icon={Mail}
              label={t.admin.dashboard.stats.totalMessages}
              value={stats.newMessages}
              trend={locale === "id" ? "Pesan belum dibaca" : "Unread messages"}
              delay={0.19}
              accent="rose"
            />
            <StatCard
              icon={MessageSquare}
              label={t.admin.dashboard.stats.totalComments}
              value={stats.pendingComments}
              trend={locale === "id" ? "Komentar menunggu" : "Pending comments"}
              delay={0.26}
              accent="emerald"
            />
          </>
        )}
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* At a Glance */}
          <WidgetCard
            title={t.admin.widgets.atAGlance}
            icon={Sparkles}
          >
            <ul className="space-y-2">
              {atAGlance.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.section)}
                      className="flex w-full items-center gap-3 rounded-lg border border-border/50 p-2.5 text-left transition-colors hover:bg-accent/60"
                    >
                      <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      <Badge variant="secondary" className="tabular-nums">
                        {item.count}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          </WidgetCard>

          {/* Activity */}
          <WidgetCard
            title={t.admin.widgets.activity}
            icon={Clock}
            onSeeAll={() => onNavigate("activity")}
          >
            {aLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {t.admin.activity.empty}
              </div>
            ) : (
              <ul className="space-y-2.5">
                {activities.map((a, idx) => {
                  const Icon = ACTION_ICON[a.action] ?? Clock;
                  const actionKey = a.action as keyof typeof t.admin.activity.actions;
                  const actionLabel = t.admin.activity.actions[actionKey] ?? a.action;
                  return (
                    <motion.li
                      key={a.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug">
                          <span className="font-semibold">{a.userName}</span>{" "}
                          <span className="text-muted-foreground">
                            {actionLabel}
                          </span>{" "}
                          {a.entityTitle && (
                            <span className="font-medium text-foreground">{a.entityTitle}</span>
                          )}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                          {formatDistanceToNow(new Date(a.createdAt), {
                            addSuffix: true,
                            locale: dateLocaleObj,
                          })}
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </WidgetCard>

          {/* Quick Draft */}
          <WidgetCard title={t.admin.widgets.quickDraft} icon={Pencil}>
            <div className="space-y-3">
              <Input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder={locale === "id" ? "Judul artikel…" : "Post title…"}
              />
              <Textarea
                rows={4}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder={locale === "id" ? "Tulis sesuatu…" : "Write something…"}
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">
                  {locale === "id"
                    ? "Draft akan disimpan sebagai draf (tidak dipublikasi)."
                    : "Drafts are saved as draft (not published)."}
                </p>
                <Button
                  size="sm"
                  onClick={() => quickDraftMutation.mutate()}
                  disabled={!draftTitle.trim() || quickDraftMutation.isPending}
                  className="bg-brand-gradient text-primary-foreground hover:opacity-95"
                >
                  {quickDraftMutation.isPending ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                  {t.admin.common.save}
                </Button>
              </div>
            </div>
          </WidgetCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent messages */}
          <WidgetCard
            title={t.admin.widgets.recentMessages}
            icon={Mail}
            onSeeAll={() => onNavigate("messages")}
          >
            {aLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentMessages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {t.admin.messages.empty}
              </div>
            ) : (
              <ul className="space-y-2">
                {recentMessages.map((m, idx) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <button
                      type="button"
                      onClick={() => onNavigate("messages")}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border border-border/60 p-3 text-left transition-colors hover:bg-accent/60",
                        !m.read && "bg-primary/5",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1 flex size-9 shrink-0 items-center justify-center rounded-full",
                          m.read
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {m.read ? (
                          <MailOpen className="size-4" />
                        ) : (
                          <Mail className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{m.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {m.subject || m.message}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                          {formatDistanceToNow(new Date(m.createdAt), {
                            addSuffix: true,
                            locale: dateLocaleObj,
                          })}
                        </p>
                      </div>
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </WidgetCard>

          {/* Recent comments */}
          <WidgetCard
            title={t.admin.widgets.recentComments}
            icon={MessageSquare}
            onSeeAll={() => onNavigate("comments")}
          >
            {aLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentComments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {t.admin.comments.empty}
              </div>
            ) : (
              <ul className="space-y-2">
                {recentComments.map((c, idx) => {
                  const postTitle = c.post
                    ? locale === "id"
                      ? c.post.titleId
                      : c.post.titleEn || c.post.titleId
                    : "—";
                  return (
                    <motion.li
                      key={c.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="rounded-lg border border-border/60 p-3"
                    >
                      <p className="text-sm">
                        <span className="font-semibold">{c.name}</span>{" "}
                        <span className="text-muted-foreground">
                          {t.admin.comments.wrote}
                        </span>
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        “{c.content}”
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="truncate text-[11px] text-muted-foreground/70">
                          {t.admin.comments.on}{" "}
                          <span className="font-medium text-foreground">
                            {postTitle}
                          </span>
                        </p>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            disabled={
                              commentActionMutation.isPending || c.status === "approved"
                            }
                            onClick={() =>
                              commentActionMutation.mutate({
                                id: c.id,
                                status: "approved",
                              })
                            }
                          >
                            <Check className="size-3" />
                            {t.admin.comments.approve}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={commentActionMutation.isPending}
                            onClick={() =>
                              commentActionMutation.mutate({
                                id: c.id,
                                status: "spam",
                              })
                            }
                          >
                            <X className="size-3" />
                            {t.admin.comments.spam}
                          </Button>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </WidgetCard>

          {/* Top pages */}
          <WidgetCard
            title={t.admin.widgets.topPages}
            icon={BarChart3}
            onSeeAll={() => onNavigate("analytics")}
          >
            {aLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topPosts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {t.admin.common.noData}
              </div>
            ) : (
              <ol className="space-y-2">
                {topPosts.map((p, idx) => {
                  const maxViews = topPosts[0]?.views || 1;
                  const pct = Math.round((p.views / maxViews) * 100);
                  return (
                    <li
                      key={p.id}
                      className="rounded-lg border border-border/50 p-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          <span className="mr-1.5 text-xs font-bold text-muted-foreground/60">
                            #{idx + 1}
                          </span>
                          {locale === "id" ? p.titleId : p.titleEn || p.titleId}
                        </p>
                        <Badge variant="secondary" className="shrink-0 tabular-nums">
                          <Eye className="size-3" />
                          {p.views.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: idx * 0.06, duration: 0.5 }}
                          className="h-full rounded-full bg-brand-gradient"
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </WidgetCard>

          {/* Quick actions */}
          <WidgetCard
            title={t.admin.widgets.quickActions}
            icon={ArrowUpRight}
          >
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((qa, idx) => {
                const Icon = qa.icon;
                return (
                  <motion.button
                    key={qa.label}
                    type="button"
                    onClick={() => onNavigate(qa.section)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.04 * idx }}
                    whileHover={{ y: -2 }}
                    className="flex flex-col items-start gap-2 rounded-lg border border-border/60 p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium leading-tight">
                      {qa.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </WidgetCard>
        </div>
      </div>
    </div>
  );
}
