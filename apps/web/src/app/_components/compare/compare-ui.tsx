"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";

import { api } from "~/trpc/react";
import { RoleInfo } from "../roles/role-info";
import type { CompareSize, CompareStickyHeader } from "./compare-context";
import { getCompareSize, useCompare } from "./compare-context";
import { COMPARE_ROW_COUNT } from "./compare-section";

// Cards never shrink below this; the roles page hides its sidebar to make room
export const COMPARE_CARD_MIN_WIDTH = 340;
const COMPARE_CARD_GAP = 12; // ml-3 between cards
const COMPARE_DROP_SLOT_WIDTH = 80; // 68px slot + its 12px gap margin
const COMPARE_COLUMNS_PADDING = 16; // px-2 on CompareColumns

// Width CompareColumns needs to fit every card at its minimum width
export function getCompareColumnsMinWidth(
  cardCount: number,
  hasDropSlot: boolean,
) {
  return (
    cardCount * COMPARE_CARD_MIN_WIDTH +
    (cardCount - 1) * COMPARE_CARD_GAP +
    (hasDropSlot ? COMPARE_DROP_SLOT_WIDTH : 0) +
    COMPARE_COLUMNS_PADDING
  );
}

interface CompareControlsProps {
  anchorRoleId?: string | null;
  // False when the screen is too narrow to compare; hides the COMPARE button
  canCompare?: boolean;
}

export function CompareControls({
  anchorRoleId,
  canCompare = true,
}: CompareControlsProps) {
  const compare = useCompare();

  if (!anchorRoleId) {
    return null;
  }

  if (!compare.isCompareMode) {
    if (!canCompare) return null;
    return (
      <Button
        className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-[rgba(49,115,222,0.15)] bg-[#C4D4E9] px-[14px] py-2 text-sm font-bold text-[#606060] transition hover:bg-[rgba(49,115,222,0.15)] h-9"
        onClick={() => compare.enterCompareMode(anchorRoleId)}
      >
        <Image
          src="/svg/compareRole.svg"
          width={16}
          height={16}
          alt="Compare icon"
        />
        COMPARE
      </Button>
    );
  } else {
    return (
      <div className="flex items-center gap-2">
        <Button
          className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(49,115,222,0.15)] bg-cooper-gray-400 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-cooper-gray-300 h-9"
          onClick={() => compare.exitCompareMode()}
        >
          EXIT COMPARE
        </Button>
      </div>
    );
  }
}

interface CompareColumnsProps {
  anchorRole: RoleType;
  // False while the roles sidebar is hidden: there's nothing to drag cards
  // from, so the drop slot is hidden too
  canAddCards?: boolean;
}

