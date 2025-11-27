import type {
  FieldValues,
  UseFormHandleSubmit,
  UseFormReturn,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "node_modules/@cooper/ui/src/form";
import { z } from "zod";

import type { LocationType } from "@cooper/db/schema";

import ComboBox from "./combo-box";

const _formSchema = z.object({
  searchIndustry: z.string().optional(),
  searchLocation: z.string().optional(),
});
type FormSchema = z.infer<typeof _formSchema>;

export default function LocationBox({
  searchBar,
  form,
  locationLabel,
  setSearchTerm,
  locationValuesAndLabels,
  setLocationLabel,
  locationsToUpdate,
  setValue,
  handleSubmit,
  onSubmit,
}: {
  searchBar: boolean;
  form: UseFormReturn<FieldValues>;
  locationLabel: string;
  setSearchTerm: (value: string) => void;
  locationValuesAndLabels: {
    value: string;
    label: string;
  }[];
  setLocationLabel: (currentValue: string) => void;
  locationsToUpdate?: { data?: LocationType[] };
  setValue?: (name: string, finalValue: string) => void;
  handleSubmit?: UseFormHandleSubmit<FieldValues, undefined>;
  onSubmit?: (data: FormSchema) => void;
}) {
  return (
    <FormField
      control={form.control}
      name={searchBar ? "searchLocation" : "locationId"}
      render={({ field }) => (
        <FormItem
          className={
            searchBar ? "col-span-5 lg:col-span-2" : "flex flex-col justify-end"
          }
        >
          {!searchBar && <FormLabel></FormLabel>}
          <FormControl>
            <ComboBox
              {...field}
              variant={searchBar ? "filtering" : "form"}
              defaultLabel={
                locationLabel ||
                (searchBar ? "Location" : "Search by location...")
              }
              newForm={true}
              searchPlaceholder="Search by location..."
              searchEmpty="No location found."
              valuesAndLabels={locationValuesAndLabels}
              currLabel={locationLabel}
              onChange={(value) => {
                setSearchTerm(value);
              }}
              onSelect={(currentValue) => {
                setLocationLabel(currentValue);
                if (searchBar) {
                  const selectedLoc = locationsToUpdate?.data?.find(
                    (loc) =>
                      `${loc.city}${loc.state ? `, ${loc.state}` : ""}${loc.country ? `, ${loc.country}` : ""}` ===
                      currentValue,
                  );
                  const finalValue =
                    currentValue === "LOCATION" ? undefined : selectedLoc?.id;
                  if (
                    setValue &&
                    handleSubmit &&
                    finalValue !== undefined &&
                    onSubmit
                  ) {
                    setValue(field.name, finalValue);
                    void handleSubmit(onSubmit)();
                  }
                } else {
                  field.onChange(
                    locationValuesAndLabels.find(
                      (location) => location.label === currentValue,
                    )?.value,
                  );
                }
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
