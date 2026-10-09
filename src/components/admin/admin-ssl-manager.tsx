"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { differenceInDays, format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { Lock, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
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

interface Cert {
  id: string;
  domain: string;
  type: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  autoRenew: boolean;
  status: string;
  createdAt: string;
}

const TYPES = ["dv", "ov", "ev", "wildcard"] as const;

function statusBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    active: "bg-primary/15 text-primary",
    expired: "bg-destructive/15 text-destructive",
    pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    revoked: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={map[s] || "bg-muted text-muted-foreground"}>
      {t.admin.ssl.statuses[s as keyof typeof t.admin.ssl.statuses] || s}
    </Badge>
  );
}

export function AdminSSLManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cert | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    domain: "",
    type: "dv" as string,
    issuer: "Let's Encrypt",
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: "",
    autoRenew: true,
    status: "active" as string,
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ssl-certs"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/ssl-certs");
      if (!res.ok) return [] as Cert[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Cert[];
    },
  });
  const allItems = (data ?? []) as Cert[];

  const stats = useMemo(() => {
    const now = new Date();
    let active = 0, expiringSoon = 0, expired = 0;
    for (const c of allItems) {
      if (c.status === "active" && c.validTo) {
        const days = differenceInDays(new Date(c.validTo), now);
        if (days < 0) expired++;
        else if (days < 30) expiringSoon++;
        else active++;
      } else if (c.status === "expired") expired++;
    }
    return { total: allItems.length, active, expiringSoon, expired };
  }, [allItems]);

  const list = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter(
      (c) => c.domain.toLowerCase().includes(q) || (c.issuer || "").toLowerCase().includes(q),
    );
  }, [allItems, search]);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    setDialogOpen(true);
  }
  function openEdit(c: Cert) {
    setEditing(c);
    setForm({
      domain: c.domain,
      type: TYPES.includes(c.type as any) ? c.type : "dv",
      issuer: c.issuer || "Let's Encrypt",
      validFrom: c.validFrom ? c.validFrom.slice(0, 10) : "",
      validTo: c.validTo ? c.validTo.slice(0, 10) : "",
      autoRenew: c.autoRenew,
      status: c.status,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
        validTo: form.validTo ? new Date(form.validTo).toISOString() : null,
      };
      if (editing) {
        const res = await fetchWithAuth("/api/ssl-certs", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item;
      }
      const res = await fetchWithAuth("/api/ssl-certs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "SSL tersimpan" : "SSL saved");
      queryClient.invalidateQueries({ queryKey: ["admin-ssl-certs"] });
      setDialogOpen(false);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save"),
  });

  const renewMutation = useMutation({
    mutationFn: async (c: Cert) => {
      const newTo = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetchWithAuth("/api/ssl-certs", {
        method: "PUT",
        body: JSON.stringify({ id: c.id, validFrom: new Date().toISOString(), validTo: newTo, status: "active" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Renew failed");
      return c.id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "SSL diperbarui" : "SSL renewed");
      queryClient.invalidateQueries({ queryKey: ["admin-ssl-certs"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal memperbarui" : "Failed to renew"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/ssl-certs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "SSL dihapus" : "SSL deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-ssl-certs"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  const statCards = [
    { label: locale === "id" ? "Aktif" : "Active", value: stats.active, color: "text-primary" },
    { label: t.admin.ssl.renewingSoon, value: stats.expiringSoon, color: "text-amber-500" },
    { label: t.admin.ssl.statuses.expired, value: stats.expired, color: "text-destructive" },
    { label: locale === "id" ? "Total" : "Total", value: stats.total, color: "text-gold" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.ssl.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.ssl.title}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.ssl.addNew}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <div className={cn("mt-2 text-xl font-extrabold", s.color)}>{s.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
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
          <Lock className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.ssl.fields.domain}</TableHead>
                <TableHead>{t.admin.ssl.fields.type}</TableHead>
                <TableHead>{t.admin.ssl.fields.issuer}</TableHead>
                <TableHead>{t.admin.ssl.fields.validFrom}</TableHead>
                <TableHead>{t.admin.ssl.fields.validTo}</TableHead>
                <TableHead className="text-center">{t.admin.ssl.fields.autoRenew}</TableHead>
                <TableHead>{t.admin.ssl.fields.status}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c, i) => {
                const daysLeft = c.validTo ? differenceInDays(new Date(c.validTo), new Date()) : 999;
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.025, 0.4) }}
                    className="hover:bg-accent/40"
                  >
                    <TableCell className="font-medium">{c.domain}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t.admin.ssl.types[c.type as keyof typeof t.admin.ssl.types] || c.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{c.issuer || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.validFrom ? format(new Date(c.validFrom), "dd MMM yyyy", { locale: dateLocaleObj }) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {c.validTo ? format(new Date(c.validTo), "dd MMM yyyy", { locale: dateLocaleObj }) : "—"}
                      </div>
                      {c.status === "active" && daysLeft < 30 && (
                        <Badge className="mt-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          {daysLeft}d
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={c.autoRenew} disabled aria-label={t.admin.ssl.fields.autoRenew} />
                    </TableCell>
                    <TableCell>{statusBadge(c.status, t)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => renewMutation.mutate(c)}
                          disabled={renewMutation.isPending}
                          aria-label={t.admin.ssl.renewNow}
                          className="text-primary"
                        >
                          <RefreshCw className="size-4" />
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.admin.common.edit : t.admin.ssl.addNew}
            </DialogTitle>
            <DialogDescription>{t.admin.ssl.title}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.ssl.fields.domain}</Label>
                <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.ssl.fields.type}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((tp) => (
                      <SelectItem key={tp} value={tp}>
                        {t.admin.ssl.types[tp]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.ssl.fields.status}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.admin.ssl.statuses.active}</SelectItem>
                    <SelectItem value="pending">{t.admin.ssl.statuses.pending}</SelectItem>
                    <SelectItem value="expired">{t.admin.ssl.statuses.expired}</SelectItem>
                    <SelectItem value="revoked">{t.admin.ssl.statuses.revoked}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.ssl.fields.issuer}</Label>
                <Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.ssl.fields.validFrom}</Label>
                <Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.ssl.fields.validTo}</Label>
                <Input type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3 sm:col-span-2">
                <Label className="font-medium">{t.admin.ssl.fields.autoRenew}</Label>
                <Switch checked={form.autoRenew} onCheckedChange={(v) => setForm({ ...form, autoRenew: v })} />
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

void ShieldCheck;
