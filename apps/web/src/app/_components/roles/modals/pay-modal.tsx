import { cn } from "@cooper/ui";

import RoundBarGraph from "../../shared/round-bar-graph";
import SectionCard from "../../shared/section-card";

interface AveragesData {
  minPay: number;
  maxPay: number;
  overtimeNormal: number;
  pto: number;
}

interface PayModalProps {
  averages: AveragesData;
  isComparing: boolean;
}

export function PayModal({ averages, isComparing }: PayModalProps) {
  return (
    <SectionCard title="Pay">
      <div className="flex flex-col justify-between gap-3 md:flex-row">
        <div className="flex flex-col gap-2 md:w-[30%] md:gap-5">
          <div className="text-cooper-gray-400">Pay range</div>
          {averages.minPay !== averages.maxPay ? (
            <div className="flex flex-col gap-5">
              <div className="pl-1 text-4xl text-[#141414]">
                ${averages.minPay}-{averages.maxPay} / hr
              </div>
              <RoundBarGraph
                maxValue={Math.max(averages.maxPay, 45)}
                minValue={Math.min(averages.minPay, 15)}
                lowValue={averages.minPay}
                highValue={averages.maxPay}
              />
            </div>
          ) : (
            <div className="pl-1 text-4xl text-[#141414]">
              ${averages.maxPay} / hr
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex flex-col justify-between gap-2 md:w-[30%] md:gap-5",
            isComparing && "w-full md:w-full",
          )}
        >
          <div className="text-cooper-gray-400">Overtime work</div>
          <div className="flex items-center gap-2 pl-1">
            <div className="text-4xl text-[#141414]">
              {Math.round(Number(averages.overtimeNormal.toPrecision(2)) * 100)}%
            </div>
            <div className="flex flex-wrap text-sm text-[#141414]">
              said working overtime was normal
            </div>
          </div>
          <RoundBarGraph
            maxValue={100}
            highValue={Number(averages.overtimeNormal.toPrecision(2)) * 100}
          />
        </div>
        <div
          className={cn(
            "flex flex-col justify-between gap-2 md:w-[30%] md:gap-5",
            isComparing && "w-full md:w-full",
          )}
        >
          <div className="text-cooper-gray-400">Paid time off (PTO)</div>
          <div className="flex items-center gap-2 pl-1">
            <div className="text-4xl text-[#141414]">
              {Number(averages.pto.toPrecision(2)) * 100}%
            </div>
            <div className="flex flex-wrap text-sm text-[#141414]">
              received PTO
            </div>
          </div>
          <RoundBarGraph
            maxValue={100}
            highValue={Number(averages.pto.toPrecision(2)) * 100}
          />
        </div>
      </div>
    </SectionCard>
  );
}
