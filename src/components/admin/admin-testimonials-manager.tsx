"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  messageId: string;
  messageEn: string;
  rating: number;
  avatar: string | null;
  active: boolean;
  order: number;
}

const schema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  messageId: z.string().min(1),
  messageEn: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  avatar: z.string().optional().default(""),
  active: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof schema>;

function initials(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AdminTestimonialsManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/testimonials");
      if (!res.ok) return [] as Testimonial[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Testimonial[];
    },
  });

  const list = useMemo(() => {
    const all = (data ?? []) as Testimonial[];
    const sorted = [...all].sort((a, b) => a.order - b.order);
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q),
    );
  }, [data, search]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      company: "",
      role: "",
      messageId: "",
      messageEn: "",
      rating: 5,
      avatar: "",
      active: true,
      order: 0,
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      name: "",
      company: "",
      role: "",
      messageId: "",
      messageEn: "",
      rating: 5,
      avatar: "",
      active: true,
      order: (data ?? []).length,
    });
    setDialogOpen(true);
  }

  function openEdit(item: Testimonial) {
    setEditing(item);
    form.reset({
      name: item.name,
      company: item.company,
      role: item.role,
      messageId: item.messageId,
      messageEn: item.messageEn,
      rating: item.rating,
      avatar: item.avatar ?? "",
      active: item.active,
      order: item.order,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (editing) {
        const res = await fetchWithAuth("/api/testimonials", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...values }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item as Testimonial;
      }
      const res = await fetchWithAuth("/api/testimonials", {
        method: "POST",
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item as Testimonial;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Testimoni tersimpan" : "Testimonial saved");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/testimonials?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Testimoni dihapus" : "Testimonial deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
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
            {t.admin.testimonials.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${(data ?? []).length} testimoni`
              : `${(data ?? []).length} testimonials`}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95">
          <Plus className="size-4" />
          {t.admin.testimonials.addNew}
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
              <TableHead className="min-w-[200px]">{t.admin.testimonials.fields.name}</TableHead>
              <TableHead>{t.admin.testimonials.fields.company}</TableHead>
              <TableHead>{t.admin.testimonials.fields.rating}</TableHead>
              <TableHead>{t.admin.common.status}</TableHead>
              <TableHead className="text-right">{t.admin.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  {t.admin.common.noData}
                </TableCell>
              </TableRow>
            ) : (
              list.map((item, idx) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-muted/50 border-b transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold text-xs font-bold text-primary-foreground">
                        {item.avatar || initials(item.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{item.company}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3.5",
                            i < item.rating
                              ? "fill-gold text-gold"
                              : "text-muted-foreground/30",
                          )}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                        item.active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.active && <Check className="size-3" />}
                      {item.active ? t.admin.common.active : t.admin.common.inactive}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(item.id)}
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
              {editing ? t.admin.testimonials.editTitle : t.admin.testimonials.addNew}
            </DialogTitle>
            <DialogDescription>
              {locale === "id"
                ? "Lengkapi data testimoni bilingual di bawah."
                : "Fill in the bilingual testimonial data below."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.testimonials.fields.name}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.testimonials.fields.company}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.testimonials.fields.role}</FormLabel>
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
                  name="messageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.testimonials.fields.messageId}</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="messageEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.testimonials.fields.messageEn}</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.testimonials.fields.rating}</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.admin.testimonials.fields.avatar}</FormLabel>
                      <FormControl>
                        <Input placeholder="JD" {...field} />
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
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                    <FormLabel>{t.admin.testimonials.fields.active}</FormLabel>
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
