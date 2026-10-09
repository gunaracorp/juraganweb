"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { ClientNav } from "@/components/site/client-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api-client";
import { useCustomerStore } from "@/lib/customer-store";
import { useHydrated } from "@/lib/use-hydrated";
import { QueryProvider } from "@/components/site/query-provider";

interface Ticket {
  id: string; number: string; subject: string; category: string; priority: string;
  status: string; createdAt: string;
}

function priorityBadge(p: string) {
  const s = (p || "").toLowerCase();
  const variant: "default" | "secondary" | "destructive" | "outline" =
    s === "urgent" || s === "high" ? "destructive" :
    s === "normal" ? "secondary" : "outline";
  return <Badge variant={variant} className="capitalize">{s}</Badge>;
}

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  const variant: "default" | "secondary" | "destructive" | "outline" =
    s === "resolved" || s === "closed" ? "default" :
    s === "open" || s === "pending" ? "secondary" : "outline";
  return <Badge variant={variant} className="capitalize">{s}</Badge>;
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "-";
  try { return new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return s; }
}

export default function ClientTicketsPage() {
  return (
    <QueryProvider>
      <ClientTicketsInner />
    </QueryProvider>
  );
}

function ClientTicketsInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, customer, logout } = useCustomerStore();
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && !token) router.replace("/login?next=/client/tickets");
  }, [hydrated, token, router]);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "general", priority: "normal", message: "" });

  const email = customer?.email;
  const ticketsQuery = useQuery({
    queryKey: ["customer-tickets", email],
    queryFn: async () => {
      if (!email) return [];
      const res = await apiFetch(`/tickets?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      return (data.items || []) as Ticket[];
    },
    enabled: !!email,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customer?.name || "",
          customerEmail: email,
          subject: form.subject.trim(),
          category: form.category,
          priority: form.priority,
          message: form.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal membuat tiket");
      return data;
    },
    onSuccess: () => {
      toast.success("Tiket berhasil dibuat. Tim kami akan segera merespons.");
      setOpen(false);
      setForm({ subject: "", category: "general", priority: "normal", message: "" });
      queryClient.invalidateQueries({ queryKey: ["customer-tickets", email] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Subjek dan pesan wajib diisi");
      return;
    }
    createMutation.mutate();
  };

  const filtered = (ticketsQuery.data || []).filter((t) =>
    !q.trim() ||
    t.number.toLowerCase().includes(q.trim().toLowerCase()) ||
    t.subject.toLowerCase().includes(q.trim().toLowerCase()) ||
    t.category.toLowerCase().includes(q.trim().toLowerCase()),
  );

  if (!hydrated || !token) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 size-5 animate-spin" /> Memuat...
          </div>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <section className="bg-mesh min-h-[calc(100vh-4rem)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Tiket <span className="gradient-text">Support</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Buka tiket bantuan dan pantau statusnya di sini.
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-brand-gradient text-primary-foreground">
                  <Plus className="size-3.5" /> Buka Tiket Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Buka Tiket Baru</DialogTitle>
                  <DialogDescription>
                    Sampaikan kendala atau pertanyaan Anda. Tim support akan merespons via email.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subjek</Label>
                    <Input
                      id="subject"
                      required
                      placeholder="Ringkasan masalah Anda"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Umum</SelectItem>
                          <SelectItem value="billing">Tagihan</SelectItem>
                          <SelectItem value="technical">Teknis</SelectItem>
                          <SelectItem value="sales">Penjualan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioritas</Label>
                      <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                        <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Rendah</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">Tinggi</SelectItem>
                          <SelectItem value="urgent">Mendesak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      placeholder="Jelaskan secara detail kendala yang Anda alami..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="bg-brand-gradient text-primary-foreground"
                    >
                      {createMutation.isPending ? "Mengirim..." : "Kirim Tiket"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <ClientNav />

            <div className="min-w-0 flex-1 space-y-4">
              <Card className="glass border-border/60">
                <CardContent className="p-4">
                  <div className="relative sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari nomor / subjek tiket..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border/60">
                <CardContent className="p-0">
                  {ticketsQuery.isLoading ? (
                    <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient/15">
                        <MessageSquare className="size-6 text-primary" />
                      </div>
                      <p className="font-semibold">Belum ada tiket</p>
                      <p className="text-sm text-muted-foreground">Buka tiket pertama Anda jika ada kendala atau pertanyaan.</p>
                      <Button size="sm" className="bg-brand-gradient text-primary-foreground" onClick={() => setOpen(true)}>
                        <Plus className="size-3.5" /> Buka Tiket Baru
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nomor</TableHead>
                            <TableHead>Subjek</TableHead>
                            <TableHead className="hidden md:table-cell">Kategori</TableHead>
                            <TableHead className="hidden sm:table-cell">Prioritas</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden sm:table-cell">Tanggal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((t) => (
                            <TableRow key={t.id}>
                              <TableCell className="font-mono text-xs font-medium">{t.number}</TableCell>
                              <TableCell className="max-w-[200px] truncate font-medium">{t.subject}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="outline" className="capitalize">{t.category}</Badge>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">{priorityBadge(t.priority)}</TableCell>
                              <TableCell>{statusBadge(t.status)}</TableCell>
                              <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{fmtDate(t.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
