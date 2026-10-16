"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ShoppingCart,
  RefreshCw,
  AlertCircle,
  Star,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal, formatRupiah } from "@/components/site/ui-helpers";
import { apiFetch } from "@/lib/api-client";
import { useCart, type CartItem } from "@/lib/cart-store";
import { toast } from "sonner";

export interface PackageSpec {
  slug: string;
  nameId: string;
  nameEn: string;
  descId: string;
  descEn: string;
  category: string;
  price: number;
  priceYearly: number;
  setupFee: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: string[];
  specs: Record<string, string | number>;
  popular: boolean;
  featured: boolean;
  active: boolean;
  order: number;
}

interface ApiResponse {
  ok: boolean;
  items: PackageSpec[];
}

export interface PricingTableProps {
  category: string;
  title: string;
  subtitle?: string;
}

const VALID_CART_TYPES: CartItem["type"][] = [
  "hosting",
  "vps",
  "cloud",
  "domain",
  "ssl",
  "email",
  "wordpress",
  "service",
];

function asCartType(category: string): CartItem["type"] {
  return (VALID_CART_TYPES as string[]).includes(category)
    ? (category as CartItem["type"])
    : "service";
}

export function PricingTable({ category, title, subtitle }: PricingTableProps) {
  const addItem = useCart((s) => s.addItem);
  const [cycle, setCycle] = React.useState<"monthly" | "yearly">("monthly");

  const { data, isLoading, isError, refetch } = useQuery<PackageSpec[]>({
    queryKey: ["packages", category],
    queryFn: async () => {
      const res = await apiFetch(
        `/packages?category=${encodeURIComponent(category)}`,
      );
      const json = (await res.json()) as ApiResponse;
      return json?.items ?? [];
    },
    staleTime: 60_000,
  });

  // Auto-detect yearly-only categories (SSL). If every package is billed
  // yearly, we hide the monthly/yearly toggle and show /thn labels.
  const yearlyOnly = React.useMemo(() => {
    if (!data || data.length === 0) return false;
    return data.every((p) => p.billingCycle === "yearly");
  }, [data]);

  React.useEffect(() => {
    setCycle(yearlyOnly ? "yearly" : "monthly");
  }, [yearlyOnly]);

  const items = data ?? [];
  const periodLabel = cycle === "monthly" ? "/bln" : "/thn";

  const handleOrder = (p: PackageSpec) => {
    const price = cycle === "monthly" ? p.price : p.priceYearly;
    addItem({
      type: asCartType(category),
      name: p.nameId,
      packageSlug: p.slug,
      period: cycle === "monthly" ? 1 : 12,
      billingCycle: cycle,
      price,
      qty: 1,
    });
    toast.success("Ditambahkan ke keranjang", {
      description: `${p.nameId} — ${formatRupiah(price)} ${periodLabel}`,
    });
  };

  return (
    <section id="pricing" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Harga Paket
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              {subtitle}
            </p>
          )}
        </Reveal>

        {!yearlyOnly && (
          <div className="mt-8 flex justify-center">
            <Tabs
              value={cycle}
              onValueChange={(v) => setCycle(v as "monthly" | "yearly")}
            >
              <TabsList>
                <TabsTrigger value="monthly">Bulanan</TabsTrigger>
                <TabsTrigger value="yearly">
                  Tahunan
                  <Badge
                    variant="secondary"
                    className="ml-1.5 bg-gold/15 text-gold-foreground"
                  >
                    Hemat
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <PricingCardSkeleton key={i} />
            ))
          ) : isError ? (
            <div className="col-span-full">
              <ErrorState onRetry={() => refetch()} />
            </div>
          ) : items.length === 0 ? (
            <div className="col-span-full">
              <EmptyState />
            </div>
          ) : (
            items.map((p, i) => (
              <PricingCard
                key={p.slug}
                pkg={p}
                cycle={cycle}
                periodLabel={periodLabel}
                onOrder={handleOrder}
                delay={i * 0.06}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  pkg,
  cycle,
  periodLabel,
  onOrder,
  delay = 0,
}: {
  pkg: PackageSpec;
  cycle: "monthly" | "yearly";
  periodLabel: string;
  onOrder: (p: PackageSpec) => void;
  delay?: number;
}) {
  const isPopular = pkg.popular;
  const price = cycle === "monthly" ? pkg.price : pkg.priceYearly;
  const yearlySaving = pkg.price * 12 - pkg.priceYearly;
  const showSaving = cycle === "yearly" && yearlySaving > 0;
  const savingPct =
    pkg.price > 0 ? Math.round((yearlySaving / (pkg.price * 12)) * 100) : 0;

  const specEntries = Object.entries(pkg.specs).slice(0, 6);

  return (
    <Reveal delay={delay} className="h-full">
      <Card
        className={`group relative h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${
          isPopular
            ? "border-primary/40 glow-brand"
            : "border-border/80 hover:border-primary/30"
        }`}
      >
        {isPopular && (
          <div className="absolute right-0 top-0">
            <div className="flex items-center gap-1 rounded-bl-xl bg-brand-gradient px-3 py-1 text-xs font-bold text-primary-foreground shadow-md">
              <Star className="size-3 fill-current" /> Populer
            </div>
          </div>
        )}
        <CardContent className="flex h-full flex-col p-6">
          <h3 className="text-lg font-bold text-foreground">{pkg.nameId}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{pkg.descId}</p>

          <div className="mt-5 flex items-end gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              {formatRupiah(price)}
            </span>
            <span className="pb-1 text-sm font-medium text-muted-foreground">
              {periodLabel}
            </span>
          </div>
          {showSaving && (
            <Badge
              className="mt-2 w-fit bg-gold/15 text-gold-foreground"
              variant="secondary"
            >
              hemat {savingPct}%
            </Badge>
          )}
          {pkg.setupFee > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Biaya setup: {formatRupiah(pkg.setupFee)}
            </p>
          )}

          <Button
            type="button"
            className="mt-5 w-full"
            variant={isPopular ? "default" : "outline"}
            onClick={() => onOrder(pkg)}
          >
            <ShoppingCart className="size-4" /> Pesan Sekarang
          </Button>

          <ul className="mt-6 space-y-2.5">
            {pkg.features.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-foreground/80"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          {specEntries.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {specEntries.map(([k, v]) => (
                <Badge
                  key={k}
                  variant="outline"
                  className="text-[11px] font-normal capitalize"
                >
                  {k}:{" "}
                  <span className="font-semibold text-foreground">
                    {String(v)}
                  </span>
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-auto" />
        </CardContent>
      </Card>
    </Reveal>
  );
}

function PricingCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="p-6">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="mt-2 h-3 w-full" />
        <Skeleton className="mt-1 h-3 w-4/5" />
        <div className="mt-5 flex items-end gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="mt-5 h-9 w-full" />
        <div className="mt-6 space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-10 text-center">
      <AlertCircle className="size-8 text-destructive" />
      <p className="text-sm font-medium text-foreground">
        Gagal memuat data paket.
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-4" /> Coba lagi
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
      <Sparkles className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">
        Paket akan segera hadir.
      </p>
      <p className="text-xs text-muted-foreground">
        Silakan hubungi tim kami untuk info terbaru.
      </p>
    </div>
  );
}
