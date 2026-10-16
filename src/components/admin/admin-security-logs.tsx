"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface SecurityLog {
  id: string;
  type: string;
  username: string | null;
  ip: string | null;
  location: string | null;
  userAgent: string | null;
  details: string;
  severity: string;
  createdAt: string;
}

const SEVERITIES = ["info", "warning", "critical"] as const;
const TYPES = [
  "login_success",
  "login_failed",
  "2fa_enabled",
  "2fa_disabled",
  "password_changed",
  "ip_blocked",
  "ip_whitelisted",
  "suspicious_activity",
];

function severityIcon(s: string) {
  if (s === "critical") return ShieldAlert;
  if (s === "warning") return AlertTriangle;
  if (s === "info") return Info;
  return ShieldCheck;
}

function severityColor(s: string) {
  if (s === "critical") return "bg-destructive/15 text-destructive";
  if (s === "warning") return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
}

export function AdminSecurityLogs() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [type, setType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-security-logs", type, severity],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type !== "all") params.set("type", type);
      if (severity !== "all") params.set("severity", severity);
      const url = `/api/security-logs${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetchWithAuth(url);
      if (!res.ok) return [] as SecurityLog[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as SecurityLog[];
    },
  });
  const allItems = (data ?? []) as SecurityLog[];

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let critical = 0, warning = 0, todayCount = 0;
    for (const l of allItems) {
      if (l.severity === "critical") critical++;
      else if (l.severity === "warning") warning++;
      if (l.createdAt && l.createdAt.slice(0, 10) === today) todayCount++;
    }
    return { total: allItems.length, critical, warning, today: todayCount };
  }, [allItems]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/security-logs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Log dihapus" : "Log deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-security-logs"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  const statCards = [
    { label: locale === "id" ? "Total Event" : "Total Events", value: stats.total, color: "text-primary", icon: ShieldCheck },
    { label: t.admin.securityLogs.severities.critical, value: stats.critical, color: "text-destructive", icon: ShieldAlert },
    { label: t.admin.securityLogs.severities.warning, value: stats.warning, color: "text-amber-500", icon: AlertTriangle },
    { label: locale === "id" ? "Hari Ini" : "Today", value: stats.today, color: "text-gold", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">{t.admin.securityLogs.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin.securityLogs.title}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s, i) => {
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
                  <div className={cn("mt-2 text-xl font-extrabold", s.color)}>{s.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "id" ? "Semua Tipe" : "All Types"}</SelectItem>
            {TYPES.map((tp) => (
              <SelectItem key={tp} value={tp}>
                {t.admin.securityLogs.types[tp as keyof typeof t.admin.securityLogs.types] || tp}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "id" ? "Semua Tingkat" : "All Severities"}</SelectItem>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s}>
                {t.admin.securityLogs.severities[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <ShieldCheck className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.securityLogs.fields.type}</TableHead>
                <TableHead>{t.admin.securityLogs.fields.username}</TableHead>
                <TableHead>{t.admin.securityLogs.fields.ip}</TableHead>
                <TableHead>{t.admin.securityLogs.fields.location}</TableHead>
                <TableHead>{t.admin.securityLogs.fields.details}</TableHead>
                <TableHead>{t.admin.securityLogs.fields.severity}</TableHead>
                <TableHead>{t.admin.common.createdAt}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allItems.slice(0, 100).map((l, i) => {
                const Icon = severityIcon(l.severity);
                return (
                  <motion.tr
                    key={l.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.012, 0.4) }}
                    className="hover:bg-accent/40"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className={cn(
                          "size-4",
                          l.severity === "critical" ? "text-destructive" : l.severity === "warning" ? "text-amber-500" : "text-blue-500",
                        )} />
                        <span className="text-sm">
                          {t.admin.securityLogs.types[l.type as keyof typeof t.admin.securityLogs.types] || l.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{l.username || "—"}</TableCell>
                    <TableCell className="text-sm font-mono">{l.ip || "—"}</TableCell>
                    <TableCell className="text-xs">{l.location || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{l.details}</TableCell>
                    <TableCell>
                      <Badge className={severityColor(l.severity)}>
                        {t.admin.securityLogs.severities[l.severity as keyof typeof t.admin.securityLogs.severities] || l.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(l.createdAt), { addSuffix: true, locale: dateLocaleObj })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(l.id)}
                        aria-label={t.admin.common.delete}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.common.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>{t.admin.common.noData}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.admin.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive"
            >
              {t.admin.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
