export default function CompanyStatistics({
  workModels,
  reviews,
  payStats,
  payRange,
}: {
  workModels: { name: string; percentage: number; count: number }[];
  payStats: { pay: string; percentage: number; count: number }[];
  reviews: number;
  payRange: { label?: string; min: number; max: number }[];
}) {
  const payRangeColors = [
    "cooper-yellow-200",
    "cooper-blue-400",
    "cooper-red-400",
  ];

  const payRangesWithData = payRange
    .map((range, rangeIndex) => {
      const statsInRange = payStats.filter((stat) => {
        const payValue = parseFloat(stat.pay);
        return payValue >= range.min && payValue <= range.max;
      });

      const count = statsInRange.reduce((sum, stat) => sum + stat.count, 0);
      const percentage = statsInRange.reduce(
        (sum, stat) => sum + stat.percentage,
        0,
      );

      return {
        range,
        rangeIndex,
        count,
        percentage,
        color: payRangeColors[rangeIndex],
      };
    })
    .filter((item) => item.count > 0);
  return (
    <div className="flex flex-row justify-between w-full pt-4 text-cooper-gray-400">
      <div className="w-[30%]">
        <p className="pb-2">Job type</p>
        <div className="ml-1 h-7 flex-1 rounded-lg bg-cooper-yellow-200" />
        <div className="flex flex-row items-center pt-2 justify-between">
          <div className="flex flex-row items-center">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "cooper-yellow-200" }}
            />
            <div className="pl-2">Co-op</div>
          </div>
          <div className="pl-2">{reviews}</div>
        </div>
      </div>
      <div className="w-[30%]">
        <p className="pb-2">Work model</p>
        <div className="ml-1 h-7 flex-1 rounded-lg flex overflow-hidden gap-0.5">
          {workModels.map((model) => (
            <div
              key={model.name}
              className={`h-full rounded-lg ${
                model.name === "In-person"
                  ? "bg-cooper-yellow-200"
                  : model.name === "Hybrid"
                    ? "bg-cooper-blue-400"
                    : "bg-cooper-red-400"
              }`}
              style={{ width: `${model.percentage}%` }}
            />
          ))}
        </div>

        {workModels.map((workModel) => (
          <div
            key={workModel.name}
            className="flex flex-row items-center pt-2 justify-between"
          >
            <div className="flex flex-row items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  workModel.name === "In-person"
                    ? "bg-cooper-yellow-200"
                    : workModel.name === "Hybrid"
                      ? "bg-cooper-blue-400"
                      : "bg-cooper-red-400"
                }`}
              />
              <div className="pl-2">{workModel.name}</div>
            </div>
            <div className="pl-2">{workModel.count}</div>
          </div>
        ))}
      </div>
      <div className="w-[30%]">
        <p className="pb-2">Pay</p>
        <div className="ml-1 h-7 flex-1 rounded-lg flex overflow-hidden gap-0.5">
          {payRangesWithData.map((item) => (
            <div
              key={item.range.min}
              className={`h-full rounded-lg bg-${item.color}`}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
            />
          ))}
        </div>

        {payRangesWithData.map((item) => {
          return (
            <div
              key={item.range.min}
              className="flex flex-row items-center pt-2 justify-between"
            >
              <div className="flex flex-row items-center">
                <div className={`w-3 h-3 rounded-full bg-${item.color}`} />
                <div className="pl-2">
                  ${item.range.min}-${item.range.max}/hr
                </div>
              </div>
              <div className="pl-2">{item.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
