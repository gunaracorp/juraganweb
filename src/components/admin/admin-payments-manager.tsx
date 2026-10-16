"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { CreditCard, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
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

interface Payment {
  id: string;
  invoiceId: string | null;
  orderId: string | null;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
  gateway: string | null;
  gatewayRef: string | null;
  status: string;
  fee: number;
  paidAt: string | null;
  createdAt: string;
}

const fmtRp = (v: number) => `Rp ${(v || 0).toLocaleString("id-ID")}`;

function statusBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    paid: "bg-primary/15 text-primary",
    completed: "bg-primary/15 text-primary",
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

export function AdminPaymentsManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const METHODS = ["bank", "qris", "paypal", "crypto", "credit_card"];

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/payments");
      if (!res.ok) return [] as Payment[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Payment[];
    },
  });
  const allItems = (data ?? []) as Payment[];

  const stats = useMemo(() => {
    let revenue = 0, pending = 0, failed = 0;
    for (const p of allItems) {
      if (p.status === "paid" || p.status === "completed") revenue += p.amount;
      else if (p.status === "pending") pending++;
      else if (p.status === "failed") failed++;
    }
    return { total: allItems.length, revenue, pending, failed };
  }, [allItems]);

  const list = useMemo(() => {
    let arr = allItems;
    if (status !== "all") arr = arr.filter((p) => p.status === status);
    if (method !== "all") arr = arr.filter((p) => p.method === method);
    return arr;
  }, [allItems, status, method]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/payments?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Pembayaran dihapus" : "Payment deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  const statCards = [
    {
      label: locale === "id" ? "Total Pendapatan" : "Total Revenue",
      value: fmtRp(stats.revenue),
      color: "text-primary",
    },
    { label: t.admin.orders.paymentStatuses.pending, value: stats.pending, color: "text-amber-500" },
    { label: t.admin.orders.paymentStatuses.failed, value: stats.failed, color: "text-destructive" },
    { label: t.admin.payments.allPayments, value: stats.total, color: "text-gold" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">{t.admin.payments.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin.payments.allPayments}</p>
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

      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "id" ? "Semua Status" : "All Status"}</SelectItem>
            <SelectItem value="paid">{t.admin.orders.paymentStatuses.paid}</SelectItem>
            <SelectItem value="pending">{t.admin.orders.paymentStatuses.pending}</SelectItem>
            <SelectItem value="failed">{t.admin.orders.paymentStatuses.failed}</SelectItem>
            <SelectItem value="refunded">{t.admin.orders.paymentStatuses.refunded}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "id" ? "Semua Metode" : "All Methods"}</SelectItem>
            {METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {t.admin.orders.methods[m as keyof typeof t.admin.orders.methods] || m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <CreditCard className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.payments.fields.invoice}</TableHead>
                <TableHead>{t.admin.payments.fields.customer}</TableHead>
                <TableHead>{t.admin.payments.fields.amount}</TableHead>
                <TableHead>{t.admin.payments.fields.method}</TableHead>
                <TableHead>{t.admin.payments.fields.gateway}</TableHead>
                <TableHead>{t.admin.payments.fields.status}</TableHead>
                <TableHead>{t.admin.payments.fields.fee}</TableHead>
                <TableHead>{t.admin.payments.fields.paidAt}</TableHead>
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
                  <TableCell className="font-mono text-xs">{p.invoiceId || p.orderId || "—"}</TableCell>
                  <TableCell>
                    <div className="font-medium">{p.customerName || "—"}</div>
                    <div className="text-xs text-muted-foreground">{p.customerEmail}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm font-semibold">{fmtRp(p.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t.admin.orders.methods[p.method as keyof typeof t.admin.orders.methods] || p.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{p.gateway || "—"}</TableCell>
                  <TableCell>{statusBadge(p.status, t)}</TableCell>
                  <TableCell className="font-mono text-xs">{fmtRp(p.fee)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.paidAt ? format(new Date(p.paidAt), "dd MMM yyyy HH:mm", { locale: dateLocaleObj }) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(p.id)}
                      aria-label={t.admin.common.delete}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
    </div>
  );
}
