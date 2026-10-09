"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { Mail, Megaphone, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  subjectId: string;
  subjectEn: string;
  contentId: string;
  contentEn: string;
  status: string;
  target: string;
  targetCount: number;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

const STATUS_KEYS = ["draft", "scheduled", "sending", "sent", "paused"] as const;

function statusBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    sending: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    sent: "bg-primary/15 text-primary",
    paused: "bg-destructive/15 text-destructive",
  };
  return (
    <Badge className={map[s] || "bg-muted text-muted-foreground"}>
      {t.admin.newsletter.statuses[s as keyof typeof t.admin.newsletter.statuses] || s}
    </Badge>
  );
}

export function AdminNewsletterManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Campaign | null>(null);

  const emptyForm = {
    name: "",
    subjectId: "",
    subjectEn: "",
    contentId: "",
    contentEn: "",
    status: "draft" as string,
    target: "all",
    scheduledAt: "",
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/newsletter");
      if (!res.ok) return [] as Campaign[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Campaign[];
    },
  });
  const allItems = (data ?? []) as Campaign[];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }
  function openEdit(c: Campaign) {
    setEditing(c);
    setForm({
      name: c.name,
      subjectId: c.subjectId || "",
      subjectEn: c.subjectEn || "",
      contentId: c.contentId || "",
      contentEn: c.contentEn || "",
      status: STATUS_KEYS.includes(c.status as any) ? c.status : "draft",
      target: c.target || "all",
      scheduledAt: c.scheduledAt ? c.scheduledAt.slice(0, 16) : "",
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
      };
      if (editing) {
        const res = await fetchWithAuth("/api/newsletter", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item;
      }
      const res = await fetchWithAuth("/api/newsletter", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Campaign tersimpan" : "Campaign saved");
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
      setDialogOpen(false);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save"),
  });

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/newsletter?action=send", {
        method: "PUT",
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Send failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Campaign dikirim" : "Campaign sent");
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal mengirim" : "Failed to send"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/newsletter?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Campaign dihapus" : "Campaign deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.newsletter.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.newsletter.allCampaigns}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.newsletter.addNew}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Megaphone className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.newsletter.fields.name}</TableHead>
                <TableHead>{t.admin.newsletter.fields.status}</TableHead>
                <TableHead>{t.admin.newsletter.fields.target}</TableHead>
                <TableHead className="text-center">{t.admin.newsletter.fields.targetCount}</TableHead>
                <TableHead>{t.admin.newsletter.fields.scheduledAt}</TableHead>
                <TableHead>{t.admin.newsletter.fields.sentAt}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allItems.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  className="hover:bg-accent/40"
                >
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {locale === "id" ? c.subjectId || c.subjectEn : c.subjectEn || c.subjectId}
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(c.status, t)}</TableCell>
                  <TableCell className="text-sm capitalize">{c.target || "all"}</TableCell>
                  <TableCell className="text-center text-sm">{c.targetCount || 0}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.scheduledAt ? format(new Date(c.scheduledAt), "dd MMM yyyy HH:mm", { locale: dateLocaleObj }) : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.sentAt ? format(new Date(c.sentAt), "dd MMM yyyy HH:mm", { locale: dateLocaleObj }) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewing(c)}
                        aria-label={t.admin.common.view}
                      >
                        <Mail className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => sendMutation.mutate(c.id)}
                        disabled={sendMutation.isPending || c.status === "sent"}
                        aria-label={t.admin.newsletter.sendNow}
                        className="text-primary"
                      >
                        <Send className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(c)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(c.id)}
                        aria-label={t.admin.common.delete}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.admin.newsletter.editTitle : t.admin.newsletter.addNew}
            </DialogTitle>
            <DialogDescription>{t.admin.newsletter.allCampaigns}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.newsletter.fields.name}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.newsletter.fields.subjectId}</Label>
                <Input value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.newsletter.fields.subjectEn}</Label>
                <Input value={form.subjectEn} onChange={(e) => setForm({ ...form, subjectEn: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.newsletter.fields.contentId}</Label>
                <Textarea rows={4} value={form.contentId} onChange={(e) => setForm({ ...form, contentId: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.newsletter.fields.contentEn}</Label>
                <Textarea rows={4} value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.newsletter.fields.target}</Label>
                <Select value={form.target} onValueChange={(v) => setForm({ ...form, target: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{locale === "id" ? "Semua" : "All"}</SelectItem>
                    <SelectItem value="subscribers">{locale === "id" ? "Subscriber" : "Subscribers"}</SelectItem>
                    <SelectItem value="customers">{t.admin.customers.title}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.newsletter.fields.scheduledAt}</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.newsletter.fields.status}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_KEYS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t.admin.newsletter.statuses[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.admin.common.cancel}
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-brand-gradient text-primary-foreground"
            >
              {t.admin.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats view dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>
              {viewing && statusBadge(viewing.status, t)}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {locale === "id" ? viewing.subjectId || viewing.subjectEn : viewing.subjectEn || viewing.subjectId}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: t.admin.newsletter.stats.sent, value: viewing.stats?.sent ?? 0, color: "text-primary" },
                  { label: t.admin.newsletter.stats.delivered, value: viewing.stats?.delivered ?? 0, color: "text-emerald-500" },
                  { label: t.admin.newsletter.stats.opened, value: viewing.stats?.opened ?? 0, color: "text-gold" },
                  { label: t.admin.newsletter.stats.clicked, value: viewing.stats?.clicked ?? 0, color: "text-amber-500" },
                  { label: t.admin.newsletter.stats.bounced, value: viewing.stats?.bounced ?? 0, color: "text-destructive" },
                  { label: t.admin.newsletter.stats.unsubscribed, value: viewing.stats?.unsubscribed ?? 0, color: "text-muted-foreground" },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="p-3">
                      <div className="text-[10px] uppercase text-muted-foreground">{s.label}</div>
                      <div className={cn("mt-1 text-lg font-extrabold", s.color)}>{s.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {viewing.sentAt && (
                <p className="text-xs text-muted-foreground">
                  {t.admin.newsletter.fields.sentAt}: {format(new Date(viewing.sentAt), "dd MMM yyyy HH:mm", { locale: dateLocaleObj })}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.common.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>{t.admin.common.noData}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.admin.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive"
            >
              {t.admin.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
