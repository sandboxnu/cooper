"use client";

import { useMemo, useState } from "react";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";

import { api } from "~/trpc/react";
import { RoleInfo } from "../reviews/role-info";
import { useCompare } from "./compare-context";

interface CompareControlsProps {
  anchorRoleId?: string | null;
  inTopBar?: boolean;
}

export function CompareControls({
  anchorRoleId,
  inTopBar = false,
}: CompareControlsProps) {
  const compare = useCompare();

  if (!anchorRoleId) {
    return null;
  }

  // When in top bar, only show controls if in compare mode
  if (inTopBar && !compare.isCompareMode) {
    return null;
  }

  if (!compare.isCompareMode) {
    return (
      <Button
        className="inline-flex items-center gap-3 rounded-xl border border-[#b8c9dc] bg-[#d9e5f2] px-5 py-2.5 text-sm font-semibold text-[#5a6a7a] transition hover:bg-[#ccdaea]"
        onClick={() => compare.enterCompareMode()}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="5"
            width="8"
            height="14"
            rx="2"
            stroke="#5a6a7a"
            strokeWidth="2"
            fill="#a0b0c0"
          />
          <rect
            x="13"
            y="5"
            width="8"
            height="14"
            rx="2"
            stroke="#5a6a7a"
            strokeWidth="2"
            strokeDasharray="3 2"
            fill="none"
          />
        </svg>
        COMPARE WITH
      </Button>
    );
  }

  const totalColumns =
    (anchorRoleId ? 1 : 0) +
    compare.comparedRoleIds.length +
    compare.reservedSlots;
  const canAdd = totalColumns < compare.maxColumns;

  return (
    <div className="flex items-center gap-3">
      <Button
        disabled={!canAdd}
        className={cn(
          "inline-flex items-center gap-3 rounded-xl bg-[#d5d5d5] px-5 py-2.5 text-sm font-semibold text-[#4a4a4a] transition",
          canAdd ? "hover:bg-[#c5c5c5]" : "cursor-not-allowed opacity-50",
        )}
        onClick={() => compare.addSlot()}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="#4a4a4a"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M10 6v8M6 10h8"
            stroke="#4a4a4a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        ADD COMPARISON
      </Button>
      <Button
        className="inline-flex items-center gap-3 rounded-xl bg-[#7a9ec9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6a8eb9]"
        onClick={() => compare.exitCompareMode()}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="5"
            width="8"
            height="14"
            rx="2"
            stroke="white"
            strokeWidth="2"
            fill="rgba(255,255,255,0.3)"
          />
          <rect
            x="13"
            y="5"
            width="8"
            height="14"
            rx="2"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="3 2"
            fill="none"
          />
        </svg>
        EXIT
      </Button>
    </div>
  );
}

interface CompareColumnsProps {
  anchorRole: RoleType;
}

