"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Globe, LogIn, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";

const schema = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

function LanguageToggle() {
  const { locale, setLocale } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "id" ? "en" : "id")}
      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 text-sm font-medium backdrop-blur transition-colors hover:bg-accent"
      aria-label="Switch language"
    >
      <Globe className="size-4 text-primary" />
      <span className="font-semibold">{locale === "id" ? "🇮🇩" : "🇬🇧"}</span>
      <span className="text-muted-foreground">{locale === "id" ? "ID" : "EN"}</span>
    </button>
  );
}

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const current = theme === "system" ? resolvedTheme : theme;
  return (
    <button
      type="button"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/60 backdrop-blur transition-colors hover:bg-accent"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <Sun className="hidden size-4 text-gold dark:block" />
      <Moon className="block size-4 text-primary dark:hidden" />
    </button>
  );
}

export function AdminLogin() {
  const { t, locale } = useTranslation();
  const setAdminToken = useAppStore((s) => s.setAdminToken);
  const setView = useAppStore((s) => s.setView);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setInlineError(null);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data.token) {
        const msg = t.admin.login.error;
        setInlineError(msg);
        toast.error(msg);
        return;
      }
      setAdminToken(data.token as string);
      toast.success(
        locale === "id"
          ? `Halo, ${data.user?.name ?? "Admin"} 👋`
          : `Welcome, ${data.user?.name ?? "Admin"} 👋`,
      );
    } catch {
      const msg = t.admin.login.error;
      setInlineError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-mesh relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Decorative animated blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gold/25 blur-3xl animate-blob [animation-delay:-4s]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl animate-blob [animation-delay:-8s]" />

      {/* Top-right controls */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-6 sm:top-6">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <Card className="glass border-border/60 shadow-2xl">
          <CardHeader className="space-y-3 pb-2 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-lg"
            >
              <span className="text-2xl font-extrabold">J</span>
            </motion.div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              Juragan<span className="gradient-text">Website</span>
            </CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t.admin.login.title}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            <p className="mb-5 text-center text-sm text-muted-foreground">
              {t.admin.login.subtitle}
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.login.username}</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="username"
                          autoFocus
                          disabled={loading}
                          placeholder={t.admin.login.username}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.login.password}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            disabled={loading}
                            placeholder="••••••••"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className={cn(
                              "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground",
                              "hover:bg-accent hover:text-foreground",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            )}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {inlineError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {inlineError}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        className="size-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                      />
                      {t.admin.login.loggingIn}
                    </>
                  ) : (
                    <>
                      <LogIn className="size-4" />
                      {t.admin.login.submit}
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-4 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
              {t.admin.login.hint}
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setView("public")}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                ← {t.admin.login.backToSite}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
