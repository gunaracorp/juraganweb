"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowRight, Lock, Banknote, QrCode, Wallet, CreditCard, Server, Globe,
  ShieldCheck, Cloud, Mail, Database, type LucideIcon, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal, formatRupiah } from "@/components/site/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { useCart, type CartItem } from "@/lib/cart-store";
import { useCustomerStore } from "@/lib/customer-store";
import { useHydrated } from "@/lib/use-hydrated";
import { QueryProvider } from "@/components/site/query-provider";

const ICONS: Record<CartItem["type"], LucideIcon> = {
  hosting: Server,
  vps: Database,
  cloud: Cloud,
  domain: Globe,
  ssl: ShieldCheck,
  email: Mail,
  wordpress: Server,
  service: Server,
};

type PaymentMethod = "bank_transfer" | "qris" | "e_wallet" | "credit_card";

const PAYMENTS: { id: PaymentMethod; label: string; desc: string; icon: LucideIcon }[] = [
  { id: "bank_transfer", label: "Transfer Bank", desc: "BCA / Mandiri / BNI / BRI", icon: Banknote },
  { id: "qris", label: "QRIS", desc: "Scan & bayar instan", icon: QrCode },
  { id: "e_wallet", label: "E-Wallet", desc: "GoPay / OVO / DANA / ShopeePay", icon: Wallet },
  { id: "credit_card", label: "Kartu Kredit", desc: "Visa / Mastercard / JCB", icon: CreditCard },
];

interface SessionResponse {
  ok: boolean;
  customer?: {
    id: string; email: string; name: string; phone: string | null; address: string | null;
    city: string | null; country: string | null;
  };
}

export default function CheckoutPage() {
  return (
    <QueryProvider>
      <CheckoutInner />
    </QueryProvider>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const { token, logout } = useCustomerStore();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);

  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login?next=/checkout");
    }
  }, [hydrated, token, router]);

  const sessionQuery = useQuery({
    queryKey: ["customer-session", token],
    queryFn: async () => {
      const res = await apiFetch("/customer/session", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        toast.error("Sesi berakhir, silakan login kembali");
        router.replace("/login?next=/checkout");
        return null;
      }
      return (await res.json()) as SessionResponse;
    },
    enabled: !!token,
  });

  const cust = sessionQuery.data?.customer;
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", notes: "",
  });
  const [prefilledCustId, setPrefilledCustId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");

  // Prefill billing details after session loaded — using the React-recommended
  // "adjust state during render" pattern (no setState inside useEffect).
  if (cust && cust.id !== prefilledCustId) {
    setPrefilledCustId(cust.id);
    setForm((f) => ({
      ...f,
      name: f.name || cust.name || "",
      email: f.email || cust.email || "",
      phone: f.phone || cust.phone || "",
      address: f.address || [cust.address, cust.city, cust.country].filter(Boolean).join(", "),
    }));
  }

  const subtotal = total;
  const tax = 0;
  const grandTotal = subtotal + tax;

  const orderMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        items: items.map((it) => ({
          name: it.name,
          category: it.type,
          billingCycle: it.billingCycle,
          price: it.price * it.qty,
          period: it.period,
          domain: it.domain || undefined,
        })),
        paymentMethod,
        notes: form.notes,
      };
      const res = await apiFetch("/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal membuat pesanan");
      return data;
    },
    onSuccess: () => {
      clear();
      toast.success("Pesanan berhasil dibuat! Invoice telah dibuat.");
      router.push("/client/invoices?status=success");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }
    if (!form.name || !form.email) {
      toast.error("Nama dan email wajib diisi");
      return;
    }
    orderMutation.mutate();
  };

  // Loading gate (hydration + auth redirect)
  if (!hydrated || !token) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <section className="bg-mesh relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-semibold text-foreground/70">
                <Lock className="size-3.5 text-primary" /> Checkout Aman
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Selesaikan <span className="gradient-text">Pembayaran</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Lengkapi data tagihan & pilih metode pembayaran. Pesanan akan diproses otomatis.
              </p>
            </div>
          </Reveal>

          {items.length === 0 ? (
            <Reveal>
              <Card className="glass border-border/60">
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                  <p className="text-lg font-semibold">Keranjang Anda kosong.</p>
                  <Link href="/hosting"><Button className="bg-brand-gradient text-primary-foreground">Lihat Produk</Button></Link>
                </CardContent>
              </Card>
            </Reveal>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
              <div className="space-y-6 lg:col-span-3">
                {/* Billing details */}
                <Reveal>
                  <Card className="glass border-border/60">
                    <CardHeader>
                      <CardTitle className="text-lg">Detail Tagihan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sessionQuery.isLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name">Nama</Label>
                              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="phone">No. WhatsApp</Label>
                              <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address">Alamat</Label>
                              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notes">Catatan Pesanan <span className="text-muted-foreground/70">(opsional)</span></Label>
                            <Textarea
                              id="notes"
                              rows={3}
                              placeholder="Contoh: mohon aktifkan setelah jam kerja"
                              value={form.notes}
                              onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Reveal>

                {/* Payment method */}
                <Reveal delay={0.05}>
                  <Card className="glass border-border/60">
                    <CardHeader>
                      <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {PAYMENTS.map((p) => {
                          const Icon = p.icon;
                          const active = paymentMethod === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setPaymentMethod(p.id)}
                              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                                active
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "border-border hover:border-primary/50 hover:bg-accent/50"
                              }`}
                            >
                              <Icon className={`mt-0.5 size-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold">{p.label}</p>
                                <p className="text-xs text-muted-foreground">{p.desc}</p>
                              </div>
                              {active && <CheckCircle2 className="size-4 text-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-2">
                <Reveal delay={0.1}>
                  <Card className="glass sticky top-20 border-border/60">
                    <CardHeader>
                      <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="max-h-72 space-y-2 overflow-y-auto custom-scroll pr-1">
                        {items.map((it) => {
                          const Icon = ICONS[it.type] || Server;
                          return (
                            <div key={it.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-2.5">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-brand-gradient/15 text-primary">
                                <Icon className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{it.name}</p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                                  <Badge variant="secondary" className="font-normal px-1.5 py-0">x{it.qty}</Badge>
                                  {it.domain && <span className="font-mono">{it.domain}</span>}
                                </div>
                              </div>
                              <span className="text-sm font-semibold">{formatRupiah(it.price * it.qty)}</span>
                            </div>
                          );
                        })}
                      </div>

                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">{formatRupiah(subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pajak (0%)</span>
                        <span className="font-semibold">{formatRupiah(tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-extrabold gradient-text">{formatRupiah(grandTotal)}</span>
                      </div>

                      <Button
                        type="submit"
                        disabled={orderMutation.isPending}
                        className="w-full bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90"
                      >
                        {orderMutation.isPending
                          ? "Memproses..."
                          : (<>Bayar Sekarang <ArrowRight className="size-4" /></>)}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        <Lock className="mr-1 inline size-3" /> Transaksi aman & dienkripsi
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </form>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}

