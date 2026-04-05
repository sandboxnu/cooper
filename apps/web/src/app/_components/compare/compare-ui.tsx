"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";

import { api } from "~/trpc/react";
import { RoleInfo } from "../reviews/role-info";
import { useCompare } from "./compare-context";

interface CompareControlsProps {
  anchorRoleId?: string | null;
}

export function CompareControls({ anchorRoleId }: CompareControlsProps) {
  const compare = useCompare();

  if (!anchorRoleId) {
    return null;
  }

  if (!compare.isCompareMode) {
    return (
      <Button
        className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-[rgba(49,115,222,0.15)] bg-[#C4D4E9] px-[14px] py-2 text-sm font-semibold text-[#606060] transition hover:bg-[rgba(49,115,222,0.15)] h-9"
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
          className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(49,115,222,0.15)] bg-cooper-gray-400 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-cooper-gray-300 h-9"
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
}

export function CompareColumns({ anchorRole }: CompareColumnsProps) {
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
    const data = comparedRolesQuery.data as RoleType[] | undefined;
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
    1 + nonAnchorComparedRoleIds.length < compare.maxColumns ? 1 : 0;

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

  return (
    <div className="relative flex flex-col gap-4 p-2">
      <div className="relative min-h-[70dvh] w-full overflow-x-auto">
        <div className="flex min-h-full gap-3 transition">
          {columns.map((column) => {
            if (column.type === "empty") {
              return (
                <DropSlot
                  key={column.key}
                  anchorRoleId={resolvedAnchorRoleId}
                />
              );
            }

            if (column.type === "loading") {
              return <LoadingSlot key={column.key} />;
            }

            return (
              <div
                key={column.key}
                className={"relative flex-1 rounded-lg bg-[#F1F0EC] transition"}
              >
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
  const compare = useCompare();
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleDragStart = (event: DragEvent) => {
      if (!compare.isCompareMode) return;
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
  }, [compare.isCompareMode]);

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
        setIsDragging(false);
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
        "flex items-center justify-center rounded-xl border-2 border-dashed transition",
        isActive
          ? "border-cooper-blue-400 bg-[#d4e4f7]"
          : "border-[#DDDDDD] bg-[#ECEFF1]",
        isDragging && "flex-1",
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
          <p className="text-md font-extrabold text-[#686868]">
            Drag in or select a card from the list
          </p>
        )}
      </div>
    </div>
  );
}
