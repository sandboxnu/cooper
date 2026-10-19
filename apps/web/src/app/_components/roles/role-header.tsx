import Image from "next/image";

import { cn } from "@cooper/ui";

// White rounded box the company logo sits in
export function logoBoxClass(small: boolean) {
  return cn(
    "flex shrink-0 items-center justify-center rounded-lg border border-black/[0.07] bg-white",
    small ? "size-[46px]" : "p-4",
  );
}

interface RoleHeaderProps {
  logo: React.ReactNode;
  title: string;
  jobTypeLabel?: string | null;
  locationLabel?: string | null;
  // Omitted when the role has no reviews yet
  rating?: { average: number; count: number } | null;
  small?: boolean;
  actions?: React.ReactNode;
}

// Logo + title + "job type • location" + star rating, as in compare cards
export function RoleHeader({
  logo,
  title,
  jobTypeLabel,
  locationLabel,
  rating,
  small = false,
  actions,
}: RoleHeaderProps) {
  return (
    <div className="flex items-start gap-[14px]">
      {logo}
      <div className="flex min-w-0 flex-1 flex-col gap-1 pr-1 pt-1">
        <p
          className={cn(
            "font-semibold text-cooper-gray-900",
            small
              ? "text-[18px] leading-6 tracking-[-0.18px]"
              : "text-[24px] leading-7 tracking-[-0.24px]",
          )}
        >
          {title}
        </p>
        <div
          className={cn(
            "flex flex-col text-cooper-gray-400",
            small
              ? "gap-1 text-[14px] leading-normal"
              : "gap-[3px] text-[16px] leading-6 tracking-[-0.16px]",
          )}
        >
          {locationLabel && (
            <p className="whitespace-pre">
              {jobTypeLabel}
              {jobTypeLabel && "  •  "}
              {locationLabel}
            </p>
          )}
          {rating && rating.count > 0 && (
            <div className="flex items-center gap-1.5">
              <Image
                src="/svg/star.svg"
                alt="Star icon"
                width={21}
                height={21}
              />
              <p className="whitespace-pre">
                {rating.average.toFixed(1)}
                {"  "}({rating.count} review
                {rating.count !== 1 && "s"})
              </p>
            </div>
          )}
        </div>
      </div>
      {actions}
    </div>
  );
}
