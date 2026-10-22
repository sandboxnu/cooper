"use client";

import { createPortal } from "react-dom";
import Image from "next/image";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardHeader } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { LIST_CARD_HEIGHT_CLASS } from "../shared/card-height";
import { CircleButton } from "../shared/circle-button";
import { FavoriteButton } from "../shared/favorite-button";
import { useEffect, useState } from "react";
import { useCompare } from "../compare/compare-context";

interface RoleCardPreviewProps {
  className?: string;
  roleObj: RoleType;
  showDragHandle?: boolean;
  showFavorite?: boolean;
  isAlreadyCompared?: boolean;
  currentlySelectedRoleId?: string | null;
}

export function RoleCardPreview({
  className,
  roleObj,
  showDragHandle = false,
  showFavorite = true,
  isAlreadyCompared = false,
  currentlySelectedRoleId = null,
}: RoleCardPreviewProps) {
  // ===== COMPANY DATA ===== //
  const company = api.company.getById.useQuery({
    id: roleObj.companyId,
  });

  // ===== ROLE DATA ===== //
  const role = api.role.getById.useQuery({ id: roleObj.id });
  const reviews = api.review.getByRole.useQuery({ id: roleObj.id });
  const averages = api.role.getAverageById.useQuery({
    roleId: role.data?.id ?? "",
  });

  const firstLocationId = reviews.data?.[0]?.locationId;
  const location = api.location.getById.useQuery(
    { id: firstLocationId ?? "" },
    {
      enabled: !!firstLocationId,
    },
  );

  const [hovered, setHovered] = useState(false);
  // Viewport point below the compare icon; the label is portaled so the
  // card list's scroll container doesn't clip it
  const [compareLabelPos, setCompareLabelPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!compareLabelPos) return;
    const hide = () => setCompareLabelPos(null);
    window.addEventListener("scroll", hide, true);
    return () => window.removeEventListener("scroll", hide, true);
  }, [compareLabelPos]);

  const compare = useCompare();

  const raw = Number(averages.data?.averageOverallRating);
  const averageRating = Number.isFinite(raw)
    ? Math.round(raw * 100) / 100
    : null;

  return (
    <Card
      className={cn(
        "relative flex flex-col justify-between rounded-lg hover:cursor-pointer",
        LIST_CARD_HEIGHT_CLASS,
        className,
        showDragHandle && "pl-4",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between space-x-3">
        {showDragHandle && (
          <div className="self-center pr-2">
            <Image
              src="/svg/dragHandle.svg"
              alt="Drag handle icon"
              width={11.5}
              height={26.5}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <CardHeader className="space-y-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-xl font-semibold leading-tight">
                {role.data?.title}
              </h3>
            </div>

            <div className="flex min-w-0 items-center gap-2 text-base text-[#666666]">
              <span className="truncate">{company.data?.name}</span>
              <p>•</p>
              {location.isSuccess && location.data && (
                <span className="truncate">
                  {prettyLocationName(location.data)}
                </span>
              )}
            </div>
            {reviews.isSuccess && reviews.data.length > 0 && (
              <div className="!mt-2 flex items-center gap-1.5 text-base text-[#666666]">
                <Image
                  src="/svg/star.svg"
                  alt="Star icon"
                  width={18}
                  height={18}
                />
                <span className="font-medium">{averageRating}</span>
                <span>
                  ({reviews.data.length} review
                  {reviews.data.length === 1 ? "" : "s"})
                </span>
              </div>
            )}
          </CardHeader>
        </div>

        {!compare.isCompareMode && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-between h-[77px] w-4"
          >
            {showFavorite && (
              <FavoriteButton objId={roleObj.id} objType="role" />
            )}
            {hovered && currentlySelectedRoleId && (
              <CircleButton
                aria-label="Compare"
                // Original 16px icon box; the 44px circle centers on it
                className="hidden h-4 w-4 md:inline-flex"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setCompareLabelPos({
                    x: rect.left + rect.width / 2,
                    y: rect.bottom,
                  });
                }}
                onMouseLeave={() => setCompareLabelPos(null)}
                onClick={() => {
                  setCompareLabelPos(null);
                  compare.enterCompareMode(currentlySelectedRoleId);
                  compare.addRoleId(role.data?.id ?? "");
                }}
              >
                <Image
                  src="/svg/compareRole.svg"
                  width={16}
                  height={16}
                  alt="Compare icon"
                />
              </CircleButton>
            )}
            {hovered &&
              compareLabelPos &&
              createPortal(
                // Softer than the InfoIcon tooltip; overlaps the hover circle
                <span
                  className="pointer-events-none fixed z-50 -translate-x-1/2 whitespace-nowrap rounded bg-gray-700/85 px-2 py-1 text-[11px] text-white"
                  style={{
                    left: compareLabelPos.x,
                    top: compareLabelPos.y + 16,
                  }}
                >
                  Compare with
                </span>,
                document.body,
              )}
          </div>
        )}
        {/* Same column as outside compare mode: remove X at the top (where
            save sits) on roles being compared, add button at the bottom */}
        {compare.isCompareMode && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-[77px] w-4 flex-col items-center justify-between"
          >
            {isAlreadyCompared ? (
              <CircleButton
                aria-label="Remove from comparison"
                className="h-4 w-4 translate-x-0.5"
                onClick={() => compare.removeRoleId(roleObj.id)}
              >
                <Image
                  src="/svg/exitComparisonButton.svg"
                  width={14}
                  height={14}
                  alt=""
                  style={{ minHeight: "14px", minWidth: "14px" }}
                />
              </CircleButton>
            ) : (
              <span />
            )}
            {hovered &&
              !isAlreadyCompared &&
              compare.comparedRoleIds.length < 2 && (
                <CircleButton
                  aria-label="Add to comparison"
                  className="h-4 w-4"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setCompareLabelPos({
                      x: rect.left + rect.width / 2,
                      y: rect.bottom,
                    });
                  }}
                  onMouseLeave={() => setCompareLabelPos(null)}
                  onClick={() => {
                    setCompareLabelPos(null);
                    compare.addRoleId(roleObj.id);
                  }}
                >
                  {/* Compare icon with a plus badge (Figma 482:5377), drawn
                      at ~1.06x so the glyph (~16x19) is centered on the 16px
                      button; the badge sticks out past it */}
                  <span className="relative block h-4 w-4">
                    <Image
                      src="/svg/compareRoleAdd.svg"
                      width={18}
                      height={18}
                      alt=""
                      className="absolute left-[0.08px] top-[-1.5px] h-[21.64px] w-[21.22px] max-w-none"
                    />
                  </span>
                </CircleButton>
              )}
            {hovered &&
              compareLabelPos &&
              createPortal(
                // Same label as "Compare with" outside compare mode
                <span
                  className="pointer-events-none fixed z-50 -translate-x-1/2 whitespace-nowrap rounded bg-gray-700/85 px-2 py-1 text-[11px] text-white"
                  style={{
                    left: compareLabelPos.x,
                    top: compareLabelPos.y + 16,
                  }}
                >
                  Add to comparison
                </span>,
                document.body,
              )}
          </div>
        )}
      </div>
    </Card>
  );
}
