interface BarGraphProps {
  title: string;
  maxValue: number;
  value: number;
  industryAvg?: number;
}

export default function BarGraph({
  title,
  maxValue,
  value,
  industryAvg,
}: BarGraphProps) {
  const fillPercentage = Math.min(value / maxValue, 1) * 100;
  const industryAvgPos = industryAvg ? (industryAvg / maxValue) * 100 : null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[#5a5a5a]">
        {title}
        <div className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-cooper-gray-400 text-center text-xs text-[#f6f6f6]">
          ?
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-36 border border-black bg-white">
          <div
            className={`absolute left-0 top-0 h-full border-black bg-cooper-blue-400 ${fillPercentage !== 100 && fillPercentage !== 0 && "border-r"}`}
            style={{ width: `${fillPercentage}%` }}
          />

          {industryAvgPos && (
            <div
              className="absolute top-1/2 h-16 -translate-y-1/2 border-l border-dashed border-black"
              style={{ left: `${industryAvgPos}%` }}
            />
          )}
        </div>
        <div className="text-4xl font-normal">{value.toPrecision(2)}</div>
      </div>
      {industryAvg && (
        <div className="text-[#5a5a5a]">Industry average: {industryAvg}</div>
      )}
    </div>
  );
}
