"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  Twitter,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type SettingValue = { valueId: string; valueEn: string };
type SettingsMap = Record<string, SettingValue>;

const SETTING_KEYS = [
  "siteName",
  "tagline",
  "description",
  "address",
  "phone",
  "email",
  "whatsapp",
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
] as const;

const GENERAL_KEYS = ["siteName", "tagline", "description"] as const;
const CONTACT_KEYS = ["address", "phone", "email", "whatsapp"] as const;
const SOCIAL_KEYS = [
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
] as const;

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  siteName: Building2,
  tagline: Building2,
  description: Building2,
  address: MapPin,
  phone: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

function emptySettings(): SettingsMap {
  const out: SettingsMap = {};
  for (const k of SETTING_KEYS) out[k] = { valueId: "", valueEn: "" };
  return out;
}

export function AdminSettings() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/settings");
      if (!res.ok) return emptySettings();
      const json = await res.json().catch(() => null);
      const settings = (json?.settings ?? {}) as SettingsMap;
      return { ...emptySettings(), ...settings };
    },
  });

  // We never call setState inside an effect — instead, derive the live form
  // state from the server data plus a local "overrides" map of user edits.
  const base = data ?? emptySettings();
  const [overrides, setOverrides] = useState<Record<string, SettingValue>>({});

  const form: SettingsMap = useMemo(() => {
    const result: SettingsMap = { ...emptySettings(), ...base };
    for (const k of Object.keys(overrides)) {
      const ov = overrides[k];
      if (ov) result[k] = ov;
    }
    return result;
  }, [base, overrides]);

  const saveMutation = useMutation({
    mutationFn: async (settings: SettingsMap) => {
      const res = await fetchWithAuth("/api/settings", {
        method: "PUT",
        body: JSON.stringify({ settings }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Save failed");
      return settings;
    },
    onSuccess: () => {
      toast.success(t.admin.settings.saved);
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: () => {
      toast.error(
        locale === "id" ? "Gagal menyimpan pengaturan" : "Failed to save settings",
      );
    },
  });

  function update(key: string, field: "valueId" | "valueEn", value: string) {
    setOverrides((prev) => ({
      ...prev,
      [key]: { ...form[key], [field]: value },
    }));
  }

  function handleSave() {
    saveMutation.mutate(form);
  }

  const dirty = useMemo(() => {
    if (!data) return false;
    for (const k of SETTING_KEYS) {
      if (form[k]?.valueId !== data[k]?.valueId) return true;
      if (form[k]?.valueEn !== data[k]?.valueEn) return true;
    }
    return false;
  }, [form, data]);

  function renderField(key: string) {
    const Icon = ICONS[key] ?? Building2;
    const val = form[key] ?? { valueId: "", valueEn: "" };
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-3 rounded-lg border border-border/60 p-4 sm:grid-cols-[auto_1fr_1fr]"
      >
        <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-1.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <Label className="text-xs font-medium text-muted-foreground">
            {t.admin.settings.fields[key as keyof typeof t.admin.settings.fields]}
          </Label>
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor={`${key}-id`}
            className="text-[11px] uppercase tracking-wider text-muted-foreground"
          >
            {locale === "id" ? "Indonesia" : "Indonesian"}
          </Label>
          <Input
            id={`${key}-id`}
            value={val.valueId}
            onChange={(e) => update(key, "valueId", e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor={`${key}-en`}
            className="text-[11px] uppercase tracking-wider text-muted-foreground"
          >
            English
          </Label>
          <Input
            id={`${key}-en`}
            value={val.valueEn}
            onChange={(e) => update(key, "valueEn", e.target.value)}
            disabled={isLoading}
            dir="ltr"
          />
        </div>
      </motion.div>
    );
  }

  const tabConfig: {
    key: "general" | "contact" | "social";
    label: string;
    keys: readonly string[];
  }[] = [
    {
      key: "general",
      label: t.admin.settings.general,
      keys: GENERAL_KEYS,
    },
    {
      key: "contact",
      label: t.admin.settings.contact,
      keys: CONTACT_KEYS,
    },
    {
      key: "social",
      label: t.admin.settings.social,
      keys: SOCIAL_KEYS,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.settings.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? "Kelola pengaturan website bilingual di satu tempat."
              : "Manage bilingual website settings in one place."}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || isLoading || !dirty}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          {saveMutation.isPending ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="size-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
            />
          ) : (
            <Save className="size-4" />
          )}
          {t.admin.settings.save}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="h-auto w-full justify-start overflow-x-auto sm:w-auto">
          {tabConfig.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="flex-1 sm:flex-none">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{tab.label}</CardTitle>
                    <CardDescription>
                      {locale === "id"
                        ? "Isi nilai dalam Bahasa Indonesia dan English."
                        : "Provide both Indonesian and English values."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isLoading ? (
                      Array.from({ length: tab.keys.length }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-lg" />
                      ))
                    ) : (
                      tab.keys.map((k) => renderField(k))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