export function CompareColumns({ anchorRole }: CompareColumnsProps) {
  const compare = useCompare();
  const { comparedRoleIds, reservedSlots } = compare;

  const comparedRolesQuery = api.role.getManyByIds.useQuery(
    { ids: comparedRoleIds },
    {
      enabled: comparedRoleIds.length > 0,
      placeholderData: (previousData) => previousData,
    },
  );

  const { loadedRoles, loadingRoleIds } = useMemo(() => {
    const data = comparedRolesQuery.data as RoleType[] | undefined;
    const loadedRoleMap = new Map(data?.map((role) => [role.id, role]) ?? []);

    const loaded: RoleType[] = [];
    const loading: string[] = [];

    comparedRoleIds.forEach((id) => {
      const role = loadedRoleMap.get(id);
      if (role) {
        loaded.push(role);
      } else {
        loading.push(id);
      }
    });

    return { loadedRoles: loaded, loadingRoleIds: loading };
  }, [comparedRoleIds, comparedRolesQuery.data]);

  const placeholders = Array.from({ length: reservedSlots }, (_, index) => ({
    key: `placeholder-${index}`,
    type: "empty" as const,
  }));

  const loadingPlaceholders = loadingRoleIds.map((id) => ({
    key: `loading-${id}`,
    type: "loading" as const,
    roleId: id,
  }));

  const columns = [
    {
      key: `anchor-${anchorRole.id}`,
      role: anchorRole,
      isAnchor: true,
      type: "role" as const,
    },
    ...loadedRoles.map((role) => ({
      key: role.id,
      role,
      isAnchor: false,
      type: "role" as const,
    })),
    ...loadingPlaceholders,
    ...placeholders,
  ];

  return (
    <div className="relative flex flex-col gap-4 px-3">
      <div className="relative min-h-[70dvh] w-full overflow-x-auto">
        <div className="flex min-h-full gap-3 pb-4 pr-4 transition">
          {columns.map((column) => {
            const widthClass =
              columns.length === 1
                ? "w-full"
                : columns.length === 2
                  ? "min-w-[360px] md:min-w-[420px]"
                  : "min-w-[320px]";

            if (column.type === "empty") {
              return (
                <DropSlot
                  key={column.key}
                  widthClass={widthClass}
                  anchorRoleId={anchorRole.id}
                />
              );
            }

            if (column.type === "loading") {
              return (
                <LoadingSlot
                  key={column.key}
                  widthClass={widthClass}
                  roleId={column.roleId}
                />
              );
            }

            return (
              <div
                key={column.key}
                className={cn(
                  "relative flex-1 rounded-lg border-[0.75px] border-cooper-gray-300 bg-white shadow-sm transition",
                  widthClass,
                )}
              >
                {!column.isAnchor && (
                  <button
                    type="button"
                    aria-label="Remove from comparison"
                    className="text-cooper-gray-500 absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-[0.75px] border-cooper-gray-300 bg-white text-lg leading-none shadow-sm transition hover:bg-cooper-gray-100"
                    onClick={() => compare.removeRoleId(column.role.id)}
                  >
                    ×
                  </button>
                )}
                <div className="max-h-[78dvh] overflow-y-auto">
                  <RoleInfo roleObj={column.role} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LoadingSlot({
  widthClass,
  roleId,
}: {
  widthClass: string;
  roleId: string;
}) {
  const compare = useCompare();

  return (
    <div
      className={cn(
        "relative flex flex-1 items-center justify-center rounded-lg border-[0.75px] border-cooper-gray-300 bg-white shadow-sm transition",
        widthClass,
      )}
    >
      <button
        type="button"
        aria-label="Remove from comparison"
        className="text-cooper-gray-500 absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-[0.75px] border-cooper-gray-300 bg-white text-lg leading-none shadow-sm transition hover:bg-cooper-gray-100"
        onClick={() => compare.removeRoleId(roleId)}
      >
        ×
      </button>
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <div className="border-t-cooper-blue-300 h-12 w-12 animate-spin rounded-full border-4 border-cooper-gray-200" />
        <p className="text-cooper-gray-500 text-sm">Loading role...</p>
      </div>
    </div>
  );
}

function DropSlot({
  widthClass,
  anchorRoleId,
}: {
  widthClass: string;
  anchorRoleId: string;
}) {
  const compare = useCompare();
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      onDragOver={(event) => {
        if (!compare.isCompareMode) return;
        event.preventDefault();
        setIsActive(true);
      }}
      onDragLeave={() => setIsActive(false)}
      onDrop={(event) => {
        if (!compare.isCompareMode) return;
        event.preventDefault();
        setIsActive(false);
        const id =
          event.dataTransfer.getData("application/role-id") ||
          event.dataTransfer.getData("text/plain");
        if (id) {
          // Prevent adding duplicate roles (including anchor role)
          if (id !== anchorRoleId && !compare.comparedRoleIds.includes(id)) {
            compare.addRoleId(id);
          }
        }
      }}
      className={cn(
        "flex flex-1 items-center justify-center rounded-xl border-2 border-dashed transition",
        isActive
          ? "border-cooper-blue-400 bg-[#d4e4f7]"
          : "border-[#c5d5e8] bg-[#e8eff7]",
        widthClass,
      )}
    >
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#9aacbc] text-2xl font-light text-[#9aacbc]">
          +
        </span>
        <p className="text-sm font-medium text-[#6b7a8a]">
          Drag in or select a card from the list
        </p>
      </div>
    </div>
  );
}
