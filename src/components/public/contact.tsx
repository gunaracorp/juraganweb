"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Send,
  Check,
  MessageSquare,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Reveal } from "@/components/public/reveal";
import { apiFetch } from "@/lib/api-client";

const SOCIAL_LINKS = [
  { icon: Facebook, href: "https://facebook.com/juraganwebsite", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/juraganwebsite", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com/juraganwebsite", label: "Twitter / X" },
  { icon: Linkedin, href: "https://linkedin.com/company/juraganwebsite", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@juraganwebsite", label: "YouTube" },
];

export function Contact() {
  const { t } = useTranslation();

  // Form schema with localized labels
  const formSchema = z.object({
    name: z.string().min(2, { message: t.contact.form.namePlaceholder }),
    email: z.string().email({ message: t.contact.form.emailPlaceholder }),
    phone: z.string().optional(),
    subject: z.string().min(2, { message: t.contact.form.subjectPlaceholder }),
    message: z.string().min(10, { message: t.contact.form.messagePlaceholder }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  // Prefill subject from sessionStorage (set by services section "Pesan Layanan Ini")
  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem("contact-prefill-subject");
      if (prefill) {
        form.setValue("subject", prefill);
        sessionStorage.removeItem("contact-prefill-subject");
      }
    } catch {
      // ignore
    }
  }, [form]);

  const sendMessage = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiFetch("/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      toast.success(t.contact.form.success);
      form.reset();
    },
    onError: () => {
      toast.error(t.contact.form.error);
    },
  });

  // Newsletter subscribe
  const [subEmail, setSubEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  const subscribe = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiFetch("/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to subscribe");
      return res.json();
    },
    onSuccess: () => {
      toast.success(t.contact.subscribe.success);
      setSubEmail("");
      setSubDone(true);
      setTimeout(() => setSubDone(false), 2500);
    },
    onError: () => {
      toast.error(t.contact.form.error);
    },
  });

  const onSubmit = (values: FormValues) => sendMessage.mutate(values);

  return (
    <section id="contact" className="relative overflow-hidden py-20 sm:py-28">
      {/* Decorative background mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
      <div className="pointer-events-none absolute -left-20 top-20 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 -z-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {t.contact.tag}
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.contact.title}
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            {t.contact.subtitle}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Left: contact info + map */}
          <Reveal>
            <div className="flex h-full flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={MapPin}
                  title={t.contact.info.addressTitle}
                  lines={[t.contact.info.address]}
                />
                <InfoCard
                  icon={Phone}
                  title={t.contact.info.phoneTitle}
                  lines={[t.contact.info.phone]}
                  href={`tel:${t.contact.info.phone.replace(/\s/g, "")}`}
                />
                <InfoCard
                  icon={Mail}
                  title={t.contact.info.emailTitle}
                  lines={[t.contact.info.email]}
                  href={`mailto:${t.contact.info.email}`}
                />
                <InfoCard
                  icon={Clock}
                  title={t.contact.info.hoursTitle}
                  lines={t.contact.info.hours.split("\n")}
                />
              </div>

              {/* Social row */}
              <div className="flex flex-wrap items-center gap-2">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>

              {/* Branch Offices */}
              <div className="rounded-2xl border border-border bg-card/50 p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Building2 className="size-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">
                    {t.contact.info.branchOfficesTitle}
                  </h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-background/60 p-3">
                    <p className="mb-1 text-sm font-semibold text-primary">
                      {t.contact.info.branchOffices.tasikmalaya.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.contact.info.branchOffices.tasikmalaya.address}
                    </p>
                  </div>
                  <div className="rounded-lg bg-background/60 p-3">
                    <p className="mb-1 text-sm font-semibold text-primary">
                      {t.contact.info.branchOffices.bandung.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.contact.info.branchOffices.bandung.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="relative mt-2 aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:aspect-[16/9]">
                <iframe
                  title="Office map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=106.8%2C-6.25%2C106.85%2C-6.20&layer=mapnik&marker=-6.225%2C106.825"
                  className="h-full w-full border-0"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-background/90 px-3 py-2 text-xs font-semibold text-foreground shadow-md backdrop-blur-md">
                  📍 Jakarta, Indonesia
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: form */}
          <Reveal delay={0.1}>
            <Card className="border-primary/20 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold">
                              {t.contact.form.name}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t.contact.form.namePlaceholder}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold">
                              {t.contact.form.email}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={t.contact.form.emailPlaceholder}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold">
                              {t.contact.form.phone}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t.contact.form.phonePlaceholder}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold">
                              {t.contact.form.subject}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t.contact.form.subjectPlaceholder}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">
                            {t.contact.form.message}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder={t.contact.form.messagePlaceholder}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      disabled={sendMessage.isPending}
                      className="w-full bg-brand-gradient text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95"
                    >
                      <Send className="size-4" />
                      {sendMessage.isPending
                        ? t.contact.form.sending
                        : t.contact.form.submit}
                    </Button>
                  </form>
                </Form>

                {/* Newsletter */}
                <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <MessageSquare className="size-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">
                        {t.contact.subscribe.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t.contact.subscribe.subtitle}
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!subEmail) return;
                          subscribe.mutate(subEmail);
                        }}
                        className="mt-3 flex gap-2"
                      >
                        <Input
                          type="email"
                          value={subEmail}
                          onChange={(e) => setSubEmail(e.target.value)}
                          placeholder={t.contact.subscribe.placeholder}
                          required
                          className="bg-background"
                        />
                        <Button
                          type="submit"
                          size="default"
                          disabled={subscribe.isPending || subDone}
                          className="shrink-0 bg-brand-gradient text-primary-foreground"
                        >
                          {subDone ? (
                            <>
                              <Check className="size-4" />
                              {t.contact.subscribe.button}
                            </>
                          ) : (
                            t.contact.subscribe.button
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  icon: Icon,
  title,
  lines,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  lines: string[];
  href?: string;
}) {
  const content = (
    <div className="group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <div className="mt-1 space-y-0.5">
          {lines.map((line, i) => (
            <p key={i} className="text-sm text-foreground">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }
  return content;
}
