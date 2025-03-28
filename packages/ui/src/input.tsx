import * as React from "react";

import { cn } from "@cooper/ui";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "dialogue";
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    const style =
      variant === "dialogue"
        ? "flex h-fit w-[100%] rounded-lg outline outline-[1px] outline-[#474747] px-3 py-2"
        : "flex h-16 w-full rounded-md border-[3px] border-cooper-blue-600 bg-white px-3 py-2 text-xl font-normal file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:border-cooper-gray-300 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

    return (
      <input
        type={type}
        className={cn(style, className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
