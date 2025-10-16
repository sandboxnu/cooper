"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { useToast } from "./hooks/use-toast";
import { SuccessToast } from "./success-toast";
import { ErrorToast } from "./error-toast";
import { cn } from "@cooper/ui";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

// Helper to determine variant from className
const getVariantFromClassName = (className?: string) => {
  if (className?.includes("toast-success")) return "success";
  if (className?.includes("toast-error")) return "error";
  if (className?.includes("toast-warning")) return "warning";
  if (className?.includes("toast-info")) return "info";
  return "default";
};

export function CustomToaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        className,
        ...props
      }) {
        const customVariant =
          getVariantFromClassName(className) !== "default"
            ? getVariantFromClassName(className)
            : variant === "destructive"
              ? "error"
              : "default";

        // Choose which toast component to render based on variant
        if (customVariant === "success") {
          return (
            <SuccessToast
              key={id}
              title={title}
              description={description}
              action={action}
              {...props}
            />
          );
        }

        if (customVariant === "error" || variant === "destructive") {
          return (
            <ErrorToast
              key={id}
              title={title}
              description={description}
              action={action}
              {...props}
            />
          );
        }

        // Fallback to success toast for other variants (you can add more specific toast components later)
        return (
          <SuccessToast
            key={id}
            title={title}
            description={description}
            action={action}
            {...props}
          />
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
