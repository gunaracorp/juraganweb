"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  ChevronDown,
  Inbox,
  Mail,
  MailOpen,
  MessageCircle,
  Phone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  read: boolean;
  createdAt: string;
}

type Filter = "all" | "new" | "read";

function statusBadge(status: string, read: boolean, t: any) {
  if (status === "replied") {
    return (
      <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
        {t.admin.messages.replied}
      </Badge>
    );
  }
  if (!read) {
    return (
      <Badge variant="default" className="bg-gold text-gold-foreground">
        {t.admin.messages.new}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-muted text-muted-foreground">
      {t.admin.messages.read}
    </Badge>
  );
}

export function AdminMessages() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const dateLocale = locale === "id" ? idLocale : enUS;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/messages");
      if (!res.ok) return [] as Message[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Message[];
    },
  });

  const all = useMemo(() => {
    const arr = (data ?? []) as Message[];
    return [...arr].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [data]);

  const counts = useMemo(() => {
    const c = { all: all.length, new: 0, read: 0 };
    for (const m of all) {
      if (m.status === "replied") c.read++;
      else if (!m.read) c.new++;
      else c.read++;
    }
    return c;
  }, [all]);

  const list = useMemo(() => {
    if (filter === "all") return all;
    if (filter === "new") return all.filter((m) => m.status !== "replied" && !m.read);
    return all.filter((m) => m.status === "replied" || m.read);
  }, [all, filter]);

  const toggleReadMutation = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const res = await fetchWithAuth("/api/messages", {
        method: "PUT",
        body: JSON.stringify({ id, read }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Update failed");
      return { id, read };
    },
    onSuccess: ({ read }) => {
      toast.success(
        read
          ? locale === "id"
            ? "Ditandai dibaca"
            : "Marked as read"
          : locale === "id"
            ? "Ditandai belum dibaca"
            : "Marked as unread",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages-preview"] });
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal memperbarui" : "Failed to update");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/messages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Pesan dihapus" : "Message deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages-preview"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete");
    },
  });

  function handleExpand(m: Message) {
    if (expanded === m.id) {
      setExpanded(null);
      return;
    }
    setExpanded(m.id);
    if (!m.read) {
      toggleReadMutation.mutate({ id: m.id, read: true });
    }
  }

  function handleReplyWhatsApp(phone: string | null) {
    if (!phone) {
      toast.error(locale === "id" ? "Nomor WhatsApp tidak tersedia" : "No WhatsApp number available");
      return;
    }
    const clean = phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
    window.open(`https://wa.me/${clean}`, "_blank", "noopener,noreferrer");
  }

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: locale === "id" ? "Semua" : "All", count: counts.all },
    { key: "new", label: t.admin.messages.new, count: counts.new },
    { key: "read", label: t.admin.messages.read, count: counts.read },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.messages.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${counts.new} pesan baru dari ${counts.all} total`
              : `${counts.new} new of ${counts.all} total`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background hover:bg-accent",
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs font-semibold",
                filter === f.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {t.admin.messages.empty}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {list.map((m, idx) => {
              const isOpen = expanded === m.id;
              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={cn(
                    "rounded-xl border border-border/60 bg-card transition-colors",
                    !m.read && "border-primary/40 bg-primary/5",
                    isOpen && "shadow-md",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleExpand(m)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <div
                      className={cn(
                        "mt-1 flex size-9 shrink-0 items-center justify-center rounded-full",
                        m.read
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {m.read ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {m.name}
                            {!m.read && (
                              <span className="ml-2 inline-block size-2 -translate-y-0.5 rounded-full bg-primary align-middle" />
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {m.subject || m.message}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {statusBadge(m.status, m.read, t)}
                          <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                            <ChevronDown className="size-4 text-muted-foreground" />
                          </motion.span>
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {format(new Date(m.createdAt), "PPpp", { locale: dateLocale })}
                      </p>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-border/60"
                      >
                        <div className="p-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                {t.admin.messages.from}
                              </p>
                              <p className="text-sm font-medium">{m.name}</p>
                              <a
                                href={`mailto:${m.email}`}
                                className="block truncate text-xs text-primary hover:underline"
                              >
                                {m.email}
                              </a>
                              {m.phone && (
                                <a
                                  href={`tel:${m.phone}`}
                                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <Phone className="size-3" />
                                  {m.phone}
                                </a>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                {t.admin.messages.title}
                              </p>
                              <p className="text-sm font-medium">
                                {m.subject || "—"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-3">
                            <p className="whitespace-pre-line text-sm text-foreground/90">
                              {m.message}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toggleReadMutation.mutate({
                                  id: m.id,
                                  read: !m.read,
                                })
                              }
                              disabled={toggleReadMutation.isPending}
                            >
                              {m.read ? (
                                <>
                                  <Mail className="size-3.5" />
                                  {t.admin.messages.markUnread}
                                </>
                              ) : (
                                <>
                                  <MailOpen className="size-3.5" />
                                  {t.admin.messages.markRead}
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReplyWhatsApp(m.phone)}
                              className="bg-brand-gradient text-primary-foreground hover:opacity-95"
                            >
                              <MessageCircle className="size-3.5" />
                              {t.admin.messages.reply}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteId(m.id)}
                              className="ml-auto border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                              {t.admin.messages.delete}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.common.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "id"
                ? "Tindakan ini tidak dapat dibatalkan."
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t.admin.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t.admin.common.loading : t.admin.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
