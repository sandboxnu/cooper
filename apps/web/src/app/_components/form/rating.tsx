import type { FieldPath } from "react-hook-form";
import { forwardRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { cn } from "@cooper/ui";

// FIXME: Fix this import at some point (form context)
import type { ReviewFormType } from "~/app/_components/form/review-form";

type RatingProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Rating component provides a star-based rating input.
 *
 * See: {@link https://github.com/shadcn-ui/ui/issues/1107#issuecomment-1918229523}
 */
export const Rating = forwardRef<HTMLInputElement, RatingProps>(
  (props, ref) => {
    const name = props.name as FieldPath<ReviewFormType>;
    const { register, setValue, getValues } = useFormContext<ReviewFormType>();
    const [hoveredIndex, setHoveredIndex] = useState<number>(0);

    return (
      <div className="flex">
        <input {...props} className="hidden" {...register(name)} ref={ref} />
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
                "size-20",
                i < hoveredIndex || i < +getValues(name)
                  ? "fill-cooper-yellow-500"
                  : "fill-cooper-gray-100",
                "pr-2 hover:cursor-pointer",
              )}
              onMouseEnter={() => setHoveredIndex(i + 1)}
              onMouseLeave={() => setHoveredIndex(0)}
              onClick={() => {
                const currentValue = +getValues(name);
                if (currentValue === i + 1) {
                  setValue(name, 0);
                  setHoveredIndex(0);
                } else {
                  setValue(name, i + 1);
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
