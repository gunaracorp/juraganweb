"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Globe, Plus, Search, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { ClientNav } from "@/components/site/client-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api-client";
import { useCustomerStore } from "@/lib/customer-store";
import { useHydrated } from "@/lib/use-hydrated";
import { QueryProvider } from "@/components/site/query-provider";

interface Service {
  id: string; name: string; category: string; domain: string | null;
  status: string; createdAt: string; expiresAt: string | null;
}

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  const variant: "default" | "secondary" | "destructive" | "outline" =
    s === "active" ? "default" :
    s === "pending" ? "secondary" :
    s === "suspended" || s === "expired" || s === "cancelled" ? "destructive" : "outline";
  return <Badge variant={variant} className="capitalize">{s}</Badge>;
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "-";
  try { return new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return s; }
}

function daysUntil(s: string | null | undefined) {
  if (!s) return null;
  const d = new Date(s).getTime() - Date.now();
  return Math.ceil(d / (1000 * 60 * 60 * 24));
}

export default function ClientDomainsPage() {
  return (
    <QueryProvider>
      <ClientDomainsInner />
    </QueryProvider>
  );
}

function ClientDomainsInner() {
  const router = useRouter();
  const { token, logout } = useCustomerStore();
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && !token) router.replace("/login?next=/client/domains");
  }, [hydrated, token, router]);

  const [q, setQ] = useState("");

  const servicesQuery = useQuery({
    queryKey: ["customer-services-domains", token],
    queryFn: async () => {
      const res = await apiFetch("/customer/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { logout(); router.replace("/login?next=/client/domains"); return []; }
      const data = await res.json();
      return (data.items || []) as Service[];
    },
    enabled: !!token,
  });

  const domains = useMemo(() => {
    const arr = (servicesQuery.data || []).filter((s) => s.category === "domain");
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      return arr.filter((s) => (s.domain || "").toLowerCase().includes(t));
    }
    return arr;
  }, [servicesQuery.data, q]);

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
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Domain <span className="gradient-text">Saya</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Kelola domain yang Anda miliki dan pengaturan DNS-nya.
              </p>
            </div>
            <Link href="/domain">
              <Button size="sm" className="bg-brand-gradient text-primary-foreground">
                <Plus className="size-3.5" /> Daftar Domain Baru
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <ClientNav />

            <div className="min-w-0 flex-1 space-y-4">
              <Card className="glass border-border/60">
                <CardContent className="p-4">
                  <div className="relative sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama domain..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border/60">
                <CardContent className="p-0">
                  {servicesQuery.isLoading ? (
                    <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                  ) : domains.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient/15">
                        <Globe className="size-6 text-primary" />
                      </div>
                      <p className="font-semibold">Belum punya domain</p>
                      <p className="text-sm text-muted-foreground">Cari dan daftarkan domain impian Anda sekarang.</p>
                      <Link href="/domain"><Button size="sm" className="bg-brand-gradient text-primary-foreground"><Plus className="size-3.5" /> Cari Domain</Button></Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Domain</TableHead>
                            <TableHead className="hidden sm:table-cell">Terdaftar</TableHead>
                            <TableHead className="hidden md:table-cell">Berakhir</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {domains.map((d) => {
                            const days = daysUntil(d.expiresAt);
                            return (
                              <TableRow key={d.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-brand-gradient/15 text-primary sm:flex">
                                      <Globe className="size-4" />
                                    </div>
                                    <div>
                                      <span className="font-mono text-sm">{d.domain || d.name}</span>
                                      {days !== null && days < 30 && days >= 0 && (
                                        <p className="text-[11px] font-medium text-amber-600 dark:text-amber-500">
                                          Akan berakhir dalam {days} hari
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{fmtDate(d.createdAt)}</TableCell>
                                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{fmtDate(d.expiresAt)}</TableCell>
                                <TableCell>{statusBadge(d.status)}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toast.info("Kelola DNS segera hadir")}
                                  >
                                    <Settings2 className="size-3.5" /> Kelola DNS
                                  </Button>
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
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
