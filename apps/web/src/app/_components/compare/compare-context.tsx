/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CompareContextValue = {
  isCompareMode: boolean;
  comparedRoleIds: string[]; // Secondary roles, not including the currently selected anchor role
  reservedSlots: number; // Empty slots shown while in compare mode to invite drops
  enterCompareMode: () => void;
  exitCompareMode: () => void;
  addRoleId: (id: string) => void;
  removeRoleId: (id: string) => void;
  clear: () => void;
  addSlot: () => void;
  maxColumns: number;
};

const CompareContext = createContext<CompareContextValue | null>(null);

const STORAGE_KEY = "cooper.compare";

type PersistedState = {
  isCompareMode: boolean;
  comparedRoleIds: string[];
};

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparedRoleIds, setComparedRoleIds] = useState<string[]>([]);
  const [reservedSlots, setReservedSlots] = useState(1); // default one slot when user enters compare mode
  const maxColumns = 3; // including the anchor/currently viewed role

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        setIsCompareMode(parsed.isCompareMode ?? false);
        setComparedRoleIds(parsed.comparedRoleIds ?? []);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PersistedState = { isCompareMode, comparedRoleIds };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [isCompareMode, comparedRoleIds]);

  const enterCompareMode = useCallback(() => {
    setIsCompareMode(true);
    setReservedSlots((s) => (s < 1 ? 1 : s));
  }, []);

  const exitCompareMode = useCallback(() => {
    setIsCompareMode(false);
  }, []);

  const addRoleId = useCallback((id: string) => {
    setComparedRoleIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= maxColumns - 1) return prev;
      return [...prev, id];
    });
    // When adding a role, consume one reserved slot
    setReservedSlots((s) => Math.max(0, s - 1));
  }, []);

  const removeRoleId = useCallback((id: string) => {
    setComparedRoleIds((prev) => prev.filter((r) => r !== id));
    // When removing a role, also remove one reserved slot
    // so the visual column count decreases
    setReservedSlots((s) => Math.max(0, s - 1));
  }, []);

  const clear = useCallback(() => {
    setComparedRoleIds([]);
    setReservedSlots(1);
  }, []);

  const addSlot = useCallback(() => {
    // Only add a slot if we haven't reached max columns
    setReservedSlots((s) => s + 1);
  }, []);

  const value = useMemo(
    () => ({
      isCompareMode,
      comparedRoleIds,
      reservedSlots,
      enterCompareMode,
      exitCompareMode,
      addRoleId,
      removeRoleId,
      clear,
      addSlot,
      maxColumns,
    }),
    [
      isCompareMode,
      comparedRoleIds,
      reservedSlots,
      enterCompareMode,
      exitCompareMode,
      addRoleId,
      removeRoleId,
      clear,
      addSlot,
    ],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}


