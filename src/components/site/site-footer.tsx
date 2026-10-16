"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook, Instagram, Twitter, Linkedin, Youtube, ArrowUp, MapPin, Phone, Mail,
  MessageCircle, Heart, Server, Globe, Cloud, Mailbox, ShieldCheck, ShoppingCart,
} from "lucide-react";

const WHATSAPP_NUMBER = "6281234559556";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const SOCIAL_LINKS = [
  { icon: Facebook, href: "https://facebook.com/juraganwebsite", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/juraganwebsite", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com/juraganwebsite", label: "Twitter / X" },
  { icon: Linkedin, href: "https://linkedin.com/company/juraganwebsite", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@juraganwebsite", label: "YouTube" },
];

const PRODUCT_LINKS = [
  { href: "/hosting", label: "Shared Hosting" },
  { href: "/wordpress", label: "WordPress Hosting" },
  { href: "/vps", label: "VPS Cloud Server" },
  { href: "/cloud", label: "Cloud Hosting" },
  { href: "/domain", label: "Domain" },
  { href: "/email", label: "Email Bisnis" },
  { href: "/ssl", label: "SSL Certificate" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "Tentang Kami" },
  { href: "/portfolio", label: "Portofolio" },
  { href: "/blog", label: "Blog" },
  { href: "/knowledge", label: "Pusat Bantuan" },
  { href: "/compare", label: "Bandingkan Provider" },
  { href: "/affiliate", label: "Program Afiliasi" },
  { href: "/contact", label: "Kontak" },
];

export function SiteFooter() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
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
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2">
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
              </Link>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                JuraganWebsite adalah layanan hosting, domain, dan pembuatan website profesional dari PT Digital Bisnis Manajemen (Digiman), melayani bisnis Indonesia sejak 2007.
              </p>
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ikuti Kami</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                       className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
                      <Icon className="size-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Produk */}
            <nav aria-label="Produk">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Server className="size-4 text-primary" /> Produk
              </h3>
              <ul className="mt-4 space-y-2.5">
                {PRODUCT_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Perusahaan */}
            <nav aria-label="Perusahaan">
              <h3 className="text-sm font-bold text-foreground">Perusahaan</h3>
              <ul className="mt-4 space-y-2.5">
                {COMPANY_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/admin" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    CMS Admin
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Kontak */}
            <div>
              <h3 className="text-sm font-bold text-foreground">Kontak</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>Jl. Sudirman Kav. 52-53, Jakarta Selatan 12190</span>
                </li>
                <li>
                  <a href="tel:+6281234559556" className="flex items-start gap-2.5 text-sm text-muted-foreground hover:text-primary">
                    <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>+62 812-3455-9556</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:juraganwebsite10@gmail.com" className="flex items-start gap-2.5 text-sm text-muted-foreground hover:text-primary">
                    <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>juraganwebsite10@gmail.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} JuraganWebsite — PT Digital Bisnis Manajemen. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <Link href="/knowledge" className="text-muted-foreground hover:text-primary">Kebijakan Privasi</Link>
              <Link href="/knowledge" className="text-muted-foreground hover:text-primary">Syarat & Ketentuan</Link>
              <Link href="/knowledge" className="text-muted-foreground hover:text-primary">Sitemap</Link>
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              Dibuat dengan <Heart className="size-3 fill-rose-500 text-rose-500" /> di Indonesia
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
