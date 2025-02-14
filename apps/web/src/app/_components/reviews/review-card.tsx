"use client";

import type { ReviewType } from "@cooper/db/schema";
import { Card, CardContent } from "@cooper/ui/card";

import { ReviewCardStars } from "./review-card-stars";

// const InterviewDifficulty = [
//   { des: "Very Easy", color: "text-[#4bc92e]" },
//   { des: "Easy", color: "text-[#09b52b]" },
//   { des: "Neither Easy Nor Difficult", color: "text-cooper-blue-400" },
//   { des: "Difficult", color: "text-[#f27c38]" },
//   { des: "Very Difficult", color: "text-[#f52536]" },
// ];

interface ReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
}

export function ReviewCard({ reviewObj }: ReviewCardProps) {
  return (
    <Card className="mx-auto w-[94%]">
      <div className="flex pt-5">
        <Card className="w-25% border-none shadow-none">
          <CardContent>
            <div className="pt-2">
              <ReviewCardStars numStars={reviewObj.overallRating} />
            </div>
            <div className="align-center flex gap-2 pt-2">
              <span
                className={`${reviewObj.location ? "visibility: visible" : "visibility: hidden"}`}
              >
                {" "}
                {reviewObj.location} •
              </span>
              <span>{reviewObj.workTerm}</span>
            </div>
            <div>date posted</div>
            <div>posted by:</div>
            <div>
              <h3>Position type: Co-op</h3>
            </div>
            <div>
              <h3>Work model: {reviewObj.workEnvironment}</h3>
            </div>
            <div>
              <h3>Pay: ${reviewObj.hourlyPay}/hr</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="w-75% border-none shadow-none">
          <CardContent>
            <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3>Company Culture</h3>
                <ReviewCardStars numStars={reviewObj.cultureRating} />
              </div>
              <div>
                <h3>Supervisor</h3>
                <ReviewCardStars numStars={reviewObj.supervisorRating} />
              </div>
              <div>
                <h3>Interview Rating</h3>
                <ReviewCardStars numStars={reviewObj.interviewRating} />
              </div>
            </div>
            <div className="pt-5">{reviewObj.textReview}</div>
          </CardContent>
        </Card>
      </div>
    </Card>
  );
}
