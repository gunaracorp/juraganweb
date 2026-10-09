"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  icon: string;
  price: number;
  priceLabel: string;
  features: string;
  active: boolean;
  order: number;
}

const schema = z.object({
  titleId: z.string().min(1),
  titleEn: z.string().min(1),
  descId: z.string().min(1),
  descEn: z.string().min(1),
  icon: z.string().min(1).default("Code"),
  price: z.coerce.number().int().min(0).default(0),
  priceLabel: z.string().optional().default(""),
  features: z.string().optional().default(""),
  active: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
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

export function AdminServicesManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/services");
      if (!res.ok) return [] as Service[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Service[];
    },
  });

  const list = useMemo(() => {
    const all = (data ?? []) as Service[];
    const sorted = [...all].sort((a, b) => a.order - b.order);
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (s) =>
        s.titleId.toLowerCase().includes(q) ||
        s.titleEn.toLowerCase().includes(q) ||
        s.icon.toLowerCase().includes(q),
    );
  }, [data, search]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titleId: "",
      titleEn: "",
      descId: "",
      descEn: "",
      icon: "Code",
      price: 0,
      priceLabel: "",
      features: "",
      active: true,
      order: 0,
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      titleId: "",
      titleEn: "",
      descId: "",
      descEn: "",
      icon: "Code",
      price: 0,
      priceLabel: "",
      features: "",
      active: true,
      order: (data ?? []).length,
    });
    setDialogOpen(true);
  }

  function openEdit(item: Service) {
    setEditing(item);
    form.reset({
      titleId: item.titleId,
      titleEn: item.titleEn,
      descId: item.descId,
      descEn: item.descEn,
      icon: item.icon,
      price: item.price,
      priceLabel: item.priceLabel,
      features: item.features,
      active: item.active,
      order: item.order,
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
        const res = await fetchWithAuth("/api/services", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item as Service;
      }
      const res = await fetchWithAuth("/api/services", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item as Service;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Layanan tersimpan" : "Service saved");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/services?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Layanan dihapus" : "Service deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete");
    },
  });

  function onSubmit(values: FormValues) {
    saveMutation.mutate(values);
  }

  function formatPrice(price: number, label?: string) {
    if (label) return label;
    if (price <= 0) return "—";
    return `Rp ${price.toLocaleString("id-ID")}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.services.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${(data ?? []).length} layanan`
              : `${(data ?? []).length} services`}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95">
          <Plus className="size-4" />
          {t.admin.services.addNew}
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
              <TableHead>{t.admin.services.fields.icon}</TableHead>
              <TableHead>{t.admin.services.fields.priceLabel}</TableHead>
              <TableHead>{t.admin.common.status}</TableHead>
              <TableHead className="text-right">{t.admin.services.fields.order}</TableHead>
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
              list.map((s, idx) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-muted/50 border-b transition-colors"
                >
                  <TableCell className="max-w-[280px]">
                    <p className="truncate text-sm font-semibold">
                      {locale === "id" ? s.titleId : s.titleEn || s.titleId}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {locale === "id" ? s.titleEn : s.titleId}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {s.icon}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium tabular-nums">
                    {formatPrice(s.price, s.priceLabel)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                        s.active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {s.active && <Check className="size-3" />}
                      {s.active ? t.admin.common.active : t.admin.common.inactive}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {s.order}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(s)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(s.id)}
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
              {editing ? t.admin.services.editTitle : t.admin.services.addNew}
            </DialogTitle>
            <DialogDescription>
              {locale === "id"
                ? "Lengkapi data layanan bilingual di bawah."
                : "Fill in the bilingual service data below."}
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
                      <FormLabel>{t.admin.services.fields.titleId}</FormLabel>
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
                      <FormLabel>{t.admin.services.fields.titleEn}</FormLabel>
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
                      <FormLabel>{t.admin.services.fields.descId}</FormLabel>
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
                      <FormLabel>{t.admin.services.fields.descEn}</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.services.fields.icon}</FormLabel>
                      <FormControl>
                        <Input placeholder="Code" {...field} />
                      </FormControl>
                      <FormDescription>lucide-react</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.services.fields.price}</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.services.fields.order}</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="priceLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.services.fields.priceLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder="Rp 1.500.000 / Starting from…" {...field} />
                    </FormControl>
                    <FormDescription>
                      {locale === "id"
                        ? "Mengoverride angka harga bila diisi."
                        : "Overrides the numeric price when set."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.admin.services.fields.features}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Feature 1 | Feature 2 | Feature 3"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {locale === "id"
                        ? "Pisahkan setiap fitur dengan tanda | (pipe)."
                        : "Separate each feature with a | (pipe)."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                    <FormLabel>{t.admin.services.fields.active}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

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
