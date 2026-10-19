import { DotBar, DotCount } from "./dot-statement";

interface PipCardProps {
  name: string;
  countLabel: string;
  filledCount: number;
  totalCount: number;
  filledColor: string;
  footer?: React.ReactNode;
}

export function PipCard({
  name,
  countLabel,
  filledCount,
  totalCount,
  filledColor,
  footer,
}: PipCardProps) {
  return (
    <div className="flex w-[172px] flex-col gap-[20px]">
      <div className="flex flex-col gap-[10px]">
        <div className="flex flex-col gap-[2px]">
          <p className="text-[16px] tracking-[-0.16px] text-cooper-gray-900">
            {name}
          </p>
          <DotCount
            count={filledCount}
            total={totalCount}
            label={countLabel}
            color={filledColor}
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
  );
}
