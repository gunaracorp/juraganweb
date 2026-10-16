"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { ExternalLink, GitBranch, Pencil, Plus, Rocket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Staging {
  id: string;
  name: string;
  domain: string;
  sourceDomain: string;
  branch: string;
  status: string;
  deployUrl: string | null;
  lastDeploy: string | null;
  autoSync: boolean;
  createdAt: string;
}

function statusBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    idle: "bg-muted text-muted-foreground",
    deploying: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    running: "bg-primary/15 text-primary",
    error: "bg-destructive/15 text-destructive",
  };
  return (
    <Badge className={map[s] || "bg-muted text-muted-foreground"}>
      {t.admin.staging.statuses[s as keyof typeof t.admin.staging.statuses] || s}
    </Badge>
  );
}

export function AdminStagingManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Staging | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    name: "",
    domain: "",
    sourceDomain: "",
    branch: "main",
    autoSync: false,
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-staging"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/staging");
      if (!res.ok) return [] as Staging[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Staging[];
    },
    refetchInterval: 5000,
  });
  const allItems = (data ?? []) as Staging[];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }
  function openEdit(s: Staging) {
    setEditing(s);
    setForm({
      name: s.name,
      domain: s.domain,
      sourceDomain: s.sourceDomain || "",
      branch: s.branch || "main",
      autoSync: s.autoSync,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const res = await fetchWithAuth("/api/staging", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item;
      }
      const res = await fetchWithAuth("/api/staging", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Staging tersimpan" : "Staging saved");
      queryClient.invalidateQueries({ queryKey: ["admin-staging"] });
      setDialogOpen(false);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save"),
  });

  const deployMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/staging?action=deploy", {
        method: "PUT",
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Deploy failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Deploy dimulai" : "Deploy started");
      queryClient.invalidateQueries({ queryKey: ["admin-staging"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal mendeploy" : "Failed to deploy"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/staging?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Staging dihapus" : "Staging deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-staging"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.staging.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.staging.title}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.staging.addNew}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <GitBranch className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.staging.fields.name}</TableHead>
                <TableHead>{t.admin.staging.fields.domain}</TableHead>
                <TableHead>{t.admin.staging.fields.sourceDomain}</TableHead>
                <TableHead>{t.admin.staging.fields.branch}</TableHead>
                <TableHead>{t.admin.staging.fields.status}</TableHead>
                <TableHead>{t.admin.staging.fields.deployUrl}</TableHead>
                <TableHead>{t.admin.staging.fields.lastDeploy}</TableHead>
                <TableHead className="text-center">{t.admin.staging.fields.autoSync}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allItems.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  className="hover:bg-accent/40"
                >
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="font-mono text-sm">{s.domain}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{s.sourceDomain || "—"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 font-mono text-xs">
                      <GitBranch className="size-3" />
                      {s.branch}
                    </span>
                  </TableCell>
                  <TableCell>{statusBadge(s.status, t)}</TableCell>
                  <TableCell>
                    {s.deployUrl ? (
                      <a
                        href={s.deployUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        <span className="max-w-[160px] truncate">{s.deployUrl}</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.lastDeploy ? format(new Date(s.lastDeploy), "dd MMM yyyy HH:mm", { locale: dateLocaleObj }) : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch checked={s.autoSync} disabled aria-label={t.admin.staging.fields.autoSync} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deployMutation.mutate(s.id)}
                        disabled={deployMutation.isPending || s.status === "deploying"}
                        aria-label={t.admin.staging.deployNow}
                        className="text-primary"
                      >
                        <Rocket className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(s)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(s.id)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.admin.common.edit : t.admin.staging.addNew}
            </DialogTitle>
            <DialogDescription>{t.admin.staging.title}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label>{t.admin.staging.fields.name}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.staging.fields.domain}</Label>
                <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="font-mono" placeholder="staging.example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.staging.fields.sourceDomain}</Label>
                <Input value={form.sourceDomain} onChange={(e) => setForm({ ...form, sourceDomain: e.target.value })} className="font-mono" placeholder="example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.staging.fields.branch}</Label>
                <Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="font-mono" />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <Label className="font-medium">{t.admin.staging.fields.autoSync}</Label>
                <Switch checked={form.autoSync} onCheckedChange={(v) => setForm({ ...form, autoSync: v })} />
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
