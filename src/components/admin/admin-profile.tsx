"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  Calendar,
  CheckCircle2,
  Key,
  Lock,
  Mail,
  Pencil,
  Save,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getCurrentUser, getInitials } from "./_utils";

interface Profile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  lastLogin: string | null;
  createdAt: string;
}

function ProfileEditForm({
  initial,
  onCancel,
}: {
  initial: Profile;
  onCancel: () => void;
}) {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();

  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [avatar, setAvatar] = useState(initial.avatar || "");
  const [bio, setBio] = useState(initial.bio || "");

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ name, email, avatar, bio }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Update failed");
      }
      return json.user as Profile;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Profil diperbarui" : "Profile updated");
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onCancel();
    },
    onError: (err: Error) => {
      toast.error(err.message || (locale === "id" ? "Gagal memperbarui" : "Failed to update"));
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t.admin.profile.fields.name}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t.admin.profile.fields.email}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t.admin.profile.fields.avatar}</label>
        <Input
          type="url"
          placeholder="https://..."
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t.admin.profile.fields.bio}</label>
        <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={updateProfileMutation.isPending}>
          {t.admin.common.cancel}
        </Button>
        <Button
          onClick={() => updateProfileMutation.mutate()}
          disabled={updateProfileMutation.isPending || !name.trim() || !email.trim()}
          className="bg-brand-gradient text-primary-foreground hover:opacity-95"
        >
          <Save className="size-3.5" />
          {updateProfileMutation.isPending ? t.admin.common.loading : t.admin.common.save}
        </Button>
      </div>
    </div>
  );
}

export function AdminProfile() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;
  const me = getCurrentUser();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/profile");
      if (!res.ok) return null;
      const json = await res.json().catch(() => null);
      return (json?.user ?? null) as Profile | null;
    },
    enabled: !!me,
  });

  const profile = data ?? null;

  const [editMode, setEditMode] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Change failed");
      }
      return json.user;
    },
    onSuccess: () => {
      toast.success(t.admin.profile.passwordChanged);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("incorrect")) {
        toast.error(t.admin.profile.wrongPassword);
      } else if (msg.toLowerCase().includes("match")) {
        toast.error(t.admin.profile.passwordMismatch);
      } else {
        toast.error(
          locale === "id" ? "Gagal mengganti password" : "Failed to change password",
        );
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">
          {locale === "id" ? "Profil tidak ditemukan." : "Profile not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">
          {t.admin.profile.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {locale === "id"
            ? "Kelola informasi profil dan keamanan akun Anda."
            : "Manage your profile information and account security."}
        </p>
      </div>

      {/* Profile info card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <UserIcon className="size-4" />
              </span>
              {t.admin.profile.editProfile}
            </CardTitle>
            {!editMode && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="size-3.5" />
                {t.admin.common.edit}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Avatar header */}
            <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-gradient-to-br from-primary/5 to-gold/5 p-4">
              <Avatar className="size-16 border-2 border-primary/30">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-brand-gradient text-xl font-bold text-primary-foreground">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold">{profile.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  @{profile.username} · {profile.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    <CheckCircle2 className="size-3" />
                    {t.admin.users.roles[
                      profile.role as keyof typeof t.admin.users.roles
                    ] ?? profile.role}
                  </Badge>
                  <Badge variant="outline" className="font-medium">
                    <Calendar className="size-3" />
                    {locale === "id" ? "Bergabung sejak" : "Member since"}{" "}
                    {format(new Date(profile.createdAt), "PP", {
                      locale: dateLocaleObj,
                    })}
                  </Badge>
                  {profile.lastLogin && (
                    <Badge variant="outline" className="font-medium">
                      <Lock className="size-3" />
                      {t.admin.users.lastLogin}{" "}
                      {format(new Date(profile.lastLogin), "PPpp", {
                        locale: dateLocaleObj,
                      })}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {editMode ? (
              <ProfileEditForm
                key={profile.id + profile.name + profile.email}
                initial={profile}
                onCancel={() => setEditMode(false)}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.admin.profile.fields.name}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">{profile.name}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.admin.profile.fields.email}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold">
                    {profile.email}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 p-3 sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.admin.profile.fields.bio}
                  </p>
                  <p className="mt-0.5 text-sm">
                    {profile.bio || (
                      <span className="text-muted-foreground">
                        {locale === "id" ? "Belum ada bio." : "No bio yet."}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Change password card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <span className="flex size-7 items-center justify-center rounded-md bg-gold/10 text-gold">
                <Key className="size-4" />
              </span>
              {t.admin.profile.changePassword}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {t.admin.profile.fields.currentPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t.admin.profile.fields.newPassword}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t.admin.profile.fields.confirmPassword}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className={cn(
                      "pl-9",
                      confirmPassword &&
                        newPassword !== confirmPassword &&
                        "border-destructive/50",
                    )}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-destructive">
                    {t.admin.profile.passwordMismatch}
                  </p>
                )}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {locale === "id"
                ? "Password minimal 6 karakter."
                : "Password must be at least 6 characters."}
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => changePasswordMutation.mutate()}
                disabled={
                  changePasswordMutation.isPending ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
                className="bg-brand-gradient text-primary-foreground hover:opacity-95"
              >
                <Key className="size-3.5" />
                {changePasswordMutation.isPending
                  ? t.admin.common.loading
                  : t.admin.profile.changePassword}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
