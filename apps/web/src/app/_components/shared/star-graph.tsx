import { ReviewCardStars } from "../reviews/review-card-stars";

export default function StarGraph({
  ratings,
  averageOverallRating,
}: {
  ratings: { stars: number; percentage: number }[];
  averageOverallRating: number;
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
    <div className="mb-6 flex flex-wrap items-start md:flex-nowrap">
      <div className="mr-6">
        <p className="text-gray-500">Overall Rating:</p>
        <h2 className="mb-4 mt-2 text-5xl">
          {averageOverallRating.toFixed(1)}
        </h2>
        <div className="my-1 flex">
          <ReviewCardStars
            numStars={parseInt(averageOverallRating.toFixed(0))}
          />
        </div>
      </div>

      <div className="mt-4 w-full min-w-24 max-w-64 space-y-2 pt-1 md:mt-0">
        {ratings.map((rating) => (
          <div key={rating.stars} className="flex items-center">
            <span className="flex w-8 items-center">
              <svg
                className="h-3 w-3 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-xs text-gray-600">{rating.stars}</span>
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
          </div>
        ))}
      </div>
    </div>
  );
}
