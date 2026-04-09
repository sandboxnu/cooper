"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";

import { cn } from "@cooper/ui";

import { ErrorToast } from "./error-toast";
import { useToast } from "./hooks/use-toast";
import { SuccessToast } from "./success-toast";

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
  if (className?.includes("toast-action")) return "action";
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

        if (customVariant === "action") {
          return (
            <ToastPrimitives.Root
              key={id}
              className="pointer-events-auto relative flex w-full items-center justify-between overflow-hidden rounded-lg bg-white px-4 py-3 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"
              {...props}
            >
              <style>{`
                @keyframes cooper-toast-progress {
                  from { width: 100%; }
                  to { width: 0%; }
                }
              `}</style>
              <div
                className="absolute bottom-0 left-0 h-[3px] bg-[#FFA400]"
                style={{ animation: "cooper-toast-progress 5s linear forwards" }}
              />
              <ToastPrimitives.Description className="text-sm text-gray-900">
                {description}
              </ToastPrimitives.Description>
            </ToastPrimitives.Root>
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
