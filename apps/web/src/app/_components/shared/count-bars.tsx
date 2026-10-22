import { cn } from "@cooper/ui";

interface CountBarsProps {
  rows: { label: string; count: number }[];
  // Fill color of the bars
  color: string;
  className?: string;
}

// Labeled horizontal bars with counts, styled like the job page's star rating
// bars (StarGraph / RatingSummary); each bar is its share of the total
export function CountBars({ rows, color, className }: CountBarsProps) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {rows.map(({ label, count }) => (
        <div key={label} className="flex items-center gap-3">
          <p className="w-[120px] shrink-0 text-[14px] leading-normal text-cooper-gray-400">
            {label}
          </p>
          <div className="h-2 min-w-px flex-1 rounded-full bg-cooper-gray-150">
            <div
              className="h-full rounded-full"
              style={{
                width: `${total > 0 ? (count / total) * 100 : 0}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <p className="w-6 shrink-0 text-[14px] leading-normal text-cooper-gray-400">
            {count}
          </p>
        </div>
      ))}
    </div>
  );
}
