export interface FilterState {
  industries: string[];
  locations: string[];
  jobTypes: string[];
  hourlyPay: { min: number; max: number };
  ratings: string[];
  workModels: string[];
  overtimeWork: string[];
  // Average hours per week; (0,0) means no filter, like hourlyPay
  workHours: { min: number; max: number };
  // On the job checkboxes; each holds its option ids (see ON_THE_JOB_OPTIONS)
  federalHolidays: string[];
  transportation: string[];
  drugTest: string[];
  benefits: string[];
}

// On the job filter options. Ids are what the roles list API filters on
export const ON_THE_JOB_OPTIONS = {
  federalHolidays: [
    { id: "federalHolidays", label: "Federal holidays off" },
  ],
  transportation: [
    {
      id: "accessibleByTransportation",
      label: "Accessible by transportation",
    },
  ],
  drugTest: [{ id: "noDrugTest", label: "No drug test required" }],
  benefits: [
    { id: "freeLunch", label: "Lunch provided" },
    { id: "freeMerch", label: "Free merch" },
    { id: "snackBar", label: "Snack bar" },
    { id: "travelBenefits", label: "Travel benefits" },
  ],
};
