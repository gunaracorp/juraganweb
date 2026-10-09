"use client";

import { useState } from "react";
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
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { apiFetch } from "@/lib/api-client";
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

const SOCIAL_LINKS = [
  { icon: Facebook, href: "https://facebook.com/juraganwebsite", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/juraganwebsite", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com/juraganwebsite", label: "Twitter / X" },
  { icon: Linkedin, href: "https://linkedin.com/company/juraganwebsite", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@juraganwebsite", label: "YouTube" },
];

const BRANCHES = [
  {
    city: "Jakarta",
    label: "Kantor Pusat",
    address: "Jl. Sudirman Kav. 52-53, Jakarta Selatan 12190, Indonesia",
  },
  {
    city: "Tasikmalaya",
    label: "Kantor Cabang",
    address:
      "Perumahan Andalusia Garden Cluster Granada No.11, Mangkubumi, Kota Tasikmalaya, Jawa Barat",
  },
  {
    city: "Bandung",
    label: "Kantor Cabang",
    address:
      "Jln. Muararajeun Lama No.26, Kel. Cihaurgeulis, Cibeunying Kaler, Kota Bandung, Jawa Barat 40122",
  },
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }),
  phone: z.string().optional(),
  subject: z.string().min(2, { message: "Subjek minimal 2 karakter" }),
  message: z.string().min(10, { message: "Pesan minimal 10 karakter" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactPage() {
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
      toast.success(
        "Pesan berhasil dikirim! Tim kami akan menghubungi Anda dalam 1x24 jam.",
      );
      form.reset();
    },
    onError: () => {
      toast.error("Maaf, terjadi kesalahan. Silakan coba lagi.");
    },
  });

  const onSubmit = (values: FormValues) => sendMessage.mutate(values);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-mesh py-16 sm:py-24">
        <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              Hubungi Kami
            </span>
            <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Hubungi <span className="gradient-text">Kami</span>
            </h1>
            <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
              Tim kami siap membantu Anda 24/7. Konsultasi gratis tanpa
              komitmen — ceritakan kebutuhan website atau aplikasi Anda.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Contact body */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Left: info + map + branches */}
            <Reveal>
              <div className="flex h-full flex-col gap-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    icon={MapPin}
                    title="Alamat Kantor Pusat"
                    lines={[
                      "Jl. Sudirman Kav. 52-53,",
                      "Jakarta Selatan 12190, Indonesia",
                    ]}
                  />
                  <InfoCard
                    icon={Phone}
                    title="Telepon / WhatsApp"
                    lines={["+62 812-3455-9556"]}
                    href="tel:+6281234559556"
                  />
                  <InfoCard
                    icon={Mail}
                    title="Email"
                    lines={["juraganwebsite10@gmail.com"]}
                    href="mailto:juraganwebsite10@gmail.com"
                  />
                  <InfoCard
                    icon={Clock}
                    title="Jam Operasional"
                    lines={[
                      "Senin - Jumat: 08.00 - 17.00 WIB",
                      "Sabtu: 09.00 - 14.00 WIB",
                      "Minggu & Libur: Tutup",
                    ]}
                  />
                </div>

                {/* Social row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-sm font-semibold text-foreground">
                    Ikuti Kami:
                  </span>
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

                {/* Branch offices */}
                <div className="rounded-2xl border border-border bg-card/50 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 className="size-5 text-primary" />
                    <h3 className="text-base font-bold text-foreground">
                      Kantor Cabang
                    </h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {BRANCHES.slice(1).map((branch) => (
                      <div key={branch.city} className="rounded-lg bg-background/60 p-3">
                        <p className="mb-1 text-sm font-semibold text-primary">
                          {branch.city}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {branch.address}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:aspect-[16/9]">
                  <iframe
                    title="Peta Kantor JuraganWebsite"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=106.8%2C-6.25%2C106.85%2C-6.20&layer=mapnik&marker=-6.225%2C106.825"
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-background/90 px-3 py-2 text-xs font-semibold text-foreground shadow-md backdrop-blur-md">
                    Jakarta, Indonesia
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right: form */}
            <Reveal delay={0.1}>
              <Card className="border-primary/20 shadow-md">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                      Kirim Pesan
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Isi formulir di bawah ini, tim kami akan membalas dalam
                      1x24 jam.
                    </p>
                  </div>
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
                                Nama Lengkap
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Masukkan nama Anda"
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
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="email@contoh.com"
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
                                Nomor WhatsApp
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="08xxxxxxxxxx"
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
                                Subjek
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Topik yang ingin dibahas"
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
                              Pesan
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                rows={5}
                                placeholder="Ceritakan kebutuhan website atau aplikasi Anda..."
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
                          ? "Mengirim..."
                          : "Kirim Pesan"}
                      </Button>
                    </form>
                  </Form>

                  {/* Newsletter */}
                  <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <NewsletterInline />
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function NewsletterInline() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const subscribe = useMutation({
    mutationFn: async (mail: string) => {
      const res = await apiFetch("/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Terima kasih sudah berlangganan newsletter!");
      setEmail("");
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    },
    onError: () => toast.error("Gagal berlangganan. Coba lagi."),
  });

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <MessageSquare className="size-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">Berlangganan Newsletter</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Dapatkan tips dan penawaran eksklusif langsung di email Anda.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            subscribe.mutate(email);
          }}
          className="mt-3 flex gap-2"
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Anda"
            required
            className="bg-background"
            aria-label="Email newsletter"
          />
          <Button
            type="submit"
            size="default"
            disabled={subscribe.isPending || done}
            className="shrink-0 bg-brand-gradient text-primary-foreground"
          >
            {done ? (
              <>
                <Check className="size-4" />
                Berhasil
              </>
            ) : subscribe.isPending ? (
              "..."
            ) : (
              "Daftar"
            )}
          </Button>
        </form>
      </div>
    </div>
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
