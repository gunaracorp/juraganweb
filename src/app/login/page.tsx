"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Reveal } from "@/components/site/ui-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api-client";
import { useCustomerStore } from "@/lib/customer-store";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/client";
  const setAuth = useCustomerStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await apiFetch("/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Login gagal");
        setLoading(false);
        return;
      }
      setAuth(data.token, data.customer);
      toast.success("Login berhasil! Mengarahkan ke dashboard...");
      router.push(next);
    } catch {
      toast.error("Terjadi kesalahan jaringan");
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("demo@juraganwebsite.id");
    setPassword("demo123");
  };

  return (
    <MarketingLayout>
      <section className="bg-mesh relative overflow-hidden">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <Reveal className="w-full max-w-md">
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-semibold text-foreground/70">
                <ShieldCheck className="size-3.5 text-primary" /> Client Area JuraganWebsite
              </span>
            </div>

            <Card className="glass border-border/60 shadow-xl">
              <CardHeader className="space-y-2 pb-4">
                <CardTitle className="text-2xl font-extrabold tracking-tight">
                  Masuk ke <span className="gradient-text">Akun Anda</span>
                </CardTitle>
                <CardDescription>
                  Kelola layanan, tagihan, dan tiket support Anda di satu tempat.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        disabled
                        className="text-xs font-medium text-muted-foreground/60 cursor-not-allowed"
                        title="Fitur akan segera hadir"
                      >
                        Lupa password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
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
                    {loading ? "Memproses..." : (<>Masuk <ArrowRight className="size-4" /></>)}
                  </Button>
                </form>

                <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 size-4 text-primary" />
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">Akun Demo</p>
                      <p className="text-muted-foreground">Email: <code className="font-mono">demo@juraganwebsite.id</code></p>
                      <p className="text-muted-foreground">Password: <code className="font-mono">demo123</code></p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={fillDemo}
                  >
                    Isi otomatis akun demo
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="justify-center border-t border-border/60 pt-4">
                <p className="text-sm text-muted-foreground">
                  Belum punya akun?{" "}
                  <Link href="/register" className="font-semibold text-primary hover:underline">
                    Daftar gratis
                  </Link>
                </p>
              </CardFooter>
            </Card>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                ← Kembali ke beranda
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  );
}
