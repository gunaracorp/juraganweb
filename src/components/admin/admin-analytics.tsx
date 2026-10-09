"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  Mail,
  MessageSquare,
  MousePointerClick,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Period = "7" | "30" | "90";

interface AnalyticsData {
  stats: {
    posts: number;
    pages: number;
    portfolio: number;
    services: number;
    testimonials: number;
    messages: number;
    newMessages: number;
    subscribers: number;
    comments: number;
    pendingComments: number;
    media: number;
    users: number;
    totalViews: number;
  };
  topPosts: Array<{
    id: string;
    titleId: string;
    titleEn: string;
    slug: string;
    views: number;
    category?: string;
    published?: boolean;
  }>;
  recentPosts: Array<{
    id: string;
    titleId: string;
    titleEn: string;
    slug: string;
    status: string;
  }>;
  recentPages: Array<{
    id: string;
    titleId: string;
    titleEn: string;
    slug: string;
    status: string;
  }>;
  recentMessages: Array<{
    id: string;
    name: string;
    subject: string;
    read: boolean;
    createdAt: string;
  }>;
  recentComments: Array<{
    id: string;
    name: string;
    content: string;
    status: string;
    createdAt: string;
    post?: { titleId: string; titleEn: string; slug: string } | null;
  }>;
  activities: Array<{
    id: string;
    userName: string;
    action: string;
    entity: string;
    entityTitle: string | null;
    createdAt: string;
  }>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  delay,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint: string;
  delay: number;
  accent: "primary" | "gold" | "rose" | "emerald";
}) {
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
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/60 p-2.5 backdrop-blur">
            <Icon className="size-5 text-primary" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AdminAnalytics() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const [period, setPeriod] = useState<Period>("30");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/analytics");
      if (!res.ok)
        return {
          stats: {
            posts: 0, pages: 0, portfolio: 0, services: 0, testimonials: 0,
            messages: 0, newMessages: 0, subscribers: 0, comments: 0,
            pendingComments: 0, media: 0, users: 0, totalViews: 0,
          },
          topPosts: [], recentPosts: [], recentPages: [],
          recentMessages: [], recentComments: [], activities: [],
        } as AnalyticsData;
      const json = await res.json().catch(() => null);
      return (json ?? {}) as AnalyticsData;
    },
  });

  const stats = data?.stats ?? {
    posts: 0, pages: 0, portfolio: 0, services: 0, testimonials: 0,
    messages: 0, newMessages: 0, subscribers: 0, comments: 0,
    pendingComments: 0, media: 0, users: 0, totalViews: 0,
  };

  const topPosts = (data?.topPosts ?? []).slice(0, 10);

  // Content chart data
  const contentData = [
    { name: t.admin.dashboard.posts, value: stats.posts, fill: "var(--chart-1)" },
    { name: t.admin.dashboard.pages, value: stats.pages, fill: "var(--chart-2)" },
    { name: t.admin.dashboard.portfolio, value: stats.portfolio, fill: "var(--chart-3)" },
    { name: t.admin.dashboard.services, value: stats.services, fill: "var(--chart-4)" },
    { name: t.admin.dashboard.testimonials, value: stats.testimonials, fill: "var(--chart-5)" },
    { name: t.admin.dashboard.media, value: stats.media, fill: "var(--chart-1)" },
    { name: t.admin.dashboard.users, value: stats.users, fill: "var(--chart-2)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.analytics.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.admin.analytics.overview}
          </p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">{t.admin.analytics.last7Days}</SelectItem>
            <SelectItem value="30">{t.admin.analytics.last30Days}</SelectItem>
            <SelectItem value="90">{t.admin.analytics.last90Days}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* GA note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-2 rounded-xl border border-gold/30 bg-gold/5 p-4 sm:flex-row sm:items-center"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
          <Info className="size-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {locale === "id"
              ? "Belum ada data real-time pengunjung"
              : "No real-time visitor data yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.admin.analytics.noData}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-gold/40 text-gold hover:bg-gold/10 hover:text-gold"
        >
          {t.admin.analytics.installGA}
        </Button>
      </motion.div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[124px] w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={Users}
              label={t.admin.analytics.visitors}
              value="—"
              hint={locale === "id" ? "Pasang GA" : "Install GA"}
              delay={0.05}
              accent="primary"
            />
            <StatCard
              icon={Eye}
              label={t.admin.analytics.pageViews}
              value={stats.totalViews}
              hint={locale === "id" ? "Total views artikel" : "Total post views"}
              delay={0.12}
              accent="gold"
            />
            <StatCard
              icon={Clock}
              label={t.admin.analytics.avgTime}
              value="—"
              hint={locale === "id" ? "Pasang GA" : "Install GA"}
              delay={0.19}
              accent="emerald"
            />
            <StatCard
              icon={MousePointerClick}
              label={t.admin.analytics.bounceRate}
              value="—"
              hint={locale === "id" ? "Pasang GA" : "Install GA"}
              delay={0.26}
              accent="rose"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top posts chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <TrendingUp className="size-4" />
              </span>
              {t.admin.analytics.topPosts}
            </CardTitle>
            <Badge variant="secondary" className="tabular-nums">
              {topPosts.length} {locale === "id" ? "artikel" : "posts"}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : topPosts.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                {t.admin.common.noData}
              </div>
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topPosts.map((p) => ({
                      name:
                        (locale === "id" ? p.titleId : p.titleEn || p.titleId).slice(0, 30) +
                        ((locale === "id" ? p.titleId : p.titleEn || p.titleId).length > 30
                          ? "…"
                          : ""),
                      views: p.views,
                    }))}
                    layout="vertical"
                    margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      stroke="var(--border)"
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={140}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      stroke="var(--border)"
                    />
                    <Tooltip
                      cursor={{ fill: "var(--accent)" }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                      {topPosts.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={`var(--chart-${(idx % 5) + 1})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content stats chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <span className="flex size-7 items-center justify-center rounded-md bg-gold/10 text-gold">
                <BarChart3 className="size-4" />
              </span>
              {locale === "id" ? "Statistik Konten" : "Content Statistics"}
            </CardTitle>
            <Badge variant="secondary" className="tabular-nums">
              {contentData.reduce((sum, d) => sum + d.value, 0)}{" "}
              {locale === "id" ? "item" : "items"}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={contentData}
                    margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      stroke="var(--border)"
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      stroke="var(--border)"
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--accent)" }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {contentData.map((d, idx) => (
                        <Cell key={idx} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <FileText className="size-4 text-primary" />
              {t.admin.dashboard.posts}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <p className="text-2xl font-extrabold tabular-nums">
                    {stats.posts}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {locale === "id" ? "total artikel" : "total posts"}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Mail className="size-4 text-gold" />
              {t.admin.dashboard.messages}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <p className="text-2xl font-extrabold tabular-nums">
                    {stats.newMessages}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {locale === "id" ? "pesan baru" : "new messages"}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <Mail className="size-5" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <MessageSquare className="size-4 text-primary" />
              {t.admin.dashboard.comments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <p className="text-2xl font-extrabold tabular-nums">
                    {stats.pendingComments}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {locale === "id" ? "menunggu approval" : "pending approval"}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="size-5" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hint icons */}
      <div className="hidden">
        <Activity aria-hidden />
        <ImageIcon aria-hidden />
        <Users aria-hidden />
      </div>
    </div>
  );
}