export function CompareColumns({
  anchorRole,
  canAddCards = true,
}: CompareColumnsProps) {
  const compare = useCompare();
  const { comparedRoleIds, anchorRoleId } = compare;

  const resolvedAnchorRoleId = anchorRoleId ?? anchorRole.id;

  const anchorRoleQuery = api.role.getById.useQuery(
    { id: resolvedAnchorRoleId },
    {
      enabled: !!resolvedAnchorRoleId && resolvedAnchorRoleId !== anchorRole.id,
      placeholderData: (previousData) => previousData,
    },
  );

  const resolvedAnchorRole =
    resolvedAnchorRoleId === anchorRole.id ? anchorRole : anchorRoleQuery.data;

  const nonAnchorComparedRoleIds = useMemo(
    () => comparedRoleIds.filter((id) => id !== resolvedAnchorRoleId),
    [comparedRoleIds, resolvedAnchorRoleId],
  );

  const comparedRolesQuery = api.role.getManyByIds.useQuery(
    { ids: nonAnchorComparedRoleIds },
    {
      enabled: nonAnchorComparedRoleIds.length > 0,
      placeholderData: (previousData) => previousData,
    },
  );

  const { loadedRoles, loadingRoleIds } = useMemo(() => {
    const data = comparedRolesQuery.data;
    const loadedRoleMap = new Map(data?.map((role) => [role.id, role]) ?? []);

    const loaded: RoleType[] = [];
    const loading: string[] = [];

    nonAnchorComparedRoleIds.forEach((id) => {
      const role = loadedRoleMap.get(id);
      if (role) {
        loaded.push(role);
      } else {
        loading.push(id);
      }
    });

    return { loadedRoles: loaded, loadingRoleIds: loading };
  }, [nonAnchorComparedRoleIds, comparedRolesQuery.data]);

  const emptySlotCount =
    canAddCards && 1 + nonAnchorComparedRoleIds.length < compare.maxColumns
      ? 1
      : 0;

  const placeholders = Array.from({ length: emptySlotCount }, (_, index) => ({
    key: `placeholder-${index}`,
    type: "empty" as const,
  }));

  const loadingPlaceholders = loadingRoleIds.map((id) => ({
    key: `loading-${id}`,
    type: "loading" as const,
    roleId: id,
  }));

  const columns = [
    ...(resolvedAnchorRole
      ? [
          {
            key: `anchor-${resolvedAnchorRole.id}`,
            role: resolvedAnchorRole,
            isAnchor: true,
            type: "role" as const,
          },
        ]
      : [
          {
            key: `loading-anchor-${resolvedAnchorRoleId}`,
            type: "loading" as const,
            roleId: resolvedAnchorRoleId,
          },
        ]),
    ...loadedRoles.map((role) => ({
      key: role.id,
      role,
      isAnchor: false,
      type: "role" as const,
    })),
    ...loadingPlaceholders,
    ...placeholders,
  ];

  // The drop slot sits outside the scroll container so the scrollbar stays
  // beside the cards. Widths only transition when the track count stays the
  // same, so both grids keep fixed track counts, every track is
  // minmax(<length>, <fr>) so they can interpolate, and unused tracks
  // collapse to 0.
  const cardColumns = columns.filter((column) => column.type !== "empty");
  const hasDropSlot = cardColumns.length < columns.length;

  const cardsGridTemplateColumns = [
    ...cardColumns.map(() => `minmax(${COMPARE_CARD_MIN_WIDTH}px, 1fr)`),
    ...Array.from(
      { length: Math.max(0, compare.maxColumns - cardColumns.length) },
      () => "minmax(0px, 0fr)",
    ),
  ].join(" ");

  // The drop slot stays narrow (just its + icon) until a card is dragged,
  // then grows to a card's width
  const dropSlotTrack = !hasDropSlot
    ? "minmax(0px, 0fr)"
    : compare.isDragging
      ? "minmax(0px, 1fr)"
      : `minmax(${COMPARE_DROP_SLOT_WIDTH}px, 0fr)`;
  const outerGridTemplateColumns = `minmax(0px, ${cardColumns.length}fr) ${dropSlotTrack}`;

  // Size cards by their rendered width (screen width and card count both
  // affect it). The first column is always the anchor card or its loader.
  const outerGridRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const [compareSize, setCompareSize] = useState<CompareSize>("lg");

  useLayoutEffect(() => {
    const outerGrid = outerGridRef.current;
    const cardsGrid = cardsGridRef.current;
    if (!outerGrid || !cardsGrid) return;

    const update = () => {
      const firstColumnWidth = parseFloat(
        getComputedStyle(cardsGrid).gridTemplateColumns,
      );
      if (!Number.isNaN(firstColumnWidth)) {
        setCompareSize(getCompareSize(firstColumnWidth));
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(cardsGrid);
    // Column widths animate, so re-measure once they settle
    outerGrid.addEventListener("transitionend", update);
    return () => {
      observer.disconnect();
      outerGrid.removeEventListener("transitionend", update);
    };
  }, [cardsGridTemplateColumns, outerGridTemplateColumns]);

  // Sticky header: hidden while the in-flow header is still in view, compact
  // while scrolling down, full while scrolling up
  const lastScrollTopRef = useRef(0);
  const [stickyHeader, setStickyHeader] = useState<CompareStickyHeader | null>(
    null,
  );

  const handleCardsScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const delta = scrollTop - lastScrollTopRef.current;
    // Ignore tiny jitters (trackpad momentum, sub-pixel scrolling)
    if (Math.abs(delta) < 4) return;
    lastScrollTopRef.current = scrollTop;

    const headerHeight =
      event.currentTarget.querySelector<HTMLElement>("[data-compare-header]")
        ?.offsetHeight ?? 0;
    if (scrollTop <= headerHeight) {
      setStickyHeader(null);
    } else {
      setStickyHeader(delta > 0 ? "compact" : "full");
    }
  };

  const columnTransition =
    "ease-out motion-safe:transition-[grid-template-columns] motion-safe:duration-500";
  const fadeIn = "duration-500 motion-safe:animate-in motion-safe:fade-in";

  return (
    <div className="relative flex h-full flex-col px-2 pt-2">
      <div
        ref={outerGridRef}
        className={cn("grid min-h-0 flex-1", columnTransition)}
        style={{
          gridTemplateColumns: outerGridTemplateColumns,
          gridTemplateRows: "minmax(0, 1fr)",
        }}
      >
        {/* One scroll container so every card scrolls together. It fills to
            the bottom of the window so cards run off-screen until scrolled to
            the end. Size containment lets children use cqh units for its
            visible height. */}
        <div
          className="relative min-w-0 overflow-auto [container-type:size]"
          onScroll={handleCardsScroll}
        >
          <div
            ref={cardsGridRef}
            className={cn("grid min-h-[100cqh] gap-0", columnTransition)}
            style={{
              gridTemplateColumns: cardsGridTemplateColumns,
              // Shared content rows, then a filler row that stretches to min height
              gridTemplateRows: `repeat(${COMPARE_ROW_COUNT}, auto) 1fr`,
            }}
          >
            {cardColumns.map((column, index) => {
              // Column gaps are margins, since a grid gap would also sit
              // beside the collapsed unused tracks
              const gapClass = index > 0 && "ml-3";

              if (column.type === "role") {
                return (
                  <RoleInfo
                    key={column.key}
                    roleObj={column.role}
                    compareSize={compareSize}
                    stickyHeader={stickyHeader}
                    className={cn(gapClass)}
                  />
                );
              }

              return (
                <div
                  key={column.key}
                  className={cn("grid", fadeIn, gapClass)}
                  style={{ gridRow: "1 / -1" }}
                >
                  <LoadingSlot />
                </div>
              );
            })}
          </div>
        </div>
        {hasDropSlot && (
          <div className={cn("ml-3 grid min-w-0", fadeIn)}>
            <DropSlot anchorRoleId={resolvedAnchorRoleId} />
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSlot() {
  return (
    <div
      className={
        "relative flex flex-1 items-center justify-center bg-white shadow-sm transition"
      }
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <div className="border-t-cooper-blue-300 h-12 w-12 animate-spin rounded-full border-4 border-cooper-gray-200" />
        <p className="text-cooper-gray-500 text-sm">Loading role...</p>
      </div>
    </div>
  );
}

function DropSlot({ anchorRoleId }: { anchorRoleId: string }) {
  const {
    isCompareMode,
    isDragging,
    comparedRoleIds,
    addRoleId,
    setIsDragging,
  } = useCompare();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleDragStart = (event: DragEvent) => {
      if (!isCompareMode) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[draggable="true"]')) {
        setIsDragging(true);
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      setIsActive(false);
    };

    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("dragend", handleDragEnd);
    window.addEventListener("drop", handleDragEnd);

    return () => {
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("dragend", handleDragEnd);
      window.removeEventListener("drop", handleDragEnd);
    };
  }, [isCompareMode, setIsDragging]);

  return (
    <div
      onDragOver={(event) => {
        if (!isCompareMode) return;
        event.preventDefault();
        setIsActive(true);
      }}
      onDragLeave={() => setIsActive(false)}
      onDrop={(event) => {
        if (!isCompareMode) return;
        event.preventDefault();
        setIsActive(false);
        setIsDragging(false);
        const id =
          event.dataTransfer.getData("application/role-id") ||
          event.dataTransfer.getData("text/plain");
        if (id) {
          // Prevent adding duplicate roles (including anchor role)
          if (id !== anchorRoleId && !comparedRoleIds.includes(id)) {
            addRoleId(id);
          }
        }
      }}
      className={cn(
        "flex items-center justify-center rounded-xl border-2 border-dashed transition",
        isActive
          ? "border-[#C4C9CD] bg-[#E1E5E8]"
          : "border-[#DDDDDD] bg-[#ECEFF1]",
      )}
    >
      <div className="flex flex-col items-center gap-2 px-5 text-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="#686868"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M10 6v8M6 10h8"
            stroke="#686868"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {isDragging && (
          <p className="text-md font-extrabold text-[#686868] duration-500 motion-safe:animate-in motion-safe:fade-in">
            Drag in or select a card from the list
          </p>
        )}
      </div>
    </div>
  );
}
