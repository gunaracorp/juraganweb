"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  Package,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OrderItem { name: string; price: number; qty: number }
interface Order {
  id: string;
  invoice: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  couponCode: string | null;
  paymentMethod: string | null;
  paymentStatus: string;
  status: string;
  notes: string;
  paidAt: string | null;
  createdAt: string;
}

const STATUSES = ["pending", "processing", "completed", "cancelled"] as const;
const PAY_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

const fmtRp = (v: number) => `Rp ${(v || 0).toLocaleString("id-ID")}`;

function statusBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    processing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    completed: "bg-primary/15 text-primary",
    cancelled: "bg-destructive/15 text-destructive",
  };
  return (
    <Badge className={map[s] || "bg-muted text-muted-foreground"}>
      {t.admin.orders.statuses[s as keyof typeof t.admin.orders.statuses] || s}
    </Badge>
  );
}

function payStatusBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    paid: "bg-primary/15 text-primary",
    pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    failed: "bg-destructive/15 text-destructive",
    refunded: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={map[s] || "bg-muted text-muted-foreground"}>
      {t.admin.orders.paymentStatuses[s as keyof typeof t.admin.orders.paymentStatuses] || s}
    </Badge>
  );
}

export function AdminOrdersManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>("all");
  const [viewing, setViewing] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<{ id: string; status: string } | null>(null);

  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/orders");
      if (!res.ok) return [] as Order[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Order[];
    },
  });

  const allItems = (data ?? []) as Order[];

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let pending = 0;
    let completed = 0;
    let pendingPay = 0;
    for (const o of allItems) {
      if (o.status === "completed" && o.paymentStatus === "paid") {
        totalRevenue += o.total;
        completed++;
      }
      if (o.status === "pending") pending++;
      if (o.paymentStatus === "pending") pendingPay++;
    }
    return { total: allItems.length, pending, completed, pendingPay, totalRevenue };
  }, [allItems]);

  const list = useMemo(() => {
    let arr = allItems;
    if (status !== "all") arr = arr.filter((o) => o.status === status);
    return arr;
  }, [allItems, status]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status: s }: { id: string; status: string }) => {
      const res = await fetchWithAuth("/api/orders", {
        method: "PUT",
        body: JSON.stringify({ id, status: s }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Update failed");
      return json.item as Order;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Status diperbarui" : "Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setEditingStatus(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal memperbarui" : "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/orders?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Pesanan dihapus" : "Order deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  const filters = [
    { key: "all", label: locale === "id" ? "Semua" : "All" },
    ...STATUSES.map((s) => ({ key: s, label: t.admin.orders.statuses[s] })),
  ];

  const statCards = [
    {
      label: t.admin.orders.allOrders,
      value: stats.total,
      icon: Package,
      color: "text-primary",
    },
    {
      label: t.admin.orders.paymentStatuses.pending,
      value: stats.pendingPay,
      icon: Clock,
      color: "text-amber-500",
    },
    {
      label: t.admin.orders.statuses.completed,
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-primary",
    },
    {
      label: locale === "id" ? "Total Pendapatan" : "Total Revenue",
      value: fmtRp(stats.totalRevenue),
      icon: DollarSign,
      color: "text-gold",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">{t.admin.orders.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin.orders.allOrders}</p>
      </div>

      {/* Stats */}
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
                  <div className="mt-2 text-xl font-extrabold">{s.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
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
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.orders.fields.invoice}</TableHead>
                <TableHead>{t.admin.orders.fields.customer}</TableHead>
                <TableHead className="text-center">{t.admin.orders.fields.items}</TableHead>
                <TableHead>{t.admin.orders.fields.total}</TableHead>
                <TableHead>{t.admin.orders.fields.paymentMethod}</TableHead>
                <TableHead>{t.admin.orders.fields.paymentStatus}</TableHead>
                <TableHead>{t.admin.orders.fields.status}</TableHead>
                <TableHead>{t.admin.common.createdAt}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  className="hover:bg-accent/40"
                >
                  <TableCell className="font-mono text-xs font-semibold">{o.invoice}</TableCell>
                  <TableCell>
                    <div className="font-medium">{o.customerName || "—"}</div>
                    <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                  </TableCell>
                  <TableCell className="text-center">{Array.isArray(o.items) ? o.items.length : 0}</TableCell>
                  <TableCell className="font-mono text-sm font-semibold">{fmtRp(o.total)}</TableCell>
                  <TableCell>
                    {o.paymentMethod ? (
                      <Badge variant="outline">
                        {t.admin.orders.methods[o.paymentMethod as keyof typeof t.admin.orders.methods] || o.paymentMethod}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{payStatusBadge(o.paymentStatus, t)}</TableCell>
                  <TableCell>{statusBadge(o.status, t)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(o.createdAt), "dd MMM yyyy", { locale: dateLocaleObj })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewing(o)}
                        aria-label={t.admin.common.view}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingStatus({ id: o.id, status: o.status })}
                        aria-label={t.admin.common.edit}
                      >
                        <Package className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(o.id)}
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

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {viewing?.invoice} — {viewing?.customerName}
            </DialogTitle>
            <DialogDescription>{t.admin.orders.allOrders}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            {viewing && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t.admin.orders.fields.customer}:</span>{" "}
                    <span className="font-medium">{viewing.customerName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="font-medium">{viewing.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t.admin.orders.fields.status}:</span>{" "}
                    {statusBadge(viewing.status, t)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t.admin.orders.fields.paymentStatus}:</span>{" "}
                    {payStatusBadge(viewing.paymentStatus, t)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t.admin.orders.fields.paymentMethod}:</span>{" "}
                    <span className="font-medium">
                      {viewing.paymentMethod ? t.admin.orders.methods[viewing.paymentMethod as keyof typeof t.admin.orders.methods] || viewing.paymentMethod : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t.admin.common.createdAt}:</span>{" "}
                    <span className="font-medium">
                      {format(new Date(viewing.createdAt), "dd MMM yyyy HH:mm", { locale: dateLocaleObj })}
                    </span>
                  </div>
                </div>

                <div className="rounded-md border border-border">
                  <div className="border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.admin.orders.fields.items}
                  </div>
                  <div className="divide-y divide-border">
                    {(viewing.items || []).map((it, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {fmtRp(it.price)} × {it.qty}
                          </div>
                        </div>
                        <div className="font-mono font-semibold">{fmtRp(it.price * it.qty)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.admin.orders.fields.subtotal}</span>
                    <span className="font-mono">{fmtRp(viewing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.admin.orders.fields.discount}</span>
                    <span className="font-mono">-{fmtRp(viewing.discount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.admin.orders.fields.tax}</span>
                    <span className="font-mono">{fmtRp(viewing.tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                    <span>{t.admin.orders.fields.total}</span>
                    <span className="font-mono">{fmtRp(viewing.total)}</span>
                  </div>
                </div>

                {viewing.notes && (
                  <div className="rounded-md border border-border p-3 text-sm">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">{t.admin.orders.fields.notes}</span>
                    <p className="mt-1">{viewing.notes}</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit status dialog */}
      <Dialog open={!!editingStatus} onOpenChange={(o) => !o && setEditingStatus(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.admin.orders.fields.status}</DialogTitle>
            <DialogDescription>{editingStatus?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setEditingStatus({ id: editingStatus!.id, status: s })}
                className={cn(
                  "flex w-full items-center justify-between rounded-md border p-3 text-sm font-medium transition-colors",
                  editingStatus?.status === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent",
                )}
              >
                <span>{t.admin.orders.statuses[s]}</span>
                {editingStatus?.status === s && <CheckCircle2 className="size-4 text-primary" />}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStatus(null)}>
              {t.admin.common.cancel}
            </Button>
            <Button
              onClick={() => editingStatus && updateStatusMutation.mutate(editingStatus)}
              disabled={updateStatusMutation.isPending}
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

void XCircle;
