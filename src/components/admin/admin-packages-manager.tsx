"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Package,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { slugify } from "./_utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
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

interface Pkg {
  id: string;
  slug: string;
  nameId: string;
  nameEn: string;
  descId: string;
  descEn: string;
  category: string;
  price: number;
  priceYearly: number;
  setupFee: number;
  currency: string;
  billingCycle: string;
  features: string[];
  specs: Record<string, unknown>;
  popular: boolean;
  featured: boolean;
  active: boolean;
  order: number;
  maxOrders: number;
  stock: number;
  createdAt: string;
}

const CATEGORIES = ["hosting", "vps", "cloud", "domain", "ssl", "email", "wordpress"] as const;
const CYCLES = ["monthly", "yearly", "one-time"] as const;

const fmtRp = (v: number) => `Rp ${(v || 0).toLocaleString("id-ID")}`;

export function AdminPackagesManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nameId: "",
    nameEn: "",
    descId: "",
    descEn: "",
    slug: "",
    category: "hosting",
    price: 0,
    priceYearly: 0,
    setupFee: 0,
    billingCycle: "monthly",
    features: "",
    specs: "{}",
    popular: false,
    featured: false,
    active: true,
    order: 0,
    maxOrders: 0,
    stock: -1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/packages?admin=true");
      if (!res.ok) return [] as Pkg[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Pkg[];
    },
  });

  const allItems = (data ?? []) as Pkg[];

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: allItems.length };
    for (const c of CATEGORIES) map[c] = 0;
    for (const p of allItems) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    return map;
  }, [allItems]);

  const list = useMemo(() => {
    let arr = allItems;
    if (category !== "all") arr = arr.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.nameId.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q),
      );
    }
    return [...arr].sort((a, b) => a.order - b.order);
  }, [allItems, category, search]);

  function openCreate() {
    setEditing(null);
    setForm({
      nameId: "",
      nameEn: "",
      descId: "",
      descEn: "",
      slug: "",
      category: "hosting",
      price: 0,
      priceYearly: 0,
      setupFee: 0,
      billingCycle: "monthly",
      features: "",
      specs: "{}",
      popular: false,
      featured: false,
      active: true,
      order: 0,
      maxOrders: 0,
      stock: -1,
    });
    setDialogOpen(true);
  }

  function openEdit(p: Pkg) {
    setEditing(p);
    setForm({
      nameId: p.nameId,
      nameEn: p.nameEn,
      descId: p.descId,
      descEn: p.descEn,
      slug: p.slug,
      category: (CATEGORIES.includes(p.category as any) ? p.category : "hosting") as string,
      price: p.price,
      priceYearly: p.priceYearly,
      setupFee: p.setupFee,
      billingCycle: (CYCLES.includes(p.billingCycle as any) ? p.billingCycle : "monthly") as string,
      features: Array.isArray(p.features) ? p.features.join(" | ") : "",
      specs: typeof p.specs === "object" ? JSON.stringify(p.specs, null, 2) : "{}",
      popular: p.popular,
      featured: p.featured,
      active: p.active,
      order: p.order,
      maxOrders: p.maxOrders,
      stock: p.stock,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.nameId || form.nameEn),
        price: Number(form.price),
        priceYearly: Number(form.priceYearly),
        setupFee: Number(form.setupFee),
        order: Number(form.order),
        maxOrders: Number(form.maxOrders),
        stock: Number(form.stock),
        features: form.features
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean),
        specs: (() => {
          try {
            return JSON.parse(form.specs || "{}");
          } catch {
            return {};
          }
        })(),
      };
      if (editing) {
        const res = await fetchWithAuth("/api/packages", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item as Pkg;
      }
      const res = await fetchWithAuth("/api/packages", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item as Pkg;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Paket tersimpan" : "Package saved");
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      setDialogOpen(false);
    },
    onError: () =>
      toast.error(locale === "id" ? "Gagal menyimpan paket" : "Failed to save package"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/packages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Paket dinonaktifkan" : "Package deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  const cats: { key: string; label: string }[] = [
    { key: "all", label: locale === "id" ? "Semua" : "All" },
    ...CATEGORIES.map((c) => ({ key: c, label: t.admin.packages.categories[c] })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.packages.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${counts.all} paket ditemukan`
              : `${counts.all} packages found`}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.packages.addNew}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.admin.common.search}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {cats.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                category === c.key
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background hover:bg-accent",
              )}
            >
              {c.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs font-semibold",
                  category === c.key
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {counts[c.key] || 0}
              </span>
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
          <Package className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
          <Button onClick={openCreate} variant="outline" size="sm" className="mt-4">
            <Plus className="size-4" />
            {t.admin.packages.addNew}
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.packages.fields.nameId}</TableHead>
                <TableHead>{t.admin.packages.fields.category}</TableHead>
                <TableHead>{t.admin.packages.fields.price}</TableHead>
                <TableHead>{t.admin.packages.fields.billingCycle}</TableHead>
                <TableHead className="text-center">Badges</TableHead>
                <TableHead className="text-center">{t.admin.common.status}</TableHead>
                <TableHead className="text-center">{t.admin.packages.fields.order}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  className="hover:bg-accent/40"
                >
                  <TableCell className="font-medium">
                    <div>{locale === "id" ? p.nameId || p.nameEn : p.nameEn || p.nameId}</div>
                    <div className="text-xs text-muted-foreground">/{p.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.admin.packages.categories[p.category as keyof typeof t.admin.packages.categories] || p.category}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{fmtRp(p.price)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {t.admin.packages.cycles[p.billingCycle as keyof typeof t.admin.packages.cycles] || p.billingCycle}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      {p.popular && (
                        <Badge className="bg-gold/20 text-gold">★</Badge>
                      )}
                      {p.featured && (
                        <Badge className="bg-primary/15 text-primary">
                          <Star className="size-3" />
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {p.active ? (
                      <Badge className="bg-primary/15 text-primary">{t.admin.common.active}</Badge>
                    ) : (
                      <Badge variant="secondary">{t.admin.common.inactive}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm">{p.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(p)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(p.id)}
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

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.admin.packages.editTitle : t.admin.packages.addNew}
            </DialogTitle>
            <DialogDescription>{t.admin.packages.allPackages}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t.admin.packages.fields.nameId}</Label>
                <Input
                  value={form.nameId}
                  onChange={(e) => setForm({ ...form, nameId: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.packages.fields.nameEn}</Label>
                <Input
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.packages.fields.descId}</Label>
                <Textarea
                  value={form.descId}
                  rows={2}
                  onChange={(e) => setForm({ ...form, descId: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.packages.fields.descEn}</Label>
                <Textarea
                  value={form.descEn}
                  rows={2}
                  onChange={(e) => setForm({ ...form, descEn: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.packages.fields.slug}</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder={slugify(form.nameId || form.nameEn)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.packages.fields.category}</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {t.admin.packages.categories[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.packages.fields.price}</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.packages.fields.priceYearly}</Label>
                <Input
                  type="number"
                  value={form.priceYearly}
                  onChange={(e) => setForm({ ...form, priceYearly: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.packages.fields.setupFee}</Label>
                <Input
                  type="number"
                  value={form.setupFee}
                  onChange={(e) => setForm({ ...form, setupFee: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.packages.fields.billingCycle}</Label>
                <Select
                  value={form.billingCycle}
                  onValueChange={(v) => setForm({ ...form, billingCycle: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CYCLES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {t.admin.packages.cycles[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.packages.fields.order}</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.packages.fields.maxOrders}</Label>
                <Input
                  type="number"
                  value={form.maxOrders}
                  onChange={(e) => setForm({ ...form, maxOrders: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.packages.fields.stock}</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.packages.fields.features}</Label>
                <Textarea
                  value={form.features}
                  rows={3}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="10GB SSD | 100GB Bandwidth | Free SSL"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.packages.fields.specs}</Label>
                <Textarea
                  value={form.specs}
                  rows={4}
                  onChange={(e) => setForm({ ...form, specs: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3 sm:col-span-2">
                <div>
                  <Label className="font-medium">{t.admin.packages.fields.popular}</Label>
                </div>
                <Switch
                  checked={form.popular}
                  onCheckedChange={(v) => setForm({ ...form, popular: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3 sm:col-span-2">
                <div>
                  <Label className="font-medium">{t.admin.packages.fields.featured}</Label>
                </div>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3 sm:col-span-2">
                <div>
                  <Label className="font-medium">{t.admin.packages.fields.active}</Label>
                </div>
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
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

      {/* Delete confirm */}
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
