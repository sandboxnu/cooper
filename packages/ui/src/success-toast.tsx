"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import Image from "next/image";

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
        "shadow-green-500/10 group pointer-events-auto relative flex items-start space-x-3 overflow-hidden rounded-lg bg-green-50 p-4 text-green-900 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        className,
      )}
      {...props}
    >
      <div className="flex flex-row justify-center items-center space-x-3">
        <Image
          src="/svg/toastCheck.svg"
          alt="Check icon"
          width={25}
          height={25}
        />

        {description && (
          <ToastPrimitives.Description className="text-sm opacity-90 leading-relaxed">
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
