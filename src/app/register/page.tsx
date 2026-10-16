"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api-client";
import { useCustomerStore } from "@/lib/customer-store";

const BENEFITS = [
  "Hosting & domain dalam satu dashboard",
  "Invoice & riwayat pembayaran rapi",
  "Buka tiket support 24/7",
  "Kelola profil & keamanan akun",
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useCustomerStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await apiFetch("/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Pendaftaran gagal");
        setLoading(false);
        return;
      }
      setAuth(data.token, data.customer);
      toast.success("Pendaftaran berhasil! Selamat datang.");
      router.push("/client");
    } catch {
      toast.error("Terjadi kesalahan jaringan");
      setLoading(false);
    }
  };

  return (
    <MarketingLayout>
      <section className="bg-mesh relative overflow-hidden">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center">
            <Reveal className="hidden lg:block">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-semibold text-foreground/70">
                <ShieldCheck className="size-3.5 text-primary" /> Daftar Gratis
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Bergabung dengan <span className="gradient-text">ribuan juragan</span> website Indonesia
              </h1>
              <p className="mt-3 text-muted-foreground">
                Satu akun untuk semua layanan: hosting, domain, VPS, cloud, SSL, dan email bisnis. Tanpa biaya langganan bulanan.
              </p>
              <ul className="mt-6 space-y-2.5">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                    <span className="text-foreground/80">{b}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <Card className="glass border-border/60 shadow-xl">
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="text-2xl font-extrabold tracking-tight">
                    Buat <span className="gradient-text">Akun Baru</span>
                  </CardTitle>
                  <CardDescription>
                    Gratis, tidak perlu kartu kredit. Daftar & langsung mulai pesan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="name"
                          required
                          minLength={3}
                          autoComplete="name"
                          placeholder="Budi Santoso"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="nama@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">No. WhatsApp <span className="text-muted-foreground/70">(opsional)</span></Label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="0812xxxxxxx"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          required
                          minLength={6}
                          autoComplete="new-password"
                          placeholder="Minimal 6 karakter"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand-gradient text-primary-foreground shadow-md hover:opacity-90"
                    >
                      {loading ? "Mendaftarkan..." : (<>Daftar Sekarang <ArrowRight className="size-4" /></>)}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      Dengan mendaftar, Anda menyetujui <Link href="/" className="underline">Syarat & Ketentuan</Link> serta{" "}
                      <Link href="/" className="underline">Kebijakan Privasi</Link> JuraganWebsite.
                    </p>
                  </form>
                </CardContent>
                <CardFooter className="justify-center border-t border-border/60 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                      Masuk di sini
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
