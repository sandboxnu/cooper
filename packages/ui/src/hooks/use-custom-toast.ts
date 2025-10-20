"use client";

import { useToast as useBaseToast } from "./use-toast";

export function useCustomToast() {
  const { toast: baseToast, ...rest } = useBaseToast();

  const toast = {
    success: (description: string) =>
      baseToast({
        description,
        // Use a custom property that our custom toaster will recognize
        className: "toast-success",
        variant: "default",
      }),

    error: (description: string) =>
      baseToast({
        description,
        className: "toast-error",
        variant: "destructive",
      }),

    warning: (description: string) =>
      baseToast({
        description,
        className: "toast-warning",
        variant: "default",
      }),

    info: (description: string) =>
      baseToast({
        description,
        className: "toast-info",
        variant: "default",
      }),

    custom: baseToast,
  };

  return {
    ...rest,
    toast,
  };
}
