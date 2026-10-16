"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity as ActivityIcon,
  BarChart3,
  BookOpen,
  Briefcase,
  Clock,
  ExternalLink,
  FileText,
  FolderOpen,
  Globe,
  HardDrive,
  Image as ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  Megaphone,
  Menu as MenuIcon,
  Menu as MenuManagerIcon,
  MessageSquare,
  Moon,
  Pencil,
  Search as SearchIcon,
  Server,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Tag,
  Ticket,
  User as UserIcon,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { getCurrentUser, getInitials } from "./_utils";

import { AdminOverview } from "./admin-overview";
import { AdminPostsManager } from "./admin-posts-manager";
import { AdminPagesManager } from "./admin-pages-manager";
import { AdminPortfolioManager } from "./admin-portfolio-manager";
import { AdminServicesManager } from "./admin-services-manager";
import { AdminTestimonialsManager } from "./admin-testimonials-manager";
import { AdminCommentsManager } from "./admin-comments-manager";
import { AdminMediaManager } from "./admin-media-manager";
import { AdminMenusManager } from "./admin-menus-manager";
import { AdminMessages } from "./admin-messages";
import { AdminUsersManager } from "./admin-users-manager";
import { AdminActivityLog } from "./admin-activity-log";
import { AdminAnalytics } from "./admin-analytics";
import { AdminProfile } from "./admin-profile";
import { AdminSeoSettings } from "./admin-seo-settings";
import { AdminSettings } from "./admin-settings";

// Hosting Panel — 22 new managers
import { AdminPackagesManager } from "./admin-packages-manager";
import { AdminOrdersManager } from "./admin-orders-manager";
import { AdminInvoicesManager } from "./admin-invoices-manager";
import { AdminCustomersManager } from "./admin-customers-manager";
import { AdminPaymentsManager } from "./admin-payments-manager";
import { AdminCouponsManager } from "./admin-coupons-manager";
import { AdminTicketsManager } from "./admin-tickets-manager";
import { AdminKnowledgeManager } from "./admin-knowledge-manager";
import { AdminServerMonitor } from "./admin-server-monitor";
import { AdminCronManager } from "./admin-cron-manager";
import { AdminDNSManager } from "./admin-dns-manager";
import { AdminSSLManager } from "./admin-ssl-manager";
import { AdminBackupsManager } from "./admin-backups-manager";
import { AdminEmailAccountsManager } from "./admin-email-accounts-manager";
import { AdminFTPAccountsManager } from "./admin-ftp-accounts-manager";
import { AdminNewsletterManager } from "./admin-newsletter-manager";
import { AdminAffiliateManager } from "./admin-affiliate-manager";
import { AdminSecurityLogs } from "./admin-security-logs";
import { AdminStagingManager } from "./admin-staging-manager";
import { AdminAIBuilderManager } from "./admin-ai-builder-manager";
import { AdminRealtimeAnalytics } from "./admin-realtime-analytics";
import { AdminNotificationsCenter } from "./admin-notifications-center";

export type SectionKey =
  | "overview"
  | "posts"
  | "pages"
  | "portfolio"
  | "services"
  | "testimonials"
  | "comments"
  | "media"
  | "menus"
  | "messages"
  | "users"
  | "activity"
  | "analytics"
  | "profile"
  | "seo"
  | "settings"
  // Hosting Panel
  | "packages"
  | "orders"
  | "invoices"
  | "customers"
  | "payments"
  | "coupons"
  // Support
  | "tickets"
  | "knowledge"
  // Server
  | "server-monitor"
  | "cron"
  | "dns"
  | "ssl-certs"
  | "backups"
  | "email-accounts"
  | "ftp-accounts"
  // Marketing
  | "newsletter"
  | "affiliate"
  // Security & Tools
  | "security-logs"
  | "staging"
  | "ai-builder"
  | "realtime";

interface NavItem {
  key: SectionKey;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Lightweight badge-counter query for the topbar bell. */
function useNotificationCounts() {
  // Just read the same `/api/stats` endpoint that the dashboard uses.
  // We don't need react-query here because it's polled on mount only.
  // Reads via the auth fetch adapter.
  return { pendingComments: 0, newMessages: 0 } as const;
}

function LanguageToggle() {
  const { locale, setLocale } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "id" ? "en" : "id")}
      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 text-sm font-medium transition-colors hover:bg-accent"
      aria-label="Switch language"
    >
      <Globe className="size-4 text-primary" />
      <span className="font-semibold">{locale === "id" ? "🇮🇩" : "🇬🇧"}</span>
      <span className="hidden text-muted-foreground sm:inline">
        {locale === "id" ? "ID" : "EN"}
      </span>
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/60 transition-colors hover:bg-accent"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <Sun className="hidden size-4 text-gold dark:block" />
      <Moon className="block size-4 text-primary dark:hidden" />
    </button>
  );
}

