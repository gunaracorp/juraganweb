"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { Bell, CheckCheck, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function AdminNotificationsCenter() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const { data } = useQuery({
    queryKey: ["admin-notifications-unread"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/notifications?read=false");
      if (!res.ok) return [] as Notification[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Notification[];
    },
    refetchInterval: 30000,
  });

  const items = (data ?? []) as Notification[];
  const unreadCount = items.length;

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/notifications?id=${encodeURIComponent(id)}&action=read`, {
        method: "PUT",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Failed");
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications-unread"] }),
    onError: () => toast.error(locale === "id" ? "Gagal" : "Failed"),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth("/api/notifications?action=readall", {
        method: "PUT",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Failed");
      return true;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Semua notifikasi dibaca" : "All notifications marked read");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications-unread"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal" : "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Failed");
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications-unread"] }),
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/60 transition-colors hover:bg-accent"
          aria-label={t.admin.notifications.title}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-semibold">{t.admin.notifications.title}</span>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="h-7 px-2 text-xs"
            >
              <CheckCheck className="size-3.5" />
              {t.admin.notifications.markAllRead}
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[320px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="size-8 text-muted-foreground/40" />
              <p className="mt-2 text-xs text-muted-foreground">{t.admin.notifications.noNotifications}</p>
            </div>
          ) : (
            items.slice(0, 30).map((n) => (
              <div
                key={n.id}
                className="border-b border-border px-3 py-2 last:border-b-0 hover:bg-accent/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Badge variant="outline" className="mb-1 text-[10px]">
                      {t.admin.notifications.types[n.type as keyof typeof t.admin.notifications.types] || n.type}
                    </Badge>
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    {n.message && (
                      <p className="truncate text-xs text-muted-foreground">{n.message}</p>
                    )}
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: dateLocaleObj })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      onClick={() => markReadMutation.mutate(n.id)}
                      aria-label={t.admin.notifications.markRead}
                    >
                      <CheckCircle2 className={cn("size-3.5", n.read ? "text-primary" : "text-muted-foreground")} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(n.id)}
                      aria-label={t.admin.notifications.delete}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

void DropdownMenuItem;
void DropdownMenuLabel;
void DropdownMenuSeparator;
