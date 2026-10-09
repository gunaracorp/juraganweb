"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { PublicSite } from "@/components/public/public-site";
import { AdminApp } from "@/components/admin/admin-app";

export default function Home() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  // Support deep-linking to admin via hash (#admin) or query (?view=admin)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.replace("#", "");
    if (params.get("view") === "admin" || hash === "admin") {
      setView("admin");
    }
    // Listen for hash changes
    const onHash = () => {
      const h = window.location.hash.replace("#", "");
      if (h === "admin") setView("admin");
      else if (h === "home" || h === "") setView("public");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [setView]);

  return (
    <AnimatePresence mode="wait">
      {view === "public" ? (
        <motion.div
          key="public"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PublicSite />
        </motion.div>
      ) : (
        <motion.div
          key="admin"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <AdminApp />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
