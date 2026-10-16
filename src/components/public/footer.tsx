"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ArrowUp,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Heart,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { scrollToSection } from "@/components/public/header";

const WHATSAPP_NUMBER = "6281234559556";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const SOCIAL_LINKS = [
  { icon: Facebook, href: "https://facebook.com/juraganwebsite", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/juraganwebsite", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com/juraganwebsite", label: "Twitter / X" },
  { icon: Linkedin, href: "https://linkedin.com/company/juraganwebsite", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@juraganwebsite", label: "YouTube" },
];

const QUICK_LINKS = [
  { key: "home", id: "home" },
  { key: "about", id: "about" },
  { key: "services", id: "services" },
  { key: "portfolio", id: "portfolio" },
  { key: "blog", id: "blog" },
  { key: "testimonials", id: "testimonials" },
  { key: "contact", id: "contact" },
];

const SERVICE_LINKS = [
  { slug: "website-company-profile" },
  { slug: "toko-online" },
  { slug: "aplikasi-web" },
  { slug: "hosting-domain" },
  { slug: "seo-marketing" },
  { slug: "maintenance" },
];

export function Footer() {
  const { t } = useTranslation();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* WhatsApp floating button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-white shadow-lg shadow-primary/40 transition-transform hover:scale-110"
      >
        <span className="absolute inset-0 rounded-full bg-primary/50 animate-pulse-ring" />
        <MessageCircle className="relative size-7" />
        <span className="sr-only">Chat WhatsApp</span>
      </a>

      {/* Back to top button */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="fixed bottom-20 right-5 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/90 text-primary shadow-md backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="mt-auto border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground shadow-md">
                  <span className="text-base font-extrabold">J</span>
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-lg font-extrabold tracking-tight">
                    Juragan<span className="gradient-text">Website</span>
                  </span>
                  <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    est. 2007
                  </span>
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {t.footer.about}
              </p>
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.footer.followUs}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    >
                      <Icon className="size-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick links */}
            <nav aria-label={t.footer.quickLinks}>
              <h3 className="text-sm font-bold text-foreground">
                {t.footer.quickLinks}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {QUICK_LINKS.map((link) => (
                  <li key={link.key}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(link.id)}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {(t.nav as any)[link.key]}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Services */}
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t.footer.services}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {SERVICE_LINKS.map((svc) => {
                  const found = t.services.items.find((i) => i.slug === svc.slug);
                  return (
                    <li key={svc.slug}>
                      <button
                        type="button"
                        onClick={() => scrollToSection("services")}
                        className="text-left text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {found?.title ?? svc.slug}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t.footer.contact}
              </h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{t.contact.info.address}</span>
                </li>
                <li>
                  <a
                    href={`tel:${t.contact.info.phone.replace(/\s/g, "")}`}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{t.contact.info.phone}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${t.contact.info.email}`}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{t.contact.info.email}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {t.footer.copyright}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {t.footer.legal.privacy}
              </a>
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {t.footer.legal.terms}
              </a>
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {t.footer.legal.sitemap}
              </a>
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {t.footer.madeWith}{" "}
              <Heart className="size-3 fill-rose-500 text-rose-500" />{" "}
              {t.footer.inIndonesia}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
