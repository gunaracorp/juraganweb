"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Code2,
  Globe,
  Image as ImageIcon,
  Link2,
  Save,
  Search,
  Settings,
  Share2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type SeoSettings = Record<string, { valueId: string; valueEn: string }>;

const SEO_KEYS = [
  "seoMetaTitle",
  "seoMetaDescription",
  "seoMetaKeywords",
  "seoOgTitle",
  "seoOgDescription",
  "seoOgImage",
  "seoTwitterCard",
  "seoGoogleAnalytics",
  "seoGoogleSearchConsole",
  "seoBingWebmaster",
  "seoRobotsTxt",
  "seoSitemap",
  "seoStructuredData",
] as const;

function buildDefault(data: SeoSettings | undefined): SeoSettings {
  const next: SeoSettings = {};
  for (const k of SEO_KEYS) {
    next[k] = data?.[k] ?? { valueId: "", valueEn: "" };
  }
  return next;
}

function BilingualInput({
  label,
  value,
  onChange,
  textarea,
  placeholderId,
  placeholderEn,
  type,
}: {
  label: string;
  value: { valueId: string; valueEn: string };
  onChange: (v: { valueId: string; valueEn: string }) => void;
  textarea?: boolean;
  placeholderId?: string;
  placeholderEn?: string;
  type?: "text" | "url";
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="relative">
          <span className="absolute left-2 top-1.5 select-none rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            🇮🇩
          </span>
          {textarea ? (
            <Textarea
              rows={3}
              className="pl-12"
              value={value.valueId}
              placeholder={placeholderId}
              onChange={(e) => onChange({ ...value, valueId: e.target.value })}
            />
          ) : (
            <Input
              className="pl-12"
              type={type || "text"}
              value={value.valueId}
              placeholder={placeholderId}
              onChange={(e) => onChange({ ...value, valueId: e.target.value })}
            />
          )}
        </div>
        <div className="relative">
          <span className="absolute left-2 top-1.5 select-none rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            🇬🇧
          </span>
          {textarea ? (
            <Textarea
              rows={3}
              className="pl-12"
              value={value.valueEn}
              placeholder={placeholderEn}
              dir="ltr"
              onChange={(e) => onChange({ ...value, valueEn: e.target.value })}
            />
          ) : (
            <Input
              className="pl-12"
              type={type || "text"}
              value={value.valueEn}
              placeholder={placeholderEn}
              dir="ltr"
              onChange={(e) => onChange({ ...value, valueEn: e.target.value })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminSeoSettings() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState("general");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-seo"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/seo");
      if (!res.ok) return {} as SeoSettings;
      const json = await res.json().catch(() => null);
      return (json?.settings ?? {}) as SeoSettings;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48 rounded-lg" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  // Build a fingerprint of the loaded data so the form re-mounts when data changes
  // (e.g. after invalidateQueries). The inner Form uses `useState(initial)` once on
  // mount, so changing the key forces a fresh mount with the latest data.
  const fingerprint = Object.keys(data ?? {})
    .sort()
    .map((k) => `${k}:${data?.[k]?.valueId ?? ""}|${data?.[k]?.valueEn ?? ""}`)
    .join(";");

  return (
    <SeoSettingsForm
      key={fingerprint}
      initial={buildDefault(data)}
      tab={tab}
      setTab={setTab}
      locale={locale}
      t={t}
      fetchWithAuth={fetchWithAuth}
      queryClient={queryClient}
    />
  );
}

function SeoSettingsForm({
  initial,
  tab,
  setTab,
  locale,
  t,
  fetchWithAuth,
  queryClient,
}: {
  initial: SeoSettings;
  tab: string;
  setTab: (v: string) => void;
  locale: "id" | "en";
  t: ReturnType<typeof useTranslation>["t"];
  fetchWithAuth: ReturnType<typeof useAuthFetch>;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [settings, setSettings] = useState<SeoSettings>(initial);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth("/api/seo", {
        method: "PUT",
        body: JSON.stringify({ settings }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Save failed");
      return json;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Pengaturan SEO disimpan" : "SEO settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin-seo"] });
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save");
    },
  });

  function update(key: string, value: { valueId: string; valueEn: string }) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function getSingle(key: string): string {
    return settings[key]?.valueId || "";
  }
  function setSingle(key: string, value: string) {
    setSettings((s) => ({ ...s, [key]: { valueId: value, valueEn: value } }));
  }

  const isGAConnected = !!getSingle("seoGoogleAnalytics");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.seo.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? "Optimasi SEO untuk mesin pencari dan media sosial."
              : "Optimize SEO for search engines and social media."}
          </p>
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-brand-gradient text-primary-foreground hover:opacity-95"
        >
          <Save className="size-4" />
          {saveMutation.isPending ? t.admin.common.loading : t.admin.common.save}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general">
            <Sparkles className="size-3.5" />
            {t.admin.seo.general}
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="size-3.5" />
            {t.admin.seo.social}
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings className="size-3.5" />
            {t.admin.seo.advanced}
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </span>
                  {t.admin.seo.general}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BilingualInput
                  label={t.admin.seo.fields.metaTitle}
                  value={settings.seoMetaTitle ?? { valueId: "", valueEn: "" }}
                  onChange={(v) => update("seoMetaTitle", v)}
                  placeholderId="JuraganWebsite - Jasa Pembuatan Website Profesional"
                  placeholderEn="JuraganWebsite - Professional Website Builder"
                />
                <BilingualInput
                  label={t.admin.seo.fields.metaDescription}
                  value={settings.seoMetaDescription ?? { valueId: "", valueEn: "" }}
                  onChange={(v) => update("seoMetaDescription", v)}
                  textarea
                  placeholderId="Mitra terpercaya pembuatan website profesional..."
                  placeholderEn="Trusted partner for professional website creation..."
                />
                <BilingualInput
                  label={t.admin.seo.fields.metaKeywords}
                  value={settings.seoMetaKeywords ?? { valueId: "", valueEn: "" }}
                  onChange={(v) => update("seoMetaKeywords", v)}
                  placeholderId="jasa website, pembuatan website, website murah"
                  placeholderEn="website builder, web design, cheap website"
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <span className="flex size-7 items-center justify-center rounded-md bg-gold/10 text-gold">
                    <Share2 className="size-4" />
                  </span>
                  {t.admin.seo.social}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BilingualInput
                  label={t.admin.seo.fields.ogTitle}
                  value={settings.seoOgTitle ?? { valueId: "", valueEn: "" }}
                  onChange={(v) => update("seoOgTitle", v)}
                />
                <BilingualInput
                  label={t.admin.seo.fields.ogDescription}
                  value={settings.seoOgDescription ?? { valueId: "", valueEn: "" }}
                  onChange={(v) => update("seoOgDescription", v)}
                  textarea
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t.admin.seo.fields.ogImage}
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={getSingle("seoOgImage")}
                      onChange={(e) => setSingle("seoOgImage", e.target.value)}
                    />
                  </div>
                  {getSingle("seoOgImage") && (
                    <div className="mt-2 overflow-hidden rounded-lg border border-border/60">
                      <img
                        src={getSingle("seoOgImage")}
                        alt="OG preview"
                        className="aspect-[1.91/1] w-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t.admin.seo.fields.twitterCard}
                  </label>
                  <Select
                    value={getSingle("seoTwitterCard") || "summary"}
                    onValueChange={(v) => setSingle("seoTwitterCard", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">summary</SelectItem>
                      <SelectItem value="summary_large_image">
                        summary_large_image
                      </SelectItem>
                      <SelectItem value="player">player</SelectItem>
                      <SelectItem value="app">app</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Settings className="size-4" />
                  </span>
                  {t.admin.seo.advanced}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Google Analytics */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {t.admin.seo.fields.googleAnalytics}
                    </label>
                    {isGAConnected && (
                      <Badge className="bg-primary/15 text-primary">
                        <span className="size-1.5 rounded-full bg-primary" />
                        {locale === "id" ? "Terhubung" : "Connected"}
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="G-XXXXXXXXXX"
                      value={getSingle("seoGoogleAnalytics")}
                      onChange={(e) =>
                        setSingle("seoGoogleAnalytics", e.target.value)
                      }
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {locale === "id"
                      ? "Format ID Google Analytics 4 (contoh: G-ABC123XYZ9)."
                      : "Google Analytics 4 ID format (e.g., G-ABC123XYZ9)."}
                  </p>
                </div>

                {/* Google Search Console */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t.admin.seo.fields.googleSearchConsole}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="google-site-verification=..."
                      value={getSingle("seoGoogleSearchConsole")}
                      onChange={(e) =>
                        setSingle("seoGoogleSearchConsole", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Bing Webmaster */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t.admin.seo.fields.bingWebmaster}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="msvalidate.01=..."
                      value={getSingle("seoBingWebmaster")}
                      onChange={(e) =>
                        setSingle("seoBingWebmaster", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Robots.txt */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t.admin.seo.fields.robotsTxt}
                  </label>
                  <Textarea
                    rows={4}
                    className="font-mono text-sm"
                    placeholder={`User-agent: *\nDisallow: /admin\nSitemap: https://example.com/sitemap.xml`}
                    value={getSingle("seoRobotsTxt")}
                    onChange={(e) => setSingle("seoRobotsTxt", e.target.value)}
                  />
                </div>

                {/* Sitemap */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t.admin.seo.fields.sitemap}
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      type="url"
                      placeholder="https://juraganwebsite.web.id/sitemap.xml"
                      value={getSingle("seoSitemap")}
                      onChange={(e) => setSingle("seoSitemap", e.target.value)}
                    />
                  </div>
                </div>

                {/* Structured data (JSON-LD) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium">
                    <Code2 className="size-3.5" />
                    {t.admin.seo.fields.structuredData}
                  </label>
                  <Textarea
                    rows={8}
                    className="font-mono text-xs"
                    placeholder={`{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "JuraganWebsite",
  "url": "https://juraganwebsite.web.id"
}`}
                    value={getSingle("seoStructuredData")}
                    onChange={(e) => setSingle("seoStructuredData", e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {locale === "id"
                      ? "JSON-LD untuk rich snippets di Google."
                      : "JSON-LD for Google rich snippets."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
