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
  FileText,
  GripVertical,
  Hash,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  X,
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
import { slugify, getCurrentUser } from "./_utils";

interface Post {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  excerptId: string;
  excerptEn: string;
  contentId: string;
  contentEn: string;
  category: string;
  tags: string;
  coverImage: string | null;
  author: string;
  featured: boolean;
  published: boolean;
  status: string; // published, draft, pending, trash
  pinned: boolean;
  allowComments: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  ogImage: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryItem {
  id: string;
  slug: string;
  nameId: string;
  nameEn: string;
}

const FALLBACK_CATEGORIES = [
  "Umum",
  "Tutorial",
  "Digital Marketing",
  "Web Development",
  "Bisnis",
];

const schema = z.object({
  titleId: z.string().min(1),
  titleEn: z.string().min(1),
  excerptId: z.string().min(1),
  excerptEn: z.string().min(1),
  contentId: z.string().min(1),
  contentEn: z.string().min(1),
  category: z.string().min(1),
  tags: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  author: z.string().min(1),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  // SEO fields
  metaTitle: z.string().optional().default(""),
  metaDescription: z.string().optional().default(""),
  focusKeyword: z.string().optional().default(""),
  ogImage: z.string().optional().default(""),
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
      return <Badge variant="secondary">{t.admin.common.draft}</Badge>;
    case "pending":
      return (
        <Badge className="bg-gold/15 text-gold">
          <Eye className="size-3" />
          {localeForPending(t)}
        </Badge>
      );
    case "trash":
      return <Badge variant="destructive">{t.admin.trash.label}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function localeForPending(t: ReturnType<typeof useTranslation>["t"]) {
  // We use a generic label since i18n doesn't have a `pending` key in posts.
  return "Pending";
}

export function AdminPostsManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const me = getCurrentUser();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [seoOpen, setSeoOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/posts?admin=true");
      if (!res.ok) return [] as Post[];
      const json = await res.json().catch(() => null);
      return (json?.posts ?? []) as Post[];
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/categories");
      if (!res.ok) return [] as CategoryItem[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as CategoryItem[];
    },
  });

  // Build category options: prefer DB categories, fall back to hardcoded list.
  const categoryOptions = useMemo(() => {
    if (categoriesData && categoriesData.length > 0) {
      return Array.from(
        new Set([
          ...categoriesData.map((c) => c.nameId),
          ...FALLBACK_CATEGORIES,
        ]),
      );
    }
    return FALLBACK_CATEGORIES;
  }, [categoriesData]);

  const allPosts = (data ?? []) as Post[];

  const counts = useMemo(() => {
    const c = { all: allPosts.length, published: 0, draft: 0, trash: 0 };
    for (const p of allPosts) {
      if (p.status === "published") c.published++;
      else if (p.status === "draft") c.draft++;
      else if (p.status === "trash") c.trash++;
    }
    return c;
  }, [allPosts]);

  const list = useMemo(() => {
    let arr = allPosts;
    if (statusFilter !== "all") {
      // "published" includes anything with status=published
      // "draft" includes status=draft or pending
      // "trash" includes status=trash
      arr = arr.filter((p) => {
        if (statusFilter === "draft") return p.status === "draft" || p.status === "pending";
        return p.status === statusFilter;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.titleId.toLowerCase().includes(q) ||
          p.titleEn.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    return arr;
  }, [allPosts, statusFilter, search]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titleId: "",
      titleEn: "",
      excerptId: "",
      excerptEn: "",
      contentId: "",
      contentEn: "",
      category: "Umum",
      tags: "",
      coverImage: "",
      author: me?.name || "Tim JuraganWebsite",
      featured: false,
      published: true,
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      ogImage: "",
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      titleId: "",
      titleEn: "",
      excerptId: "",
      excerptEn: "",
      contentId: "",
      contentEn: "",
      category: "Umum",
      tags: "",
      coverImage: "",
      author: me?.name || "Tim JuraganWebsite",
      featured: false,
      published: true,
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      ogImage: "",
    });
    setSeoOpen(false);
    setDialogOpen(true);
  }

  function openEdit(post: Post) {
    setEditing(post);
    form.reset({
      titleId: post.titleId,
      titleEn: post.titleEn,
      excerptId: post.excerptId,
      excerptEn: post.excerptEn,
      contentId: post.contentId,
      contentEn: post.contentEn,
      category: post.category,
      tags: post.tags,
      coverImage: post.coverImage ?? "",
      author: post.author,
      featured: post.featured,
      published: post.published,
      metaTitle: post.metaTitle ?? "",
      metaDescription: post.metaDescription ?? "",
      focusKeyword: post.focusKeyword ?? "",
      ogImage: post.ogImage ?? "",
    });
    setSeoOpen(false);
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const slug = editing?.slug ?? slugify(values.titleId || values.titleEn);
      const payload = {
        ...values,
        slug,
        // Also send SEO fields (API may ignore them but we send anyway)
        metaTitle: values.metaTitle || null,
        metaDescription: values.metaDescription || null,
        focusKeyword: values.focusKeyword || null,
        ogImage: values.ogImage || null,
        // Status derived from published flag (trash is set via separate action)
        status: values.published ? "published" : "draft",
      };
      if (editing) {
        const res = await fetchWithAuth("/api/posts", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.post as Post;
      }
      const res = await fetchWithAuth("/api/posts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.post as Post;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Artikel tersimpan" : "Post saved");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-posts-preview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menyimpan artikel" : "Failed to save post");
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
        ? `/api/posts?id=${encodeURIComponent(id)}&permanent=true`
        : `/api/posts?id=${encodeURIComponent(id)}`;
      const res = await fetchWithAuth(url, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return { id, permanent };
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.permanent
          ? locale === "id"
            ? "Artikel dihapus permanen"
            : "Post permanently deleted"
          : locale === "id"
            ? "Artikel dipindahkan ke sampah"
            : "Post moved to trash",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-posts-preview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      setDeleteId(null);
      setSelected((s) => s.filter((x) => x !== vars.id));
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menghapus artikel" : "Failed to delete post");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/posts", {
        method: "PUT",
        body: JSON.stringify({ id, status: "draft", published: false }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Restore failed");
      return json.post as Post;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Artikel dipulihkan" : "Post restored");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal memulihkan" : "Failed to restore");
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({
      ids,
      action,
    }: {
      ids: string[];
      action: "delete" | "publish" | "unpublish" | "trash" | "restore";
    }) => {
      if (action === "publish" || action === "unpublish") {
        const target = action === "publish";
        await Promise.all(
          ids.map((id) =>
            fetchWithAuth("/api/posts", {
              method: "PUT",
              body: JSON.stringify({
                id,
                published: target,
                status: target ? "published" : "draft",
              }),
            }),
          ),
        );
      } else if (action === "trash") {
        await Promise.all(
          ids.map((id) =>
            fetchWithAuth(`/api/posts?id=${encodeURIComponent(id)}`, {
              method: "DELETE",
            }),
          ),
        );
      } else if (action === "restore") {
        await Promise.all(
          ids.map((id) =>
            fetchWithAuth("/api/posts", {
              method: "PUT",
              body: JSON.stringify({ id, status: "draft", published: false }),
            }),
          ),
        );
      } else if (action === "delete") {
        await Promise.all(
          ids.map((id) =>
            fetchWithAuth(`/api/posts?id=${encodeURIComponent(id)}&permanent=true`, {
              method: "DELETE",
            }),
          ),
        );
      }
      return { ids, action };
    },
    onSuccess: (vars) => {
      const labels: Record<string, { id: string; en: string }> = {
        delete: { id: "Artikel dihapus permanen", en: "Posts permanently deleted" },
        publish: { id: "Artikel dipublikasi", en: "Posts published" },
        unpublish: { id: "Artikel dibatalkan publikasi", en: "Posts unpublished" },
        trash: { id: "Artikel dipindahkan ke sampah", en: "Posts moved to trash" },
        restore: { id: "Artikel dipulihkan", en: "Posts restored" },
      };
      toast.success(locale === "id" ? labels[vars.action].id : labels[vars.action].en);
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      setSelected([]);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menjalankan aksi" : "Failed to apply action");
    },
  });

  // Category CRUD (lightweight)
  const [newCatNameId, setNewCatNameId] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth("/api/categories", {
        method: "POST",
        body: JSON.stringify({
          nameId: newCatNameId,
          nameEn: newCatNameEn || newCatNameId,
          description: newCatDesc,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Kategori dibuat" : "Category created");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setNewCatNameId("");
      setNewCatNameEn("");
      setNewCatDesc("");
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal membuat kategori" : "Failed to create category");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Kategori dihapus" : "Category deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menghapus kategori" : "Failed to delete category");
    },
  });

  function onSubmit(values: FormValues) {
    saveMutation.mutate(values);
  }

  function toggleSelected(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function toggleSelectAll() {
    if (selected.length === list.length) setSelected([]);
    else setSelected(list.map((p) => p.id));
  }

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: locale === "id" ? "Semua" : "All", count: counts.all },
    { key: "published", label: t.admin.common.published, count: counts.published },
    { key: "draft", label: t.admin.common.draft, count: counts.draft },
    { key: "trash", label: t.admin.trash.label, count: counts.trash },
  ];

  const hasSelected = selected.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.posts.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${counts.all} artikel ditemukan`
              : `${counts.all} posts found`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCategoryDialogOpen(true)}
          >
            <Tag className="size-4" />
            <span className="hidden sm:inline">
              {locale === "id" ? "Kelola Kategori" : "Manage Categories"}
            </span>
          </Button>
          <Button
            onClick={openCreate}
            className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
          >
            <Plus className="size-4" />
            {t.admin.posts.addNew}
          </Button>
        </div>
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
              onClick={() => {
                setStatusFilter(f.key);
                setSelected([]);
              }}
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
            {statusFilter === "trash" ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    bulkActionMutation.mutate({ ids: selected, action: "restore" })
                  }
                  disabled={bulkActionMutation.isPending}
                >
                  <Pencil className="size-3.5" />
                  {t.admin.bulkActions.restore}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    bulkActionMutation.mutate({ ids: selected, action: "delete" })
                  }
                  disabled={bulkActionMutation.isPending}
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  {t.admin.trash.deletePermanent}
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    bulkActionMutation.mutate({ ids: selected, action: "publish" })
                  }
                  disabled={bulkActionMutation.isPending}
                >
                  <Eye className="size-3.5" />
                  {t.admin.bulkActions.publish}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    bulkActionMutation.mutate({ ids: selected, action: "unpublish" })
                  }
                  disabled={bulkActionMutation.isPending}
                >
                  <X className="size-3.5" />
                  {t.admin.bulkActions.unpublish}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    bulkActionMutation.mutate({ ids: selected, action: "trash" })
                  }
                  disabled={bulkActionMutation.isPending}
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  {t.admin.bulkActions.moveToTrash}
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
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
              <TableHead className="min-w-[200px]">{t.admin.common.title}</TableHead>
              <TableHead>{t.admin.posts.fields.category}</TableHead>
              <TableHead>{t.admin.common.status}</TableHead>
              <TableHead>{t.admin.common.featured}</TableHead>
              <TableHead className="text-right">{t.blog.views}</TableHead>
              <TableHead>{t.admin.common.createdAt}</TableHead>
              <TableHead className="text-right">{t.admin.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
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
                  className={cn(
                    "border-b transition-colors hover:bg-muted/50",
                    selected.includes(p.id) && "bg-primary/5",
                  )}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleSelected(p.id)}
                      className="size-4 cursor-pointer rounded border-border accent-primary"
                      aria-label="Select post"
                    />
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {locale === "id" ? p.titleId : p.titleEn || p.titleId}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {locale === "id" ? p.titleEn : p.titleId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {p.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{statusBadge(p.status, t)}</TableCell>
                  <TableCell>
                    {p.featured ? (
                      <Star className="size-4 fill-gold text-gold" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {p.views.toLocaleString()}
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
              {editing ? t.admin.posts.editTitle : t.admin.posts.addNew}
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
                            <FormLabel>{t.admin.posts.fields.titleId}</FormLabel>
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
                            <FormLabel>{t.admin.posts.fields.excerptId}</FormLabel>
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
                            <FormLabel>{t.admin.posts.fields.contentId}</FormLabel>
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
                            <FormLabel>{t.admin.posts.fields.titleEn}</FormLabel>
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
                            <FormLabel>{t.admin.posts.fields.excerptEn}</FormLabel>
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
                            <FormLabel>{t.admin.posts.fields.contentEn}</FormLabel>
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
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.posts.fields.category}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t.admin.posts.fields.category} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoryOptions.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.posts.fields.author}</FormLabel>
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
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.posts.fields.tags}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                              <Input className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="coverImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.admin.posts.fields.coverImage}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                className="pl-9"
                                type="url"
                                placeholder="https://images.unsplash.com/…"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-1.5">
                              <Star className="size-3.5 text-gold" />
                              {t.admin.posts.fields.featured}
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-1.5">
                              <Eye className="size-3.5 text-primary" />
                              {t.admin.posts.fields.published}
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* SEO collapsible */}
                  <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" type="button" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="size-4" />
                          {locale === "id" ? "Pengaturan SEO Lanjutan" : "Advanced SEO Settings"}
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
                        name="focusKeyword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{locale === "id" ? "Focus Keyword" : "Focus Keyword"}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input className="pl-9" placeholder="jasa website murah" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              {locale === "id"
                                ? "Kata kunci utama untuk artikel ini."
                                : "Main keyword for this article."}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{locale === "id" ? "Meta Title (SEO)" : "Meta Title (SEO)"}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              {locale === "id"
                                ? "Kosongkan untuk pakai judul artikel."
                                : "Leave empty to use the post title."}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{locale === "id" ? "Meta Description (SEO)" : "Meta Description (SEO)"}</FormLabel>
                            <FormControl>
                              <Textarea rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ogImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{locale === "id" ? "Open Graph Image URL" : "Open Graph Image URL"}</FormLabel>
                            <FormControl>
                              <Input type="url" placeholder="https://..." {...field} />
                            </FormControl>
                            <FormDescription>
                              {locale === "id"
                                ? "Gambar ketika dibagikan ke media sosial. Kosongkan untuk pakai cover."
                                : "Image shown when shared on social. Leave empty to use cover."}
                            </FormDescription>
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
                ? "Artikel akan dipindahkan ke Sampah. Anda bisa memulihkannya nanti."
                : "Post will be moved to Trash. You can restore it later."}
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

      {/* Category management dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-hidden p-0">
          <DialogHeader className="border-b border-border/60 px-6 py-4">
            <DialogTitle>
              {locale === "id" ? "Kelola Kategori" : "Manage Categories"}
            </DialogTitle>
            <DialogDescription>
              {locale === "id"
                ? "Tambah atau hapus kategori artikel."
                : "Add or remove post categories."}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            {/* Existing categories */}
            <div className="mb-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {locale === "id" ? "Kategori Saat Ini" : "Current Categories"}
              </p>
              {categoriesData && categoriesData.length > 0 ? (
                <div className="space-y-1.5">
                  {categoriesData.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 rounded-lg border border-border/60 p-2"
                    >
                      <Tag className="size-4 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.nameId}</p>
                        {c.nameEn && c.nameEn !== c.nameId && (
                          <p className="truncate text-xs text-muted-foreground">
                            {c.nameEn}
                          </p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => deleteCategoryMutation.mutate(c.id)}
                        disabled={deleteCategoryMutation.isPending}
                        aria-label={t.admin.common.delete}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  {locale === "id"
                    ? "Belum ada kategori. Tambahkan di bawah."
                    : "No categories yet. Add one below."}
                </p>
              )}
            </div>

            {/* New category form */}
            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {locale === "id" ? "Tambah Kategori Baru" : "Add New Category"}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  placeholder={locale === "id" ? "Nama (Indonesia)" : "Name (Indonesian)"}
                  value={newCatNameId}
                  onChange={(e) => setNewCatNameId(e.target.value)}
                />
                <Input
                  placeholder={locale === "id" ? "Nama (English)" : "Name (English)"}
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  dir="ltr"
                />
              </div>
              <Input
                placeholder={locale === "id" ? "Deskripsi (opsional)" : "Description (optional)"}
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
              />
              <Button
                size="sm"
                className="w-full bg-brand-gradient text-primary-foreground hover:opacity-95"
                onClick={() => createCategoryMutation.mutate()}
                disabled={!newCatNameId.trim() || createCategoryMutation.isPending}
              >
                <Plus className="size-3.5" />
                {createCategoryMutation.isPending ? t.admin.common.loading : t.admin.common.add}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
