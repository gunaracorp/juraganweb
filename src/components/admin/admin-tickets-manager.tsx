"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  LifeBuoy,
  Lock,
  Mail,
  Send,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthFetch } from "./use-auth-fetch";
import { getCurrentUser, getInitials } from "./_utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  number: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  department: string;
  assignedTo: string | null;
  message: string;
  tags: string;
  rating: number | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LocalReply {
  id: string;
  author: string;
  authorRole: string;
  message: string;
  internal: boolean;
  createdAt: string;
}

const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
const STATUSES = ["open", "pending", "resolved", "closed"] as const;
const CATEGORIES = ["general", "billing", "technical", "sales", "abuse"] as const;

function priorityBadge(p: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    normal: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    high: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    urgent: "bg-destructive/15 text-destructive",
  };
  return (
    <Badge className={map[p] || "bg-muted text-muted-foreground"}>
      {t.admin.tickets.priorities[p as keyof typeof t.admin.tickets.priorities] || p}
    </Badge>
  );
}

function statusBadge(s: string, t: ReturnType<typeof useTranslation>["t"]) {
  const map: Record<string, string> = {
    open: "bg-primary/15 text-primary",
    pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    resolved: "bg-primary/15 text-primary",
    closed: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={map[s] || "bg-muted text-muted-foreground"}>
      {t.admin.tickets.statuses[s as keyof typeof t.admin.tickets.statuses] || s}
    </Badge>
  );
}

