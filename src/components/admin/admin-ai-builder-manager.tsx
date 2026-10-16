"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  Bot,
  ExternalLink,
  Eye,
  Plus,
  Rocket,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { cn } from "@/lib/utils";

interface AIPage {
  id: string;
  slug: string;
  title: string;
  path: string;
}
interface AIProject {
  id: string;
  name: string;
  business: string;
  industry: string;
  template: string;
  status: string;
  pages: AIPage[];
  publishedUrl: string | null;
  createdAt: string;
}

const TEMPLATES = ["cafe", "salon", "boutique", "consultant", "restaurant", "portfolio", "landing", "store"];

function statusBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    generating: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    completed: "bg-primary/15 text-primary",
    published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  };
  return (
    <Badge className={map[s] || "bg-muted text-muted-foreground"}>
      {t.admin.aiBuilder.statuses[s as keyof typeof t.admin.aiBuilder.statuses] || s}
    </Badge>
  );
}

export function AdminAIBuilderManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<AIProject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    name: "",
    business: "",
    industry: "",
    template: "cafe",
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ai-builder"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/ai-builder");
      if (!res.ok) return [] as AIProject[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as AIProject[];
    },
    refetchInterval: 2000,
  });
  const allItems = (data ?? []) as AIProject[];

  function openCreate() {
    setForm(emptyForm);
    setDialogOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth("/api/ai-builder", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Proyek dibuat" : "Project created");
      queryClient.invalidateQueries({ queryKey: ["admin-ai-builder"] });
      setDialogOpen(false);
    },
    onError: () => toast.error(locale === "id" ? "Gagal membuat" : "Failed to create"),
  });

  const generateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/ai-builder?action=generate", {
        method: "PUT",
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Generate failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Generate dimulai" : "Generation started");
      queryClient.invalidateQueries({ queryKey: ["admin-ai-builder"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal generate" : "Failed to generate"),
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/ai-builder?action=publish", {
        method: "PUT",
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Publish failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Website dipublikasi" : "Website published");
      queryClient.invalidateQueries({ queryKey: ["admin-ai-builder"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal publikasi" : "Failed to publish"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/ai-builder?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Proyek dihapus" : "Project deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-ai-builder"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.aiBuilder.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-gold" />
              {t.admin.aiBuilder.generate}
            </span>
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.aiBuilder.addNew}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Bot className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allItems.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
            >
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-bold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.business} · <span className="capitalize">{p.industry}</span>
                      </div>
                    </div>
                    {statusBadge(p.status, t)}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="capitalize">{p.template}</Badge>
                    <span>·</span>
                    <span>{(p.pages || []).length} {t.admin.aiBuilder.fields.pages}</span>
                    <span>·</span>
                    <span>{format(new Date(p.createdAt), "dd MMM yyyy", { locale: dateLocaleObj })}</span>
                  </div>

                  {p.publishedUrl && (
                    <a
                      href={p.publishedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 truncate text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      <span className="truncate">{p.publishedUrl}</span>
                    </a>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateMutation.mutate(p.id)}
                      disabled={generateMutation.isPending || p.status === "generating"}
                    >
                      <Wand2 className="size-3.5" />
                      {t.admin.aiBuilder.generate}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => publishMutation.mutate(p.id)}
                      disabled={publishMutation.isPending || p.status !== "completed"}
                    >
                      <Rocket className="size-3.5" />
                      {t.admin.aiBuilder.publish}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewing(p)}
                      aria-label={t.admin.common.view}
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(p.id)}
                      aria-label={t.admin.common.delete}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.admin.aiBuilder.addNew}</DialogTitle>
            <DialogDescription>{t.admin.aiBuilder.title}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label>{t.admin.aiBuilder.fields.name}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.admin.aiBuilder.fields.business}</Label>
              <Input value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} placeholder="Cafe Bahari" />
            </div>
            <div className="space-y-1.5">
              <Label>{t.admin.aiBuilder.fields.industry}</Label>
              <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="food" />
            </div>
            <div className="space-y-1.5">
              <Label>{t.admin.aiBuilder.fields.template}</Label>
              <Select value={form.template} onValueChange={(v) => setForm({ ...form, template: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((tp) => (
                    <SelectItem key={tp} value={tp} className="capitalize">{tp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.admin.common.cancel}
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="bg-brand-gradient text-primary-foreground"
            >
              {t.admin.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pages view dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>
              {viewing && statusBadge(viewing.status, t)}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <ScrollArea className="max-h-[60vh] pr-3">
              <div className="space-y-2">
                {(viewing.pages || []).length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">{t.admin.common.noData}</p>
                ) : (
                  viewing.pages.map((pg) => (
                    <div key={pg.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                      <div>
                        <div className="font-medium">{pg.title}</div>
                        <div className="text-xs text-muted-foreground font-mono">{pg.path}</div>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">{pg.slug}</Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
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
