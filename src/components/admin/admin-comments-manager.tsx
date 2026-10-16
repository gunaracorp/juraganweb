"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  Ban,
  Check,
  Clock,
  MessageSquare,
  Reply,
  Send,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "./_utils";

interface CommentItem {
  id: string;
  postId: string;
  name: string;
  email: string;
  website: string | null;
  content: string;
  status: string; // approved, pending, spam, trash
  parentId: string | null;
  createdAt: string;
  post?: { titleId: string; titleEn: string; slug: string } | null;
}

type Filter = "all" | "pending" | "approved" | "spam" | "trash";

export function AdminCommentsManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-comments", filter],
    queryFn: async () => {
      const q = filter === "all" ? "" : `?admin=true&status=${filter}`;
      const res = await fetchWithAuth(`/api/comments${q || "?admin=true"}`);
      if (!res.ok) return [] as CommentItem[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as CommentItem[];
    },
  });

  const all = (data ?? []) as CommentItem[];
  // Fetch all once for counts (we cheat and fetch every status count from a single query if "all"; otherwise we can rely on this list).
  const counts = useMemo(() => {
    const c = { all: 0, pending: 0, approved: 0, spam: 0, trash: 0 };
    for (const cmt of all) {
      c.all++;
      if (cmt.status in c) c[cmt.status as keyof typeof c]++;
    }
    return c;
  }, [all]);

  const list = all;

  function toggleSelected(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function toggleSelectAll() {
    if (selected.length === list.length) setSelected([]);
    else setSelected(list.map((c) => c.id));
  }

  const statusMutation = useMutation({
    mutationFn: async ({
      ids,
      status,
    }: {
      ids: string[];
      status: string;
    }) => {
      const results = await Promise.all(
        ids.map((id) =>
          fetchWithAuth("/api/comments", {
            method: "PUT",
            body: JSON.stringify({ id, status }),
          }),
        ),
      );
      for (const r of results) {
        const j = await r.json().catch(() => null);
        if (!r.ok || !j?.ok) throw new Error("update failed");
      }
      return { ids, status };
    },
    onSuccess: (_vars) => {
      toast.success(
        _vars.ids.length > 1
          ? `${_vars.ids.length} ${locale === "id" ? "komentar diperbarui" : "comments updated"}`
          : locale === "id"
            ? "Komentar diperbarui"
            : "Comment updated",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setSelected([]);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal memperbarui" : "Failed to update");
    },
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!replyTo) return;
      // Find original to get its postId
      const orig = all.find((c) => c.id === replyTo);
      if (!orig) throw new Error("not found");
      const res = await fetchWithAuth("/api/comments", {
        method: "POST",
        body: JSON.stringify({
          postId: orig.postId,
          name: "Admin",
          email: "admin@juraganwebsite.web.id",
          content: replyContent,
          parentId: replyTo,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Reply failed");
      // Mark original as approved (since admin replied)
      await fetchWithAuth("/api/comments", {
        method: "PUT",
        body: JSON.stringify({ id: replyTo, status: "approved" }),
      });
      return json;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Balasan terkirim" : "Reply sent");
      setReplyTo(null);
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal membalas" : "Failed to reply");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      permanent,
    }: {
      id: string;
      permanent: boolean;
    }) => {
      const url = permanent
        ? `/api/comments?id=${encodeURIComponent(id)}&permanent=true`
        : `/api/comments?id=${encodeURIComponent(id)}`;
      const res = await fetchWithAuth(url, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return { id, permanent };
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.permanent
          ? locale === "id"
            ? "Komentar dihapus permanen"
            : "Comment permanently deleted"
          : locale === "id"
            ? "Komentar dipindahkan ke sampah"
            : "Comment moved to trash",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete");
    },
  });

  function statusBadge(status: string) {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-primary/15 text-primary">
            <Check className="size-3" />
            {t.admin.comments.approved}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gold/15 text-gold">
            <Clock className="size-3" />
            {t.admin.comments.pending}
          </Badge>
        );
      case "spam":
        return (
          <Badge variant="destructive">
            <Shield className="size-3" />
            {t.admin.comments.spam}
          </Badge>
        );
      case "trash":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Trash2 className="size-3" />
            {t.admin.trash.label}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: t.admin.comments.all, count: counts.all },
    { key: "pending", label: t.admin.comments.pending, count: counts.pending },
    { key: "approved", label: t.admin.comments.approved, count: counts.approved },
    { key: "spam", label: t.admin.comments.spam, count: counts.spam },
    { key: "trash", label: t.admin.trash.label, count: counts.trash },
  ];

  const hasSelected = selected.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.comments.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${counts.all} komentar total`
              : `${counts.all} total comments`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              setFilter(f.key);
              setSelected([]);
            }}
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

      {/* Bulk actions bar */}
      {hasSelected && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5"
        >
          <span className="px-2 text-sm font-medium text-primary">
            {selected.length} {t.admin.bulkActions.selected}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                statusMutation.mutate({ ids: selected, status: "approved" })
              }
              disabled={statusMutation.isPending}
            >
              <Check className="size-3.5" />
              {t.admin.comments.approve}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                statusMutation.mutate({ ids: selected, status: "spam" })
              }
              disabled={statusMutation.isPending}
            >
              <Shield className="size-3.5" />
              {t.admin.comments.spam}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                statusMutation.mutate({ ids: selected, status: "trash" })
              }
              disabled={statusMutation.isPending}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
              {t.admin.trash.label}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelected([])}
            >
              <X className="size-3.5" />
              {t.admin.common.cancel}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <input
                  type="checkbox"
                  checked={list.length > 0 && selected.length === list.length}
                  onChange={toggleSelectAll}
                  className="size-4 cursor-pointer rounded border-border accent-primary"
                  aria-label={t.admin.bulkActions.selectAll}
                />
              </TableHead>
              <TableHead className="min-w-[200px]">
                {locale === "id" ? "Penulis" : "Author"}
              </TableHead>
              <TableHead className="min-w-[260px]">
                {locale === "id" ? "Komentar" : "Comment"}
              </TableHead>
              <TableHead>{t.admin.comments.on}</TableHead>
              <TableHead>{t.admin.common.status}</TableHead>
              <TableHead>{t.admin.common.createdAt}</TableHead>
              <TableHead className="text-right">{t.admin.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="size-8 text-muted-foreground/50" />
                    {t.admin.comments.empty}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              list.map((c, idx) => {
                const postTitle = c.post
                  ? locale === "id"
                    ? c.post.titleId
                    : c.post.titleEn || c.post.titleId
                  : "—";
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50",
                      selected.includes(c.id) && "bg-primary/5",
                    )}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.includes(c.id)}
                        onChange={() => toggleSelected(c.id)}
                        className="size-4 cursor-pointer rounded border-border accent-primary"
                        aria-label="Select comment"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-9 border border-border">
                          <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                            {getInitials(c.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{c.name}</p>
                          <a
                            href={`mailto:${c.email}`}
                            className="block truncate text-xs text-muted-foreground hover:text-primary"
                          >
                            {c.email}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[320px]">
                        <p className="line-clamp-2 text-sm">{c.content}</p>
                        {replyTo === c.id && (
                          <div className="mt-2 space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-2">
                            <Textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={locale === "id" ? "Tulis balasan..." : "Write reply..."}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setReplyTo(null);
                                  setReplyContent("");
                                }}
                              >
                                {t.admin.common.cancel}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => replyMutation.mutate()}
                                disabled={!replyContent.trim() || replyMutation.isPending}
                                className="bg-brand-gradient text-primary-foreground hover:opacity-95"
                              >
                                <Send className="size-3.5" />
                                {locale === "id" ? "Kirim" : "Send"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {postTitle}
                      </p>
                    </TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.createdAt), {
                        addSuffix: true,
                        locale: dateLocaleObj,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {c.status === "approved" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              statusMutation.mutate({ ids: [c.id], status: "pending" })
                            }
                            aria-label={t.admin.comments.unapprove}
                          >
                            <Ban className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              statusMutation.mutate({ ids: [c.id], status: "approved" })
                            }
                            aria-label={t.admin.comments.approve}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Check className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setReplyTo(c.id)}
                          aria-label={t.admin.comments.reply}
                        >
                          <Reply className="size-4" />
                        </Button>
                        {c.status !== "spam" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              statusMutation.mutate({ ids: [c.id], status: "spam" })
                            }
                            aria-label={t.admin.comments.spam}
                            className="text-gold hover:bg-gold/10"
                          >
                            <Shield className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(c.id)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={t.admin.common.delete}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.common.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "id"
                ? "Komentar akan dipindahkan ke sampah. Anda bisa menghapus permanen nanti."
                : "Comment will be moved to trash. You can permanently delete later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t.admin.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteId && deleteMutation.mutate({ id: deleteId, permanent: false })
              }
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
