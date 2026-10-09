"use client";
// Detects whether we're on the client after hydration — returns false on server, true on client.
// Uses useSyncExternalStore so it doesn't trigger setState-in-effect lint warnings.
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