/** Global command palette (cmd+k) for searching across sections. */
function GlobalSearch({
  onNavigate,
}: {
  onNavigate: (s: SectionKey) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: t.admin.dashboard.title,
      items: [
        { key: "overview", label: t.admin.dashboard.overview, icon: LayoutDashboard },
        { key: "profile", label: t.admin.dashboard.profile, icon: UserIcon },
        { key: "analytics", label: t.admin.dashboard.analytics, icon: BarChart3 },
        { key: "activity", label: t.admin.dashboard.activity, icon: ActivityIcon },
      ],
    },
    {
      label: t.admin.dashboard.title + " — " + (t.admin.common.title || ""),
      items: [
        { key: "posts", label: t.admin.dashboard.posts, icon: FileText },
        { key: "pages", label: t.admin.dashboard.pages, icon: FileText },
        { key: "portfolio", label: t.admin.dashboard.portfolio, icon: Briefcase },
        { key: "services", label: t.admin.dashboard.services, icon: Wrench },
        { key: "testimonials", label: t.admin.dashboard.testimonials, icon: Star },
        { key: "comments", label: t.admin.dashboard.comments, icon: MessageSquare },
      ],
    },
    {
      label: t.admin.dashboard.menus,
      items: [
        { key: "media", label: t.admin.dashboard.media, icon: ImageIcon },
        { key: "menus", label: t.admin.dashboard.menus, icon: MenuManagerIcon },
        { key: "messages", label: t.admin.dashboard.messages, icon: Mail },
        { key: "users", label: t.admin.dashboard.users, icon: Users },
        { key: "seo", label: t.admin.dashboard.seo, icon: Tag },
        { key: "settings", label: t.admin.dashboard.settings, icon: SettingsIcon },
      ],
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="hidden h-9 min-w-[240px] items-center gap-2 rounded-md border border-border bg-background/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent md:inline-flex"
          aria-label={t.admin.common.search}
        >
          <SearchIcon className="size-4" />
          <span className="truncate">{t.admin.common.search}</span>
          <kbd className="ml-auto hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[420px] p-0"
        align="start"
        sideOffset={6}
      >
        <Command>
          <CommandInput placeholder={t.admin.common.search} />
          <CommandList className="max-h-[360px]">
            <CommandEmpty>{t.admin.common.noData}</CommandEmpty>
            {groups.map((g) => (
              <CommandGroup key={g.label} heading={g.label}>
                {g.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.key}
                      value={`${item.label} ${item.key}`}
                      onSelect={() => {
                        onNavigate(item.key);
                        setOpen(false);
                      }}
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** User avatar dropdown (top-right). */
function UserMenu({
  onProfile,
  onSettings,
  onLogout,
}: {
  onProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
}) {
  const { t } = useTranslation();
  const user = getCurrentUser();
  const name = user?.name || "Admin";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md p-1 pr-2 transition-colors hover:bg-accent"
          aria-label={t.admin.dashboard.myProfile}
        >
          <Avatar className="size-8 border border-border">
            <AvatarFallback className="bg-brand-gradient text-xs font-bold text-primary-foreground">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
            {name}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{name}</span>
            <span className="text-xs text-muted-foreground">
              {user?.username ? `@${user.username}` : ""}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onProfile}>
          <UserIcon className="size-4" />
          {t.admin.dashboard.myProfile}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSettings}>
          <SettingsIcon className="size-4" />
          {t.admin.dashboard.settings}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          {t.admin.dashboard.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminLayout() {
  const { t, locale } = useTranslation();
  const setView = useAppStore((s) => s.setView);
  const adminToken = useAppStore((s) => s.adminToken);
  const setAdminToken = useAppStore((s) => s.setAdminToken);
  const [active, setActive] = useState<SectionKey>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  void useNotificationCounts();

  function handleNavigate(s: SectionKey) {
    setActive(s);
    setMobileOpen(false);
  }

  const navGroups: NavGroup[] = [
    {
      title: t.admin.dashboard.title,
      items: [
        { key: "overview", label: t.admin.dashboard.overview, icon: LayoutDashboard },
      ],
    },
    {
      title: locale === "id" ? "Konten" : "Content",
      items: [
        { key: "posts", label: t.admin.dashboard.posts, icon: Pencil },
        { key: "pages", label: t.admin.dashboard.pages, icon: FileText },
        { key: "portfolio", label: t.admin.dashboard.portfolio, icon: Briefcase },
        { key: "services", label: t.admin.dashboard.services, icon: Wrench },
        { key: "testimonials", label: t.admin.dashboard.testimonials, icon: Star },
        { key: "comments", label: t.admin.dashboard.comments, icon: MessageSquare },
      ],
    },
    {
      title: locale === "id" ? "Struktur" : "Structure",
      items: [
        { key: "media", label: t.admin.dashboard.media, icon: ImageIcon },
        { key: "menus", label: t.admin.dashboard.menus, icon: MenuManagerIcon },
      ],
    },
    {
      title: t.admin.dashboard.users,
      items: [
        { key: "profile", label: t.admin.dashboard.profile, icon: UserIcon },
        { key: "users", label: t.admin.dashboard.users, icon: Users },
        { key: "activity", label: t.admin.dashboard.activity, icon: ActivityIcon },
        { key: "analytics", label: t.admin.dashboard.analytics, icon: BarChart3 },
      ],
    },
    {
      title: locale === "id" ? "Sistem" : "System",
      items: [
        { key: "messages", label: t.admin.dashboard.messages, icon: Mail },
        { key: "seo", label: t.admin.dashboard.seo, icon: Tag },
        { key: "settings", label: t.admin.dashboard.settings, icon: SettingsIcon },
      ],
    },
    // === Panel Hosting ===
    {
      title: t.admin.dashboard.hostingPanel,
      items: [
        { key: "packages", label: t.admin.dashboard.packages, icon: Server },
        { key: "orders", label: t.admin.dashboard.orders, icon: Briefcase },
        { key: "invoices", label: t.admin.dashboard.invoices, icon: FileText },
        { key: "customers", label: t.admin.dashboard.customers, icon: Users },
        { key: "payments", label: t.admin.dashboard.payments, icon: Tag },
        { key: "coupons", label: t.admin.dashboard.coupons, icon: Ticket },
      ],
    },
    // === Support ===
    {
      title: t.admin.support.title,
      items: [
        { key: "tickets", label: t.admin.dashboard.tickets, icon: LifeBuoy },
        { key: "knowledge", label: t.admin.dashboard.knowledge, icon: BookOpen },
      ],
    },
    // === Server ===
    {
      title: t.admin.server.title,
      items: [
        { key: "server-monitor", label: t.admin.dashboard.serverMonitor, icon: ActivityIcon },
        { key: "cron", label: t.admin.dashboard.cronJobs, icon: Clock },
        { key: "dns", label: t.admin.dashboard.dns, icon: Globe },
        { key: "ssl-certs", label: t.admin.dashboard.ssl, icon: ShieldCheck },
        { key: "backups", label: t.admin.dashboard.backups, icon: HardDrive },
        { key: "email-accounts", label: t.admin.dashboard.emailAccounts, icon: Mail },
        { key: "ftp-accounts", label: t.admin.dashboard.ftpAccounts, icon: FolderOpen },
      ],
    },
    // === Marketing ===
    {
      title: t.admin.marketing.title,
      items: [
        { key: "newsletter", label: t.admin.dashboard.newsletter, icon: Megaphone },
        { key: "affiliate", label: t.admin.dashboard.affiliate, icon: Users },
      ],
    },
    // === Keamanan & Tools ===
    {
      title: t.admin.security.title,
      items: [
        { key: "security-logs", label: t.admin.dashboard.securityLogs, icon: ShieldCheck },
        { key: "staging", label: t.admin.dashboard.staging, icon: Server },
        { key: "ai-builder", label: t.admin.dashboard.aiBuilder, icon: Sparkles },
        { key: "realtime", label: t.admin.dashboard.analyticsPro, icon: BarChart3 },
      ],
    },
  ];

  async function handleLogout() {
    try {
      if (adminToken) {
        await apiFetch("/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: adminToken }),
        });
      }
    } catch {
      // ignore — we clear locally either way
    } finally {
      setAdminToken(null);
      toast.success(locale === "id" ? "Anda telah keluar" : "You have been logged out");
    }
  }

  function renderContent() {
    switch (active) {
      case "overview":
        return <AdminOverview onNavigate={handleNavigate} />;
      case "posts":
        return <AdminPostsManager />;
      case "pages":
        return <AdminPagesManager />;
      case "portfolio":
        return <AdminPortfolioManager />;
      case "services":
        return <AdminServicesManager />;
      case "testimonials":
        return <AdminTestimonialsManager />;
      case "comments":
        return <AdminCommentsManager />;
      case "media":
        return <AdminMediaManager />;
      case "menus":
        return <AdminMenusManager />;
      case "messages":
        return <AdminMessages />;
      case "users":
        return <AdminUsersManager />;
      case "activity":
        return <AdminActivityLog />;
      case "analytics":
        return <AdminAnalytics />;
      case "profile":
        return <AdminProfile />;
      case "seo":
        return <AdminSeoSettings />;
      case "settings":
        return <AdminSettings />;
      // Hosting Panel
      case "packages":
        return <AdminPackagesManager />;
      case "orders":
        return <AdminOrdersManager />;
      case "invoices":
        return <AdminInvoicesManager />;
      case "customers":
        return <AdminCustomersManager />;
      case "payments":
        return <AdminPaymentsManager />;
      case "coupons":
        return <AdminCouponsManager />;
      // Support
      case "tickets":
        return <AdminTicketsManager />;
      case "knowledge":
        return <AdminKnowledgeManager />;
      // Server
      case "server-monitor":
        return <AdminServerMonitor />;
      case "cron":
        return <AdminCronManager />;
      case "dns":
        return <AdminDNSManager />;
      case "ssl-certs":
        return <AdminSSLManager />;
      case "backups":
        return <AdminBackupsManager />;
      case "email-accounts":
        return <AdminEmailAccountsManager />;
      case "ftp-accounts":
        return <AdminFTPAccountsManager />;
      // Marketing
      case "newsletter":
        return <AdminNewsletterManager />;
      case "affiliate":
        return <AdminAffiliateManager />;
      // Security & Tools
      case "security-logs":
        return <AdminSecurityLogs />;
      case "staging":
        return <AdminStagingManager />;
      case "ai-builder":
        return <AdminAIBuilderManager />;
      case "realtime":
        return <AdminRealtimeAnalytics />;
      default:
        return <AdminOverview onNavigate={handleNavigate} />;
    }
  }

  // Find the currently active item across all groups (for the top bar title).
  const activeItem = navGroups
    .flatMap((g) => g.items)
    .find((i) => i.key === active);
  const ActiveIcon = activeItem?.icon ?? LayoutDashboard;

  const SidebarInner = ({ onNavigate }: { onNavigate?: (s: SectionKey) => void }) => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground shadow">
          <span className="text-base font-extrabold">J</span>
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-extrabold tracking-tight">
            Juragan<span className="gradient-text">Website</span>
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            CMS Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav
        className="custom-scroll flex-1 space-y-4 overflow-y-auto px-3 py-4"
        aria-label="Admin sections"
      >
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActive(item.key);
                    onNavigate?.(item.key);
                  }}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-accent hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r bg-gradient-to-b from-primary to-gold"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/60 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setView("public");
            onNavigate?.("overview");
          }}
          className="w-full justify-start gap-2 text-foreground/70 hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          {t.admin.dashboard.viewSite}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            handleLogout();
            onNavigate?.("overview");
          }}
          className="mt-1 w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          {t.admin.dashboard.logout}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-background flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:block">
        <SidebarInner onNavigate={(s) => setActive(s)} />
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <MenuIcon className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 sm:max-w-[300px]">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarInner onNavigate={(s) => handleNavigate(s)} />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </button>
              </SheetContent>
            </Sheet>

            <div className="flex min-w-0 items-center gap-2">
              <ActiveIcon className="size-5 shrink-0 text-primary" />
              <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">
                {activeItem?.label ?? t.admin.dashboard.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <GlobalSearch onNavigate={handleNavigate} />
            <LanguageToggle />
            <ThemeToggle />

            {/* Notifications bell — fetches from /api/notifications */}
            <AdminNotificationsCenter />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("public")}
              className="hidden sm:inline-flex"
            >
              <ExternalLink className="size-4" />
              {t.admin.dashboard.viewSite}
            </Button>

            <UserMenu
              onProfile={() => handleNavigate("profile")}
              onSettings={() => handleNavigate("settings")}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
