"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Portfolio {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  category: string;
  client: string;
  url: string | null;
  image: string | null;
  year: number;
  featured: boolean;
  createdAt: string;
}

const PORTFOLIO_CATEGORIES = [
  "Website",
  "E-Commerce",
  "Company Profile",
  "Web App",
  "Mobile App",
  "Branding",
];

const schema = z.object({
  titleId: z.string().min(1),
  titleEn: z.string().min(1),
  descId: z.string().min(1),
  descEn: z.string().min(1),
  category: z.string().min(1),
  client: z.string().min(1),
  url: z.string().optional().default(""),
  image: z.string().optional().default(""),
  year: z.coerce.number().int().min(2000).max(2100),
  featured: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function AdminPortfolioManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Portfolio | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/portfolio");
      if (!res.ok) return [] as Portfolio[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Portfolio[];
    },
  });

  const list = useMemo(() => {
    const all = (data ?? []) as Portfolio[];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (p) =>
        p.titleId.toLowerCase().includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [data, search]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titleId: "",
      titleEn: "",
      descId: "",
      descEn: "",
      category: "Website",
      client: "",
      url: "",
      image: "",
      year: new Date().getFullYear(),
      featured: false,
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      titleId: "",
      titleEn: "",
      descId: "",
      descEn: "",
      category: "Website",
      client: "",
      url: "",
      image: "",
      year: new Date().getFullYear(),
      featured: false,
    });
    setDialogOpen(true);
  }

  function openEdit(item: Portfolio) {
    setEditing(item);
    form.reset({
      titleId: item.titleId,
      titleEn: item.titleEn,
      descId: item.descId,
      descEn: item.descEn,
      category: item.category,
      client: item.client,
      url: item.url ?? "",
      image: item.image ?? "",
      year: item.year,
      featured: item.featured,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        slug: editing?.slug ?? slugify(values.titleId || values.titleEn),
      };
      if (editing) {
        const res = await fetchWithAuth("/api/portfolio", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item as Portfolio;
      }
      const res = await fetchWithAuth("/api/portfolio", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item as Portfolio;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Portofolio tersimpan" : "Portfolio saved");
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/portfolio?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Portofolio dihapus" : "Portfolio deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete");
    },
  });

  function onSubmit(values: FormValues) {
    saveMutation.mutate(values);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.portfolio.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${(data ?? []).length} proyek portofolio`
              : `${(data ?? []).length} portfolio items`}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95">
          <Plus className="size-4" />
          {t.admin.portfolio.addNew}
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.admin.common.search}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">{t.admin.common.title}</TableHead>
              <TableHead>{t.admin.portfolio.fields.category}</TableHead>
              <TableHead>{t.admin.portfolio.fields.client}</TableHead>
              <TableHead>{t.admin.portfolio.fields.year}</TableHead>
              <TableHead>{t.admin.common.featured}</TableHead>
              <TableHead className="text-right">{t.admin.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  {t.admin.common.noData}
                </TableCell>
              </TableRow>
            ) : (
              list.map((p, idx) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-muted/50 border-b transition-colors"
                >
                  <TableCell className="max-w-[280px]">
                    <p className="truncate text-sm font-semibold">
                      {locale === "id" ? p.titleId : p.titleEn || p.titleId}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {locale === "id" ? p.titleEn : p.titleId}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{p.client}</TableCell>
                  <TableCell className="text-sm tabular-nums">{p.year}</TableCell>
                  <TableCell>
                    {p.featured ? (
                      <Star className="size-4 fill-gold text-gold" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(p)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(p.id)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={t.admin.common.delete}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.admin.portfolio.editTitle : t.admin.portfolio.addNew}
            </DialogTitle>
            <DialogDescription>
              {locale === "id"
                ? "Lengkapi data portofolio bilingual di bawah."
                : "Fill in the bilingual portfolio data below."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="titleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.portfolio.fields.titleId}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="titleEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.portfolio.fields.titleEn}</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="descId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.portfolio.fields.descId}</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.portfolio.fields.descEn}</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.portfolio.fields.category}</FormLabel>
                      <FormControl>
                        <Input list="portfolio-categories" {...field} />
                        <datalist id="portfolio-categories">
                          {PORTFOLIO_CATEGORIES.map((c) => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.portfolio.fields.client}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.portfolio.fields.url}</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.portfolio.fields.image}</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.portfolio.fields.year}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border/60 p-3 mt-6">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-1.5">
                          <Star className="size-3.5 text-gold" />
                          {t.admin.portfolio.fields.featured}
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="sticky bottom-0 -mx-6 border-t border-border/60 bg-background/80 px-6 py-3 backdrop-blur">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={saveMutation.isPending}
                >
                  {t.admin.common.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-brand-gradient text-primary-foreground hover:opacity-95"
                >
                  {saveMutation.isPending ? t.admin.common.loading : t.admin.common.save}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
