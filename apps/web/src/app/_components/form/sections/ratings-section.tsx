import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";
import { RadioGroup, RadioGroupItem } from "@cooper/ui/radio-group";
import { Textarea } from "@cooper/ui/textarea";

import { FormSection } from "~/app/_components/form/form-section";
import { Rating } from "~/app/_components/form/rating";

/**
 * RatingsSection component renders form fields for rating various
 * aspects of a co-op experience.
 */
export function RatingsSection({ textColor }: { textColor: string }) {
  const form = useFormContext();

  return (
    <FormSection title="Ratings" className={textColor}>
      <FormField
        control={form.control}
        name="overallRating"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              How would you rate your overall co-op experience?*
            </FormLabel>
            <FormControl>
              <Rating {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="cultureRating"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              How would you rate your company&apos;s culture?*
            </FormLabel>
            <FormControl>
              <Rating {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="supervisorRating"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How would you rate your supervisor?*</FormLabel>
            <FormControl>
              <Rating {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="interviewRating"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              How would you rate your interview experience?*
            </FormLabel>
            <FormControl>
              <Rating {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="interviewDifficulty"
        render={({ field }) => (
          <FormItem className="space-y-8">
            <FormLabel>Interview Difficulty*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                defaultValue={field.value}
                className="flex w-full flex-col justify-between space-y-3 text-center sm:flex-row sm:space-y-0"
              >
                <FormItem className="flex flex-col items-center space-x-2 space-y-2">
                  <FormControl>
                    <RadioGroupItem value="1" checked={field.value === "1"} />
                  </FormControl>
                  <FormLabel>Very easy</FormLabel>
                </FormItem>
                <FormItem className="flex flex-col items-center space-x-2 space-y-2">
                  <FormControl>
                    <RadioGroupItem value="2" checked={field.value === "2"} />
                  </FormControl>
                  <FormLabel>Easy</FormLabel>
                </FormItem>
                <FormItem className="flex flex-col items-center space-x-2 space-y-2">
                  <FormControl>
                    <RadioGroupItem value="3" checked={field.value === "3"} />
                  </FormControl>
                  <FormLabel>Neither easy nor difficult</FormLabel>
                </FormItem>
                <FormItem className="flex flex-col items-center space-x-2 space-y-2">
                  <FormControl>
                    <RadioGroupItem value="4" checked={field.value === "4"} />
                  </FormControl>
                  <FormLabel>Difficult</FormLabel>
                </FormItem>
                <FormItem className="flex flex-col items-center space-x-2 space-y-2">
                  <FormControl>
                    <RadioGroupItem value="5" checked={field.value === "5"} />
                  </FormControl>
                  <FormLabel>Very difficult</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="interviewReview"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tell us about your interview experience</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
