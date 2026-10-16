"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { AdminApp } from "@/components/admin/admin-app";
import { AdminLogin } from "@/components/admin/admin-login";

export default function AdminPage() {
  const adminToken = useAppStore((s) => s.adminToken);
  // Ensure view is set to admin so any shared logic works
  const setView = useAppStore((s) => s.setView);
  useEffect(() => { setView("admin"); }, [setView]);

  return (
    <AnimatePresence mode="wait">
      {adminToken ? (
        <motion.div key="app" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
          <AdminApp />
        </motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <AdminLogin />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
