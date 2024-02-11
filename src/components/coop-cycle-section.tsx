import { useFormContext } from "react-hook-form";
import { FormSection } from "~/components/form-section";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

export function CoopCycleSection() {
  const form = useFormContext();

  return (
    <FormSection title="Co-op Cycle">
      <FormField
        control={form.control}
        name="coopCycle"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Co-op Cycle*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="Spring" />
                  </FormControl>
                  <FormLabel>Spring</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="Fall" />
                  </FormControl>
                  <FormLabel>Fall</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="Other..." />
                  </FormControl>
                  <FormLabel>Other...</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
