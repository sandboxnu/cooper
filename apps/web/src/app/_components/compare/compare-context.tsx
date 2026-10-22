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
const SESSION_KEY = "cooper.compare-open";
const MAX_COLUMNS = 3; // Including the anchor role

interface PersistedState {
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
      // isCompareMode uses sessionStorage so it resets on new tabs but survives refreshes
      const rawSession = window.sessionStorage.getItem(SESSION_KEY);
      if (rawSession) {
        setIsCompareMode(JSON.parse(rawSession) as boolean);
      }
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        setComparedRoleIds(parsed.comparedRoleIds);
        setReservedSlots(Math.min(parsed.reservedSlots, MAX_COLUMNS - 1));
        setAnchorRoleId(parsed.anchorRoleId);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist open/closed state per-tab (resets on new tab, survives refresh)
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(isCompareMode));
  }, [isCompareMode]);

  // Persist role data across tabs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PersistedState = {
      comparedRoleIds,
      reservedSlots,
      anchorRoleId,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [comparedRoleIds, reservedSlots, anchorRoleId]);

  const enterCompareMode = useCallback(
    (nextAnchorRoleId: string) => {
      setIsCompareMode(true);
      setAnchorRoleId(nextAnchorRoleId);
      // The anchor is its own column, so it can't also be a compared role
      setComparedRoleIds((prev) =>
        prev.filter((id) => id !== nextAnchorRoleId),
      );
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
      // Work from the columns as shown: the anchor plus the compared roles
      // other than it (persisted state can list the anchor in both)
      const others = comparedRoleIds.filter(
        (roleId) => roleId !== anchorRoleId,
      );
      if (others.length === 0) {
        // Removing the only card exits compare mode
        setIsCompareMode(false);
        setComparedRoleIds([]);
      } else if (id === anchorRoleId || !others.includes(id)) {
        // Removing the anchor promotes the next compared role
        const [newAnchorRoleId, ...rest] = others;
        setAnchorRoleId(newAnchorRoleId ?? null);
        setComparedRoleIds(rest);
      } else {
        setComparedRoleIds(others.filter((roleId) => roleId !== id));
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

// Card density in compare mode, picked from a card's rendered width.
// Figma frames: sm = 347px, md = 520px, lg = 1064px.
export type CompareSize = "sm" | "md" | "lg";

const COMPARE_SIZE_MD_MIN_WIDTH = 500;
const COMPARE_SIZE_LG_MIN_WIDTH = 800;

export type CompareStickyHeader = "compact" | "full";

export function getCompareSize(cardWidth: number): CompareSize {
  if (cardWidth < COMPARE_SIZE_MD_MIN_WIDTH) return "sm";
  if (cardWidth < COMPARE_SIZE_LG_MIN_WIDTH) return "md";
  return "lg";
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}
