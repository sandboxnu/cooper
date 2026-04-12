interface PipBarProps {
  filledCount: number;
  totalCount: number;
  filledColor: string;
}

const MAX_PIP_WIDTH = 24;
const GAP = 2;
const REFERENCE_WIDTH = MAX_PIP_WIDTH * 4 + GAP * 3; // 102px — capped at 4-pip width
const MIN_PIP_WIDTH = 4;

export function PipBar({ filledCount, totalCount, filledColor }: PipBarProps) {
  const pipWidth = Math.max(
    MIN_PIP_WIDTH,
    (REFERENCE_WIDTH - (totalCount - 1) * GAP) / totalCount,
  );

  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: totalCount }).map((_, i) => (
        <div
          key={i}
          className={`h-9 shrink-0 rounded-[8px] ${
            i < filledCount ? "" : "bg-[#d3d3d3]"
          }`}
          style={{
            width: pipWidth,
            ...(i < filledCount ? { backgroundColor: filledColor } : {}),
          }}
        />
      ))}
    </div>
  );
}
