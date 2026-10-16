"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Trash2, Minus, Plus, ArrowRight, Server, Globe, ShieldCheck,
  Cloud, Mail, Database, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal, formatRupiah } from "@/components/site/ui-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCart, type CartItem } from "@/lib/cart-store";
import { useCustomerStore } from "@/lib/customer-store";
import { useHydrated } from "@/lib/use-hydrated";

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

const TAX_RATE = 0;

function periodLabel(i: CartItem): string {
  if (i.billingCycle === "one-time") return "Sekali bayar";
  if (i.type === "domain") return `${i.period} tahun`;
  return `${i.period} bulan`;
}

function billingLabel(i: CartItem): string {
  if (i.billingCycle === "monthly") return "Bulanan";
  if (i.billingCycle === "yearly") return "Tahunan";
  return "Sekali bayar";
}

export default function CartPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);
  const total = useCart((s) => s.total());
  const { token } = useCustomerStore();
  const hydrated = useHydrated();

  const subtotal = total;
  const tax = Math.round(subtotal * TAX_RATE);
  const grandTotal = subtotal + tax;

  const onCheckout = () => {
    if (!token) {
      toast.info("Silakan login dulu untuk melanjutkan pembayaran");
      router.push("/login?next=/checkout");
      return;
    }
    router.push("/checkout");
  };

  if (!hydrated) {
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
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-semibold text-foreground/70">
                  <ShoppingCart className="size-3.5 text-primary" /> Keranjang Belanja
                </span>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Keranjang <span className="gradient-text">Anda</span>
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Periksa kembali item, durasi, dan jumlah sebelum checkout.
                </p>
              </div>
              {items.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="size-4" /> Kosongkan keranjang
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Kosongkan keranjang?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Semua {items.length} item di keranjang akan dihapus. Tindakan ini tidak bisa dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => { clear(); toast.success("Keranjang dikosongkan"); }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Ya, kosongkan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </Reveal>

          {items.length === 0 ? (
            <Reveal>
              <Card className="glass border-border/60">
                <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient/15">
                    <ShoppingCart className="size-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Keranjang masih kosong</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Mari pilih layanan hosting, domain, atau add-on lainnya untuk memulai.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Link href="/hosting">
                      <Button className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90">
                        <Server className="size-4" /> Pesan Hosting
                      </Button>
                    </Link>
                    <Link href="/domain">
                      <Button variant="outline">
                        <Globe className="size-4" /> Cari Domain
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <Reveal className="lg:col-span-2">
                <Card className="glass border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg">Item ({items.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {items.map((it) => {
                      const Icon = ICONS[it.type] || Server;
                      return (
                        <div
                          key={it.id}
                          className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex flex-1 items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gradient/15 text-primary">
                              <Icon className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold">{it.name}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                <Badge variant="secondary" className="font-normal">{billingLabel(it)}</Badge>
                                <span>•</span>
                                <span>{periodLabel(it)}</span>
                                {it.domain && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-foreground/70">{it.domain}</span>
                                  </>
                                )}
                              </div>
                              <p className="mt-1 text-sm font-semibold text-primary">{formatRupiah(it.price)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                            <div className="inline-flex items-center overflow-hidden rounded-md border border-border">
                              <button
                                type="button"
                                aria-label="Kurangi jumlah"
                                onClick={() => updateQty(it.id, it.qty - 1)}
                                className="flex h-8 w-8 items-center justify-center hover:bg-accent"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold">{it.qty}</span>
                              <button
                                type="button"
                                aria-label="Tambah jumlah"
                                onClick={() => updateQty(it.id, it.qty + 1)}
                                className="flex h-8 w-8 items-center justify-center hover:bg-accent"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold">{formatRupiah(it.price * it.qty)}</span>
                              <button
                                type="button"
                                aria-label="Hapus item"
                                onClick={() => { removeItem(it.id); toast.success("Item dihapus"); }}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </Reveal>

              <Reveal delay={0.1}>
                <Card className="glass sticky top-20 border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pajak ({Math.round(TAX_RATE * 100)}%)</span>
                      <span className="font-semibold">{formatRupiah(tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-extrabold gradient-text">{formatRupiah(grandTotal)}</span>
                    </div>
                    <Button
                      type="button"
                      onClick={onCheckout}
                      className="w-full bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90"
                    >
                      Lanjut ke Pembayaran <ArrowRight className="size-4" />
                    </Button>
                    <Link href="/hosting" className="block">
                      <Button type="button" variant="outline" className="w-full">
                        + Tambah item lain
                      </Button>
                    </Link>
                    <p className="text-center text-xs text-muted-foreground">
                      Pembayaran aman via transfer bank, QRIS, e-wallet, atau kartu kredit.
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
