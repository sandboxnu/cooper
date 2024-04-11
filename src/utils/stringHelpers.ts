import { WorkEnvironment } from "@prisma/client";
import { cn } from "~/lib/utils";

export function truncateText(text: string, length: number): string {
  return text && text.length >= length
    ? cn(text.slice(0, length), "...")
    : text;
}

export function prettyWorkEnviornment(workEnviornment: WorkEnvironment) {
  switch (workEnviornment) {
    case "HYBRID":
      return "Hybrid";
    case "INPERSON":
      return "In-person";
    case "REMOTE":
      return "Remote";
  }
}
