"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

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
        className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(49,115,222,0.2)] bg-[rgba(49,115,222,0.15)] px-3 py-1.5 text-xs font-semibold text-[#606060] transition hover:bg-[rgba(49,115,222,0.25)]"
        onClick={() => compare.enterCompareMode()}
      >
        <Image
          src="/svg/compareRole.svg"
          width={16}
          height={16}
          alt="Compare icon"
        />
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
    <div className="flex items-center gap-2">
      <Button
        disabled={!canAdd}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-[#DDDDDD] bg-[#E6E6E6] px-3 py-1.5 text-xs font-semibold text-[#4a4a4a] transition",
          canAdd ? "hover:bg-[#c5c5c5]" : "cursor-not-allowed opacity-50",
        )}
        onClick={() => compare.addSlot()}
      >
        <Image
          src="/svg/compareAdd.svg"
          width={16}
          height={16}
          alt="Compare icon"
        />
        <span>ADD COMPARISON</span>
      </Button>
      <Button
        className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(49,115,222,0.15)] bg-[#7a9ec9] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#6a8eb9]"
        onClick={() => compare.exitCompareMode()}
      >
        <Image
          src="/svg/compareRole.svg"
          width={16}
          height={16}
          alt="Compare icon"
          className="brightness-0 invert"
        />
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
                  "relative flex-1 rounded-lg border-[0.75px] border-cooper-gray-300 bg-white transition",
                  widthClass,
                )}
              >
                {!column.isAnchor && (
                  <button
                    type="button"
                    aria-label="Remove from comparison"
                    className="text-cooper-gray-500 absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center text-2xl leading-none transition"
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
        "relative flex flex-1 items-center justify-center bg-white shadow-sm transition",
        widthClass,
      )}
    >
      <button
        type="button"
        aria-label="Remove from comparison"
        className="text-cooper-gray-500 absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center text-2xl leading-none transition hover:bg-cooper-gray-100"
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
          : "border-[#DDDDDD] bg-[#E4EAF0]",
        widthClass,
      )}
    >
      <div className="flex flex-col items-center gap-2 px-6 text-center">
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
        <p className="text-md font-extrabold text-[#686868]">
          Drag in or select a card from the list
        </p>
      </div>
    </div>
  );
}
