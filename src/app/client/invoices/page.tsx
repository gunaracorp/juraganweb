"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FileText, Search, CreditCard, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { ClientNav } from "@/components/site/client-nav";
import { formatRupiah } from "@/components/site/ui-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api-client";
import { useCustomerStore } from "@/lib/customer-store";
import { useHydrated } from "@/lib/use-hydrated";
import { QueryProvider } from "@/components/site/query-provider";

interface Invoice {
  id: string; number: string; total: number; status: string; createdAt: string;
  customerName: string; customerEmail: string;
}

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  const variant: "default" | "secondary" | "destructive" | "outline" =
    s === "paid" ? "default" :
    s === "unpaid" || s === "pending" ? "secondary" :
    s === "overdue" || s === "cancelled" ? "destructive" : "outline";
  return <Badge variant={variant} className="capitalize">{s}</Badge>;
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "-";
  try { return new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return s; }
}

const STATUS_TABS = [
  { id: "all", label: "Semua" },
  { id: "unpaid", label: "Belum Bayar" },
  { id: "paid", label: "Lunas" },
  { id: "overdue", label: "Terlambat" },
];

export default function ClientInvoicesPage() {
  return (
    <QueryProvider>
      <ClientInvoicesInner />
    </QueryProvider>
  );
}

function ClientInvoicesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, customer, logout } = useCustomerStore();
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && !token) router.replace("/login?next=/client/invoices");
  }, [hydrated, token, router]);

  useEffect(() => {
    if (searchParams.get("status") === "success") {
      toast.success("Pesanan berhasil dibuat! Invoice baru tersedia di bawah.");
    }
  }, [searchParams]);

  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const customerId = customer?.id;
  const invoicesQuery = useQuery({
    queryKey: ["customer-invoices", customerId, token],
    queryFn: async () => {
      if (!customerId || !token) return [];
      const res = await apiFetch(`/customer/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { logout(); router.replace("/login?next=/client/invoices"); return []; }
      const data = await res.json();
      return (data.items || []) as Invoice[];
    },
    enabled: !!customerId && !!token,
  });

  const filtered = useMemo(() => {
    let arr = invoicesQuery.data || [];
    if (tab !== "all") arr = arr.filter((i) => (i.status || "").toLowerCase() === tab);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      arr = arr.filter((i) => i.number.toLowerCase().includes(t));
    }
    return arr;
  }, [invoicesQuery.data, tab, q]);

  const onPay = (inv: Invoice) => {
    toast.info(`Mengarahkan ke gateway pembayaran untuk ${inv.number}...`);
  };

  if (!hydrated || !token) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 size-5 animate-spin" /> Memuat...
          </div>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <section className="bg-mesh min-h-[calc(100vh-4rem)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Invoice <span className="gradient-text">Saya</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Lihat dan kelola tagihan serta riwayat pembayaran Anda.
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <ClientNav />

            <div className="min-w-0 flex-1 space-y-4">
              <Card className="glass border-border/60">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Tabs value={tab} onValueChange={setTab}>
                      <TabsList className="bg-background/60">
                        {STATUS_TABS.map((c) => (
                          <TabsTrigger key={c.id} value={c.id} className="text-xs">{c.label}</TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                    <div className="relative sm:w-64">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Cari nomor invoice..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border/60">
                <CardContent className="p-0">
                  {invoicesQuery.isLoading ? (
                    <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient/15">
                        <FileText className="size-6 text-primary" />
                      </div>
                      <p className="font-semibold">Belum ada invoice</p>
                      <p className="text-sm text-muted-foreground">Invoice akan muncul di sini setelah Anda membuat pesanan.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nomor Invoice</TableHead>
                            <TableHead className="hidden sm:table-cell">Tanggal</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((inv) => {
                            const st = (inv.status || "").toLowerCase();
                            const isPaid = st === "paid";
                            return (
                              <TableRow key={inv.id}>
                                <TableCell className="font-mono text-sm font-medium">{inv.number}</TableCell>
                                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{fmtDate(inv.createdAt)}</TableCell>
                                <TableCell className="font-semibold">{formatRupiah(inv.total)}</TableCell>
                                <TableCell>{statusBadge(inv.status)}</TableCell>
                                <TableCell className="text-right">
                                  {isPaid ? (
                                    <Button size="sm" variant="ghost" disabled>
                                      <CheckCircle2 className="size-3.5" /> Lunas
                                    </Button>
                                  ) : (
                                    <Button size="sm" className="bg-brand-gradient text-primary-foreground" onClick={() => onPay(inv)}>
                                      <CreditCard className="size-3.5" /> Bayar
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground">
                Menampilkan {filtered.length} dari {invoicesQuery.data?.length || 0} invoice
              </p>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
