import { FieldPath, useFormContext } from "react-hook-form";
import { ReviewFormType } from "~/components/review-form";
import { forwardRef } from "react";
import { cn } from "~/lib/utils";

type RatingProps = React.InputHTMLAttributes<HTMLInputElement>;

// See: https://github.com/shadcn-ui/ui/issues/1107#issuecomment-1918229523
export const Rating = forwardRef<HTMLInputElement, RatingProps>(
  (props, ref) => {
    const name = props.name as FieldPath<ReviewFormType>;
    const { register, setValue, getValues } = useFormContext<ReviewFormType>();

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
              strokeWidth={1}
              stroke="currentColor"
              className={cn(
                "size-10",
                i < +getValues(name)
                  ? "fill-primary"
                  : "fill-primary-foreground",
                "hover:cursor-pointer",
              )}
              onClick={() =>
                setValue(name, i === +getValues(name) - 1 ? 0 : i + 1)
              }
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
      </div>
    );
  },
);
Rating.displayName = "Rating";
