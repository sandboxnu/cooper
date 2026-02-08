export const Industry = {
  TECHNOLOGY: "TECHNOLOGY",
  HEALTHCARE: "HEALTHCARE",
  FINANCE: "FINANCE",
  EDUCATION: "EDUCATION",
  MANUFACTURING: "MANUFACTURING",
  HOSPITALITY: "HOSPITALITY",
  RETAIL: "RETAIL",
  TRANSPORTATION: "TRANSPORTATION",
  ENERGY: "ENERGY",
  MEDIA: "MEDIA",
  AEROSPACE: "AEROSPACE",
  TELECOMMUNICATIONS: "TELECOMMUNICATIONS",
  BIOTECHNOLOGY: "BIOTECHNOLOGY",
  PHARMACEUTICAL: "PHARMACEUTICAL",
  CONSTRUCTION: "CONSTRUCTION",
  REALESTATE: "REALESTATE",
  FASHIONANDBEAUTY: "FASHIONANDBEAUTY",
  ENTERTAINMENT: "ENTERTAINMENT",
  GOVERNMENT: "GOVERNMENT",
  NONPROFIT: "NONPROFIT",
  FOODANDBEVERAGE: "FOODANDBEVERAGE",
  GAMING: "GAMING",
  SPORTS: "SPORTS",
  MARKETING: "MARKETING",
  CONSULTING: "CONSULTING",
  FITNESS: "FITNESS",
  ECOMMERCE: "ECOMMERCE",
  ENVIRONMENTAL: "ENVIRONMENTAL",
  ROBOTICS: "ROBOTICS",
  MUSIC: "MUSIC",
  INSURANCE: "INSURANCE",
  DESIGN: "DESIGN",
  PUBLISHING: "PUBLISHING",
  ARCHITECTURE: "ARCHITECTURE",
  VETERINARY: "VETERINARY",
} as const;

export type IndustryType = (typeof Industry)[keyof typeof Industry];

export const WorkEnvironment = {
  INPERSON: "INPERSON",
  HYBRID: "HYBRID",
  REMOTE: "REMOTE",
} as const;

export const JobType = {
  COOP: "coop",
  PARTTIME: "parttime",
  INTERNSHIP: "internship",
} as const;

export type WorkEnvironmentType =
  (typeof WorkEnvironment)[keyof typeof WorkEnvironment];

export const WorkTerm = {
  FALL: "FALL",
  SPRING: "SPRING",
  SUMMER: "SUMMER",
} as const;

export type WorkTermType = (typeof WorkTerm)[keyof typeof WorkTerm];

export const RequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type RequestStatusType =
  (typeof RequestStatus)[keyof typeof RequestStatus];

export const Status = {
  DELETED: "DELETED",
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type StatusType =
  (typeof Status)[keyof typeof Status];