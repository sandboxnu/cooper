import { DotBar, DotCount } from "./dot-statement";

interface PipCardProps {
  name: string;
  countLabel: string;
  filledCount: number;
  totalCount: number;
  filledColor: string;
  grayCount?: boolean;
  footer?: React.ReactNode;
}

export function PipCard({
  name,
  countLabel,
  filledCount,
  totalCount,
  filledColor,
  grayCount = false,
  footer,
}: PipCardProps) {
  return (
    <>
      {/* Below sm: a row like the On the Job co-op support rows */}
      <div className="flex w-full items-center gap-[90px] sm:hidden">
        {/* Name with its chip beside it; the chip wraps under if needed */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1.5">
          <p className="text-[16px] leading-6 tracking-[-0.16px] text-cooper-gray-900">
            {name}
          </p>
          {footer && (
            <div className="flex items-center gap-[8px] text-[14px] text-cooper-gray-400">
              {footer}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-[10px]">
          <DotBar
            className="max-w-[102px]"
            filledCount={filledCount}
            totalCount={totalCount}
            filledColor={filledColor}
          />
          <DotCount
            count={filledCount}
            total={totalCount}
            label="reported"
            color={grayCount ? undefined : filledColor}
          />
        </div>
      </div>
      <div className="hidden w-[172px] flex-col gap-[20px] sm:flex">
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-[16px] tracking-[-0.16px] text-cooper-gray-900">
              {name}
            </p>
            <DotCount
              count={filledCount}
              total={totalCount}
              label={countLabel}
              color={grayCount ? undefined : filledColor}
            />
          </div>
          <DotBar
            filledCount={filledCount}
            totalCount={totalCount}
            filledColor={filledColor}
          />
        </div>
        {footer && (
          <div className="flex items-center gap-[8px] text-[14px] text-cooper-gray-400">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
