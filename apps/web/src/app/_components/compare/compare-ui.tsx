"use client";

import { useMemo, useState } from "react";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";

import { api } from "~/trpc/react";
import { RoleInfo } from "../reviews/role-info";
import { useCompare } from "./compare-context";

type CompareControlsProps = {
  anchorRoleId?: string | null;
  inTopBar?: boolean;
};

export function CompareControls({ anchorRoleId, inTopBar = false }: CompareControlsProps) {
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
        className="inline-flex items-center gap-2 rounded-md border-[0.75px] border-cooper-gray-300 bg-cooper-blue-200 px-4 py-2 text-sm font-medium text-[#141414] transition hover:bg-cooper-blue-300"
        onClick={() => compare.enterCompareMode()}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
        >
          <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
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
          "inline-flex items-center gap-2 rounded-md border-[0.75px] border-cooper-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#141414] transition",
          canAdd ? "hover:bg-cooper-gray-100" : "cursor-not-allowed opacity-50",
        )}
        onClick={() => compare.addSlot()}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
        >
          <path
            d="M8 3v10M3 8h10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        ADD COMPARISON
      </Button>
      <Button
        variant="ghost"
        className="rounded-md border-[0.75px] border-cooper-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#141414] transition hover:bg-cooper-gray-100"
        onClick={() => compare.exitCompareMode()}
      >
        EXIT
      </Button>
    </div>
  );
}

type CompareColumnsProps = {
  anchorRole: RoleType;
};

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
    type: 'empty' as const,
  }));

  const loadingPlaceholders = loadingRoleIds.map((id) => ({
    key: `loading-${id}`,
    type: 'loading' as const,
    roleId: id,
  }));

  const columns = [
    { key: `anchor-${anchorRole.id}`, role: anchorRole, isAnchor: true, type: 'role' as const },
    ...loadedRoles.map((role) => ({
      key: role.id,
      role,
      isAnchor: false,
      type: 'role' as const,
    })),
    ...loadingPlaceholders,
    ...placeholders,
  ];

  return (
    <div className="relative flex flex-col gap-4 px-3">
      <div className="relative min-h-[70dvh] w-full overflow-x-auto">
        <div className="flex min-h-full gap-3 pb-4 pr-4 transition">
          {columns.map((column, index) => {
            const widthClass =
              columns.length === 1
                ? "w-full"
                : columns.length === 2
                  ? "min-w-[360px] md:min-w-[420px]"
                  : "min-w-[320px]";

            if (column.type === 'empty') {
              return <DropSlot key={column.key} widthClass={widthClass} anchorRoleId={anchorRole.id} />;
            }

            if (column.type === 'loading') {
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
                    className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-[0.75px] border-cooper-gray-300 bg-white text-lg leading-none text-cooper-gray-500 shadow-sm transition hover:bg-cooper-gray-100"
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

function LoadingSlot({ widthClass, roleId }: { widthClass: string; roleId: string }) {
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
        className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-[0.75px] border-cooper-gray-300 bg-white text-lg leading-none text-cooper-gray-500 shadow-sm transition hover:bg-cooper-gray-100"
        onClick={() => compare.removeRoleId(roleId)}
      >
        ×
      </button>
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cooper-gray-200 border-t-cooper-blue-300" />
        <p className="text-sm text-cooper-gray-500">Loading role...</p>
      </div>
    </div>
  );
}

function DropSlot({ widthClass, anchorRoleId }: { widthClass: string; anchorRoleId: string }) {
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
        "flex flex-1 items-center justify-center rounded-lg border-2 border-dashed bg-white text-cooper-gray-400 transition",
        isActive
          ? "border-cooper-blue-300 bg-cooper-blue-50"
          : "border-cooper-gray-300",
        widthClass,
      )}
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-cooper-gray-300 bg-white text-3xl text-cooper-gray-400">
          +
        </span>
        <p className="text-sm text-cooper-gray-500">
          Drag in or select a card from the list
        </p>
      </div>
    </div>
  );
}


