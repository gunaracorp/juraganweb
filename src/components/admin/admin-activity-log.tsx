"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  Activity as ActivityIcon,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  LogIn,
  LogOut,
  Menu as MenuIcon,
  MessageSquare,
  Pencil,
  Plus,
  Settings,
  Trash2,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "./_utils";

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string | null;
  entityTitle: string | null;
  details: string;
  ip: string | null;
  createdAt: string;
}

const ENTITIES = [
  "all",
  "post",
  "page",
  "portfolio",
  "service",
  "testimonial",
  "message",
  "comment",
  "media",
  "menu",
  "setting",
  "user",
] as const;

const ACTION_ICON: Record<string, LucideIcon> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
  published: ArrowUpRight,
  unpublished: X,
  login: LogIn,
  logout: LogOut,
  uploaded: ArrowUpRight,
  replied: MessageSquare,
  approved: Check,
};

const ENTITY_ICON: Record<string, LucideIcon> = {
  post: FileText,
  page: FileText,
  portfolio: FileText,
  service: Settings,
  testimonial: CheckCircle2,
  message: MessageSquare,
  comment: MessageSquare,
  media: ImageIcon,
  menu: MenuIcon,
  setting: Settings,
  user: User,
};

export function AdminActivityLog() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;
  const [entity, setEntity] = useState<(typeof ENTITIES)[number]>("all");
  const [limit, setLimit] = useState(50);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity", entity, limit],
    queryFn: async () => {
      const q = entity === "all" ? "" : `?entity=${entity}`;
      const qLimit = `?limit=${limit}`;
      const sep = q && qLimit ? "&" : "";
      const url = `/api/activity${q || qLimit}${q && qLimit ? sep : ""}`;
      const res = await fetchWithAuth(url);
      if (!res.ok) return [] as ActivityItem[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as ActivityItem[];
    },
  });

  const items = (data ?? []) as ActivityItem[];

  // Group consecutive items by day for nicer display
  const grouped = useMemo(() => {
    const map = new Map<string, ActivityItem[]>();
    for (const a of items) {
      const day = new Date(a.createdAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US");
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(a);
    }
    return Array.from(map.entries());
  }, [items, locale]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.activity.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${items.length} aktivitas tercatat`
              : `${items.length} activities recorded`}
          </p>
        </div>
        <Select
          value={entity}
          onValueChange={(v) => setEntity(v as (typeof ENTITIES)[number])}
        >
          <SelectTrigger className="sm:w-[200px]">
            <SelectValue placeholder={t.admin.activity.filterAll} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.admin.activity.filterAll}</SelectItem>
            {ENTITIES.filter((e) => e !== "all").map((e) => (
              <SelectItem key={e} value={e}>
                {e === "post"
                  ? t.admin.dashboard.posts
                  : e === "page"
                    ? t.admin.dashboard.pages
                    : e === "portfolio"
                      ? t.admin.dashboard.portfolio
                      : e === "service"
                        ? t.admin.dashboard.services
                        : e === "testimonial"
                          ? t.admin.dashboard.testimonials
                          : e === "message"
                            ? t.admin.dashboard.messages
                            : e === "comment"
                              ? t.admin.dashboard.comments
                              : e === "media"
                                ? t.admin.dashboard.media
                                : e === "menu"
                                  ? t.admin.dashboard.menus
                                  : e === "setting"
                                    ? t.admin.dashboard.settings
                                    : e === "user"
                                      ? t.admin.dashboard.users
                                      : e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ActivityIcon className="size-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {t.admin.activity.empty}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, group]) => (
            <div key={day}>
              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                {day}
              </p>
              <div className="relative space-y-3 pl-6">
                {/* Timeline line */}
                <div className="absolute bottom-0 left-2 top-0 w-px bg-border/60" />
                {group.map((a, idx) => {
                  const ActionIcon = ACTION_ICON[a.action] ?? Clock;
                  const EntityIcon = ENTITY_ICON[a.entity] ?? ActivityIcon;
                  const actionText =
                    t.admin.activity.actions[
                      a.action as keyof typeof t.admin.activity.actions
                    ] ?? a.action;
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="relative"
                    >
                      <span
                        className={cn(
                          "absolute -left-6 top-3 flex size-5 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground",
                        )}
                      >
                        <ActionIcon className="size-3" />
                      </span>
                      <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:bg-accent/40">
                        <Avatar className="size-9 shrink-0 border border-border">
                          <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                            {getInitials(a.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug">
                            <span className="font-semibold">{a.userName}</span>{" "}
                            <span className="text-muted-foreground">{actionText}</span>{" "}
                            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                              <EntityIcon className="size-3" />
                              {a.entity}
                            </span>{" "}
                            {a.entityTitle && (
                              <span className="font-medium text-foreground">
                                {a.entityTitle}
                              </span>
                            )}
                          </p>
                          {a.details && (
                            <p className="mt-0.5 text-xs text-muted-foreground/80">
                              {a.details}
                            </p>
                          )}
                          <p className="mt-1 text-[11px] text-muted-foreground/70">
                            {formatDistanceToNow(new Date(a.createdAt), {
                              addSuffix: true,
                              locale: dateLocaleObj,
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Load more */}
          {items.length >= limit && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => setLimit((l) => l + 50)}
              >
                {locale === "id" ? "Muat Lebih Banyak" : "Load More"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
