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
import { formatDate } from "~/utils/dateHelpers";
import { Role } from "@prisma/client";
import {
  averageStarRating,
  mostCommonWorkEnviornment,
} from "~/utils/reviewsAggregationHelpers";

// todo: add this attribution in a footer somewhere
//  <a href="https://clearbit.com">Logos provided by Clearbit</a>

type RoleReviewCardProps = {
  className?: string;
  roleObj: Role;
};

export async function RoleReviewCard({
  className,
  roleObj,
  ...props
}: RoleReviewCardProps) {
  // ===== COMPANY DATA ===== //
  const company = await api.company.getById.query({ id: roleObj.companyId });
  const roleDescription =
    roleObj.description && roleObj.description.length >= 210
      ? cn(roleObj.description.slice(0, 210), "...")
      : roleObj.description;
  const positionDate: string = formatDate(company.createdAt);

  // ===== REVIEW DATA ===== //
  const reviews = await api.review.getByRole.query({ roleId: roleObj.id });
  const reviewCount = reviews.length;
  const workEnvironment = mostCommonWorkEnviornment(reviews);

  // ===== AVERAGE RATING ===== //
  const averageStars = averageStarRating(reviews);

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
              width={75}
              height={75}
              alt={`Logo of ${company}`}
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
