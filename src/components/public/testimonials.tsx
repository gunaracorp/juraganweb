"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/public/reveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";

interface ApiTestimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  messageId: string;
  messageEn: string;
  rating: number;
  avatar: string | null;
  active: boolean;
  order: number;
}

const AVATAR_GRADIENTS = [
  "from-primary to-gold",
  "from-gold to-primary",
  "from-violet-500 to-purple-700",
  "from-blue-500 to-indigo-600",
  "from-fuchsia-500 to-purple-700",
  "from-sky-500 to-blue-700",
];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Testimonials() {
  const { t, locale } = useTranslation();
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);

  const { data, isLoading } = useQuery<ApiTestimonial[]>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const res = await apiFetch("/testimonials");
      const json = await res.json();
      return (json?.items ?? []) as ApiTestimonial[];
    },
    staleTime: 60_000,
  });

  const items = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => a.order - b.order);
  }, [data]);

  const count = items.length;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Autoplay every 5s
  useEffect(() => {
    if (!api || items.length === 0) return;
    const id = setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => clearInterval(id);
  }, [api, items.length]);

  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {t.testimonials.tag}
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.testimonials.title}
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            {t.testimonials.subtitle}
          </p>
        </Reveal>

        {isLoading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {t.admin.common.noData}
            </p>
          </div>
        ) : (
          <div className="mt-12">
            <Carousel
              opts={{ align: "start", loop: items.length > 2 }}
              setApi={setApi}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {items.map((item, i) => (
                  <CarouselItem
                    key={item.id}
                    className="pl-4 sm:basis-1/2 lg:basis-1/2"
                  >
                    <TestimonialCard
                      item={item}
                      gradient={AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]}
                      message={
                        locale === "id" ? item.messageId : item.messageEn
                      }
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => api?.scrollPrev()}
                disabled={current === 0}
                aria-label="Previous testimonial"
                className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {Array.from({ length: count }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => api?.scrollTo(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      idx === current
                        ? "w-6 bg-brand-gradient"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60",
                    )}
                  />
                ))}
              </div>

              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => api?.scrollNext()}
                disabled={current === count - 1}
                aria-label="Next testimonial"
                className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({
  item,
  gradient,
  message,
}: {
  item: ApiTestimonial;
  gradient: string;
  message: string;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg sm:p-8"
    >
      {/* Decorative quote */}
      <Quote
        className="absolute right-4 top-4 size-16 text-primary/10"
        aria-hidden
      />

      {/* Stars */}
      <div className="relative flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star
            key={idx}
            className={cn(
              "size-4",
              idx < item.rating
                ? "fill-gold text-gold"
                : "fill-muted text-muted-foreground/30",
            )}
            strokeWidth={0}
          />
        ))}
      </div>

      {/* Message */}
      <blockquote className="relative mt-4 flex-1 text-pretty text-sm text-foreground/85 sm:text-base">
        <AnimatePresence mode="wait">
          <motion.p
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            &ldquo;{message}&rdquo;
          </motion.p>
        </AnimatePresence>
      </blockquote>

      {/* Author */}
      <figcaption className="relative mt-6 flex items-center gap-3 border-t border-border pt-5">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white font-bold shadow-md",
            gradient,
          )}
        >
          {item.avatar ? (
            <img
              src={item.avatar}
              alt={item.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials(item.name)
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {item.role} · {item.company}
          </p>
        </div>
      </figcaption>
    </motion.figure>
  );
}
