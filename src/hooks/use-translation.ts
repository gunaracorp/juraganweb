"use client";
import { useAppStore } from "@/lib/store";
import { translations, type Locale } from "@/lib/i18n";

export function useTranslation() {
  const locale = useAppStore((s) => s.locale);
  const t = translations[locale] as (typeof translations)["id"];
  return { t, locale, setLocale: useAppStore((s) => s.setLocale) };
}

export type { Locale };
