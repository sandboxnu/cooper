import { cn } from "@cooper/ui";

// Compare columns share one grid so every "topic" lines up across cards.
// Each card spans all rows with a subgrid, and each section spans its own
// rows with a nested subgrid, rendering exactly one child per row.
// Sections are placed on fixed rows so a section that hasn't loaded yet
// leaves its rows empty instead of shifting the sections below it.
export const COMPARE_ROWS = {
  header: { start: 1, span: 1 },
  // title + headline, work hours, transportation, drug test, food, tools,
  // company culture, co-op support
  onTheJob: { start: 2, span: 8 },
  // title + rounds, types
  interview: { start: 10, span: 2 },
  // title + rate, benefits card
  pay: { start: 12, span: 2 },
  // title + summary
  reviews: { start: 14, span: 1 },
} as const;

export const COMPARE_ROW_COUNT = 14;

export type CompareSectionKey = Exclude<keyof typeof COMPARE_ROWS, "header">;

export function compareRowStyle(
  key: keyof typeof COMPARE_ROWS,
): React.CSSProperties {
  const { start, span } = COMPARE_ROWS[key];
  // Explicit column too: the card's sticky header overlay shares these rows,
  // and auto-placement would push overlapping items into implicit columns
  return { gridRow: `${start} / span ${span}`, gridColumn: "1" };
}

interface CompareSectionProps {
  section: CompareSectionKey;
  className?: string;
  children: React.ReactNode;
}

export function CompareSection({
  section,
  className,
  children,
}: CompareSectionProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)] grid-rows-subgrid gap-y-0 rounded-lg border border-cooper-gray-125 bg-white px-6 py-5",
        // 8px between sections; On the Job sits right under the header
        section !== "onTheJob" && "mt-2",
        className,
      )}
      style={compareRowStyle(section)}
    >
      {children}
    </div>
  );
}

export function CompareSectionTitle({ children }: { children: string }) {
  return (
    <p className="mb-3 text-lg font-medium tracking-[-0.18px] text-cooper-gray-900">
      {children}
    </p>
  );
}
