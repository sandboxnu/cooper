/* eslint-disable @next/next/no-img-element */
import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/server";
import { ReviewCardStars } from "./review-card-stars";

// TODO: move this somewehre else?
function formatDate(date: Date) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Extract the year, month, and day components
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const month = months[monthIndex];
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits for the day

  // Construct the formatted date string
  const formattedDate = `${day} ${month} ${year}`;

  return formattedDate;
}

// todo: add this attribution in a footer somewhere
//  <a href="https://clearbit.com">Logos provided by Clearbit</a>

type RoleReviewCardProps = {
  className?: string;
  roleObj: {
    id: string;
    title: string;
    description: string | null;
    companyId: string;
  };
};

export async function RoleReviewCard({
  className,
  roleObj,
  ...props
}: RoleReviewCardProps) {
  // Get all of the information needed from the corresponding company
  const company = await api.company.getById.query({ id: roleObj.companyId });
  const roleDescription =
    roleObj.description && roleObj.description.length >= 210
      ? cn(roleObj.description.slice(0, 210), "...")
      : roleObj.description;
  const positionDate: string = formatDate(company.createdAt);

  // Get all of the information needed from the corresponding reviews
  const reviews = await api.review.getByRole.query({ roleId: roleObj.id });
  const reviewCount = reviews.length;
  let workEnvironment = "In Person";
  // TODO: we are setting the work enviornment to the first role since its not stored per company. Change?
  if (reviews.length > 0 && reviews[0]) {
    if (reviews[0].workEnvironment == "HYBRID") {
      workEnvironment = "Hybrid";
    } else if (reviews[0].workEnvironment == "REMOTE") {
      workEnvironment = "Remote";
    }
  }
  // Calculate average total review
  // TODO: abstract?
  const totalStars = reviews.reduce((accum, curr) => {
    return accum + curr.overallRating;
  }, 0);
  const averageStars = totalStars / reviewCount;

  return (
    <Card
      className={cn(
        "flex h-[26rem] w-96 flex-col justify-between overflow-hidden rounded-3xl",
        className,
      )}
      {...props}
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex justify-end text-xs font-extralight leading-3">
            {positionDate}
          </div>
          <div className="flex items-center justify-start space-x-4">
            <img
              src={`https://logo.clearbit.com/${company.name.replace(/\s/g, "")}.com`}
              alt="Description of the image"
              width={75}
              height={75}
              className="rounded-2xl border"
            />
            <div>
              <CardTitle className="text-xl">{roleObj.title}</CardTitle>
              <p className="text-sm font-semibold">{company.name}</p>
              <ReviewCardStars numStars={averageStars} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid">
          <div className="m-4 flex items-center space-x-8">
            <div className="flex flex-col text-sm">
              <h4 className="font-semibold">Location</h4>
              <p>{company.location}</p>
            </div>
            <div className="flex flex-col text-sm">
              <h4 className="font-semibold">Work Model</h4>
              <p>{workEnvironment}</p>
            </div>
          </div>
          <div className="m-4 flex items-center space-x-4">
            <p className="text-sm">{roleDescription}</p>
          </div>
        </CardContent>
      </div>
      <CardFooter className=" items-end justify-end text-xs">
        {reviewCount + " Reviews"}
      </CardFooter>
    </Card>
  );
}
