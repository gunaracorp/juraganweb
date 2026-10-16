"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { Clock, Play, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface CronJob {
  id: string;
  name: string;
  command: string;
  schedule: string;
  description: string;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  lastStatus: string | null;
  lastOutput: string | null;
  createdAt: string;
}

const SCHEDULES = [
  { key: "every5min", label: "every5min", value: "*/5 * * * *" },
  { key: "hourly", label: "hourly", value: "0 * * * *" },
  { key: "daily", label: "daily", value: "0 0 * * *" },
  { key: "weekly", label: "weekly", value: "0 0 * * 0" },
  { key: "monthly", label: "monthly", value: "0 0 1 * *" },
] as const;

function statusBadge(s: string | null) {
  if (!s) return <Badge variant="secondary">—</Badge>;
  if (s === "success")
    return <Badge className="bg-primary/15 text-primary">OK</Badge>;
  if (s === "failed")
    return <Badge className="bg-destructive/15 text-destructive">ERR</Badge>;
  return <Badge variant="outline">{s}</Badge>;
}

export function AdminCronManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CronJob | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    name: "",
    command: "",
    schedule: "0 * * * *",
    description: "",
    enabled: true,
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-cron"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/cron");
      if (!res.ok) return [] as CronJob[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as CronJob[];
    },
  });
  const allItems = (data ?? []) as CronJob[];

  const list = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter(
      (c) => c.name.toLowerCase().includes(q) || c.command.toLowerCase().includes(q),
    );
  }, [allItems, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }
  function openEdit(c: CronJob) {
    setEditing(c);
    setForm({
      name: c.name,
      command: c.command,
      schedule: c.schedule,
      description: c.description || "",
      enabled: c.enabled,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const res = await fetchWithAuth("/api/cron", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item;
      }
      const res = await fetchWithAuth("/api/cron", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Cron job tersimpan" : "Cron job saved");
      queryClient.invalidateQueries({ queryKey: ["admin-cron"] });
      setDialogOpen(false);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/cron?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Cron job dihapus" : "Cron job deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-cron"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  const runNowMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/cron", {
        method: "PUT",
        body: JSON.stringify({
          id,
          lastRun: new Date().toISOString(),
          lastStatus: "success",
          lastOutput: "Manual run triggered (mock)",
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Run failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Cron job dijalankan" : "Cron job triggered");
      queryClient.invalidateQueries({ queryKey: ["admin-cron"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal menjalankan" : "Failed to run"),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.cron.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.cron.title}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.cron.addNew}
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.admin.common.search}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Clock className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.cron.fields.name}</TableHead>
                <TableHead>{t.admin.cron.fields.command}</TableHead>
                <TableHead>{t.admin.cron.fields.schedule}</TableHead>
                <TableHead className="text-center">{t.admin.cron.fields.enabled}</TableHead>
                <TableHead>{t.admin.cron.fields.lastRun}</TableHead>
                <TableHead>{t.admin.cron.fields.nextRun}</TableHead>
                <TableHead className="text-center">{t.admin.cron.fields.lastStatus}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  className="hover:bg-accent/40"
                >
                  <TableCell className="font-medium">
                    <div>{c.name}</div>
                    {c.description && (
                      <div className="text-xs text-muted-foreground">{c.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{c.command}</code>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{c.schedule}</code>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch checked={c.enabled} disabled aria-label={t.admin.cron.fields.enabled} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.lastRun ? format(new Date(c.lastRun), "dd MMM yyyy HH:mm", { locale: dateLocaleObj }) : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.nextRun ? format(new Date(c.nextRun), "dd MMM yyyy HH:mm", { locale: dateLocaleObj }) : "—"}
                  </TableCell>
                  <TableCell className="text-center">{statusBadge(c.lastStatus)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => runNowMutation.mutate(c.id)}
                        aria-label={locale === "id" ? "Jalankan" : "Run"}
                        className="text-primary"
                      >
                        <Play className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(c)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(c.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.admin.common.edit : t.admin.cron.addNew}
            </DialogTitle>
            <DialogDescription>{t.admin.cron.title}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label>{t.admin.cron.fields.name}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.cron.fields.command}</Label>
                <Input
                  value={form.command}
                  onChange={(e) => setForm({ ...form, command: e.target.value })}
                  className="font-mono text-sm"
                  placeholder="php /var/www/artisan schedule:run"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.cron.fields.schedule}</Label>
                <Input
                  value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                  className="font-mono text-sm"
                  placeholder="0 * * * *"
                />
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {SCHEDULES.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setForm({ ...form, schedule: s.value })}
                      className={cn(
                        "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                        form.schedule === s.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent",
                      )}
                    >
                      {t.admin.cron.commonSchedules[s.key as keyof typeof t.admin.cron.commonSchedules]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.cron.fields.description}</Label>
                <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <Label className="font-medium">{t.admin.cron.fields.enabled}</Label>
                <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.admin.common.cancel}
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-brand-gradient text-primary-foreground"
            >
              {t.admin.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
