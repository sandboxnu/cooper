import type { FieldPath } from "react-hook-form";
import { forwardRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import Image from "next/image";
import { cn } from "@cooper/ui";

// FIXME: Fix this import at some point (form context)
import type { ReviewFormType } from "~/app/_components/form/review-form";

type RatingProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Rating component provides a star-based rating input with labels.
 *
 * See: {@link https://github.com/shadcn-ui/ui/issues/1107#issuecomment-1918229523}
 */
export const NumberedRating = forwardRef<HTMLInputElement, RatingProps>(
  (props, ref) => {
    const name = props.name as FieldPath<ReviewFormType>;
    const { register, setValue, getValues } = useFormContext<ReviewFormType>();
    const [hoveredIndex, setHoveredIndex] = useState<number>(0);

    return (
      <div className="flex gap-2">
        <input {...props} className="hidden" {...register(name)} ref={ref} />
        {Array(5)
          .fill(0)
          .map((_, i) => {
            const rating = i + 1;
            const isSelected = rating === +getValues(name);
            const isHovered = rating === hoveredIndex;

            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setValue(name, 0);
                    setHoveredIndex(0);
                  } else {
                    setValue(name, rating);
                  }
                }}
                onMouseEnter={() => setHoveredIndex(rating)}
                onMouseLeave={() => setHoveredIndex(0)}
                className={cn(
                  "flex items-center md:gap-2 px-3 py-2 rounded-lg transition-colors",
                  isSelected || isHovered
                    ? "border border-cooper-yellow-500"
                    : "bg-[#EBEBEB] text-[#333]",
                  "hover:border hover:border-cooper-yellow-500 cursor-pointer",
                )}
              >
                <Image
                  src="/svg/star.svg"
                  alt="Star icon"
                  width={20}
                  height={20}
                />
                <span className="text-sm font-medium">{rating}.0</span>
              </button>
            );
          })}
      </div>
    );
  },
);
NumberedRating.displayName = "Rating";
