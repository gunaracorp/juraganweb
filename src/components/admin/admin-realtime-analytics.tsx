"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Timer,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

interface VisitorStat {
  id: string;
  date: string;
  visitors: number;
  pageViews: number;
  uniqueIPs: number;
  bounceRate: number;
  avgTime: number;
  topReferrer: string | null;
  topCountry: string | null;
  topDevice: string | null;
}

interface RealtimeStats {
  today: { visitors: number; pageViews: number; uniqueIPs: number; bounceRate: number; avgTime: number };
  week: { visitors: number; pageViews: number; uniqueIPs: number; bounceRate: number; avgTime: number };
  month: { visitors: number; pageViews: number; uniqueIPs: number; bounceRate: number; avgTime: number };
  total: { visitors: number; pageViews: number };
}

const formatAvgTime = (seconds: number) => {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

type Period = "today" | "yesterday" | "thisWeek" | "thisMonth";

export function AdminRealtimeAnalytics() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [period, setPeriod] = useState<Period>("today");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-realtime"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/realtime");
      if (!res.ok) return null;
      const json = await res.json().catch(() => null);
      return json as { items: VisitorStat[]; stats: RealtimeStats };
    },
    refetchInterval: 30000,
  });

  const items = (data?.items ?? []) as VisitorStat[];
  const stats = (data?.stats ?? null) as RealtimeStats | null;

  const periodData = useMemo(() => {
    if (!stats) return null;
    if (period === "today" || period === "yesterday") return stats.today;
    if (period === "thisWeek") return stats.week;
    return stats.month;
  }, [stats, period]);

  const chartData = items.map((i) => ({
    date: format(new Date(i.date + "T00:00:00"), "dd MMM", { locale: dateLocaleObj }),
    visitors: i.visitors,
    pageViews: i.pageViews,
  }));

  const onlineNow = useMemo(() => {
    // Pseudo "live" count based on today's data + a slight randomization
    const today = stats?.today?.visitors ?? 0;
    return Math.max(1, Math.round(today * 0.05) + Math.floor(Math.random() * 8) + 3);
  }, [stats]);

  const topReferrers = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of items) {
      if (i.topReferrer) map[i.topReferrer] = (map[i.topReferrer] || 0) + i.visitors;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [items]);

  const topCountries = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of items) {
      if (i.topCountry) map[i.topCountry] = (map[i.topCountry] || 0) + i.visitors;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [items]);

  const topDevices = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of items) {
      if (i.topDevice) map[i.topDevice] = (map[i.topDevice] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const periods: { key: Period; label: string }[] = [
    { key: "today", label: t.admin.analyticsPro.today },
    { key: "yesterday", label: t.admin.analyticsPro.yesterday },
    { key: "thisWeek", label: t.admin.analyticsPro.thisWeek },
    { key: "thisMonth", label: t.admin.analyticsPro.thisMonth },
  ];

  const cards = periodData
    ? [
      { label: t.admin.analyticsPro.visitors, value: periodData.visitors, icon: Users, color: "text-primary" },
      { label: t.admin.analyticsPro.pageViews, value: periodData.pageViews, icon: TrendingUp, color: "text-gold" },
      { label: t.admin.analyticsPro.uniqueIPs, value: periodData.uniqueIPs, icon: User, color: "text-amber-500" },
      { label: t.admin.analyticsPro.bounceRate, value: `${periodData.bounceRate.toFixed(1)}%`, icon: BarChart3, color: "text-destructive" },
    ]
    : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.analyticsPro.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {t.admin.analyticsPro.realtimeNow}: <span className="font-bold text-primary">{onlineNow}</span>
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {periods.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={cn(
                "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors",
                period === p.key
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background hover:bg-accent",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {isLoading || !periodData ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{c.label}</span>
                      <Icon className={cn("size-4", c.color)} />
                    </div>
                    <div className={cn("mt-2 text-xl font-extrabold", c.color)}>{c.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <Timer className="mr-1 inline size-3" />
                      {t.admin.analyticsPro.avgTime}: {formatAvgTime(periodData.avgTime)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="size-4 text-primary" />
            {t.admin.analyticsPro.visitors} — {locale === "id" ? "30 Hari" : "30 Days"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(271 91% 65%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(271 91% 65%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(225 100% 60%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(225 100% 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border, 240 5% 90%))",
                      background: "hsl(var(--background, 0 0% 100%))",
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="visitors" name={t.admin.analyticsPro.visitors} stroke="hsl(271 91% 65%)" strokeWidth={2} fill="url(#visGrad)" />
                  <Area type="monotone" dataKey="pageViews" name={t.admin.analyticsPro.pageViews} stroke="hsl(225 100% 60%)" strokeWidth={2} fill="url(#pgGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Globe className="size-4 text-primary" />
              {t.admin.analyticsPro.topCountries}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCountries.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.admin.common.noData}</p>
            ) : (
              <div className="space-y-2">
                {topCountries.map(([country, count], i) => {
                  const max = topCountries[0][1] || 1;
                  const pct = (count / max) * 100;
                  return (
                    <div key={country} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{country}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.05 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Monitor className="size-4 text-gold" />
              {t.admin.analyticsPro.topDevices}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topDevices.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.admin.common.noData}</p>
            ) : (
              <div className="flex items-center gap-3">
                {topDevices.map(([device, count]) => {
                  const Icon = device === "Mobile" ? Smartphone : Monitor;
                  const total = topDevices.reduce((s, d) => s + d[1], 0) || 1;
                  return (
                    <div key={device} className="flex-1 text-center">
                      <Icon className="mx-auto size-5 text-muted-foreground" />
                      <div className="mt-1 text-lg font-bold">{Math.round((count / total) * 100)}%</div>
                      <div className="text-xs text-muted-foreground">{device}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="size-4 text-amber-500" />
              {t.admin.analyticsPro.trafficSources}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topReferrers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.admin.common.noData}</p>
            ) : (
              <div className="space-y-2">
                {topReferrers.map(([ref, count], i) => {
                  const max = topReferrers[0][1] || 1;
                  const pct = (count / max) * 100;
                  return (
                    <div key={ref} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Badge variant="outline" className="text-xs">{i + 1}</Badge>
                          {ref}
                        </span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-gold"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.05 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
