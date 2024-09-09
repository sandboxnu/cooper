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
