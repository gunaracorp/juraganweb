"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  Copy,
  Folder,
  FolderOpen,
  Grid3x3,
  ImageIcon,
  Image as ImageIcon2,
  Link2,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatBytes } from "./_utils";

interface Media {
  id: string;
  filename: string;
  url: string;
  thumbUrl: string | null;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  caption: string;
  uploadedBy: string;
  folder: string;
  createdAt: string;
}

function isImage(mime: string) {
  return /^image\/(png|jpe?g|gif|webp|svg|avif)$/i.test(mime);
}

function MediaThumb({
  media,
  className,
}: {
  media: Media;
  className?: string;
}) {
  if (isImage(media.mimeType)) {
    return (
      <img
        src={media.thumbUrl || media.url}
        alt={media.alt || media.filename}
        className={cn("size-full object-cover", className)}
        loading="lazy"
      />
    );
  }
  return (
    <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
      <ImageIcon className="size-6" />
    </div>
  );
}

export function AdminMediaManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState<string>("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/media?admin=true");
      if (!res.ok) return [] as Media[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Media[];
    },
  });

  const allMedia = (data ?? []) as Media[];

  const folders = useMemo(() => {
    const set = new Set<string>();
    for (const m of allMedia) set.add(m.folder || "/");
    return Array.from(set).sort();
  }, [allMedia]);

  const list = useMemo(() => {
    let arr = allMedia;
    if (folder !== "all") arr = arr.filter((m) => (m.folder || "/") === folder);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (m) =>
          m.filename.toLowerCase().includes(q) ||
          m.alt.toLowerCase().includes(q) ||
          m.caption.toLowerCase().includes(q),
      );
    }
    return arr;
  }, [allMedia, search, folder]);

  const editing = editId ? allMedia.find((m) => m.id === editId) : null;

  // Upload form state (URL-based)
  const [upUrl, setUpUrl] = useState("");
  const [upFilename, setUpFilename] = useState("");
  const [upAlt, setUpAlt] = useState("");
  const [upCaption, setUpCaption] = useState("");
  const [upFolder, setUpFolder] = useState("/");

  // Edit form state
  const [editAlt, setEditAlt] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editFolder, setEditFolder] = useState("/");
  const [editUrl, setEditUrl] = useState("");

  function openEdit(media: Media) {
    setEditAlt(media.alt);
    setEditCaption(media.caption);
    setEditFolder(media.folder || "/");
    setEditUrl(media.url);
    setEditId(media.id);
  }

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!upUrl.trim()) throw new Error("URL required");
      const filename =
        upFilename.trim() ||
        upUrl.split("/").pop()?.split("?")[0] ||
        `media-${Date.now()}`;
      // Guess mime from extension
      const ext = filename.split(".").pop()?.toLowerCase() || "";
      const mimeMap: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        svg: "image/svg+xml",
        avif: "image/avif",
        pdf: "application/pdf",
        mp4: "video/mp4",
      };
      const mimeType = mimeMap[ext] || "image/jpeg";
      const res = await fetchWithAuth("/api/media", {
        method: "POST",
        body: JSON.stringify({
          filename,
          url: upUrl.trim(),
          thumbUrl: upUrl.trim(),
          mimeType,
          size: 0,
          alt: upAlt,
          caption: upCaption,
          folder: upFolder,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Upload failed");
      return json.item as Media;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Media ditambahkan" : "Media added");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      setUpUrl("");
      setUpFilename("");
      setUpAlt("");
      setUpCaption("");
      setUpFolder("/");
      setUploadOpen(false);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menambah media" : "Failed to add media");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editId) return;
      const res = await fetchWithAuth("/api/media", {
        method: "PUT",
        body: JSON.stringify({
          id: editId,
          alt: editAlt,
          caption: editCaption,
          folder: editFolder,
          url: editUrl,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Update failed");
      return json.item as Media;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Media diperbarui" : "Media updated");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setEditId(null);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal memperbarui" : "Failed to update");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/media?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Media dihapus" : "Media deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete");
    },
  });

  function copyUrl(url: string) {
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success(locale === "id" ? "URL disalin" : "URL copied"))
      .catch(() => toast.error(locale === "id" ? "Gagal menyalin" : "Copy failed"));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.media.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${allMedia.length} file media`
              : `${allMedia.length} media files`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as "grid" | "list")}
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="grid" aria-label="Grid view">
                <Grid3x3 className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="list" aria-label="List view">
                <List className="size-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
          >
            <Upload className="size-4" />
            {t.admin.media.addNew}
          </Button>
        </div>
      </div>

      {/* Filters */}
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
        <Select value={folder} onValueChange={setFolder}>
          <SelectTrigger className="sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {locale === "id" ? "Semua Folder" : "All Folders"}
            </SelectItem>
            {folders.map((f) => (
              <SelectItem key={f} value={f}>
                {f === "/" ? "📁 /" : `📁 ${f}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        view === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        )
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImageIcon2 className="size-9" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-gold text-gold-foreground shadow">
              <Plus className="size-4" />
            </div>
          </div>
          <div>
            <p className="text-base font-semibold">{t.admin.media.noMedia}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {locale === "id"
                ? "Upload file pertamamu untuk mulai mengelola media."
                : "Upload your first file to start managing media."}
            </p>
          </div>
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-brand-gradient text-primary-foreground hover:opacity-95"
          >
            <Upload className="size-4" />
            {t.admin.media.uploadNew}
          </Button>
        </div>
      ) : view === "grid" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        >
          {list.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ y: -3 }}
              className="group overflow-hidden rounded-xl border border-border/60 bg-card transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <MediaThumb media={m} />
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-background/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-8"
                    onClick={() => openEdit(m)}
                    aria-label={t.admin.common.edit}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-8"
                    onClick={() => copyUrl(m.url)}
                    aria-label={t.admin.media.copyUrl}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-8 bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => setDeleteId(m.id)}
                    aria-label={t.admin.common.delete}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-semibold" title={m.filename}>
                  {m.filename}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {format(new Date(m.createdAt), "PP", { locale: dateLocaleObj })}{" "}
                  · {formatBytes(m.size)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">{t.admin.media.fields.filename}</TableHead>
                <TableHead>{t.admin.media.fields.dimensions}</TableHead>
                <TableHead>{t.admin.media.size}</TableHead>
                <TableHead>{t.admin.media.fields.folder}</TableHead>
                <TableHead>{t.admin.media.uploaded}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((m, idx) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-muted/50 border-b transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        <MediaThumb media={m} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{m.filename}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {m.alt || "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {m.width && m.height ? `${m.width}×${m.height}` : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatBytes(m.size)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      <Folder className="size-3" />
                      {m.folder || "/"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(m.createdAt), "PP", { locale: dateLocaleObj })}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(m)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyUrl(m.url)}
                        aria-label={t.admin.media.copyUrl}
                      >
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(m.id)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={t.admin.common.delete}
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

      {/* Upload dialog (URL-based) */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.admin.media.uploadNew}</DialogTitle>
            <DialogDescription>
              {locale === "id"
                ? "Masukkan URL gambar/file. Untuk shared hosting, upload file ke hosting lalu tempel URL di sini."
                : "Enter the image/file URL. For shared hosting, upload the file to your hosting then paste the URL here."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {t.admin.media.fields.url}
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={upUrl}
                  onChange={(e) => setUpUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t.admin.media.fields.filename}
                </label>
                <Input
                  placeholder="auto"
                  value={upFilename}
                  onChange={(e) => setUpFilename(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t.admin.media.fields.folder}
                </label>
                <Input
                  placeholder="/"
                  value={upFolder}
                  onChange={(e) => setUpFolder(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {t.admin.media.fields.alt}
              </label>
              <Input
                placeholder={locale === "id" ? "Deskripsi singkat untuk SEO" : "Short description for SEO"}
                value={upAlt}
                onChange={(e) => setUpAlt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {t.admin.media.fields.caption}
              </label>
              <Textarea
                rows={2}
                value={upCaption}
                onChange={(e) => setUpCaption(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadOpen(false)}
              disabled={uploadMutation.isPending}
            >
              {t.admin.common.cancel}
            </Button>
            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={!upUrl.trim() || uploadMutation.isPending}
              className="bg-brand-gradient text-primary-foreground hover:opacity-95"
            >
              <Upload className="size-4" />
              {uploadMutation.isPending ? t.admin.common.loading : t.admin.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.admin.common.edit}</DialogTitle>
            <DialogDescription>
              {locale === "id"
                ? "Edit metadata media."
                : "Edit media metadata."}
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-border/60 bg-muted">
                <div className="flex aspect-[16/9] items-center justify-center">
                  <MediaThumb media={editing} />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 p-2.5">
                <code className="flex-1 truncate text-xs">{editing.url}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyUrl(editing.url)}
                >
                  <Copy className="size-3.5" />
                  {t.admin.media.copyUrl}
                </Button>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t.admin.media.fields.url}
                </label>
                <Input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t.admin.media.fields.alt}
                </label>
                <Input
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t.admin.media.fields.caption}
                </label>
                <Textarea
                  rows={2}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t.admin.media.fields.folder}
                </label>
                <div className="relative">
                  <FolderOpen className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={editFolder}
                    onChange={(e) => setEditFolder(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditId(null)}
              disabled={updateMutation.isPending}
            >
              {t.admin.common.cancel}
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="bg-brand-gradient text-primary-foreground hover:opacity-95"
            >
              {updateMutation.isPending ? t.admin.common.loading : t.admin.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.media.deleteConfirm}</AlertDialogTitle>
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
