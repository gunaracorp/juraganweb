"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Handshake, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

interface Affiliate {
  id: string;
  code: string;
  name: string;
  email: string;
  commissionRate: number;
  totalClicks: number;
  totalSignups: number;
  totalSales: number;
  totalCommission: number;
  paidOut: number;
  balance: number;
  status: string;
  createdAt: string;
}

const fmtRp = (v: number) => `Rp ${(v || 0).toLocaleString("id-ID")}`;

export function AdminAffiliateManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Affiliate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    code: "",
    name: "",
    email: "",
    commissionRate: 10,
    status: "active" as string,
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-affiliate"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/affiliate");
      if (!res.ok) return [] as Affiliate[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Affiliate[];
    },
  });
  const allItems = (data ?? []) as Affiliate[];

  const stats = useMemo(() => {
    let totalCommission = 0, paidOut = 0, balance = 0;
    for (const a of allItems) {
      totalCommission += a.totalCommission || 0;
      paidOut += a.paidOut || 0;
      balance += a.balance || 0;
    }
    return { total: allItems.length, totalCommission, paidOut, balance };
  }, [allItems]);

  const list = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter(
      (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.code.toLowerCase().includes(q),
    );
  }, [allItems, search]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, code: Math.random().toString(36).slice(2, 10).toUpperCase() });
    setDialogOpen(true);
  }
  function openEdit(a: Affiliate) {
    setEditing(a);
    setForm({
      code: a.code,
      name: a.name,
      email: a.email,
      commissionRate: a.commissionRate,
      status: a.status,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, commissionRate: Number(form.commissionRate) };
      if (editing) {
        const res = await fetchWithAuth("/api/affiliate", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item;
      }
      const res = await fetchWithAuth("/api/affiliate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Afiliasi tersimpan" : "Affiliate saved");
      queryClient.invalidateQueries({ queryKey: ["admin-affiliate"] });
      setDialogOpen(false);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/affiliate?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Afiliasi dihapus" : "Affiliate deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-affiliate"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  const statCards = [
    { label: t.admin.affiliate.title, value: stats.total, color: "text-primary" },
    { label: t.admin.affiliate.fields.totalCommission, value: fmtRp(stats.totalCommission), color: "text-gold" },
    { label: t.admin.affiliate.fields.paidOut, value: fmtRp(stats.paidOut), color: "text-emerald-500" },
    { label: t.admin.affiliate.fields.balance, value: fmtRp(stats.balance), color: "text-amber-500" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.affiliate.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.affiliate.title}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.affiliate.addNew}
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
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <Users className={cn("size-4", s.color)} />
                </div>
                <div className={cn("mt-2 text-lg font-extrabold", s.color)}>{s.value}</div>
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
          <Handshake className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.affiliate.fields.code}</TableHead>
                <TableHead>{t.admin.affiliate.fields.name}</TableHead>
                <TableHead className="text-center">{t.admin.affiliate.fields.commissionRate}</TableHead>
                <TableHead className="text-center">{t.admin.affiliate.fields.totalClicks}</TableHead>
                <TableHead className="text-center">{t.admin.affiliate.fields.totalSignups}</TableHead>
                <TableHead className="text-center">{t.admin.affiliate.fields.totalSales}</TableHead>
                <TableHead>{t.admin.affiliate.fields.totalCommission}</TableHead>
                <TableHead>{t.admin.affiliate.fields.balance}</TableHead>
                <TableHead>{t.admin.common.status}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((a, i) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  className="hover:bg-accent/40"
                >
                  <TableCell className="font-mono font-bold">{a.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.email}</div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{a.commissionRate}%</TableCell>
                  <TableCell className="text-center text-sm">{a.totalClicks || 0}</TableCell>
                  <TableCell className="text-center text-sm">{a.totalSignups || 0}</TableCell>
                  <TableCell className="text-center text-sm">{a.totalSales || 0}</TableCell>
                  <TableCell className="font-mono text-sm">{fmtRp(a.totalCommission)}</TableCell>
                  <TableCell className="font-mono text-sm font-semibold text-primary">{fmtRp(a.balance)}</TableCell>
                  <TableCell>
                    {a.status === "active" ? (
                      <Badge className="bg-primary/15 text-primary">{t.admin.common.active}</Badge>
                    ) : (
                      <Badge variant="secondary">{a.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(a)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(a.id)}
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
              {editing ? t.admin.common.edit : t.admin.affiliate.addNew}
            </DialogTitle>
            <DialogDescription>{t.admin.affiliate.title}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label>{t.admin.affiliate.fields.code}</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.affiliate.fields.name}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.affiliate.fields.email}</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.affiliate.fields.commissionRate}</Label>
                <Input
                  type="number"
                  value={form.commissionRate}
                  onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.affiliate.fields.status}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.admin.common.active}</SelectItem>
                    <SelectItem value="suspended">{t.admin.customers.statuses.suspended}</SelectItem>
                    <SelectItem value="banned">{t.admin.customers.statuses.banned}</SelectItem>
                  </SelectContent>
                </Select>
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
