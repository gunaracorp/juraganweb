"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate, type Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Headphones,
  Star,
  Zap,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/components/public/header";

const TRUST_COMPANIES = [
  "Kopi Maju",
  "Bumi Property",
  "Sehat App",
  "Modisa Batik",
  "Edukasi Raya",
  "Nusantara Travel",
];

function StatCounter({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="text-center sm:text-left"
    >
      <div className="flex items-baseline justify-center gap-0.5 sm:justify-start">
        <span className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {display.toLocaleString("id-ID")}
        </span>
        <span className="gradient-text text-2xl font-extrabold sm:text-3xl">
          {suffix}
        </span>
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
        {label}
      </p>
    </motion.div>
  );
}

const blobVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

export function Hero() {
  const { t } = useTranslation();

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-mesh pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-40"
    >
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          variants={blobVariants}
          initial="hidden"
          animate="visible"
          className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/30 blur-3xl animate-blob"
        />
        <motion.div
          variants={blobVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-gold/30 blur-3xl animate-blob"
          style={{ animationDelay: "4s" }}
        />
        <motion.div
          variants={blobVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-blob"
          style={{ animationDelay: "8s" }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        {/* Left content */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary sm:text-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {t.hero.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="mt-5 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            {t.hero.title}{" "}
            <span className="gradient-text">{t.hero.titleHighlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button
              type="button"
              size="lg"
              onClick={() => scrollToSection("contact")}
              className="bg-brand-gradient text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95"
            >
              <Sparkles className="size-4" />
              {t.hero.ctaPrimary}
              <ArrowRight className="size-4" />
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("portfolio")}
              className="border-primary/30 bg-background/60 text-foreground hover:bg-accent"
            >
              {t.hero.ctaSecondary}
            </Button>
          </motion.div>

          {/* Stats row */}
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <StatCounter
              value={500}
              suffix="+"
              label={t.hero.stats.clients}
              delay={0}
            />
            <StatCounter
              value={1200}
              suffix="+"
              label={t.hero.stats.projects}
              delay={0.1}
            />
            <StatCounter
              value={17}
              suffix="+"
              label={t.hero.stats.years}
              delay={0.2}
            />
            <StatCounter
              value={99}
              suffix=".9%"
              label={t.hero.stats.uptime}
              delay={0.3}
            />
          </div>
        </div>

        {/* Right visual: floating decorative cards */}
        <div className="relative hidden h-[480px] lg:col-span-5 lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute right-6 top-8 w-72 rounded-2xl border border-border bg-card/80 p-5 shadow-xl backdrop-blur-md animate-float"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  100% Garansi
                </p>
                <p className="text-xs text-muted-foreground">Quality assured</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.4, delay: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-gold"
              />
            </div>
            <p className="mt-2 text-right text-xs font-medium text-primary">
              100% Complete
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute left-2 top-48 w-60 rounded-2xl border border-border bg-card/80 p-5 shadow-xl backdrop-blur-md animate-float-slow"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Headphones className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  24/7 Support
                </p>
                <p className="text-xs text-muted-foreground">Always online</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute bottom-6 right-12 w-64 rounded-2xl border border-border bg-card/80 p-5 shadow-xl backdrop-blur-md animate-float"
            style={{ animationDelay: "2s" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Fast Delivery
                </p>
                <p className="text-xs text-muted-foreground">
                  On-time, every time
                </p>
              </div>
            </div>
          </motion.div>

          {/* Decorative rating badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute left-10 top-4 flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1.5 shadow-lg backdrop-blur-md animate-float-slow"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="size-3.5 fill-gold text-gold"
                  strokeWidth={0}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-foreground">4.9/5</span>
          </motion.div>
        </div>
      </div>

      {/* Trust bar marquee */}
      <div className="relative mt-16 overflow-hidden sm:mt-20">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Dipercaya oleh 500+ bisnis Indonesia
        </p>
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex shrink-0 animate-marquee items-center gap-12 px-6">
            {[...TRUST_COMPANIES, ...TRUST_COMPANIES].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap text-lg font-bold text-foreground/40 transition-colors hover:text-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
