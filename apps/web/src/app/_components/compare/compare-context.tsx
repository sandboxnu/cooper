"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CompareContextValue = {
  isCompareMode: boolean;
  comparedRoleIds: string[];
  reservedSlots: number;
  maxColumns: number;
  enterCompareMode: () => void;
  exitCompareMode: () => void;
  addRoleId: (id: string) => void;
  removeRoleId: (id: string) => void;
  addSlot: () => void;
  clear: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

const STORAGE_KEY = "cooper.compare-state";
const MAX_COLUMNS = 3; // Including the anchor role

type PersistedState = {
  isCompareMode: boolean;
  comparedRoleIds: string[];
  reservedSlots: number;
};

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparedRoleIds, setComparedRoleIds] = useState<string[]>([]);
  const [reservedSlots, setReservedSlots] = useState(0);

  // Load persisted state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        setIsCompareMode(parsed.isCompareMode ?? false);
        setComparedRoleIds(parsed.comparedRoleIds ?? []);
        setReservedSlots(
          Math.min(parsed.reservedSlots ?? 0, MAX_COLUMNS - 1),
        );
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PersistedState = {
      isCompareMode,
      comparedRoleIds,
      reservedSlots,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [isCompareMode, comparedRoleIds, reservedSlots]);

  const enterCompareMode = useCallback(() => {
    setIsCompareMode(true);
    setReservedSlots((slots) => {
      if (slots > 0) return slots;
      const hasCapacity = comparedRoleIds.length < MAX_COLUMNS - 1;
      return hasCapacity ? 1 : 0;
    });
  }, [comparedRoleIds.length]);

  const exitCompareMode = useCallback(() => {
    setIsCompareMode(false);
  }, []);

  const addRoleId = useCallback((id: string) => {
    setComparedRoleIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= MAX_COLUMNS - 1) return prev;
      return [...prev, id];
    });
    setReservedSlots((slots) => Math.max(0, slots - 1));
  }, []);

  const removeRoleId = useCallback((id: string) => {
    setComparedRoleIds((prev) => prev.filter((roleId) => roleId !== id));
  }, []);

  const addSlot = useCallback(() => {
    setReservedSlots((slots) => {
      const totalColumns = 1 + comparedRoleIds.length + slots;
      if (totalColumns >= MAX_COLUMNS) return slots;
      return slots + 1;
    });
  }, [comparedRoleIds.length]);

  const clear = useCallback(() => {
    setComparedRoleIds([]);
    setReservedSlots(0);
  }, []);

  const value = useMemo(
    () => ({
      isCompareMode,
      comparedRoleIds,
      reservedSlots,
      maxColumns: MAX_COLUMNS,
      enterCompareMode,
      exitCompareMode,
      addRoleId,
      removeRoleId,
      addSlot,
      clear,
    }),
    [
      isCompareMode,
      comparedRoleIds,
      reservedSlots,
      enterCompareMode,
      exitCompareMode,
      addRoleId,
      removeRoleId,
      addSlot,
      clear,
    ],
  );

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}


