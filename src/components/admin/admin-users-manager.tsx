"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  Mail,
  Pencil,
  Plus,
  Shield,
  Trash2,
  User as UserIcon,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getCurrentUser, getInitials } from "./_utils";

interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  lastLogin: Date | null;
  createdAt: Date;
}

const ROLES = ["superadmin", "admin", "editor", "author", "contributor"] as const;

function roleBadge(role: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    superadmin: "bg-destructive/15 text-destructive",
    admin: "bg-primary/15 text-primary",
    editor: "bg-gold/15 text-gold",
    author: "bg-secondary text-secondary-foreground",
    contributor: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", map[role] || "")}>
      <Shield className="size-3" />
      {t.admin.users.roles[role as keyof typeof t.admin.users.roles] ?? role}
    </Badge>
  );
}

export function AdminUsersManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const me = getCurrentUser();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("editor");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/users");
      if (!res.ok) return [] as AdminUser[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as AdminUser[];
    },
  });

  const users = (data ?? []) as AdminUser[];

  function openCreate() {
    setEditing(null);
    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("editor");
    setAvatar("");
    setBio("");
    setDialogOpen(true);
  }

  function openEdit(u: AdminUser) {
    setEditing(u);
    setName(u.name);
    setUsername(u.username);
    setEmail(u.email);
    setPassword("");
    setRole(u.role as (typeof ROLES)[number]);
    setAvatar(u.avatar || "");
    setBio(u.bio || "");
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const body: Record<string, unknown> = {
          id: editing.id,
          name,
          email,
          role,
          avatar,
          bio,
        };
        if (password) body.password = password;
        const res = await fetchWithAuth("/api/users", {
          method: "PUT",
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) throw new Error(json?.error || "Update failed");
        return json.item;
      }
      if (!password) {
        throw new Error("Password required");
      }
      const res = await fetchWithAuth("/api/users", {
        method: "POST",
        body: JSON.stringify({ username, password, name, email, role }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Create failed");
      return json.item;
    },
    onSuccess: () => {
      toast.success(
        editing
          ? locale === "id"
            ? "Pengguna diperbarui"
            : "User updated"
          : locale === "id"
            ? "Pengguna dibuat"
            : "User created",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      setDialogOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || (locale === "id" ? "Gagal menyimpan" : "Failed to save"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (u: AdminUser) => {
      if (me?.username === u.username) {
        throw new Error(t.admin.users.cannotDeleteSelf);
      }
      const res = await fetchWithAuth(
        `/api/users?id=${encodeURIComponent(u.id)}&username=${encodeURIComponent(u.username)}`,
        { method: "DELETE" },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Delete failed");
      }
      return u.id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Pengguna dihapus" : "User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-overview"] });
      setDeleteId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || (locale === "id" ? "Gagal menghapus" : "Failed to delete"));
    },
  });

  const deletingUser = deleteId ? users.find((u) => u.id === deleteId) : null;
  const isSelf = deletingUser ? me?.username === deletingUser.username : false;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.admin.users.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "id"
              ? `${users.length} pengguna terdaftar`
              : `${users.length} users registered`}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-gradient text-primary-foreground shadow-md hover:opacity-95"
        >
          <Plus className="size-4" />
          {t.admin.users.addNew}
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">
                {locale === "id" ? "Pengguna" : "User"}
              </TableHead>
              <TableHead>{t.admin.users.fields.username}</TableHead>
              <TableHead>{t.admin.users.fields.role}</TableHead>
              <TableHead>{t.admin.users.lastLogin}</TableHead>
              <TableHead>{t.admin.common.createdAt}</TableHead>
              <TableHead className="text-right">{t.admin.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  {t.admin.common.noData}
                </TableCell>
              </TableRow>
            ) : (
              users.map((u, idx) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-muted/50 border-b transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border border-border">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="size-full rounded-full object-cover"
                          />
                        ) : (
                          <AvatarFallback className="bg-brand-gradient text-xs font-bold text-primary-foreground">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {u.name}
                          {me?.username === u.username && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              <UserIcon className="size-2.5" />
                              {locale === "id" ? "Anda" : "You"}
                            </span>
                          )}
                        </p>
                        <a
                          href={`mailto:${u.email}`}
                          className="flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-primary"
                        >
                          <Mail className="size-3" />
                          {u.email}
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded-md bg-muted px-2 py-0.5 text-xs">
                      @{u.username}
                    </code>
                  </TableCell>
                  <TableCell>{roleBadge(u.role, t)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.lastLogin
                      ? format(new Date(u.lastLogin), "PP pp", { locale: dateLocaleObj })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(u.createdAt), "PP", { locale: dateLocaleObj })}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(u)}
                        aria-label={t.admin.common.edit}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(u.id)}
                        disabled={me?.username === u.username}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                        aria-label={t.admin.common.delete}
                        title={
                          me?.username === u.username
                            ? t.admin.users.cannotDeleteSelf
                            : t.admin.common.delete
                        }
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

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] max-w-lg overflow-hidden p-0">
          <DialogHeader className="border-b border-border/60 px-6 py-4">
            <DialogTitle>
              {editing ? t.admin.users.editTitle : t.admin.users.addNew}
            </DialogTitle>
            <DialogDescription>
              {locale === "id"
                ? "Isi data pengguna di bawah ini."
                : "Fill in the user data below."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(92vh-9rem)] px-6">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t.admin.users.fields.name}
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t.admin.users.fields.username}
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!!editing}
                    placeholder="username (tidak bisa diubah)"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t.admin.users.fields.email}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t.admin.users.fields.password}
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      editing
                        ? locale === "id"
                          ? "Kosongkan jika tidak ganti"
                          : "Leave blank to keep"
                        : ""
                    }
                  />
                  {editing && (
                    <p className="text-[11px] text-muted-foreground">
                      {locale === "id"
                        ? "Kosongkan jika tidak ingin mengganti password."
                        : "Leave blank to keep current password."}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t.admin.users.fields.role}
                  </label>
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as (typeof ROLES)[number])}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {t.admin.users.roles[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t.admin.users.fields.avatar}
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t.admin.users.fields.bio}
                </label>
                <Textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="border-t border-border/60 bg-background/80 px-6 py-3 backdrop-blur">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saveMutation.isPending}
            >
              {t.admin.common.cancel}
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={
                saveMutation.isPending ||
                !name.trim() ||
                !email.trim() ||
                (!editing && (!username.trim() || !password.trim()))
              }
              className="bg-brand-gradient text-primary-foreground hover:opacity-95"
            >
              {saveMutation.isPending ? t.admin.common.loading : t.admin.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isSelf ? t.admin.users.cannotDeleteSelf : t.admin.common.confirmDelete}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isSelf
                ? locale === "id"
                  ? "Anda tidak bisa menghapus akun sendiri."
                  : "You cannot delete your own account."
                : locale === "id"
                  ? "Pengguna akan dihapus permanen."
                  : "The user will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t.admin.common.cancel}
            </AlertDialogCancel>
            {!isSelf && (
              <AlertDialogAction
                onClick={() =>
                  deletingUser && deleteMutation.mutate(deletingUser)
                }
                disabled={deleteMutation.isPending}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? t.admin.common.loading : t.admin.common.delete}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
