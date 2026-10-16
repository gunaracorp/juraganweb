import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "./i18n";

interface AppState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  // View state - "public" or "admin"
  view: "public" | "admin";
  setView: (v: "public" | "admin") => void;
  // Admin auth
  adminToken: string | null;
  setAdminToken: (t: string | null) => void;
  // Active section for public SPA navigation
  activeSection: string;
  setActiveSection: (s: string) => void;
  // Blog detail view
  activePostSlug: string | null;
  setActivePostSlug: (s: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: "id",
      setLocale: (l) => set({ locale: l }),
      view: "public",
      setView: (v) => set({ view: v }),
      adminToken: null,
      setAdminToken: (t) => set({ adminToken: t }),
      activeSection: "home",
      setActiveSection: (s) => set({ activeSection: s }),
      activePostSlug: null,
      setActivePostSlug: (s) => set({ activePostSlug: s }),
    }),
    {
      name: "juraganwebsite-store",
      partialize: (s) => ({ locale: s.locale, view: s.view, adminToken: s.adminToken }),
    },
  ),
);
