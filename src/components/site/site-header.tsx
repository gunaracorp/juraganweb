"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, Moon, Sun, Globe, ArrowRight, X, ShoppingCart, User, ChevronDown, Server, ShieldCheck,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const PRODUCT_LINKS = [
  { href: "/hosting", label: "Shared Hosting", desc: "Website pribadi & UMKM" },
  { href: "/wordpress", label: "WordPress Hosting", desc: "Dioptimasi untuk WP" },
  { href: "/vps", label: "VPS / Cloud Server", desc: "Full root access" },
  { href: "/cloud", label: "Cloud Hosting", desc: "Auto-scaling & HA" },
  { href: "/email", label: "Email Bisnis", desc: "Email domain sendiri" },
  { href: "/ssl", label: "SSL Certificate", desc: "Enkripsi & trust" },
  { href: "/domain", label: "Domain", desc: "Cari & daftar domain" },
];

const MAIN_LINKS = [
  { href: "/hosting", label: "Hosting" },
  { href: "/vps", label: "VPS" },
  { href: "/domain", label: "Domain" },
  { href: "/pricing", label: "Harga" },
  { href: "/compare", label: "Bandingkan" },
  { href: "/blog", label: "Blog" },
  { href: "/knowledge", label: "Bantuan" },
];

function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "id" ? "en" : "id")}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 text-sm font-medium transition-colors hover:bg-accent",
        className,
      )}
      aria-label="Switch language"
    >
      <Globe className="size-4 text-primary" />
      <span className="font-semibold">{locale === "id" ? "🇮🇩" : "🇬🇧"}</span>
      <span className="text-muted-foreground">{locale === "id" ? "ID" : "EN"}</span>
    </button>
  );
}

function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const current = theme === "system" ? resolvedTheme : theme;
  return (
    <button
      type="button"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/60 text-foreground transition-colors hover:bg-accent",
        className,
      )}
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <Sun className="size-4 hidden text-gold dark:block" />
      <Moon className="size-4 block text-primary dark:hidden" />
    </button>
  );
}

export function SiteHeader() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const cartCount = useCart((s) => s.count());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile sheet on any navigation link click (bubbles to container)
  const closeSheet = () => setOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass border-b border-border/60 shadow-sm" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2" aria-label="JuraganWebsite home">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground shadow-md">
            <span className="text-base font-extrabold">J</span>
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-gold ring-2 ring-background" />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-base font-extrabold tracking-tight">
              Juragan<span className="gradient-text">Website</span>
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              est. 2007
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
                Produk <ChevronDown className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                Layanan Hosting & Domain
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRODUCT_LINKS.map((p) => (
                <DropdownMenuItem key={p.href} asChild>
                  <Link href={p.href} className="flex flex-col items-start gap-0.5 py-1.5">
                    <span className="text-sm font-semibold text-foreground">{p.label}</span>
                    <span className="text-xs text-muted-foreground">{p.desc}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {MAIN_LINKS.filter((l) => l.href !== "/hosting" && l.href !== "/vps" && l.href !== "/domain").map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-primary to-gold"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageToggle />
          <ThemeToggle />
          <Link href="/cart" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/60 text-foreground transition-colors hover:bg-accent" aria-label="Cart">
            <ShoppingCart className="size-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href="/client">
            <Button type="button" variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
              <User className="size-4" /> Client Area
            </Button>
          </Link>
          <Link href="/admin" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent" aria-label="CMS Admin">
            <ShieldCheck className="size-4 text-primary" />
            <span className="hidden xl:inline">Admin</span>
          </Link>
          <Link href="/hosting">
            <Button type="button" size="sm" className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90">
              Mulai Sekarang <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <Link href="/cart" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/60 text-foreground" aria-label="Cart">
            <ShoppingCart className="size-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:max-w-[340px] overflow-y-auto">
              <SheetHeader className="pr-8">
                <SheetTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-gradient text-primary-foreground">
                    <span className="text-sm font-extrabold">J</span>
                  </span>
                  <span className="text-base font-extrabold">
                    Juragan<span className="gradient-text">Website</span>
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-2 flex flex-col gap-1 px-4" onClick={closeSheet}>
                <p className="px-3 pt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Produk</p>
                {PRODUCT_LINKS.map((p) => (
                  <Link key={p.href} href={p.href} className="flex flex-col gap-0.5 rounded-md px-3 py-2.5 hover:bg-accent">
                    <span className="text-sm font-semibold">{p.label}</span>
                    <span className="text-xs text-muted-foreground">{p.desc}</span>
                  </Link>
                ))}
                <p className="px-3 pt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Perusahaan</p>
                <Link href="/pricing" className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent">Harga</Link>
                <Link href="/compare" className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent">Bandingkan Provider</Link>
                <Link href="/blog" className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent">Blog</Link>
                <Link href="/knowledge" className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent">Bantuan</Link>
                <Link href="/about" className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent">Tentang</Link>
                <Link href="/contact" className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent">Kontak</Link>
              </div>
              <div className="mt-auto flex flex-col gap-2 border-t border-border p-4" onClick={closeSheet}>
                <Link href="/client">
                  <Button type="button" variant="outline" className="w-full">
                    <User className="size-4" /> Client Area
                  </Button>
                </Link>
                <Link href="/hosting">
                  <Button type="button" className="w-full bg-brand-gradient text-primary-foreground">
                    <Server className="size-4" /> Mulai Sekarang
                  </Button>
                </Link>
                <Link href="/admin" className="text-center text-sm font-medium text-muted-foreground hover:text-primary">
                  {t.nav.cms}
                </Link>
              </div>
              <SheetClose className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Close">
                <X className="size-4" />
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          />
        )}
      </AnimatePresence>
    </header>
  );
}
