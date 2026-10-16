"use client";
// Customer auth store — token + basic profile di client (persist localStorage)
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CustomerBasic {
  id: string;
  email: string;
  name: string;
}

interface CustomerState {
  token: string | null;
  customer: CustomerBasic | null;
  setAuth: (token: string, customer: CustomerBasic) => void;
  logout: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      token: null,
      customer: null,
      setAuth: (token, customer) => set({ token, customer }),
      logout: () => set({ token: null, customer: null }),
    }),
    {
      name: "juraganwebsite-customer",
      // only persist token + customer
      partialize: (s) => ({ token: s.token, customer: s.customer }),
    },
  ),
);
