"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, Server, Search, Plus, Globe,
} from "lucide-react";
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

interface Service {
  id: string; name: string; category: string; domain: string | null; billingCycle: string;
  price: number; status: string; createdAt: string; expiresAt: string | null;
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

const CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "hosting", label: "Hosting" },
  { id: "vps", label: "VPS" },
  { id: "cloud", label: "Cloud" },
  { id: "domain", label: "Domain" },
  { id: "ssl", label: "SSL" },
  { id: "email", label: "Email" },
  { id: "wordpress", label: "WordPress" },
];

export default function ClientServicesPage() {
  return (
    <QueryProvider>
      <ClientServicesInner />
    </QueryProvider>
  );
}

function ClientServicesInner() {
  const router = useRouter();
  const { token, logout } = useCustomerStore();
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && !token) router.replace("/login?next=/client/services");
  }, [hydrated, token, router]);

  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const servicesQuery = useQuery({
    queryKey: ["customer-services-list", token],
    queryFn: async () => {
      const res = await apiFetch("/customer/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { logout(); router.replace("/login?next=/client/services"); return []; }
      const data = await res.json();
      return (data.items || []) as Service[];
    },
    enabled: !!token,
  });

  const filtered = useMemo(() => {
    let arr = servicesQuery.data || [];
    if (tab !== "all") arr = arr.filter((s) => s.category === tab);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      arr = arr.filter((s) =>
        s.name.toLowerCase().includes(t) ||
        (s.domain || "").toLowerCase().includes(t) ||
        s.category.toLowerCase().includes(t),
      );
    }
    return arr;
  }, [servicesQuery.data, tab, q]);

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
                Layanan <span className="gradient-text">Saya</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Kelola hosting, VPS, domain, dan layanan lainnya.
              </p>
            </div>
            <Link href="/hosting">
              <Button size="sm" className="bg-brand-gradient text-primary-foreground">
                <Plus className="size-3.5" /> Pesan Layanan Baru
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <ClientNav />

            <div className="min-w-0 flex-1 space-y-4">
              <Card className="glass border-border/60">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Tabs value={tab} onValueChange={setTab}>
                      <TabsList className="flex h-auto flex-wrap gap-1 bg-background/60">
                        {CATEGORIES.map((c) => (
                          <TabsTrigger key={c.id} value={c.id} className="text-xs">{c.label}</TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                    <div className="relative sm:w-64">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Cari layanan / domain..."
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
                  {servicesQuery.isLoading ? (
                    <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient/15">
                        <Server className="size-6 text-primary" />
                      </div>
                      <p className="font-semibold">Belum ada layanan</p>
                      <p className="text-sm text-muted-foreground">Mulai pesan hosting atau domain untuk mengisi daftar ini.</p>
                      <Link href="/hosting"><Button size="sm" className="bg-brand-gradient text-primary-foreground"><Plus className="size-3.5" /> Pesan Sekarang</Button></Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead className="hidden md:table-cell">Kategori</TableHead>
                            <TableHead className="hidden lg:table-cell">Domain</TableHead>
                            <TableHead className="hidden sm:table-cell">Siklus</TableHead>
                            <TableHead className="hidden md:table-cell">Harga</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Berakhir</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-brand-gradient/15 text-primary sm:flex">
                                    <Server className="size-4" />
                                  </div>
                                  <span className="truncate">{s.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="outline" className="capitalize">{s.category}</Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {s.domain ? <span className="font-mono text-xs">{s.domain}</span> : <span className="text-muted-foreground">-</span>}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell capitalize text-xs">{s.billingCycle}</TableCell>
                              <TableCell className="hidden md:table-cell text-xs">{formatRupiah(s.price)}</TableCell>
                              <TableCell>{statusBadge(s.status)}</TableCell>
                              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{fmtDate(s.expiresAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="size-3.5" /> Menampilkan {filtered.length} dari {servicesQuery.data?.length || 0} layanan
              </p>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
