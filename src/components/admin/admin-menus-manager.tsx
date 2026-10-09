"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Edit2,
  ExternalLink,
  GripVertical,
  Menu as MenuIcon,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { slugify } from "./_utils";

interface MenuItem {
  type: "page" | "post" | "custom" | "category";
  label: string;
  url: string;
  order: number;
}

interface MenuRecord {
  id: string;
  slug: string;
  name: string;
  location: string;
  items: string; // JSON array of MenuItem
  createdAt: string;
  updatedAt: string;
}

const LOCATIONS = ["header", "footer", "mobile", "sidebar"] as const;
const ITEM_TYPES = ["page", "post", "custom", "category"] as const;

/** Sortable menu item row. */
function SortableItem({
  item,
  onRemove,
}: {
  item: MenuItem;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${item.type}|${item.label}|${item.url}|${item.order}` });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border/60 bg-card p-2.5",
        isDragging && "z-10 border-primary shadow-md",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <Badge variant="outline" className="text-[10px] font-semibold uppercase">
        {item.type}
      </Badge>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.label}</p>
        <p className="truncate text-xs text-muted-foreground">{item.url}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md p-1.5 text-destructive transition-colors hover:bg-destructive/10"
        aria-label="Remove item"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function AdminMenusManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] =
    useState<(typeof LOCATIONS)[number]>("header");

  // Add-item form state
  const [addType, setAddType] =
    useState<(typeof ITEM_TYPES)[number]>("custom");
  const [addLabel, setAddLabel] = useState("");
  const [addUrl, setAddUrl] = useState("");

  // Edit menu meta state
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] =
    useState<(typeof LOCATIONS)[number]>("header");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin-menus"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/menus");
      if (!res.ok) return [] as MenuRecord[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as MenuRecord[];
    },
  });

  const menus = (data ?? []) as MenuRecord[];
  const active = activeId ? menus.find((m) => m.id === activeId) : null;

  // Parse active menu items.
  const activeItems: MenuItem[] = useMemo(() => {
    if (!active) return [] as MenuItem[];
    try {
      const parsed = JSON.parse(active.items || "[]") as MenuItem[];
      return Array.isArray(parsed)
        ? parsed.map((p, i) => ({ ...p, order: p.order ?? i }))
        : [];
    } catch {
      return [] as MenuItem[];
    }
  }, [active]);

  // Sync edit fields when active changes.
  useState(() => {
    if (active) {
      setEditName(active.name);
      setEditLocation(active.location as (typeof LOCATIONS)[number]);
    }
  });

  // Initialize edit fields whenever active menu changes (after data loads).
  if (active && editName === "" && active.name) {
    setEditName(active.name);
    setEditLocation(active.location as (typeof LOCATIONS)[number]);
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth("/api/menus", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          location: newLocation,
          items: [],
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item as MenuRecord;
    },
    onSuccess: (item) => {
      toast.success(locale === "id" ? "Menu dibuat" : "Menu created");
      queryClient.invalidateQueries({ queryKey: ["admin-menus"] });
      setActiveId(item.id);
      setNewName("");
      setNewLocation("header");
      setCreateOpen(false);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal membuat menu" : "Failed to create menu");
    },
  });

  const updateMetaMutation = useMutation({
    mutationFn: async () => {
      if (!active) return;
      const res = await fetchWithAuth("/api/menus", {
        method: "PUT",
        body: JSON.stringify({
          id: active.id,
          name: editName,
          location: editLocation,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Update failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Menu diperbarui" : "Menu updated");
      queryClient.invalidateQueries({ queryKey: ["admin-menus"] });
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal memperbarui" : "Failed to update");
    },
  });

  const updateItemsMutation = useMutation({
    mutationFn: async (items: MenuItem[]) => {
      if (!active) return;
      const res = await fetchWithAuth("/api/menus", {
        method: "PUT",
        body: JSON.stringify({ id: active.id, items }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Update failed");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menus"] });
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menyimpan urutan" : "Failed to save order");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/menus?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: (id) => {
      toast.success(locale === "id" ? "Menu dihapus" : "Menu deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-menus"] });
      if (activeId === id) setActiveId(null);
      setDeleteId(null);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete");
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active: a, over } = event;
    if (!over || a.id === over.id || !active) return;
    const oldIndex = activeItems.findIndex(
      (i) => `${i.type}|${i.label}|${i.url}|${i.order}` === a.id,
    );
    const newIndex = activeItems.findIndex(
      (i) => `${i.type}|${i.label}|${i.url}|${i.order}` === over.id,
    );
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(activeItems, oldIndex, newIndex).map(
      (item, i) => ({ ...item, order: i }),
    );
    updateItemsMutation.mutate(reordered);
  }

  function handleAddItem() {
    if (!addLabel.trim()) return;
    const newItem: MenuItem = {
      type: addType,
      label: addLabel.trim(),
      url: addUrl.trim() || slugify(addLabel),
      order: activeItems.length,
    };
    updateItemsMutation.mutate([...activeItems, newItem]);
    setAddLabel("");
    setAddUrl("");
    toast.success(locale === "id" ? "Item ditambahkan" : "Item added");
  }

  function handleRemoveItem(idx: number) {
    const next = activeItems.filter((_, i) => i !== idx).map((item, i) => ({ ...item, order: i }));
    updateItemsMutation.mutate(next);
    toast.success(locale === "id" ? "Item dihapus" : "Item removed");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.menus.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${menus.length} menu ditemukan`
              : `${menus.length} menus found`}
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.menus.addNew}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Menu list sidebar */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-border/60 bg-card">
            <div className="border-b border-border/60 p-3">
              <p className="text-sm font-semibold">
                {locale === "id" ? "Daftar Menu" : "Menu List"}
              </p>
            </div>
            <ScrollArea className="h-[480px]">
              {isLoading ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : menus.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {locale === "id"
                    ? "Belum ada menu. Buat menu pertama."
                    : "No menus yet. Create your first one."}
                </div>
              ) : (
                <div className="space-y-1.5 p-3">
                  {menus.map((m, idx) => (
                    <motion.button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveId(m.id)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                        activeId === m.id
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:bg-accent/60",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
                          activeId === m.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <MenuIcon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{m.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          /{m.slug} · {t.admin.menus.locations[m.location as keyof typeof t.admin.menus.locations] ?? m.location}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-8">
          {!active ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <MenuIcon className="size-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {locale === "id"
                  ? "Pilih menu di kiri atau buat menu baru."
                  : "Select a menu on the left or create a new one."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Meta */}
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      {t.admin.menus.fields.name}
                    </label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      {t.admin.menus.fields.location}
                    </label>
                    <Select
                      value={editLocation}
                      onValueChange={(v) =>
                        setEditLocation(v as (typeof LOCATIONS)[number])
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {t.admin.menus.locations[loc]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md bg-muted px-2.5 py-1.5 text-xs">
                    /{active.slug}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMetaMutation.mutate()}
                    disabled={updateMetaMutation.isPending}
                  >
                    <Pencil className="size-3.5" />
                    {t.admin.common.save}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(active.id)}
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    {t.admin.common.delete}
                  </Button>
                </div>
              </div>

              {/* Items */}
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {t.admin.menus.fields.items}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({activeItems.length})
                    </span>
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <GripVertical className="size-3" />
                    {t.admin.menus.dragHint}
                  </p>
                </div>

                {activeItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    {locale === "id"
                      ? "Belum ada item. Tambahkan di bawah."
                      : "No items yet. Add one below."}
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={activeItems.map(
                        (i) => `${i.type}|${i.label}|${i.url}|${i.order}`,
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {activeItems.map((item, idx) => (
                          <SortableItem
                            key={`${item.type}|${item.label}|${item.url}|${item.order}`}
                            item={item}
                            onRemove={() => handleRemoveItem(idx)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {/* Add item form */}
                <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Plus className="size-3.5" />
                    {t.admin.menus.addItem}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                    <div className="sm:col-span-3">
                      <Select value={addType} onValueChange={(v) => setAddType(v as (typeof ITEM_TYPES)[number])}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ITEM_TYPES.map((tp) => (
                            <SelectItem key={tp} value={tp}>
                              {t.admin.menus.types[tp]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-4">
                      <Input
                        placeholder={t.admin.menus.itemLabel}
                        value={addLabel}
                        onChange={(e) => setAddLabel(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Input
                        placeholder={t.admin.menus.itemUrl}
                        value={addUrl}
                        onChange={(e) => setAddUrl(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button
                        className="w-full bg-brand-gradient text-primary-foreground hover:opacity-95"
                        onClick={handleAddItem}
                        disabled={!addLabel.trim()}
                      >
                        <Plus className="size-3.5" />
                        {t.admin.common.add}
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ChevronDown className="size-3" />
                    {locale === "id"
                      ? "URL otomatis dari slug jika dikosongkan."
                      : "URL auto-derived from slug if left empty."}
                  </p>
                </div>
              </div>

              <div className="hidden">
                <ExternalLink aria-hidden />
                <Edit2 aria-hidden />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create menu dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.admin.menus.addNew}</DialogTitle>
            <DialogDescription>
              {locale === "id"
                ? "Buat menu baru dengan nama dan lokasi."
                : "Create a new menu with a name and location."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {t.admin.menus.fields.name}
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={locale === "id" ? "Menu Utama" : "Main Menu"}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {t.admin.menus.fields.location}
              </label>
              <Select
                value={newLocation}
                onValueChange={(v) => setNewLocation(v as (typeof LOCATIONS)[number])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {t.admin.menus.locations[loc]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createMutation.isPending}
            >
              {t.admin.common.cancel}
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newName.trim() || createMutation.isPending}
              className="bg-brand-gradient text-primary-foreground hover:opacity-95"
            >
              {createMutation.isPending ? t.admin.common.loading : t.admin.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.common.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "id"
                ? "Menu akan dihapus permanen."
                : "The menu will be permanently deleted."}
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
