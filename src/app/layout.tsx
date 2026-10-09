import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/site/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "JuraganWebsite - Jasa Pembuatan Website Profesional Indonesia Sejak 2007",
  description:
    "JuraganWebsite by PT Digital Bisnis Manajemen (Digiman). Jasa pembuatan website company profile, toko online, aplikasi web, hosting, dan digital marketing sejak 2007.",
  keywords: [
    "pembuatan website",
    "jasa website",
    "website murah",
    "toko online",
    "hosting indonesia",
    "JuraganWebsite",
    "PT Digital Bisnis Manajemen",
    "Digiman",
  ],
  authors: [{ name: "PT Digital Bisnis Manajemen" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "JuraganWebsite - Jasa Pembuatan Website Profesional Sejak 2007",
    description: "Mitra terpercaya pembuatan website profesional Indonesia.",
    url: "https://juraganwebsite.web.id",
    siteName: "JuraganWebsite",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "JuraganWebsite",
    description: "Jasa pembuatan website profesional Indonesia sejak 2007.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} font-jakarta antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            {children}
            <Toaster />
            <SonnerToaster position="top-right" richColors closeButton />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
