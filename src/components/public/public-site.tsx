"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { QueryProvider } from "@/components/providers";
import { Header } from "@/components/public/header";
import { Hero } from "@/components/public/hero";
import { About } from "@/components/public/about";
import { Services } from "@/components/public/services";
import { Portfolio } from "@/components/public/portfolio";
import { Blog } from "@/components/public/blog";
import { BlogDetail } from "@/components/public/blog-detail";
import { Testimonials } from "@/components/public/testimonials";
import { Contact } from "@/components/public/contact";
import { Footer } from "@/components/public/footer";

/**
 * Public-facing front-end of JuraganWebsite.
 * Wraps all sections inside a min-h-screen flex flex-col layout so the
 * footer naturally sticks to the bottom on short pages and is pushed
 * down when content overflows the viewport.
 */
export function PublicSite() {
  const activePostSlug = useAppStore((s) => s.activePostSlug);

  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {activePostSlug ? (
              <motion.div
                key={`post-${activePostSlug}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <BlogDetail slug={activePostSlug} />
              </motion.div>
            ) : (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Hero />
                <About />
                <Services />
                <Portfolio />
                <Blog />
                <Testimonials />
                <Contact />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </QueryProvider>
  );
}
