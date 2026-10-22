"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";

import { cn } from "@cooper/ui";

const SuccessToast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
  }
>(({ className, description, action, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-[320px] max-w-full items-start space-x-3 overflow-hidden rounded-lg bg-cooper-gray-550 p-4 text-white  shadow-lg shadow-black/10 transition-all data-[swipe=cancel]:translate-y-0 data-[swipe=end]:translate-y-[var(--radix-toast-swipe-end-y)] data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:slide-out-to-right-full sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:slide-in-from-right-full",
        className,
      )}
      {...props}
    >
      <div className="flex flex-row items-center justify-center space-x-3">
        {description && (
          <ToastPrimitives.Description className="text-sm leading-relaxed">
            {description}
          </ToastPrimitives.Description>
        )}

        {action && <div>{action}</div>}
      </div>
    </ToastPrimitives.Root>
  );
});
SuccessToast.displayName = "SuccessToast";

export { SuccessToast };
