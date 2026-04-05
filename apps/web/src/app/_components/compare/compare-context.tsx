"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface CompareContextValue {
  isCompareMode: boolean;
  comparedRoleIds: string[];
  reservedSlots: number;
  anchorRoleId: string | null;
  isDragging: boolean;
  maxColumns: number;
  enterCompareMode: (anchorRoleId: string) => void;
  exitCompareMode: () => void;
  addRoleId: (id: string) => void;
  removeRoleId: (id: string) => void;
  addSlot: () => void;
  clear: () => void;
  setIsDragging: (isDragging: boolean) => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

const STORAGE_KEY = "cooper.compare-state";
const MAX_COLUMNS = 3; // Including the anchor role

interface PersistedState {
  isCompareMode: boolean;
  comparedRoleIds: string[];
  reservedSlots: number;
  anchorRoleId: string | null;
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparedRoleIds, setComparedRoleIds] = useState<string[]>([]);
  const [reservedSlots, setReservedSlots] = useState(0);
  const [anchorRoleId, setAnchorRoleId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load persisted state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        setIsCompareMode(parsed.isCompareMode);
        setComparedRoleIds(parsed.comparedRoleIds);
        setReservedSlots(Math.min(parsed.reservedSlots, MAX_COLUMNS - 1));
        setAnchorRoleId(parsed.anchorRoleId);
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
      anchorRoleId,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [isCompareMode, comparedRoleIds, reservedSlots, anchorRoleId]);

  const enterCompareMode = useCallback(
    (nextAnchorRoleId: string) => {
      setIsCompareMode(true);
      setAnchorRoleId(nextAnchorRoleId);
      setReservedSlots((slots) => {
        if (slots > 0) return slots;
        const hasCapacity = comparedRoleIds.length < MAX_COLUMNS - 1;
        return hasCapacity ? 1 : 0;
      });
    },
    [comparedRoleIds.length],
  );

  const exitCompareMode = useCallback(() => {
    setIsCompareMode(false);
    setComparedRoleIds([]);
    setAnchorRoleId(null);
    setIsDragging(false);
  }, []);

  const addRoleId = useCallback((id: string) => {
    setComparedRoleIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= MAX_COLUMNS - 1) return prev;
      return [...prev, id];
    });
    setReservedSlots((slots) => Math.max(0, slots - 1));
  }, []);

  const removeRoleId = useCallback(
    (id: string) => {
      if (comparedRoleIds.length === 0) {
        setIsCompareMode(false);
      } else if (anchorRoleId === id) {
        const newAnchorRoleId =
          comparedRoleIds.find((roleId) => roleId !== id) ?? null;
        setAnchorRoleId(newAnchorRoleId);
        setComparedRoleIds((prev) =>
          prev.filter((roleId) => roleId !== newAnchorRoleId),
        );
      } else {
        setComparedRoleIds((prev) => prev.filter((roleId) => roleId !== id));
      }
    },
    [anchorRoleId, comparedRoleIds],
  );

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
      anchorRoleId,
      isDragging,
      maxColumns: MAX_COLUMNS,
      enterCompareMode,
      exitCompareMode,
      addRoleId,
      removeRoleId,
      addSlot,
      clear,
      setIsDragging,
    }),
    [
      isCompareMode,
      comparedRoleIds,
      reservedSlots,
      anchorRoleId,
      isDragging,
      enterCompareMode,
      exitCompareMode,
      addRoleId,
      removeRoleId,
      addSlot,
      clear,
      setIsDragging,
    ],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}
