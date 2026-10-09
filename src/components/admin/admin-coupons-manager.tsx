"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { Pencil, Plus, Search, Ticket, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  used: number;
  validFrom: string | null;
  validTo: string | null;
  status: string;
  appliesTo: string | null;
  createdAt: string;
}

const TYPES = ["percent", "fixed"] as const;
const STATUSES = ["active", "expired", "disabled"] as const;

const fmtRp = (v: number) => `Rp ${(v || 0).toLocaleString("id-ID")}`;

function statusBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    active: "bg-primary/15 text-primary",
    expired: "bg-destructive/15 text-destructive",
    disabled: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={map[s] || "bg-muted text-muted-foreground"}>
      {t.admin.coupons.statuses[s as keyof typeof t.admin.coupons.statuses] || s}
    </Badge>
  );
}

export function AdminCouponsManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    code: "",
    type: "percent" as string,
    value: 10,
    minOrder: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: "",
    validTo: "",
    status: "active" as string,
    appliesTo: "",
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/coupons");
      if (!res.ok) return [] as Coupon[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Coupon[];
    },
  });
  const allItems = (data ?? []) as Coupon[];

  const list = useMemo(() => {
    let arr = allItems;
    if (status !== "all") arr = arr.filter((c) => c.status === status);
    if (search.trim()) {
      const q = search.toUpperCase();
      arr = arr.filter((c) => c.code.toUpperCase().includes(q));
    }
    return arr;
  }, [allItems, status, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    setForm({
      code: c.code,
      type: TYPES.includes(c.type as any) ? c.type : "percent",
      value: c.value,
      minOrder: c.minOrder,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      validFrom: c.validFrom ? c.validFrom.slice(0, 10) : "",
      validTo: c.validTo ? c.validTo.slice(0, 10) : "",
      status: STATUSES.includes(c.status as any) ? c.status : "active",
      appliesTo: c.appliesTo || "",
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        value: Number(form.value),
        minOrder: Number(form.minOrder),
        maxDiscount: Number(form.maxDiscount),
        usageLimit: Number(form.usageLimit),
        validFrom: form.validFrom || null,
        validTo: form.validTo || null,
        appliesTo: form.appliesTo || null,
      };
      if (editing) {
        const res = await fetchWithAuth("/api/coupons", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item;
      }
      const res = await fetchWithAuth("/api/coupons", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Kupon tersimpan" : "Coupon saved");
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setDialogOpen(false);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/coupons?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Kupon dihapus" : "Coupon deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  const filters = [
    { key: "all", label: locale === "id" ? "Semua" : "All" },
    ...STATUSES.map((s) => ({ key: s, label: t.admin.coupons.statuses[s] })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.coupons.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.coupons.title}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.coupons.addNew}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.admin.common.search}
            className="pl-9 font-mono"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatus(f.key)}
              className={cn(
                "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors",
                status === f.key
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background hover:bg-accent",
              )}
            >
              {f.label}
            </button>
          ))}
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
          <Ticket className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.coupons.fields.code}</TableHead>
                <TableHead>{t.admin.coupons.fields.type}</TableHead>
                <TableHead>{t.admin.coupons.fields.value}</TableHead>
                <TableHead>{t.admin.coupons.fields.minOrder}</TableHead>
                <TableHead>{t.admin.coupons.fields.used} / {t.admin.coupons.fields.usageLimit}</TableHead>
                <TableHead>{t.admin.coupons.fields.validFrom} → {t.admin.coupons.fields.validTo}</TableHead>
                <TableHead>{t.admin.common.status}</TableHead>
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
                  <TableCell className="font-mono font-bold">{c.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t.admin.coupons.types[c.type as keyof typeof t.admin.coupons.types] || c.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {c.type === "percent" ? `${c.value}%` : fmtRp(c.value)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{fmtRp(c.minOrder)}</TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium">{c.used}</span>
                    <span className="text-muted-foreground"> / {c.usageLimit === 0 ? "∞" : c.usageLimit}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.validFrom ? format(new Date(c.validFrom), "dd MMM yyyy", { locale: dateLocaleObj }) : "—"} →{" "}
                    {c.validTo ? format(new Date(c.validTo), "dd MMM yyyy", { locale: dateLocaleObj }) : "—"}
                  </TableCell>
                  <TableCell>{statusBadge(c.status, t)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.admin.coupons.editTitle : t.admin.coupons.addNew}
            </DialogTitle>
            <DialogDescription>{t.admin.coupons.title}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t.admin.coupons.fields.code}</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="font-mono"
                  placeholder="HEMAT50"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.coupons.fields.type}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((tp) => (
                      <SelectItem key={tp} value={tp}>
                        {t.admin.coupons.types[tp]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.coupons.fields.value}</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.coupons.fields.minOrder}</Label>
                <Input
                  type="number"
                  value={form.minOrder}
                  onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.coupons.fields.maxDiscount}</Label>
                <Input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.coupons.fields.usageLimit}</Label>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.coupons.fields.validFrom}</Label>
                <Input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.coupons.fields.validTo}</Label>
                <Input
                  type="date"
                  value={form.validTo}
                  onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.coupons.fields.status}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t.admin.coupons.statuses[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.coupons.fields.appliesTo}</Label>
                <Input
                  value={form.appliesTo}
                  onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
                  placeholder="hosting, vps, all"
                />
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

void Switch;
