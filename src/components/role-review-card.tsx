/* eslint-disable @next/next/no-img-element */
import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// todo: add this attribution in a footer somewhere
//  <a href="https://clearbit.com">Logos provided by Clearbit</a>

type RoleReviewCardProps = { className?: string; description: string };

export function RoleReviewCard({ className, ...props }: RoleReviewCardProps) {
  // TODO: figure out how to use api lol
  const positionDate = "02 Feb 2024";
  const positionName = "Software Engineer";
  const companyName = "UBS";
  const companyLocation = "New York City";
  const workModel = "Hybrid";
  const companyDescription =
    props.description.length >= 210
      ? cn(props.description.slice(0, 210), "...")
      : props.description;
  const reviewCount = 30;

  return (
    <Card
      className={cn(
        "flex h-[26rem] w-[380px] flex-col justify-between rounded-3xl",
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
              src={`https://logo.clearbit.com/${companyName.replace(/\s/g, "")}.com`}
              alt="Description of the image"
              width={75}
              height={75}
              className="rounded-2xl border"
            />
            <div>
              <CardTitle className="text-xl">{positionName}</CardTitle>
              <p className="text-sm font-semibold">{companyName}</p>
              <p className="text-sm font-semibold">⭐️⭐️⭐️⭐️⭐️</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid">
          <div className="m-4 flex items-center space-x-8">
            <div className="flex flex-col text-sm">
              <h4 className="font-semibold">Location</h4>
              <p>{companyLocation}</p>
            </div>
            <div className="flex flex-col text-sm">
              <h4 className="font-semibold">Work Model</h4>
              <p>{workModel}</p>
            </div>
          </div>
          <div className="m-4 flex items-center space-x-4">
            <p className="text-sm">{companyDescription}</p>
          </div>
        </CardContent>
      </div>
      <CardFooter className=" items-end justify-end text-xs">
        {reviewCount + " Reviews"}
      </CardFooter>
    </Card>
  );
}
