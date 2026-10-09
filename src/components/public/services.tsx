"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Code,
  ShoppingCart,
  AppWindow,
  Server,
  Search,
  Wrench,
  Sparkles,
  Star,
  ArrowRight,
  Globe as GlobeIcon,
  PenTool as PenToolIcon,
  Megaphone as MegaphoneIcon,
  Rocket as RocketIcon,
  Palette as PaletteIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  Cloud as CloudIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal, RevealGroup, RevealItem } from "@/components/public/reveal";
import { scrollToSection } from "@/components/public/header";
import { apiFetch } from "@/lib/api-client";

// Common Lucide icon name -> component mapping (used to render dynamic service.icon)
const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  ShoppingCart,
  AppWindow,
  Server,
  Search,
  Wrench,
  Globe: GlobeIcon,
  PenTool: PenToolIcon,
  Megaphone: MegaphoneIcon,
  Rocket: RocketIcon,
  Palette: PaletteIcon,
  Zap: ZapIcon,
  Shield: ShieldIcon,
  Cloud: CloudIcon,
  Mail: MailIcon,
  Phone: PhoneIcon,
};

export function getLucideIcon(name: string): LucideIcon {
  if (!name) return Code;
  if (ICON_MAP[name]) return ICON_MAP[name];
  const found = Object.keys(ICON_MAP).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  if (found) return ICON_MAP[found];
  return Code;
}

interface ApiService {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  icon: string;
  price: number;
  priceLabel: string;
  features: string;
  active: boolean;
  order: number;
}

export function Services() {
  const { t, locale } = useTranslation();

  const { data, isLoading } = useQuery<ApiService[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await apiFetch("/services");
      const json = await res.json();
      return (json?.items ?? []) as ApiService[];
    },
    staleTime: 60_000,
  });

  // Merge API result with fallback i18n items so the site always looks full
  const services = useMemo(() => {
    const fallback = t.services.items.map((it, i) => ({
      id: `fallback-${it.slug}`,
      slug: it.slug,
      titleId: it.title,
      titleEn: it.title,
      descId: it.desc,
      descEn: it.desc,
      icon:
        ["Code", "ShoppingCart", "AppWindow", "Server", "Search", "Wrench"][i] ??
        "Code",
      price: 0,
      priceLabel: it.price,
      features: it.features.join("|"),
      active: true,
      order: i,
    })) as ApiService[];

    if (!data || data.length === 0) return fallback;
    return data;
  }, [data, t.services.items]);

  return (
    <section id="services" className="relative bg-mesh py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {t.services.tag}
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.services.title}
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            {t.services.subtitle}
          </p>
        </Reveal>

        <RevealGroup
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.08}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <RevealItem key={`skel-${i}`}>
                  <Card className="h-full overflow-hidden">
                    <CardContent className="p-6">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <Skeleton className="mt-4 h-5 w-2/3" />
                      <Skeleton className="mt-2 h-3 w-full" />
                      <Skeleton className="mt-1 h-3 w-4/5" />
                      <div className="mt-4 space-y-2">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <Skeleton key={j} className="h-3 w-full" />
                        ))}
                      </div>
                      <Skeleton className="mt-5 h-9 w-full" />
                    </CardContent>
                  </Card>
                </RevealItem>
              ))
            : services.map((service, i) => {
                const Icon = getLucideIcon(service.icon);
                const title = locale === "id" ? service.titleId : service.titleEn;
                const desc = locale === "id" ? service.descId : service.descEn;
                const price =
                  service.priceLabel || `Rp ${service.price.toLocaleString("id-ID")}`;
                const features = service.features
                  ? service.features.split("|").filter(Boolean)
                  : (t.services.items[i]?.features ?? []);
                const isPopular = i === 0;

                return (
                  <RevealItem key={service.id}>
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
                            <Star className="size-3 fill-current" />
                            {t.services.popular}
                          </div>
                        </div>
                      )}
                      <CardContent className="flex h-full flex-col p-6">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
                            isPopular
                              ? "bg-brand-gradient text-primary-foreground"
                              : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                          }`}
                        >
                          <Icon className="size-7" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-foreground">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {desc}
                        </p>

                        <div className="mt-4 flex items-baseline gap-1.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            {t.services.from}
                          </span>
                          <span className="text-2xl font-extrabold text-foreground">
                            {price}
                          </span>
                        </div>

                        <ul className="mt-4 space-y-2.5">
                          {features.map((f, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-sm text-foreground/80"
                            >
                              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                <Check className="size-3" strokeWidth={3} />
                              </span>
                              {f}
                            </li>
                          ))}
                        </ul>

                        <Button
                          type="button"
                          className="mt-6 w-full"
                          variant={isPopular ? "default" : "outline"}
                          onClick={() => {
                            const subject = `${t.services.cta}: ${title}`;
                            try {
                              sessionStorage.setItem(
                                "contact-prefill-subject",
                                subject,
                              );
                            } catch {
                              // ignore storage errors
                            }
                            scrollToSection("contact");
                          }}
                        >
                          <Sparkles className="size-4" />
                          {t.services.cta}
                          <ArrowRight className="size-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </RevealItem>
                );
              })}
        </RevealGroup>
      </div>
    </section>
  );
}
