export interface FilterState {
  industries: string[];
  locations: string[];
  jobTypes: string[];
  hourlyPay: { min: number; max: number };
  ratings: string[];
  workModels: string[];
  overtimeWork: string[];
  companyCulture: string[];
}
