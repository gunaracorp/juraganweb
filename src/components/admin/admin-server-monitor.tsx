"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  ServerCog,
  Zap,
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

interface Metric {
  id: string;
  server: string;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  bandwidthIn: number;
  bandwidthOut: number;
  uptime: number;
  loadAvg: string;
  processes: number;
  connections: number;
  createdAt: string;
}

interface Stats {
  avgCpu: number;
  avgRam: number;
  avgDisk: number;
  maxCpu: number;
  maxRam: number;
  maxDisk: number;
  minCpu: number;
  minRam: number;
  minDisk: number;
}

const formatUptime = (seconds: number) => {
  if (!seconds) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
};

const formatBandwidth = (bps: number) => {
  if (!bps) return "0 B/s";
  const units = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bps) / Math.log(1024));
  return `${(bps / Math.pow(1024, i)).toFixed(1)} ${units[i] ?? "B/s"}`;
};

function usageColor(p: number) {
  if (p < 60) return "from-emerald-500 to-emerald-400";
  if (p < 85) return "from-amber-500 to-amber-400";
  return "from-destructive to-red-500";
}

function statusBadge(p: number, t: ReturnType<typeof useTranslation>["t"]) {
  if (p < 60)
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        {t.admin.serverMonitor.healthy}
      </Badge>
    );
  if (p < 85)
    return (
      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
        {t.admin.serverMonitor.warning}
      </Badge>
    );
  return <Badge className="bg-destructive/15 text-destructive">{t.admin.serverMonitor.critical}</Badge>;
}

export function AdminServerMonitor() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;
  const [_, force] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-server-monitor"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/server-monitor");
      if (!res.ok) return null;
      const json = await res.json().catch(() => null);
      return json as { items: Metric[]; stats: Stats; current: Metric | null };
    },
    refetchInterval: 30000,
  });

  // Force a re-render every 30s to update "Live" indicator.
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);
  void _;

  const items = (data?.items ?? []) as Metric[];
  const stats = (data?.stats ?? null) as Stats | null;
  const current = (data?.current ?? null) as Metric | null;

  // Sample to ~30 points for the chart
  const step = Math.max(1, Math.floor(items.length / 30));
  const chartData = items
    .filter((_, i) => i % step === 0)
    .map((m) => ({
      time: format(new Date(m.createdAt), "HH:mm", { locale: dateLocaleObj }),
      cpu: m.cpuUsage,
      ram: m.ramUsage,
      disk: m.diskUsage,
    }));

  const loadArr = current?.loadAvg ? current.loadAvg.split(",") : ["0", "0", "0"];

  const cards = [
    {
      label: t.admin.serverMonitor.cpuUsage,
      value: current?.cpuUsage ?? 0,
      icon: Cpu,
      color: "text-primary",
    },
    {
      label: t.admin.serverMonitor.ramUsage,
      value: current?.ramUsage ?? 0,
      icon: MemoryStick,
      color: "text-gold",
    },
    {
      label: t.admin.serverMonitor.diskUsage,
      value: current?.diskUsage ?? 0,
      icon: HardDrive,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.serverMonitor.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {t.admin.serverMonitor.live}
            </span>
          </p>
        </div>
        {current && statusBadge(Math.max(current.cpuUsage, current.ramUsage, current.diskUsage), t)}
      </div>

      {/* Usage cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                  <Icon className={cn("size-4", c.color)} />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold">{c.value.toFixed(1)}%</span>
                    {statusBadge(c.value, t)}
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn("h-full rounded-full bg-gradient-to-r", usageColor(c.value))}
                      initial={{ width: 0 }}
                      animate={{ width: `${c.value}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t.admin.serverMonitor.last24h}</span>
                    <span>
                      avg {(c.label === t.admin.serverMonitor.cpuUsage ? stats?.avgCpu : c.label === t.admin.serverMonitor.ramUsage ? stats?.avgRam : stats?.avgDisk)?.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="size-4 text-primary" />
            {t.admin.serverMonitor.last24h}
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
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary, hsl(271 91% 65%))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-primary, hsl(271 91% 65%))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-gold, hsl(225 100% 60%))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-gold, hsl(225 100% 60%))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border, 240 5% 90%))",
                      background: "hsl(var(--background, 0 0% 100%))",
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="cpu" name="CPU" stroke="hsl(271 91% 65%)" strokeWidth={2} fill="url(#cpuGrad)" />
                  <Area type="monotone" dataKey="ram" name="RAM" stroke="hsl(225 100% 60%)" strokeWidth={2} fill="url(#ramGrad)" />
                  <Area type="monotone" dataKey="disk" name="Disk" stroke="#f59e0b" strokeWidth={2} fill="url(#diskGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t.admin.serverMonitor.uptime, value: formatUptime(current?.uptime || 0), icon: Zap, color: "text-primary" },
          { label: t.admin.serverMonitor.loadAvg, value: loadArr.join(" · "), icon: Activity, color: "text-gold" },
          { label: t.admin.serverMonitor.processes, value: current?.processes ?? 0, icon: ServerCog, color: "text-amber-500" },
          { label: t.admin.serverMonitor.connections, value: current?.connections ?? 0, icon: Network, color: "text-primary" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <Icon className={cn("size-4", s.color)} />
                  </div>
                  <div className="mt-2 text-lg font-extrabold">{s.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bandwidth */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              {t.admin.serverMonitor.bandwidth} ↓
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-primary">
              {formatBandwidth(current?.bandwidthIn || 0)}
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((current?.bandwidthIn || 0) / 50_000_000) * 100)}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              {t.admin.serverMonitor.bandwidth} ↑
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gold">
              {formatBandwidth(current?.bandwidthOut || 0)}
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gold"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((current?.bandwidthOut || 0) / 20_000_000) * 100)}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
