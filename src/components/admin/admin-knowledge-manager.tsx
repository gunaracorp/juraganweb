"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Eye, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { slugify } from "./_utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  contentId: string;
  contentEn: string;
  excerptId: string;
  excerptEn: string;
  category: string;
  tags: string;
  published: boolean;
  featured: boolean;
  author: string;
  views: number;
  helpful: number;
  unhelpful: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["general", "hosting", "domain", "billing", "technical", "tutorial"];

export function AdminKnowledgeManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    titleId: "",
    titleEn: "",
    contentId: "",
    contentEn: "",
    excerptId: "",
    excerptEn: "",
    category: "general",
    tags: "",
    published: true,
    featured: false,
    author: "Admin",
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-knowledge"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/knowledge?admin=true");
      if (!res.ok) return [] as Article[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Article[];
    },
  });
  const allItems = (data ?? []) as Article[];

  const list = useMemo(() => {
    let arr = allItems;
    if (category !== "all") arr = arr.filter((a) => a.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (a) =>
          a.titleId.toLowerCase().includes(q) ||
          a.titleEn.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q),
      );
    }
    return arr;
  }, [allItems, category, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }
  function openEdit(a: Article) {
    setEditing(a);
    setForm({
      titleId: a.titleId,
      titleEn: a.titleEn,
      contentId: a.contentId,
      contentEn: a.contentEn,
      excerptId: a.excerptId || "",
      excerptEn: a.excerptEn || "",
      category: a.category,
      tags: a.tags || "",
      published: a.published,
      featured: a.featured,
      author: a.author || "Admin",
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        slug: slugify(form.titleId || form.titleEn),
      };
      if (editing) {
        const res = await fetchWithAuth("/api/knowledge", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item;
      }
      const res = await fetchWithAuth("/api/knowledge", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Artikel tersimpan" : "Article saved");
      queryClient.invalidateQueries({ queryKey: ["admin-knowledge"] });
      setDialogOpen(false);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/knowledge?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Artikel dihapus" : "Article deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-knowledge"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.knowledge.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.knowledge.allArticles}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.knowledge.addNew}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.admin.common.search}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "id" ? "Semua Kategori" : "All Categories"}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpen className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.common.title}</TableHead>
                <TableHead>{t.admin.knowledge.fields.category}</TableHead>
                <TableHead className="text-center">{t.admin.knowledge.views}</TableHead>
                <TableHead className="text-center">{t.admin.knowledge.helpful}</TableHead>
                <TableHead className="text-center">{t.admin.common.published}</TableHead>
                <TableHead className="text-center">{t.admin.common.featured}</TableHead>
                <TableHead>{t.admin.knowledge.fields.author}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((a, i) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  className="hover:bg-accent/40"
                >
                  <TableCell>
                    <div className="font-medium">{locale === "id" ? a.titleId || a.titleEn : a.titleEn || a.titleId}</div>
                    <div className="text-xs text-muted-foreground">/{a.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{a.category}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Eye className="size-3 text-muted-foreground" />
                      {a.views || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm">{a.helpful || 0}</TableCell>
                  <TableCell className="text-center">
                    {a.published ? (
                      <Badge className="bg-primary/15 text-primary">{t.admin.common.published}</Badge>
                    ) : (
                      <Badge variant="secondary">{t.admin.common.draft}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {a.featured ? <Star className="mx-auto size-4 text-gold" /> : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{a.author}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(a)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(a.id)}
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
              {editing ? t.admin.knowledge.editTitle : t.admin.knowledge.addNew}
            </DialogTitle>
            <DialogDescription>{t.admin.knowledge.allArticles}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t.admin.knowledge.fields.titleId}</Label>
                <Input value={form.titleId} onChange={(e) => setForm({ ...form, titleId: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.knowledge.fields.titleEn}</Label>
                <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.knowledge.fields.excerptId}</Label>
                <Textarea rows={2} value={form.excerptId} onChange={(e) => setForm({ ...form, excerptId: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.knowledge.fields.excerptEn}</Label>
                <Textarea rows={2} value={form.excerptEn} onChange={(e) => setForm({ ...form, excerptEn: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.knowledge.fields.contentId}</Label>
                <Textarea rows={4} value={form.contentId} onChange={(e) => setForm({ ...form, contentId: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t.admin.knowledge.fields.contentEn}</Label>
                <Textarea rows={4} value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.knowledge.fields.category}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.knowledge.fields.tags}</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.knowledge.fields.author}</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="font-medium">{t.admin.knowledge.fields.published}</Label>
                </div>
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="font-medium">{t.admin.knowledge.fields.featured}</Label>
                </div>
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
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
