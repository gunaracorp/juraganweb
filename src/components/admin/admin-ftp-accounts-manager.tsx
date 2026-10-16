"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FolderTree, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

interface FTPAccount {
  id: string;
  username: string;
  password: string;
  path: string;
  quota: number;
  usedQuota: number;
  status: string;
  createdAt: string;
}

export function AdminFTPAccountsManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FTPAccount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    username: "",
    password: "",
    path: "/",
    quota: 1024,
    status: "active" as string,
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ftp-accounts"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/ftp-accounts");
      if (!res.ok) return [] as FTPAccount[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as FTPAccount[];
    },
  });
  const allItems = (data ?? []) as FTPAccount[];

  const list = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter((a) => a.username.toLowerCase().includes(q));
  }, [allItems, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }
  function openEdit(a: FTPAccount) {
    setEditing(a);
    setForm({
      username: a.username,
      password: "",
      path: a.path || "/",
      quota: a.quota || 1024,
      status: a.status,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, quota: Number(form.quota) };
      if (editing && !payload.password) delete (payload as any).password;
      if (editing) {
        const res = await fetchWithAuth("/api/ftp-accounts", {
          method: "PUT",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error("Save failed");
        return json.item;
      }
      const res = await fetchWithAuth("/api/ftp-accounts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "FTP tersimpan" : "FTP saved");
      queryClient.invalidateQueries({ queryKey: ["admin-ftp-accounts"] });
      setDialogOpen(false);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menyimpan" : "Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/api/ftp-accounts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "FTP dihapus" : "FTP deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-ftp-accounts"] });
      setDeleteId(null);
    },
    onError: () => toast.error(locale === "id" ? "Gagal menghapus" : "Failed to delete"),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t.admin.ftpAccounts.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.ftpAccounts.title}</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.ftpAccounts.addNew}
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

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <FolderTree className="size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.ftpAccounts.fields.username}</TableHead>
                <TableHead>{t.admin.ftpAccounts.fields.path}</TableHead>
                <TableHead>{t.admin.ftpAccounts.fields.usedQuota}</TableHead>
                <TableHead>{t.admin.common.status}</TableHead>
                <TableHead className="text-right">{t.admin.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((a, i) => {
                const usedPct = a.quota ? Math.min(100, (a.usedQuota / a.quota) * 100) : 0;
                return (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.025, 0.4) }}
                    className="hover:bg-accent/40"
                  >
                    <TableCell className="font-mono font-medium">{a.username}</TableCell>
                    <TableCell className="font-mono text-sm">{a.path}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              usedPct > 90 ? "bg-destructive" : usedPct > 70 ? "bg-amber-500" : "bg-primary",
                            )}
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {a.usedQuota || 0}/{a.quota || 0} MB
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {a.status === "active" ? (
                        <Badge className="bg-primary/15 text-primary">{t.admin.common.active}</Badge>
                      ) : (
                        <Badge variant="secondary">{a.status}</Badge>
                      )}
                    </TableCell>
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? t.admin.common.edit : t.admin.ftpAccounts.addNew}
            </DialogTitle>
            <DialogDescription>{t.admin.ftpAccounts.title}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label>{t.admin.ftpAccounts.fields.username}</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.ftpAccounts.fields.password}</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? "(leave blank to keep)" : ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.ftpAccounts.fields.path}</Label>
                <Input value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} className="font-mono" placeholder="/var/www/" />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.ftpAccounts.fields.quota}</Label>
                <Input
                  type="number"
                  value={form.quota}
                  onChange={(e) => setForm({ ...form, quota: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.admin.ftpAccounts.fields.status}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.admin.common.active}</SelectItem>
                    <SelectItem value="suspended">{t.admin.customers.statuses.suspended}</SelectItem>
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
