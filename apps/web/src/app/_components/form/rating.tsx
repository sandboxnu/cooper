import type { FieldPath } from "react-hook-form";
import { forwardRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { cn } from "@cooper/ui";
import type { ReviewFormType } from "~/app/(pages)/(protected)/review-form/page";

// FIXME: Fix this import at some point (form context)

type RatingProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  value?: number;
  onChange?: (value: number) => void;
};

/**
 * Rating component provides a star-based rating input.
 * Can be used with react-hook-form (via name prop) or with local state (via value/onChange props).
 *
 * See: {@link https://github.com/shadcn-ui/ui/issues/1107#issuecomment-1918229523}
 */
export const Rating = forwardRef<HTMLInputElement, RatingProps>(
  (props, ref) => {
    const {
      name,
      value: controlledValue,
      onChange: controlledOnChange,
      ...restProps
    } = props;

    // Always call useFormContext (hooks must be called unconditionally)
    // Only use it if name is provided
    const formContext = useFormContext<ReviewFormType>();
    const nameField = name as FieldPath<ReviewFormType> | undefined;

    const [hoveredIndex, setHoveredIndex] = useState<number>(0);

    // Get current value based on mode
    const getCurrentValue = (): number => {
      if (nameField && name) {
        return +formContext.getValues(nameField) || 0;
      }
      return controlledValue ?? 0;
    };

    // Handle value change based on mode
    const handleChange = (newValue: number) => {
      if (nameField && name) {
        formContext.setValue(nameField, newValue);
      } else if (controlledOnChange) {
        controlledOnChange(newValue);
      }
    };

    const currentValue = getCurrentValue();

    return (
      <div className="flex">
        {nameField && name && (
          <input
            {...restProps}
            className="hidden"
            {...formContext.register(nameField)}
            ref={ref}
          />
        )}
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth={0}
              stroke="white"
              className={cn(
                "size-9",
                i < hoveredIndex || i < currentValue
                  ? "fill-cooper-yellow-500"
                  : "fill-cooper-gray-200",
                "pr-2 hover:cursor-pointer",
              )}
              onMouseEnter={() => setHoveredIndex(i + 1)}
              onMouseLeave={() => setHoveredIndex(0)}
              onClick={() => {
                const newValue = currentValue === i + 1 ? 0 : i + 1;
                handleChange(newValue);
                if (newValue === 0) {
                  setHoveredIndex(0);
                }
              }}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
      </div>
    );
  },
);
Rating.displayName = "Rating";
