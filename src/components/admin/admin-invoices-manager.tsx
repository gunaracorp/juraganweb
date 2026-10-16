"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  FileText,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

interface InvoiceItem { name: string; description?: string; qty: number; price: number }
interface Invoice {
  id: string;
  number: string;
  orderId: string | null;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
  dueDate: string | null;
  sentAt: string | null;
  paidAt: string | null;
  notes: string;
  createdAt: string;
}

const STATUSES = ["unpaid", "paid", "overdue", "cancelled"] as const;

const fmtRp = (v: number) => `Rp ${(v || 0).toLocaleString("id-ID")}`;

function statusBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    paid: "bg-primary/15 text-primary",
    unpaid: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    overdue: "bg-destructive/15 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={map[s] || "bg-muted text-muted-foreground"}>
      {t.admin.invoices.statuses[s as keyof typeof t.admin.invoices.statuses] || s}
    </Badge>
  );
}

export function AdminInvoicesManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    customerId: "",
    customerName: "",
    customerEmail: "",
    items: [{ name: "", description: "", qty: 1, price: 0 }] as InvoiceItem[],
    discount: 0,
    tax: 0,
    dueDate: "",
    notes: "",
    status: "unpaid" as string,
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/invoices");
      if (!res.ok) return [] as Invoice[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Invoice[];
    },
  });
  const allItems = (data ?? []) as Invoice[];

  const list = useMemo(() => {
    let arr = allItems;
    if (status !== "all") arr = arr.filter((i) => i.status === status);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (i) =>
          i.number.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q),
      );
    }
    return arr;
  }, [allItems, status, search]);

  const subtotal = useMemo(
    () => form.items.reduce((s, it) => s + (Number(it.qty) * Number(it.price) || 0), 0),
    [form.items],
  );
  const total = Math.max(0, subtotal - Number(form.discount) + Number(form.tax));

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(inv: Invoice) {
    setEditing(inv);
    setForm({
      customerId: inv.customerId,
      customerName: inv.customerName,
      customerEmail: inv.customerEmail,
      items: (inv.items || []).length
        ? inv.items.map((it) => ({
            name: it.name,
            description: it.description || "",
            qty: Number(it.qty) || 1,
            price: Number(it.price) || 0,
          }))
        : [{ name: "", description: "", qty: 1, price: 0 }],
      discount: inv.discount,
      tax: inv.tax,
      dueDate: inv.dueDate ? inv.dueDate.slice(0, 10) : "",
      notes: inv.notes,
      status: inv.status,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        discount: Number(form.discount),
        tax: Number(form.tax),
        subtotal,
        total,
        dueDate: form.dueDate || null,
        items: form.items.map((it) => ({
          name: it.name,
          description: it.description,
          qty: Number(it.qty),
          price: Number(it.price),
        })),
      };
      if (editing) {
        const res = await fetchWithAuth("/api/invoices", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item;
      }
      const res = await fetchWithAuth("/api/invoices", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Faktur tersimpan" : "Invoice saved");
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      setDialogOpen(false);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save"),
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/invoices", {
        method: "PUT",
        body: JSON.stringify({ id, markPaid: true }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Faktur ditandai lunas" : "Invoice marked paid");
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal" : "Failed"),
  });

  const markUnpaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/invoices", {
        method: "PUT",
        body: JSON.stringify({ id, markUnpaid: true }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Faktur ditandai belum bayar" : "Invoice marked unpaid");
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal" : "Failed"),
  });

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/invoices", {
        method: "PUT",
        body: JSON.stringify({ id, sentAt: new Date().toISOString() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Faktur dikirim" : "Invoice sent");
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal mengirim" : "Failed to send"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/invoices?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Faktur dihapus" : "Invoice deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  const filters = [
    { key: "all", label: locale === "id" ? "Semua" : "All" },
    ...STATUSES.map((s) => ({ key: s, label: t.admin.invoices.statuses[s] })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.invoices.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.invoices.allInvoices}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.invoices.addNew}
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
          <FileText className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.invoices.fields.number}</TableHead>
                <TableHead>{t.admin.invoices.fields.customer}</TableHead>
                <TableHead>{t.admin.invoices.fields.total}</TableHead>
                <TableHead>{t.admin.invoices.fields.status}</TableHead>
                <TableHead>{t.admin.invoices.fields.dueDate}</TableHead>
                <TableHead>{t.admin.invoices.fields.sentAt}</TableHead>
                <TableHead>{t.admin.invoices.fields.paidAt}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  className="hover:bg-accent/40"
                >
                  <TableCell className="font-mono text-xs font-semibold">{inv.number}</TableCell>
                  <TableCell>
                    <div className="font-medium">{inv.customerName || "—"}</div>
                    <div className="text-xs text-muted-foreground">{inv.customerEmail}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm font-semibold">{fmtRp(inv.total)}</TableCell>
                  <TableCell>{statusBadge(inv.status, t)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.dueDate ? format(new Date(inv.dueDate), "dd MMM yyyy", { locale: dateLocaleObj }) : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.sentAt ? format(new Date(inv.sentAt), "dd MMM yyyy", { locale: dateLocaleObj }) : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.paidAt ? format(new Date(inv.paidAt), "dd MMM yyyy", { locale: dateLocaleObj }) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => sendMutation.mutate(inv.id)}
                        disabled={sendMutation.isPending}
                        aria-label={t.admin.invoices.sendInvoice}
                      >
                        <Send className="size-4" />
                      </Button>
                      {inv.status === "paid" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markUnpaidMutation.mutate(inv.id)}
                          disabled={markUnpaidMutation.isPending}
                          aria-label={t.admin.invoices.markUnpaid}
                        >
                          <FileText className="size-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markPaidMutation.mutate(inv.id)}
                          disabled={markPaidMutation.isPending}
                          aria-label={t.admin.invoices.markPaid}
                          className="text-primary"
                        >
                          <FileText className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(inv)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(inv.id)}
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
              {editing ? t.admin.invoices.allInvoices : t.admin.invoices.addNew}
            </DialogTitle>
            <DialogDescription>{t.admin.invoices.title}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t.admin.invoices.fields.customer}</Label>
                <Input
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.invoices.fields.dueDate}</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.invoices.fields.status}</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t.admin.invoices.statuses[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="font-semibold">{t.admin.invoices.fields.items}</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setForm({
                        ...form,
                        items: [...form.items, { name: "", description: "", qty: 1, price: 0 }],
                      })
                    }
                  >
                    <Plus className="size-3.5" />
                    {t.admin.common.add}
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.items.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <Input
                        className="col-span-5"
                        placeholder={t.admin.common.title}
                        value={it.name}
                        onChange={(e) => {
                          const arr = [...form.items];
                          arr[i] = { ...arr[i], name: e.target.value };
                          setForm({ ...form, items: arr });
                        }}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) => {
                          const arr = [...form.items];
                          arr[i] = { ...arr[i], qty: Number(e.target.value) };
                          setForm({ ...form, items: arr });
                        }}
                      />
                      <Input
                        className="col-span-3"
                        type="number"
                        value={it.price}
                        onChange={(e) => {
                          const arr = [...form.items];
                          arr[i] = { ...arr[i], price: Number(e.target.value) };
                          setForm({ ...form, items: arr });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-2 text-destructive hover:text-destructive"
                        onClick={() => {
                          const arr = form.items.filter((_, idx) => idx !== i);
                          setForm({ ...form, items: arr });
                        }}
                        disabled={form.items.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t.admin.invoices.fields.discount}</Label>
                <Input
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.invoices.fields.tax}</Label>
                <Input
                  type="number"
                  value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })}
                />
              </div>

              <div className="sm:col-span-2 grid grid-cols-3 gap-2 rounded-md border border-border p-3 text-sm">
                <div>
                  <span className="text-muted-foreground">{t.admin.invoices.fields.subtotal}</span>
                  <div className="font-mono font-semibold">{fmtRp(subtotal)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{t.admin.invoices.fields.discount} + {t.admin.invoices.fields.tax}</span>
                  <div className="font-mono font-semibold">
                    -{fmtRp(form.discount)} + {fmtRp(form.tax)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">{t.admin.invoices.fields.total}</span>
                  <div className="font-mono font-bold text-primary">{fmtRp(total)}</div>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.invoices.fields.notes || "Notes"}</Label>
                <Textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
