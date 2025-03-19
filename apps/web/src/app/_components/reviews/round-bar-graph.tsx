interface RoundBarGraphProps {
  minValue?: number; // leftmost side of bar
  maxValue: number; // rightmost side of bar
  lowValue?: number; // smallest value
  highValue: number; // largest value
  lowIndustryAvg?: number;
  highIndustryAvg?: number;
}

export default function RoundBarGraph({
  minValue = 0,
  maxValue,
  lowValue = 0,
  highValue,
  lowIndustryAvg,
  highIndustryAvg,
}: RoundBarGraphProps) {
  const fillPercentage =
    Math.min((highValue - lowValue) / (maxValue - minValue), 1) * 100;
  const leftPos = ((lowValue - minValue) / (maxValue - minValue)) * 100;

  return (
    <div className="relative h-5 w-full rounded-[10px] border border-black bg-white">
      <div
        className={`absolute left-0 top-0 h-full rounded-[10px] border-black bg-cooper-blue-400 ${lowValue !== minValue && "border-l"} ${highValue !== maxValue && highValue !== minValue && "border-r"}`}
        style={{ width: `${fillPercentage}%`, left: `${leftPos}%` }}
      />
      {lowIndustryAvg && (
        <div
          className="absolute left-0 top-1/2 h-7 -translate-y-1/2 border-l border-dashed border-black"
          style={{
            left: `${((lowIndustryAvg - minValue) / (maxValue - minValue)) * 100}%`,
          }}
        />
      )}
      {highIndustryAvg && (
        <div
          className="absolute left-0 top-1/2 h-7 -translate-y-1/2 border-r border-dashed border-black"
          style={{
            left: `${((highIndustryAvg - minValue) / (maxValue - minValue)) * 100}%`,
          }}
        />
      )}
    </div>
  );
}
