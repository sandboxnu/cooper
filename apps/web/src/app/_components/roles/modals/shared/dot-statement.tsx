import { cn } from "@cooper/ui";

interface DotBarProps {
  filledCount: number;
  totalCount: number;
  filledColor: string;
  className?: string;
}

export function DotBar({
  filledCount,
  totalCount,
  filledColor,
  className,
}: DotBarProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {Array.from({ length: totalCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "size-[18px] shrink-0 rounded-full",
            i >= filledCount && "border-2 border-[#bcbcbc]",
          )}
          style={i < filledCount ? { backgroundColor: filledColor } : undefined}
        />
      ))}
    </div>
  );
}

interface DotCountProps {
  count: number;
  total: number;
  label: string;
  // Omit to keep the count in the caption gray
  color?: string;
  className?: string;
}

// "2/3 reported" with the count bolded, optionally in its dot color
export function DotCount({
  count,
  total,
  label,
  color,
  className,
}: DotCountProps) {
  return (
    <p
      className={cn(
        "text-[14px] leading-normal text-cooper-gray-350",
        className,
      )}
    >
      <span className="font-bold" style={color ? { color } : undefined}>
        {count}
      </span>
      /{total} {label}
    </p>
  );
}
