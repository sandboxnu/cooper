interface PipBarProps {
  filledCount: number;
  totalCount: number;
  filledColor: string;
}

export function PipBar({ filledCount, totalCount, filledColor }: PipBarProps) {
  const useFixedWidth = totalCount * 24 <= 172;

  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: totalCount }).map((_, i) => (
        <div
          key={i}
          className={`h-[36px] rounded-[8px] ${
            i < filledCount ? "" : "bg-[#d3d3d3]"
          } ${useFixedWidth ? "w-[24px] shrink-0" : "flex-1"}`}
          style={i < filledCount ? { backgroundColor: filledColor } : undefined}
        />
      ))}
    </div>
  );
}
