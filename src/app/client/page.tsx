"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Server, ShoppingBag, FileText, MessageSquare, ArrowRight, Globe, Plus, Loader2,
  Sparkles, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { ClientNav } from "@/components/site/client-nav";
import { formatRupiah } from "@/components/site/ui-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/lib/api-client";
import { useCustomerStore } from "@/lib/customer-store";
import { useHydrated } from "@/lib/use-hydrated";
import { QueryProvider } from "@/components/site/query-provider";

interface SessionData {
  ok: boolean;
  customer?: {
    id: string; email: string; name: string; phone: string | null; company: string | null;
    address: string | null; city: string | null; country: string | null; avatar: string | null;
    verified: boolean; totalSpent: number; totalOrders: number; lastLogin: string | null;
    createdAt: string;
  };
  stats?: { services: number; orders: number; invoices: number; tickets: number };
}

interface Service {
  id: string; name: string; category: string; domain: string | null; billingCycle: string;
  price: number; status: string; createdAt: string; expiresAt: string | null;
}

interface Invoice {
  id: string; number: string; total: number; status: string; createdAt: string;
}

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  const variant: "default" | "secondary" | "destructive" | "outline" =
    s === "active" || s === "paid" ? "default" :
    s === "pending" || s === "unpaid" ? "secondary" :
    s === "overdue" || s === "expired" || s === "suspended" || s === "failed" || s === "cancelled" ? "destructive" : "outline";
  return <Badge variant={variant} className="capitalize">{s}</Badge>;
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return s; }
}

export default function ClientDashboardPage() {
  return (
    <QueryProvider>
      <ClientDashboardInner />
    </QueryProvider>
  );
}

function ClientDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, customer, logout } = useCustomerStore();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && !token) router.replace("/login?next=/client");
  }, [hydrated, token, router]);

  useEffect(() => {
    if (searchParams.get("status") === "success") {
      toast.success("Pesanan berhasil dibuat! Invoice telah dibuat.");
    }
  }, [searchParams]);

  const sessionQuery = useQuery({
    queryKey: ["customer-session", token],
    queryFn: async () => {
      const res = await apiFetch("/customer/session", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        router.replace("/login?next=/client");
        return null;
      }
      return (await res.json()) as SessionData;
    },
    enabled: !!token,
  });

  const servicesQuery = useQuery({
    queryKey: ["customer-services", token],
    queryFn: async () => {
      const res = await apiFetch("/customer/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return (data.items || []) as Service[];
    },
    enabled: !!token,
  });

  const invoicesQuery = useQuery({
    queryKey: ["customer-invoices-dashboard", sessionQuery.data?.customer?.id, token],
    queryFn: async () => {
      const id = sessionQuery.data?.customer?.id;
      if (!id || !token) return [];
      const res = await apiFetch(`/customer/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { logout(); router.replace("/login?next=/client"); return []; }
      const data = await res.json();
      return (data.items || []) as Invoice[];
    },
    enabled: !!sessionQuery.data?.customer?.id && !!token,
  });

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

  const sessCust = sessionQuery.data?.customer;
  const cust = sessCust || customer;
  const stats = sessionQuery.data?.stats || { services: 0, orders: 0, invoices: 0, tickets: 0 };
  const services = (servicesQuery.data || []).slice(0, 5);
  const invoices = (invoicesQuery.data || []).slice(0, 5);

  const STATS = [
    { label: "Layanan Aktif", value: stats.services, icon: Server, color: "text-primary" },
    { label: "Total Pesanan", value: stats.orders, icon: ShoppingBag, color: "text-primary" },
    { label: "Invoice", value: stats.invoices, icon: FileText, color: "text-primary" },
    { label: "Tiket Support", value: stats.tickets, icon: MessageSquare, color: "text-primary" },
  ];

  return (
    <MarketingLayout>
      <section className="bg-mesh min-h-[calc(100vh-4rem)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Greeting */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Selamat datang kembali</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Halo, <span className="gradient-text">{cust?.name || "Juragan"}</span> 👋
            </h1>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <ClientNav />

            <div className="min-w-0 flex-1 space-y-6">
              {/* Stats grid */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {STATS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Card key={s.label} className="glass border-border/60">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</span>
                          <Icon className={`size-4 ${s.color}`} />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold">
                          {sessionQuery.isLoading ? <Skeleton className="h-7 w-12" /> : s.value}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Total spent card */}
              <Card className="glass overflow-hidden border-border/60">
                <CardContent className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground">
                      <Wallet className="size-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Belanja</p>
                      <p className="text-2xl font-extrabold gradient-text">
                        {sessionQuery.isLoading ? <Skeleton className="h-7 w-28" /> : formatRupiah(sessCust?.totalSpent || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary" />
                    {sessCust?.verified ? "Akun terverifikasi" : "Akun belum terverifikasi"}
                  </div>
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card className="glass border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Link href="/hosting"><Button size="sm" className="bg-brand-gradient text-primary-foreground"><Plus className="size-3.5" /> Pesan Hosting Baru</Button></Link>
                  <Link href="/domain"><Button size="sm" variant="outline"><Globe className="size-3.5" /> Cari Domain</Button></Link>
                  <Link href="/client/tickets"><Button size="sm" variant="outline"><MessageSquare className="size-3.5" /> Buka Tiket</Button></Link>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Active services preview */}
                <Card className="glass border-border/60">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-base">Layanan Aktif</CardTitle>
                      <CardDescription>5 layanan terbaru Anda</CardDescription>
                    </div>
                    <Link href="/client/services" className="text-xs font-semibold text-primary hover:underline">
                      Lihat semua →
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {servicesQuery.isLoading ? (
                      <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                    ) : services.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">Belum ada layanan aktif.</p>
                    ) : (
                      <div className="space-y-2">
                        {services.map((s) => (
                          <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{s.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {s.domain || s.category} • {fmtDate(s.expiresAt)} berakhir
                              </p>
                            </div>
                            {statusBadge(s.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent invoices preview */}
                <Card className="glass border-border/60">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-base">Invoice Terbaru</CardTitle>
                      <CardDescription>5 invoice terakhir</CardDescription>
                    </div>
                    <Link href="/client/invoices" className="text-xs font-semibold text-primary hover:underline">
                      Lihat semua →
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {invoicesQuery.isLoading ? (
                      <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                    ) : invoices.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">Belum ada invoice.</p>
                    ) : (
                      <div className="space-y-2">
                        {invoices.map((inv) => (
                          <div key={inv.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold font-mono">{inv.number}</p>
                              <p className="truncate text-xs text-muted-foreground">{fmtDate(inv.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{formatRupiah(inv.total)}</span>
                              {statusBadge(inv.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Separator />
              <div className="flex items-center justify-between rounded-xl bg-brand-gradient/10 p-4">
                <div>
                  <p className="text-sm font-semibold">Butuh bantuan dengan layanan Anda?</p>
                  <p className="text-xs text-muted-foreground">Tim support 24/7 siap membantu</p>
                </div>
                <Link href="/client/tickets">
                  <Button size="sm" variant="outline">
                    Hubungi Support <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
