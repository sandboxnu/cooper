import type { WorkEnvironmentType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";

export function truncateText(text: string, length: number): string {
  return text && text.length >= length
    ? cn(text.slice(0, length), "...")
    : text;
}

export function prettyWorkEnviornment(workEnviornment: WorkEnvironmentType) {
  switch (workEnviornment) {
    case "HYBRID":
      return "Hybrid";
    case "INPERSON":
      return "In-person";
    case "REMOTE":
      return "Remote";
  }
}

export function prettyDescription(
  description?: string | null,
  maxLength = 200,
) {
  if (!description) return ""; // Handle undefined or empty descriptions

  return description.length > maxLength
    ? description.slice(0, maxLength) + "..."
    : description;
}

export function prettyIndustry(industry?: string) {
  if (!industry) {
    return "Unknown Industry"; // Handle undefined case
  }
  switch (industry) {
    case "TECHNOLOGY":
      return "Technology";
    case "HEALTHCARE":
      return "Healthcare";
    case "FINANCE":
      return "Finance";
    case "EDUCATION":
      return "Education";
    case "MANUFACTURING":
      return "Manufacturing";
    case "HOSPITALITY":
      return "Hospitality";
    case "RETAIL":
      return "Retail";
    case "TRANSPORTATION":
      return "Transportation";
    case "ENERGY":
      return "Energy";
    case "MEDIA":
      return "Media";
    case "AEROSPACE":
      return "Aerospace";
    case "TELECOMMUNICATIONS":
      return "Telecommunications";
    case "BIOTECHNOLOGY":
      return "Biotechnology";
    case "PHARMACEUTICAL":
      return "Pharmaceutical";
    case "CONSTRUCTION":
      return "Construction";
    case "REALESTATE":
      return "Real Estate";
    case "FASHIONANDBEAUTY":
      return "Fashion & Beauty";
    case "ENTERTAINMENT":
      return "Entertainment";
    case "GOVERNMENT":
      return "Government";
    case "NONPROFIT":
      return "Nonprofit";
    case "FOODANDBEVERAGE":
      return "Food & Beverage";
    case "GAMING":
      return "Gaming";
    case "SPORTS":
      return "Sports";
    case "MARKETING":
      return "Marketing";
    case "CONSULTING":
      return "Consulting";
    case "FITNESS":
      return "Fitness";
    case "ECOMMERCE":
      return "E-commerce";
    case "ENVIRONMENTAL":
      return "Environmental";
    case "ROBOTICS":
      return "Robotics";
    case "MUSIC":
      return "Music";
    case "INSURANCE":
      return "Insurance";
    case "DESIGN":
      return "Design";
    case "PUBLISHING":
      return "Publishing";
    case "ARCHITECTURE":
      return "Architecture";
    case "VETERINARY":
      return "Veterinary";
    default:
      return "Unknown Industry";
  }
}
