"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  ExternalLink,
  FileText,
  GripVertical,
  Hash,
  Image as ImageIcon,
  Link2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { slugify } from "./_utils";

interface Page {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  contentId: string;
  contentEn: string;
  excerptId: string;
  excerptEn: string;
  coverImage: string | null;
  template: string;
  status: string;
  showInMenu: boolean;
  menuOrder: number;
  parentId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  author: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATES = ["default", "full-width", "landing", "contact", "about"] as const;
const STATUSES = ["published", "draft", "trash"] as const;

const schema = z.object({
  titleId: z.string().min(1),
  titleEn: z.string().min(1),
  contentId: z.string().min(1),
  contentEn: z.string().min(1),
  excerptId: z.string().optional().default(""),
  excerptEn: z.string().optional().default(""),
  slug: z.string().optional().default(""),
  template: z.enum(TEMPLATES).default("default"),
  coverImage: z.string().optional().default(""),
  status: z.enum(STATUSES).default("published"),
  showInMenu: z.boolean().default(true),
  menuOrder: z.coerce.number().default(0),
  parentId: z.string().optional().default(""),
  metaTitle: z.string().optional().default(""),
  metaDescription: z.string().optional().default(""),
});

type FormValues = z.infer<typeof schema>;

type StatusFilter = "all" | "published" | "draft" | "trash";

function statusBadge(status: string, t: ReturnType<typeof useTranslation>["t"]) {
  switch (status) {
    case "published":
      return (
        <Badge className="bg-primary/15 text-primary">
          {t.admin.common.published}
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="secondary">{t.admin.common.draft}</Badge>
      );
    case "trash":
      return (
        <Badge variant="destructive">{t.admin.trash.label}</Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function AdminPagesManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [seoOpen, setSeoOpen] = useState(false);

  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/pages?admin=true");
      if (!res.ok) return [] as Page[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Page[];
    },
  });

  const allPages = (data ?? []) as Page[];

  const counts = useMemo(() => {
    const c = { all: allPages.length, published: 0, draft: 0, trash: 0 };
    for (const p of allPages) {
      if (p.status === "published") c.published++;
      else if (p.status === "draft") c.draft++;
      else if (p.status === "trash") c.trash++;
    }
    return c;
  }, [allPages]);

  const list = useMemo(() => {
    let arr = allPages;
    if (statusFilter !== "all") arr = arr.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.titleId.toLowerCase().includes(q) ||
          p.titleEn.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q),
      );
    }
    return [...arr].sort((a, b) => a.menuOrder - b.menuOrder);
  }, [allPages, statusFilter, search]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titleId: "",
      titleEn: "",
      contentId: "",
      contentEn: "",
      excerptId: "",
      excerptEn: "",
      slug: "",
      template: "default",
      coverImage: "",
      status: "published",
      showInMenu: true,
      menuOrder: 0,
      parentId: "",
      metaTitle: "",
      metaDescription: "",
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      titleId: "",
      titleEn: "",
      contentId: "",
      contentEn: "",
      excerptId: "",
      excerptEn: "",
      slug: "",
      template: "default",
      coverImage: "",
      status: "published",
      showInMenu: true,
      menuOrder: 0,
      parentId: "",
      metaTitle: "",
      metaDescription: "",
    });
    setSeoOpen(false);
    setDialogOpen(true);
  }

  function openEdit(page: Page) {
    setEditing(page);
    form.reset({
      titleId: page.titleId,
      titleEn: page.titleEn,
      contentId: page.contentId,
      contentEn: page.contentEn,
      excerptId: page.excerptId || "",
      excerptEn: page.excerptEn || "",
      slug: page.slug,
      template: (page.template as (typeof TEMPLATES)[number]) || "default",
      coverImage: page.coverImage || "",
      status: (page.status as (typeof STATUSES)[number]) || "published",
      showInMenu: page.showInMenu,
      menuOrder: page.menuOrder,
      parentId: page.parentId || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
    });
    setSeoOpen(false);
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        slug: values.slug || slugify(values.titleId || values.titleEn),
        parentId: values.parentId || null,
        coverImage: values.coverImage || null,
        metaTitle: values.metaTitle || null,
        metaDescription: values.metaDescription || null,
      };
      if (editing) {
        const res = await fetchWithAuth("/api/pages", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item as Page;
      }
      const res = await fetchWithAuth("/api/pages", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item as Page;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Halaman tersimpan" : "Page saved");
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menyimpan halaman" : "Failed to save page");
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
        ? `/api/pages?id=${encodeURIComponent(id)}&permanent=true`
        : `/api/pages?id=${encodeURIComponent(id)}`;
      const res = await fetchWithAuth(url, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return { id, permanent };
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.permanent
          ? locale === "id"
            ? "Halaman dihapus permanen"
            : "Page permanently deleted"
          : locale === "id"
            ? "Halaman dipindahkan ke sampah"
            : "Page moved to trash",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/pages", {
        method: "PUT",
        body: JSON.stringify({ id, status: "draft" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Restore failed");
      return json.item as Page;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Halaman dipulihkan" : "Page restored");
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal memulihkan" : "Failed to restore");
    },
  });

  function onSubmit(values: FormValues) {
    saveMutation.mutate(values);
  }

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: locale === "id" ? "Semua" : "All", count: counts.all },
    { key: "published", label: t.admin.common.published, count: counts.published },
    { key: "draft", label: t.admin.common.draft, count: counts.draft },
    { key: "trash", label: t.admin.trash.label, count: counts.trash },
  ];

  // Pages selectable as parent (exclude self when editing).
  const parentOptions = allPages.filter(
    (p) => p.status !== "trash" && (!editing || p.id !== editing.id),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.pages.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${counts.all} halaman ditemukan`
              : `${counts.all} pages found`}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.pages.addNew}
        </Button>
      </div>

      {/* Search + Filters */}
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
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                statusFilter === f.key
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background hover:bg-accent",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs font-semibold",
                  statusFilter === f.key
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[240px]">{t.admin.common.title}</TableHead>
              <TableHead>{t.admin.common.status}</TableHead>
              <TableHead>{t.admin.pages.fields.template}</TableHead>
              <TableHead>{t.admin.pages.fields.showInMenu}</TableHead>
              <TableHead>{t.admin.pages.fields.menuOrder}</TableHead>
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
                  {statusFilter === "trash" && counts.trash === 0
                    ? t.admin.trash.empty
                    : t.admin.common.noData}
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
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {locale === "id" ? p.titleId : p.titleEn || p.titleId}
                        </p>
                        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <Link2 className="size-3" />
                          /{p.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(p.status, t)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {t.admin.pages.templates[p.template as keyof typeof t.admin.pages.templates] ?? p.template}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.showInMenu ? (
                      <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Eye className="size-3.5" />
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {p.menuOrder}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(p.createdAt), "PP", { locale: dateLocaleObj })}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {p.status === "trash" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => restoreMutation.mutate(p.id)}
                            aria-label={t.admin.trash.restore}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              deleteMutation.mutate({ id: p.id, permanent: true })
                            }
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={t.admin.trash.deletePermanent}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border/60 px-6 py-4">
            <DialogTitle>
              {editing ? t.admin.pages.editTitle : t.admin.pages.addNew}
            </DialogTitle>
            <DialogDescription>
              {locale === "id"
                ? "Isi kolom bilingual di bawah ini."
                : "Fill in the bilingual fields below."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="flex h-[calc(92vh-8rem)] flex-col"
            >
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 py-4">
                  <Tabs defaultValue="id">
                    <TabsList className="grid w-full max-w-xs grid-cols-2">
                      <TabsTrigger value="id">🇮🇩 Indonesia</TabsTrigger>
                      <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="id" className="mt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="titleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.admin.pages.fields.titleId}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="excerptId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.admin.pages.fields.excerptId}</FormLabel>
                            <FormControl>
                              <Textarea rows={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.admin.pages.fields.contentId}</FormLabel>
                            <FormControl>
                              <Textarea rows={8} className="font-mono text-sm" {...field} />
                            </FormControl>
                            <FormDescription>
                              {locale === "id" ? "Mendukung Markdown" : "Markdown supported"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    <TabsContent value="en" className="mt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="titleEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.admin.pages.fields.titleEn}</FormLabel>
                            <FormControl>
                              <Input {...field} dir="ltr" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="excerptEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.admin.pages.fields.excerptEn}</FormLabel>
                            <FormControl>
                              <Textarea rows={2} {...field} dir="ltr" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contentEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.admin.pages.fields.contentEn}</FormLabel>
                            <FormControl>
                              <Textarea rows={8} className="font-mono text-sm" dir="ltr" {...field} />
                            </FormControl>
                            <FormDescription>
                              {locale === "id" ? "Mendukung Markdown" : "Markdown supported"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.pages.fields.slug}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                className="pl-9"
                                placeholder="otomatis-dari-judul"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            {locale === "id"
                              ? "Kosongkan untuk generate dari judul."
                              : "Leave empty to generate from title."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.pages.fields.template}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t.admin.pages.fields.template} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TEMPLATES.map((tpl) => (
                                <SelectItem key={tpl} value={tpl}>
                                  {t.admin.pages.templates[tpl]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.pages.fields.status}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="published">
                                {t.admin.common.published}
                              </SelectItem>
                              <SelectItem value="draft">{t.admin.common.draft}</SelectItem>
                              <SelectItem value="trash">{t.admin.trash.label}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.pages.fields.parent}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t.admin.pages.parentNone} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">{t.admin.pages.parentNone}</SelectItem>
                              {parentOptions.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {locale === "id" ? p.titleId : p.titleEn || p.titleId}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="menuOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.pages.fields.menuOrder}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            {locale === "id"
                              ? "Urutan tampil di menu (lebih kecil = lebih awal)."
                              : "Order shown in menu (smaller = first)."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="coverImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.pages.fields.coverImage}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                className="pl-9"
                                type="url"
                                placeholder="https://..."
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="showInMenu"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                        <div className="space-y-0.5">
                          <FormLabel>{t.admin.pages.fields.showInMenu}</FormLabel>
                          <FormDescription>
                            {locale === "id"
                              ? "Jika aktif, halaman tampil di menu navigasi."
                              : "When enabled, this page appears in navigation menus."}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" type="button" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="size-4" />
                          {locale === "id" ? "Pengaturan SEO" : "SEO Settings"}
                        </span>
                        {seoOpen ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 space-y-4">
                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.admin.pages.fields.metaTitle}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.admin.pages.fields.metaDescription}</FormLabel>
                            <FormControl>
                              <Textarea rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </ScrollArea>

              <DialogFooter className="border-t border-border/60 bg-background/80 px-6 py-3 backdrop-blur">
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
                  {saveMutation.isPending
                    ? t.admin.common.loading
                    : t.admin.common.save}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.common.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "id"
                ? "Halaman akan dipindahkan ke Sampah. Anda bisa memulihkannya nanti."
                : "Page will be moved to Trash. You can restore it later."}
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

      {/* "view site" quick link (opens the page in a new tab on the public site) */}
      <div className="hidden">
        <ExternalLink aria-hidden />
      </div>
    </div>
  );
}
