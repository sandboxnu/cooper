import Image from "next/image";

import { cn } from "@cooper/ui";

import BarGraph from "../../shared/bar-graph";
import SectionCard from "../../shared/section-card";

interface AveragesData {
  averageCultureRating: number;
  averageSupervisorRating: number;
  federalHolidays: number;
  drugTest: number;
  freeLunch: number;
  freeMerch: number;
  travelBenefits: number;
  snackBar: number;
}

interface OnTheJobModalProps {
  averages: AveragesData;
  isComparing: boolean;
}

const PERKS: { label: string; key: keyof AveragesData }[] = [
  { label: "Federal holidays off", key: "federalHolidays" },
  { label: "Drug test", key: "drugTest" },
  { label: "Lunch provided", key: "freeLunch" },
  { label: "Free merch", key: "freeMerch" },
  { label: "Travel benefits", key: "travelBenefits" },
  { label: "Snack bar", key: "snackBar" },
];

export function OnTheJobModal({ averages, isComparing }: OnTheJobModalProps) {
  return (
    <SectionCard title="On the job">
      <div
        className={cn(
          "flex flex-wrap gap-10 overflow-auto xl:flex-nowrap",
          isComparing && "flex-col gap-6 overflow-visible xl:flex-col",
        )}
      >
        <div
          className={cn(
            "flex flex-wrap gap-10 lg:flex-nowrap",
            isComparing && "flex-col gap-6 lg:flex-col",
          )}
        >
          <BarGraph
            title={"Company culture rating"}
            maxValue={5}
            value={averages.averageCultureRating}
          />
          <BarGraph
            title={"Supervisor rating"}
            maxValue={5}
            value={averages.averageSupervisorRating}
          />
        </div>

        <div className={cn("flex flex-wrap gap-x-6", isComparing && "gap-y-3")}>
          {PERKS.map(({ label, key }) => {
            const value = averages[key];
            return (
              <div
                key={label}
                className={`flex items-center gap-2 ${value > 0.5 ? "text-[#141414]" : "text-[#7d7d7d]"}`}
              >
                {value > 0.5 ? (
                  <Image
                    src="svg/perkCheck.svg"
                    alt="check mark"
                    width={12}
                    height={9}
                  />
                ) : (
                  <Image
                    src="svg/perkCross.svg"
                    alt="x mark"
                    height={11}
                    width={11}
                  />
                )}
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
