"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Globe,
  FileText,
  MessageSquare,
  User,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "@/lib/customer-store";
import { toast } from "sonner";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/client", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/services", label: "Layanan", icon: Server },
  { href: "/client/domains", label: "Domain", icon: Globe },
  { href: "/client/invoices", label: "Invoice", icon: FileText },
  { href: "/client/tickets", label: "Tiket", icon: MessageSquare },
  { href: "/client/profile", label: "Profil", icon: User },
];

export function ClientNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useCustomerStore();

  const onLogout = () => {
    logout();
    toast.success("Anda telah keluar");
    router.push("/login");
  };

  return (
    <aside className="w-full lg:w-64 lg:flex-shrink-0">
      <nav className="glass sticky top-20 rounded-xl border border-border/60 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-brand-gradient/10 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-base font-extrabold text-primary-foreground">
            {(customer?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{customer?.name || "Tamu"}</p>
            <p className="truncate text-xs text-muted-foreground">{customer?.email || "-"}</p>
          </div>
        </div>

        <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-shrink-0">
                <Link
                  href={item.href}
                  className={cn(
                    "inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-gradient text-primary-foreground shadow-sm"
                      : "text-foreground/70 hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 hidden border-t border-border/60 pt-3 lg:block">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
            <span>Keluar</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
