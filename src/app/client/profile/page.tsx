"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, User, Lock, Camera, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { ClientNav } from "@/components/site/client-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { useCustomerStore } from "@/lib/customer-store";
import { useHydrated } from "@/lib/use-hydrated";
import { QueryProvider } from "@/components/site/query-provider";

interface SessionData {
  ok: boolean;
  customer?: {
    id: string; email: string; name: string; phone: string | null; company: string | null;
    address: string | null; city: string | null; country: string | null; avatar: string | null;
    verified: boolean;
  };
}

export default function ClientProfilePage() {
  return (
    <QueryProvider>
      <ClientProfileInner />
    </QueryProvider>
  );
}

function ClientProfileInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, customer, logout, setAuth } = useCustomerStore();
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && !token) router.replace("/login?next=/client/profile");
  }, [hydrated, token, router]);

  const sessionQuery = useQuery({
    queryKey: ["customer-session-profile", token],
    queryFn: async () => {
      const res = await apiFetch("/customer/session", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        router.replace("/login?next=/client/profile");
        return null;
      }
      return (await res.json()) as SessionData;
    },
    enabled: !!token,
  });

  const cust = sessionQuery.data?.customer;

  const [form, setForm] = useState({
    name: "", phone: "", company: "", address: "", city: "", country: "Indonesia",
  });
  const [prefilledCustId, setPrefilledCustId] = useState<string | null>(null);

  // Prefill form from session — React-recommended "adjust state during render" pattern.
  if (cust && cust.id !== prefilledCustId) {
    setPrefilledCustId(cust.id);
    setForm({
      name: cust.name || "",
      phone: cust.phone || "",
      company: cust.company || "",
      address: cust.address || "",
      city: cust.city || "",
      country: cust.country || "Indonesia",
    });
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/customer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal menyimpan profil");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Profil berhasil diperbarui");
      // sync local store customer basic info if name changed
      if (customer && data.customer) {
        setAuth(token!, { id: customer.id, email: customer.email, name: data.customer.name });
      }
      queryClient.invalidateQueries({ queryKey: ["customer-session"] });
      queryClient.invalidateQueries({ queryKey: ["customer-session-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 3) {
      toast.error("Nama minimal 3 karakter");
      return;
    }
    updateMutation.mutate();
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
              Profil <span className="gradient-text">Akun</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola informasi pribadi dan keamanan akun Anda.
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <ClientNav />

            <div className="min-w-0 flex-1 space-y-6">
              {/* Avatar + identity summary */}
              <Card className="glass border-border/60">
                <CardContent className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:items-start">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient text-2xl font-extrabold text-primary-foreground">
                      {(form.name || customer?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info("Upload avatar segera hadir")}
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent"
                      aria-label="Ganti avatar"
                    >
                      <Camera className="size-3.5 text-primary" />
                    </button>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:items-center">
                      <h2 className="text-lg font-bold">{form.name || customer?.name || "Tamu"}</h2>
                      {cust?.verified ? (
                        <Badge className="bg-emerald-600 text-white">
                          <ShieldCheck className="mr-1 size-3" /> Terverifikasi
                        </Badge>
                      ) : (
                        <Badge variant="outline">Belum verifikasi</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{customer?.email || cust?.email}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Profile form */}
              <Card className="glass border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="size-5 text-primary" /> Informasi Pribadi
                  </CardTitle>
                  <CardDescription>Perbarui detail kontak & alamat tagihan.</CardDescription>
                </CardHeader>
                <CardContent>
                  {sessionQuery.isLoading ? (
                    <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                  ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Lengkap</Label>
                          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={customer?.email || cust?.email || ""} disabled className="bg-muted/40 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Email tidak bisa diubah. Hubungi admin untuk bantuan.</p>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">No. WhatsApp</Label>
                          <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0812xxxxxxx" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Perusahaan <span className="text-muted-foreground/70">(opsional)</span></Label>
                          <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="PT Maju Jaya" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Alamat</Label>
                        <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Jl. Contoh No. 123" />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="city">Kota</Label>
                          <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Jakarta" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Negara</Label>
                          <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={updateMutation.isPending} className="bg-brand-gradient text-primary-foreground">
                          {updateMutation.isPending ? "Menyimpan..." : (<>Simpan Perubahan <Save className="size-4" /></>)}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="glass border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lock className="size-5 text-primary" /> Keamanan
                  </CardTitle>
                  <CardDescription>Kelola password dan pengaturan keamanan akun.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col items-start justify-between gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-semibold">Password</p>
                      <p className="text-xs text-muted-foreground">Terakhir diubah: belum pernah</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info("Hubungi admin untuk ganti password")}>
                      <Lock className="size-3.5" /> Ganti Password
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col items-start justify-between gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-semibold">Autentikasi Dua Faktor (2FA)</p>
                      <p className="text-xs text-muted-foreground">Lindungi akun Anda dengan lapisan keamanan ekstra.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info("2FA segera hadir")}>
                      Aktifkan 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
