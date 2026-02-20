import Image from "next/image";

export default function StarGraph({
  ratings,
  averageOverallRating,
  reviews,
  cooperAvg,
}: {
  ratings: { stars: number; percentage: number }[];
  averageOverallRating: number;
  reviews: number;
  cooperAvg: number;
}) {
  const starColors = [
    "#FFE0A9",
    "#FFE0A9",
    "#FFD589",
    "#FFCC71",
    "#FFC04F",
    "#FFA400",
  ];

  return (
    <div>
      <p className="text-cooper-gray-400 font-bold text-sm pb-3">
        Overall rating
      </p>
      <div className="mr-6 flex flex-row justify-between w-full items-start text-cooper-gray-400">
        <div className="flex flex-col ">
          <div className="flex flex-row gap-2 pt-1">
            <div className="text-4xl text-[#151515]">
              {averageOverallRating.toFixed(1)}
            </div>
            <Image src="/svg/star.svg" alt="Star icon" width={28} height={28} />
          </div>
          <div className="pt-4 text-sm">
            Based on {reviews} {reviews === 1 ? "review" : "reviews"}
          </div>
          <div className="text-sm">Cooper average: {cooperAvg}</div>
        </div>
        <div className="mt-4 w-full min-w-24 max-w-36 md:max-w-48 space-y-1 pt-1 md:mt-0 ">
          {ratings.map((rating) => (
            <div key={rating.stars} className="flex items-center">
              <span className="text-xs text-gray-600 mr-2">
                {rating.stars} stars
              </span>
              <div className="ml-1 h-2 flex-1 rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${rating.percentage}%`,
                    backgroundColor: starColors[rating.stars],
                  }}
                ></div>
              </div>
              <div className="pl-2 text-xs">
                {Math.round((rating.percentage / 100) * reviews)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
