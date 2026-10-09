"use client";

import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Award,
  Wallet,
  Headphones,
  ShieldCheck,
  MapPin,
  Building2,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/public/reveal";

const VALUE_ICONS: LucideIcon[] = [Award, Wallet, Headphones, ShieldCheck];

export function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {t.about.tag}
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.about.title}
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            {t.about.subtitle}
          </p>
        </Reveal>

        {/* Top: timeline + mission/vision */}
        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Timeline / stats card */}
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-mesh p-8 shadow-sm">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="inline-flex items-baseline gap-1"
                >
                  <span className="bg-gradient-to-r from-primary to-gold bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl">
                    2007
                  </span>
                </motion.div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {t.about.established} {t.about.establishedDate}
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.about.parentCompany}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Parent Company
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.about.location}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Headquarters
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        17+ {t.about.established.toLowerCase()}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Trusted experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Mission + Vision */}
          <div className="grid gap-6">
            <Reveal delay={0.1}>
              <Card className="group h-full border-primary/20 transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <Target className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">
                    {t.about.mission.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t.about.mission.text}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={0.2}>
              <Card className="group h-full border-gold/30 transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold transition-transform group-hover:scale-110">
                    <Eye className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">
                    {t.about.vision.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t.about.vision.text}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>

        {/* Values grid */}
        <div className="mt-16">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t.about.values.title}
            </h3>
          </Reveal>

          <RevealGroup
            className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.1}
          >
            {t.about.values.items.map((value, i) => {
              const Icon = VALUE_ICONS[i] ?? Award;
              return (
                <RevealItem key={value.title}>
                  <Card className="group h-full border-border/80 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-gold/15 text-primary transition-all group-hover:from-primary group-hover:to-gold group-hover:text-primary-foreground">
                        <Icon className="size-6" />
                      </div>
                      <h4 className="mt-4 text-base font-bold text-foreground">
                        {value.title}
                      </h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {value.text}
                      </p>
                    </CardContent>
                  </Card>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
