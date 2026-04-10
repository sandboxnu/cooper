import { PipBar } from "./pip-bar";

interface PipCardProps {
  name: string;
  subtext: string;
  filledCount: number;
  totalCount: number;
  filledColor: string;
  footer?: React.ReactNode;
}

export function PipCard({
  name,
  subtext,
  filledCount,
  totalCount,
  filledColor,
  footer,
}: PipCardProps) {
  return (
    <div className="flex w-[172px] flex-col gap-[20px]">
      <div className="flex flex-col gap-[10px]">
        <div className="flex flex-col gap-[2px]">
          <p className="text-[16px] tracking-[-0.16px] text-cooper-gray-800">
            {name}
          </p>
          <p className="h-5 overflow-hidden text-[14px] leading-[normal] text-cooper-gray-350">
            {subtext}
          </p>
        </div>
        <PipBar
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
