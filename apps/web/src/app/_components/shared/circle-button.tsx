"use client";

import React from "react";

import { cn } from "@cooper/ui";

// Icon button with the gray hover circle used by save, compare and remove
// buttons. The circle is always 44px and centered on the button, so callers can
// size the box (24px by default) without changing the circle; it may overlap
// neighbors or bleed past its container.
export const CircleButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      "group relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
      className,
    )}
    {...props}
  >
    <span className="pointer-events-none absolute left-1/2 top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cooper-gray-150 opacity-0 transition-opacity group-hover:opacity-100" />
    <span className="relative z-10 flex items-center justify-center">
      {children}
    </span>
  </button>
));
CircleButton.displayName = "CircleButton";
