import * as React from "react";

import { cn } from "@cooper/ui";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    variant?: "default" | "dialogue";
  };

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    const style =
      variant === "dialogue"
        ? "flex h-fit w-[100%] rounded-lg outline outline-[1px] outline-[#474747] px-3 py-2"
        : "flex min-h-[200px] w-full rounded-md border-[3px] border-cooper-blue-600 bg-white px-3 py-2 text-xl font-normal ring-offset-background placeholder:text-cooper-gray-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return <textarea className={cn(style, className)} ref={ref} {...props} />;
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