export function AdminTicketsManager() {
  const { t, locale } = useTranslation();
  const fetchWithAuth = useAuthFetch();
  const queryClient = useQueryClient();
  const dateLocaleObj = locale === "id" ? idLocale : enUS;

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [localReplies, setLocalReplies] = useState<Record<string, LocalReply[]>>({});

  const currentUser = getCurrentUser();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/tickets?admin=true");
      if (!res.ok) return [] as Ticket[];
      const json = await res.json().catch(() => null);
      return (json?.items ?? []) as Ticket[];
    },
    refetchInterval: 30000,
  });
  const allItems = (data ?? []) as Ticket[];

  const stats = useMemo(() => {
    let open = 0, pending = 0, resolved = 0, urgent = 0;
    for (const tk of allItems) {
      if (tk.status === "open") open++;
      else if (tk.status === "pending") pending++;
      else if (tk.status === "resolved") resolved++;
      if (tk.priority === "urgent" && (tk.status === "open" || tk.status === "pending")) urgent++;
    }
    return { total: allItems.length, open, pending, resolved, urgent };
  }, [allItems]);

  const list = useMemo(() => {
    let arr = allItems;
    if (statusFilter !== "all") arr = arr.filter((tk) => tk.status === statusFilter);
    if (priorityFilter !== "all") arr = arr.filter((tk) => tk.priority === priorityFilter);
    if (categoryFilter !== "all") arr = arr.filter((tk) => tk.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (tk) =>
          tk.subject.toLowerCase().includes(q) ||
          tk.number.toLowerCase().includes(q) ||
          tk.customerName.toLowerCase().includes(q) ||
          tk.customerEmail.toLowerCase().includes(q),
      );
    }
    return arr;
  }, [allItems, statusFilter, priorityFilter, categoryFilter, search]);

  const selected = useMemo(
    () => allItems.find((tk) => tk.id === selectedId) || list[0] || null,
    [allItems, selectedId, list],
  );

  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!selected || !reply.trim()) throw new Error("Empty reply");
      const res = await fetchWithAuth("/api/tickets?action=respond", {
        method: "PUT",
        body: JSON.stringify({
          id: selected.id,
          reply: reply.trim(),
          internal,
          status: internal ? selected.status : "pending",
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Reply failed");
      return json.item as Ticket;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Balasan terkirim" : "Reply sent");
      const id = selected!.id;
      const newReply: LocalReply = {
        id: `local-${Date.now()}`,
        author: currentUser?.name || "Admin",
        authorRole: "admin",
        message: reply.trim(),
        internal,
        createdAt: new Date().toISOString(),
      };
      setLocalReplies({ ...localReplies, [id]: [...(localReplies[id] || []), newReply] });
      setReply("");
      setInternal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal membalas" : "Failed to reply"),
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/tickets", {
        method: "PUT",
        body: JSON.stringify({ id, status: "resolved" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Ticket diselesaikan" : "Ticket resolved");
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal" : "Failed"),
  });

  const assignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth("/api/tickets", {
        method: "PUT",
        body: JSON.stringify({ id, assignedTo: currentUser?.username || "admin" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("Failed");
      return id;
    },
    onSuccess: () => {
      toast.success(locale === "id" ? "Ticket ditugaskan ke Anda" : "Ticket assigned to you");
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: () => toast.error(locale === "id" ? "Gagal" : "Failed"),
  });

  const statCards = [
    { label: t.admin.tickets.statuses.open, value: stats.open, color: "text-primary" },
    { label: t.admin.tickets.statuses.pending, value: stats.pending, color: "text-amber-500" },
    { label: t.admin.tickets.statuses.resolved, value: stats.resolved, color: "text-primary" },
    { label: t.admin.tickets.priorities.urgent, value: stats.urgent, color: "text-destructive" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">{t.admin.tickets.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin.tickets.allTickets}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <div className={cn("mt-2 text-xl font-extrabold", s.color)}>{s.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={t.admin.common.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "id" ? "Semua Status" : "All Status"}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t.admin.tickets.statuses[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "id" ? "Semua Prioritas" : "All Priorities"}</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {t.admin.tickets.priorities[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "id" ? "Semua Kategori" : "All Categories"}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {t.admin.tickets.categories[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: list */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="overflow-hidden rounded-xl border border-border">
            <ScrollArea className="h-[60vh]">
              {isLoading ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LifeBuoy className="size-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
                </div>
              ) : (
                list.map((tk, i) => (
                  <motion.button
                    key={tk.id}
                    type="button"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.025, 0.4) }}
                    onClick={() => setSelectedId(tk.id)}
                    className={cn(
                      "block w-full border-b border-border p-3 text-left transition-colors last:border-b-0",
                      selectedId === tk.id ? "bg-primary/10" : "hover:bg-accent/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{tk.number}</span>
                          {priorityBadge(tk.priority, t)}
                        </div>
                        <div className="mt-1 truncate text-sm font-semibold">{tk.subject}</div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                          {tk.customerName} · {tk.customerEmail}
                        </div>
                      </div>
                      {statusBadge(tk.status, t)}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t.admin.tickets.categories[tk.category as keyof typeof t.admin.tickets.categories] || tk.category}</span>
                      <span>{formatDistanceToNow(new Date(tk.createdAt), { addSuffix: true, locale: dateLocaleObj })}</span>
                    </div>
                  </motion.button>
                ))
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Right: detail */}
        <div className="lg:col-span-7 xl:col-span-8">
          {!selected ? (
            <div className="flex h-[60vh] items-center justify-center rounded-xl border border-dashed border-border text-center">
              <div>
                <Mail className="mx-auto size-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">{t.admin.common.noData}</p>
              </div>
            </div>
          ) : (
            <Card className="flex h-[60vh] flex-col">
              <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{selected.number}</span>
                      {priorityBadge(selected.priority, t)}
                      {statusBadge(selected.status, t)}
                    </div>
                    <h3 className="mt-1 text-base font-bold">{selected.subject}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {selected.customerName} ({selected.customerEmail})
                      </span>
                      <span>{t.admin.tickets.categories[selected.category as keyof typeof t.admin.tickets.categories] || selected.category}</span>
                      <span>{t.admin.tickets.departments[selected.department as keyof typeof t.admin.tickets.departments] || selected.department}</span>
                      <span>{format(new Date(selected.createdAt), "dd MMM yyyy HH:mm", { locale: dateLocaleObj })}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!selected.assignedTo && (
                      <Button size="sm" variant="outline" onClick={() => assignMutation.mutate(selected.id)}>
                        <User className="size-3.5" />
                        {t.admin.tickets.assignToMe}
                      </Button>
                    )}
                    {selected.status !== "resolved" && selected.status !== "closed" && (
                      <Button
                        size="sm"
                        onClick={() => resolveMutation.mutate(selected.id)}
                        className="bg-brand-gradient text-primary-foreground"
                      >
                        <CheckCircle2 className="size-3.5" />
                        {t.admin.tickets.markResolved}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Thread */}
                <ScrollArea className="flex-1 pr-2">
                  <div className="space-y-3">
                    {/* Initial message */}
                    <div className="flex gap-3">
                      <Avatar className="size-8 shrink-0 border border-border">
                        <AvatarFallback className="bg-muted text-xs font-bold">
                          {getInitials(selected.customerName || "C")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 rounded-lg rounded-tl-none border border-border bg-muted/30 p-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-semibold">{selected.customerName}</span>
                          <span className="text-muted-foreground">
                            {format(new Date(selected.createdAt), "dd MMM yyyy HH:mm", { locale: dateLocaleObj })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{selected.message}</p>
                      </div>
                    </div>
                    {/* Local replies */}
                    {(localReplies[selected.id] || []).map((r) => (
                      <div key={r.id} className="flex gap-3">
                        <Avatar className="size-8 shrink-0 border border-border">
                          <AvatarFallback className="bg-brand-gradient text-xs font-bold text-primary-foreground">
                            {getInitials(r.author)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "flex-1 rounded-lg rounded-tl-none border p-3",
                            r.internal
                              ? "border-amber-500/40 bg-amber-500/10"
                              : "border-primary/40 bg-primary/10",
                          )}
                        >
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-semibold">
                              {r.author}
                              {r.internal && (
                                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                  <Lock className="size-3" />
                                  {t.admin.tickets.internalNote}
                                </Badge>
                              )}
                            </span>
                            <span className="text-muted-foreground">just now</span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm">{r.message}</p>
                        </div>
                      </div>
                    ))}
                    {/* Response time tracker */}
                    {selected.firstResponseAt && (
                      <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {t.admin.tickets.fields.firstResponseAt}:{" "}
                        {format(new Date(selected.firstResponseAt), "dd MMM yyyy HH:mm", { locale: dateLocaleObj })}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Reply form */}
                <div className="space-y-2 border-t border-border pt-3">
                  <Label htmlFor="reply">{t.admin.tickets.addReply}</Label>
                  <Textarea
                    id="reply"
                    rows={3}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={t.admin.tickets.addReply}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={internal} onCheckedChange={setInternal} />
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Lock className="size-3.5" />
                        {t.admin.tickets.internalNote}
                      </span>
                    </label>
                    <Button
                      size="sm"
                      onClick={() => replyMutation.mutate()}
                      disabled={replyMutation.isPending || !reply.trim()}
                      className="bg-brand-gradient text-primary-foreground"
                    >
                      <Send className="size-3.5" />
                      {t.admin.common.save}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
