import { FormSection } from "~/components/form-section";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";
import { Rating } from "~/components/ui/rating";

export function RatingsSection() {
  const form = useFormContext();

  return (
    <FormSection title="2. Ratings">
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
          <FormItem className="space-y-3">
            <FormLabel>Interview Difficulty*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="1" />
                  </FormControl>
                  <FormLabel>Very easy</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="2" />
                  </FormControl>
                  <FormLabel>Easy</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="3" />
                  </FormControl>
                  <FormLabel>Neither easy nor difficult</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="4" />
                  </FormControl>
                  <FormLabel>Difficult</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="5" />
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
