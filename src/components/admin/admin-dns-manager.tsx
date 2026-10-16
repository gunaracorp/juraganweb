"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Globe, Pencil, Plus, Search, Trash2 } from "lucide-react";
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

interface DNS {
  id: string;
  domain: string;
  type: string;
  name: string;
  value: string;
  priority: number | null;
  ttl: number;
  enabled: boolean;
  createdAt: string;
}

const TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA"] as const;

function typeColor(type: string) {
  const map: Record<string, string> = {
    A: "bg-primary/15 text-primary",
    AAAA: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    CNAME: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    MX: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    TXT: "bg-gold/15 text-gold",
    NS: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    SRV: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    CAA: "bg-muted text-muted-foreground",
  };
  return map[type] || "bg-muted text-muted-foreground";
}

export function AdminDNSManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();

  const [domain, setDomain] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DNS | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    domain: "",
    type: "A" as string,
    name: "@",
    value: "",
    priority: 0,
    ttl: 3600,
    enabled: true,
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dns", domain],
    queryFn: async () => {
      const url = domain ? `/api/dns?domain=${encodeURIComponent(domain)}` : "/api/dns";
      const res = await fetchWithAuth(url);
      if (!res.ok) return [] as DNS[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as DNS[];
    },
  });
  const allItems = (data ?? []) as DNS[];

  const domains = useMemo(() => {
    const set = new Set<string>();
    for (const r of allItems) set.add(r.domain);
    return Array.from(set);
  }, [allItems]);

  const list = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.value.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q),
    );
  }, [allItems, search]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, domain: domain || "" });
    setDialogOpen(true);
  }
  function openEdit(r: DNS) {
    setEditing(r);
    setForm({
      domain: r.domain,
      type: TYPES.includes(r.type as any) ? r.type : "A",
      name: r.name,
      value: r.value,
      priority: r.priority ?? 0,
      ttl: r.ttl || 3600,
      enabled: r.enabled,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        priority: ["MX", "SRV"].includes(form.type) ? Number(form.priority) : null,
        ttl: Number(form.ttl),
      };
      if (editing) {
        const res = await fetchWithAuth("/api/dns", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item;
      }
      const res = await fetchWithAuth("/api/dns", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "DNS record tersimpan" : "DNS record saved");
      queryClient.invalidateQueries({ queryKey: ["admin-dns"] });
      setDialogOpen(false);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/dns?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "DNS record dihapus" : "DNS record deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-dns"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.dns.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.dns.title}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.dns.addNew}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDomain("")}
            className={
              "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors " +
              (domain === ""
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent")
            }
          >
            {locale === "id" ? "Semua" : "All"}
          </button>
          {domains.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDomain(d)}
              className={
                "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors " +
                (domain === d
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-accent")
              }
            >
              {d}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.admin.common.search}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Globe className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.dns.fields.type}</TableHead>
                <TableHead>{t.admin.dns.fields.name}</TableHead>
                <TableHead>{t.admin.dns.fields.value}</TableHead>
                <TableHead className="text-center">{t.admin.dns.fields.priority}</TableHead>
                <TableHead className="text-center">TTL</TableHead>
                <TableHead className="text-center">{t.admin.dns.fields.enabled}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  className="hover:bg-accent/40"
                >
                  <TableCell>
                    <Badge className={typeColor(r.type)}>{r.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.domain}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{r.value}</TableCell>
                  <TableCell className="text-center text-sm">{r.priority ?? "—"}</TableCell>
                  <TableCell className="text-center text-sm">{r.ttl}s</TableCell>
                  <TableCell className="text-center">
                    <Switch checked={r.enabled} disabled aria-label={t.admin.dns.fields.enabled} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(r)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(r.id)}
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
              {editing ? t.admin.common.edit : t.admin.dns.addNew}
            </DialogTitle>
            <DialogDescription>{t.admin.dns.title}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t.admin.dns.fields.domain}</Label>
                <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.dns.fields.type}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((tp) => (
                      <SelectItem key={tp} value={tp}>
                        {t.admin.dns.types[tp as keyof typeof t.admin.dns.types] || tp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.dns.fields.name}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="@ or www" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.dns.fields.value}</Label>
                <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="font-mono text-sm" placeholder="192.168.1.1" />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.dns.fields.priority}</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                  disabled={!["MX", "SRV"].includes(form.type)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.dns.fields.ttl}</Label>
                <Input
                  type="number"
                  value={form.ttl}
                  onChange={(e) => setForm({ ...form, ttl: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3 sm:col-span-2">
                <Label className="font-medium">{t.admin.dns.fields.enabled}</Label>
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
