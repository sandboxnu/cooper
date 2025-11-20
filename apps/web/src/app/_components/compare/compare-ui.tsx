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
};

export function CompareControls({ anchorRoleId }: CompareControlsProps) {
  const compare = useCompare();

  if (!anchorRoleId) {
    return null;
  }

  if (!compare.isCompareMode) {
    return (
      <Button
        className="inline-flex items-center gap-2 rounded-md border border-cooper-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#141414] shadow-sm transition hover:bg-cooper-gray-100"
        onClick={() => compare.enterCompareMode()}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-cooper-gray-300 text-xs">
          ⇄
        </span>
        Compare with
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
          "inline-flex items-center gap-2 rounded-md border border-cooper-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#141414] shadow-sm transition",
          canAdd ? "hover:bg-cooper-gray-100" : "cursor-not-allowed opacity-50",
        )}
        onClick={() => compare.addSlot()}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-cooper-gray-300 text-base leading-none">
          +
        </span>
        Add comparison
      </Button>
      <Button
        variant="ghost"
        className="rounded-md border border-cooper-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#141414] shadow-sm transition hover:bg-cooper-gray-100"
        onClick={() => compare.exitCompareMode()}
      >
        Exit
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
    { enabled: comparedRoleIds.length > 0 },
  );

  const comparedRoles = useMemo<RoleType[]>(() => {
    if (!comparedRolesQuery.isSuccess || !comparedRolesQuery.data) {
      return [];
    }
    const data = comparedRolesQuery.data as RoleType[];
    // Ensure roles are shown in the same order as IDs
    return comparedRoleIds
      .map((id) => data.find((role) => role.id === id))
      .filter((role): role is RoleType => Boolean(role));
  }, [comparedRoleIds, comparedRolesQuery.data, comparedRolesQuery.isSuccess]);

  const placeholders = Array.from({ length: reservedSlots }, (_, index) => ({
    key: `placeholder-${index}`,
  }));

  const columns = [
    { key: `anchor-${anchorRole.id}`, role: anchorRole, isAnchor: true },
    ...comparedRoles.map((role) => ({
      key: role.id,
      role,
      isAnchor: false,
    })),
    ...placeholders,
  ];

  return (
    <div className="relative flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-cooper-gray-500">
        Drag roles from the list into the compare area. Maximum of three roles at
        once.
      </div>
      <div className="relative min-h-[70dvh] w-full overflow-x-auto">
        <div className="flex min-h-full gap-4 pb-4 pr-4 transition">
          {columns.map((column, index) => {
            const widthClass =
              columns.length === 1
                ? "w-full"
                : columns.length === 2
                  ? "min-w-[360px] md:min-w-[420px]"
                  : "min-w-[320px]";

            if (!("role" in column)) {
              return <DropSlot key={column.key} widthClass={widthClass} />;
            }

            return (
              <div
                key={column.key}
                className={cn(
                  "relative flex-1 rounded-xl border border-cooper-gray-150 bg-white shadow-sm transition",
                  widthClass,
                )}
              >
                {!column.isAnchor && (
                  <button
                    type="button"
                    aria-label="Remove from comparison"
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-cooper-gray-300 bg-white text-lg text-cooper-gray-500 shadow-sm transition hover:bg-cooper-gray-100"
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

function DropSlot({ widthClass }: { widthClass: string }) {
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
          compare.addRoleId(id);
        }
      }}
      className={cn(
        "flex flex-1 items-center justify-center rounded-xl border-2 border-dashed bg-cooper-gray-50 text-cooper-gray-500 transition",
        isActive
          ? "border-cooper-blue-300 bg-cooper-blue-50"
          : "border-cooper-gray-200",
        widthClass,
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-cooper-gray-300 bg-white text-3xl text-cooper-gray-400">
          +
        </span>
        <p className="text-sm">
          Drag in or select a role from the list to add to the comparison
        </p>
      </div>
    </div>
  );
}


