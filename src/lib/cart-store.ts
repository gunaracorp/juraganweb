"use client";
// Cart store — keranjang belanja pakai Zustand + persist ke localStorage
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // unique line id
  type: "hosting" | "vps" | "cloud" | "domain" | "ssl" | "email" | "wordpress" | "service";
  packageSlug?: string;
  name: string;
  domain?: string; // for domain registrations
  period: number; // months or years
  billingCycle: "monthly" | "yearly" | "one-time";
  price: number; // unit price in IDR
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

function genId() {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          // merge same package+period+domain
          const existing = s.items.find(
            (i) =>
              i.packageSlug === item.packageSlug &&
              i.domain === item.domain &&
              i.period === item.period &&
              i.billingCycle === item.billingCycle,
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === existing.id ? { ...i, qty: i.qty + item.qty } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, id: genId() }] };
        }),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: "juraganwebsite-cart" },
  ),
);
