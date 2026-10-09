"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { Database, Download, HardDrive, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { formatBytes } from "./_utils";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Backup {
  id: string;
  type: string;
  size: number;
  path: string;
  status: string;
  source: string;
  notes: string;
  expiresAt: string | null;
  createdAt: string;
}

function statusBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    queued: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    running: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    completed: "bg-primary/15 text-primary",
    failed: "bg-destructive/15 text-destructive",
  };
  return (
    <Badge className={map[s] || "bg-muted text-muted-foreground"}>
      {t.admin.backups.statuses[s as keyof typeof t.admin.backups.statuses] || s}
    </Badge>
  );
}

function typeBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    full: "bg-primary/15 text-primary",
    database: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    files: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    image: "bg-gold/15 text-gold",
  };
  return (
    <Badge className={map[s] || "bg-muted text-muted-foreground"}>
      {t.admin.backups.types[s as keyof typeof t.admin.backups.types] || s}
    </Badge>
  );
}

export function AdminBackupsManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-backups"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/backups");
      if (!res.ok) return [] as Backup[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Backup[];
    },
  });
  const allItems = (data ?? []) as Backup[];

  const stats = useMemo(() => {
    let totalSize = 0;
    let lastBackup: Date | null = null;
    const completed = allItems.filter((b) => b.status === "completed");
    for (const b of completed) totalSize += b.size || 0;
    for (const b of allItems) {
      const d = new Date(b.createdAt);
      if (!lastBackup || d > lastBackup) lastBackup = d;
    }
    return { total: allItems.length, totalSize, lastBackup };
  }, [allItems]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth("/api/backups", {
        method: "POST",
        body: JSON.stringify({ type: "full", source: "main" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Backup dibuat" : "Backup created");
      queryClient.invalidateQueries({ queryKey: ["admin-backups"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal membuat backup" : "Failed to create backup"),
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/backups?action=restore", {
        method: "PUT",
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Restore failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Backup dipulihkan" : "Backup restored");
      queryClient.invalidateQueries({ queryKey: ["admin-backups"] });
      setRestoreId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal memulihkan" : "Failed to restore"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/backups?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Backup dihapus" : "Backup deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-backups"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  const statCards = [
    { label: locale === "id" ? "Total Backup" : "Total Backups", value: stats.total, color: "text-primary" },
    { label: locale === "id" ? "Total Ukuran" : "Total Size", value: formatBytes(stats.totalSize), color: "text-gold" },
    {
      label: locale === "id" ? "Backup Terakhir" : "Last Backup",
      value: stats.lastBackup ? format(stats.lastBackup, "dd MMM yyyy", { locale: dateLocaleObj }) : "—",
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.backups.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.backups.title}</p>
        </div>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.backups.createNew}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {statCards.map((s, i) => (
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
                  <HardDrive className={cn("size-4", s.color)} />
                </div>
                <div className={cn("mt-2 text-xl font-extrabold", s.color)}>{s.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Database className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.backups.fields.type}</TableHead>
                <TableHead>{t.admin.backups.fields.size}</TableHead>
                <TableHead>{t.admin.backups.fields.status}</TableHead>
                <TableHead>{t.admin.backups.fields.source}</TableHead>
                <TableHead>{t.admin.common.createdAt}</TableHead>
                <TableHead>{t.admin.backups.fields.expiresAt}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allItems.map((b, i) => (
                <motion.tr
                  key={b.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  className="hover:bg-accent/40"
                >
                  <TableCell>{typeBadge(b.type, t)}</TableCell>
                  <TableCell className="font-mono text-sm">{formatBytes(b.size)}</TableCell>
                  <TableCell>{statusBadge(b.status, t)}</TableCell>
                  <TableCell className="text-sm">{b.source || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(b.createdAt), "dd MMM yyyy HH:mm", { locale: dateLocaleObj })}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {b.expiresAt ? format(new Date(b.expiresAt), "dd MMM yyyy", { locale: dateLocaleObj }) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRestoreId(b.id)}
                        aria-label={t.admin.backups.restore}
                        disabled={b.status !== "completed"}
                        className="text-primary"
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          toast.success(locale === "id" ? "Download dimulai" : "Download started");
                        }}
                        aria-label={t.admin.backups.download}
                        disabled={b.status !== "completed"}
                      >
                        <Download className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(b.id)}
                        aria-label={t.admin.common.delete}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
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

      <AlertDialog open={!!restoreId} onOpenChange={(o) => !o && setRestoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.backups.restore}?</AlertDialogTitle>
            <AlertDialogDescription>{t.admin.common.noData}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.admin.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreId && restoreMutation.mutate(restoreId)}
              className="bg-brand-gradient text-primary-foreground"
            >
              <RotateCcw className="size-4" />
              {t.admin.backups.restore}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
