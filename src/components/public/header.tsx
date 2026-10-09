"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Moon, Sun, Globe, ArrowRight, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  { key: "home", id: "home", label: (t: any) => t.nav.home },
  { key: "about", id: "about", label: (t: any) => t.nav.about },
  { key: "services", id: "services", label: (t: any) => t.nav.services },
  { key: "portfolio", id: "portfolio", label: (t: any) => t.nav.portfolio },
  { key: "blog", id: "blog", label: (t: any) => t.nav.blog },
  { key: "testimonials", id: "testimonials", label: (t: any) => t.nav.testimonials },
  { key: "contact", id: "contact", label: (t: any) => t.nav.contact },
] as const;

function scrollToSection(id: string) {
  if (id === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

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

export function Header() {
  const { t } = useTranslation();
  const setView = useAppStore((s) => s.setView);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const activeSection = useAppStore((s) => s.activeSection);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sections = NAV_SECTIONS.map((s) => s.id)
      .map((id) => (id === "home" ? null : document.getElementById(id)))
      .filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [setActiveSection]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-border/60 shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          type="button"
          onClick={() => scrollToSection("home")}
          className="group flex items-center gap-2"
          aria-label="JuraganWebsite home"
        >
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
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_SECTIONS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground",
                  isActive && "text-foreground",
                )}
              >
                {item.label(t)}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-primary to-gold"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right controls (desktop) */}
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageToggle />
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setView("admin")}
            className="text-foreground/80 hover:text-foreground"
          >
            {t.nav.cms}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => scrollToSection("contact")}
            className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90"
          >
            {t.nav.getQuote}
            <ArrowRight className="size-3.5" />
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <LanguageToggle />
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:max-w-[320px]">
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
              <nav
                className="mt-2 flex flex-col gap-1 px-4"
                aria-label="Mobile"
              >
                {NAV_SECTIONS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      scrollToSection(item.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-3 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground",
                      activeSection === item.id && "bg-accent text-foreground",
                    )}
                  >
                    {item.label(t)}
                    <ArrowRight className="size-4 opacity-50" />
                  </button>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setView("admin");
                    setOpen(false);
                  }}
                >
                  {t.nav.cms}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    scrollToSection("contact");
                    setOpen(false);
                  }}
                  className="bg-brand-gradient text-primary-foreground"
                >
                  {t.nav.getQuote}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <SheetClose
                className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent"
                aria-label="Close"
              >
                <X className="size-4" />
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Subtle bottom gradient line when scrolled */}
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

export { scrollToSection };
