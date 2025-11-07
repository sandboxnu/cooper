"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import { useCompare } from "./compare-context";
import type { RoleType } from "@cooper/db/schema";
import { api } from "~/trpc/react";
import { RoleInfo } from "../reviews/role-info";

export function CompareTopBar({ anchorRoleId }: { anchorRoleId?: string | null }) {
  const compare = useCompare();

  // Keep at least one empty slot visible when entering compare mode
  useEffect(() => {
    if (compare.isCompareMode && compare.reservedSlots < 1) {
      compare.addSlot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compare.isCompareMode]);

  if (!compare.isCompareMode) {
    return (
      <div className="flex items-center gap-2">
        <Button
          className="rounded-md border border-cooper-gray-300 bg-cooper-blue-200 px-4 py-2 text-sm font-medium text-[#141414] hover:bg-cooper-blue-300"
          onClick={() => compare.enterCompareMode()}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 inline"
          >
            <path
              d="M2 3h5v5H2V3zm0 7h5v5H2v-5zm7-7h5v5H9V3zm0 7h5v5H9v-5z"
              fill="currentColor"
            />
          </svg>
          Compare with
        </Button>
      </div>
    );
  }

  // Total columns = anchor + compared roles + reserved slots
  const currentCount =
    (anchorRoleId ? 1 : 0) +
    compare.comparedRoleIds.length +
    compare.reservedSlots;
  const canAdd = currentCount < compare.maxColumns;

  return (
    <div className="flex items-center gap-2">
      <Button
        disabled={!canAdd}
        className={cn(
          "rounded-md border border-cooper-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#141414]",
          canAdd ? "hover:bg-cooper-gray-100" : "opacity-50 cursor-not-allowed",
        )}
        onClick={() => {
          if (canAdd) compare.addSlot();
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2 inline"
        >
          <path
            d="M8 2v12M2 8h12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Add comparison
      </Button>
      <Button
        className="rounded-md border border-cooper-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#141414] hover:bg-cooper-gray-100"
        onClick={() => compare.exitCompareMode()}
      >
        Exit
      </Button>
    </div>
  );
}

export function CompareColumns({
  anchorRole,
}: {
  anchorRole?: RoleType | null;
}) {
  const compare = useCompare();
  // Build list of column data: [anchorRole, ...compared roles]
  const { comparedRoleIds, reservedSlots } = compare;
  const idsToQuery = comparedRoleIds;

  const rolesQueries = api.role.getManyByIds.useQuery(
    { ids: idsToQuery },
    { enabled: compare.isCompareMode && idsToQuery.length > 0 },
  );

  const comparedRoles: RoleType[] = useMemo(() => {
    if (!rolesQueries.isSuccess) return [];
    return rolesQueries.data as RoleType[];
  }, [rolesQueries.isSuccess, rolesQueries.data]);

  const columns: Array<{ key: string; role?: RoleType; isDrop?: boolean }> = [];
  if (anchorRole) {
    columns.push({ key: `anchor-${anchorRole.id}`, role: anchorRole });
  }
  comparedRoles.forEach((r) => columns.push({ key: r.id, role: r }));

  // Append empty slots
  const existingColumns = columns.length;
  const remainingSlots = Math.max(0, compare.maxColumns - existingColumns);
  const slotsToShow = Math.min(remainingSlots, reservedSlots);
  for (let i = 0; i < slotsToShow; i++) {
    columns.push({ key: `slot-${i}`, isDrop: true });
  }

  // Calculate width classes based on number of columns
  const totalColumns = columns.length;
  const widthClass =
    totalColumns === 1
      ? "w-full"
      : totalColumns === 2
        ? "w-[48%]"
        : "w-[31%]";

  return (
    <div className="relative w-full">
      <div
        className={cn(
          // horizontal scroll for columns themselves
          "flex w-full gap-3 overflow-x-auto px-3 pb-2 transition-all duration-300",
          compare.isCompareMode ? "translate-x-0" : "translate-x-[10%]",
        )}
      >
        {columns.map((c, idx) => {
          if (c.isDrop) {
            return <DropSlot key={c.key} index={idx} widthClass={widthClass} />;
          }
          return (
            <div
              key={c.key}
              className={cn(
                "relative flex-shrink-0 overflow-hidden rounded-lg border border-cooper-gray-300 bg-white shadow-sm transition-all duration-300",
                widthClass,
              )}
            >
              {/* Remove action for non-anchor columns */}
              {c.role && anchorRole && c.role.id !== anchorRole.id && (
                <button
                  aria-label="Remove from comparison"
                  className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-cooper-gray-300 bg-white text-xl leading-none text-[#5a5a5a] shadow-sm hover:bg-cooper-gray-100"
                  onClick={() => compare.removeRoleId(c.role!.id)}
                >
                  ×
                </button>
              )}
              {/* Each column has its own vertical scroll */}
              <div className="h-[76dvh] overflow-y-auto md:h-[82dvh] lg:h-[86dvh]">
                {c.role && <RoleInfo roleObj={c.role} className="w-full" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DropSlot({
  index,
  widthClass,
}: {
  index: number;
  widthClass: string;
}) {
  const compare = useCompare();
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        if (!compare.isCompareMode) return;
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => {
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        if (!compare.isCompareMode) return;
        e.preventDefault();
        setIsDragOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id) {
          compare.addRoleId(id);
        }
      }}
      className={cn(
        "rounded-lg border-2 border-dashed bg-cooper-gray-100/40 transition-all duration-300",
        "flex h-[76dvh] items-center justify-center text-cooper-gray-500 md:h-[82dvh] lg:h-[86dvh]",
        widthClass,
        isDragOver
          ? "border-cooper-blue-300 bg-cooper-blue-100/30"
          : "border-cooper-gray-300",
        index === 1 ? "translate-x-2 opacity-100" : "opacity-100",
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-cooper-gray-400 bg-white text-2xl text-cooper-gray-400">
          +
        </div>
        <div className="px-4 text-center text-sm text-cooper-gray-500">
          Drag in or select a card from the list
        </div>
      </div>
    </div>
  );
}


