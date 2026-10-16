"use client";

import { useAppStore } from "@/lib/store";
import { id as idLocale, enUS } from "date-fns/locale";

/** Decode the current JWT admin token to get the logged-in user's basic info. */
export function getCurrentUser(): {
  username: string;
  name: string;
  role: string;
} | null {
  const token = useAppStore.getState().adminToken;
  if (!token) return null;
  try {
    const [data] = token.split(".");
    const payload = JSON.parse(
      atob(data.replace(/-/g, "+").replace(/_/g, "/")),
    ) as {
      username?: string;
      name?: string;
      role?: string;
    };
    return {
      username: payload.username ?? "",
      name: payload.name ?? "",
      role: payload.role ?? "admin",
    };
  } catch {
    return null;
  }
}

/** Convert a string into a URL-safe slug. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

/** Pick the correct date-fns locale object based on the active i18n locale. */
export function dateLocale(locale: "id" | "en") {
  return locale === "id" ? idLocale : enUS;
}

/** Format a byte count into a human-readable file-size string. */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const unit = units[i] ?? "B";
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${unit}`;
}

/** Initials for an avatar fallback. */
export function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
