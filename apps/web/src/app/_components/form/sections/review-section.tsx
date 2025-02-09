import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";
import { Input } from "@cooper/ui/input";
import { Textarea } from "@cooper/ui/textarea";

import type { ComboBoxOption } from "~/app/_components/combo-box";
import ComboBox from "~/app/_components/combo-box";
import { FormSection } from "~/app/_components/form/form-section";

interface Location {
  city: string;
  state: string;
  country: string;
}

/**
 * ReviewSection component renders form fields for writing a co-op review.
 */
export function ReviewSection({ textColor }: { textColor: string }) {
  const form = useFormContext();

  //  // State for the location combo box

  //  const url =
  //    "https://andruxnet-world-cities-v1.p.rapidapi.com/?query=boston&searchby=city";
  //  const options = {
  //    method: "GET",
  //    headers: {
  //      "x-rapidapi-key": "1a32340272msh6862c91485f4b93p1d2742jsn4c2d9bebe366",
  //      "x-rapidapi-host": "andruxnet-world-cities-v1.p.rapidapi.com",
  //    },
  //  };

  // const [locationValuesAndLabels, setLocationValuesAndLabels] = useState<
  //   ComboBoxOption<string>[]
  // >([]);

  //  const locations = useMemo(async () => {
  //    try {
  //      const response = await fetch(url, options);
  //      const result = await response.json();
  //      console.log(result);
  //      if (!result) {
  //        return [];
  //      } else {
  //        result.map((location: { city: any }) => {
  //          return { value: location.city, label: location.city };
  //        });
  //      }
  //    } catch (error) {
  //      console.error(error);
  //    }
  //  }, []);

  const sampleData = [
    { city: "Drogenbos", state: "Vlaams-Brabant", country: "Belgium" },
    { city: "Kapelle-op-den-Bos", state: "Vlaams-Brabant", country: "Belgium" },
    { city: "Ruy Barbosa", state: "Bahia", country: "Brazil" },
    { city: "Barbosa Ferraz", state: "Parana", country: "Brazil" },
    { city: "Pombos", state: "Pernambuco", country: "Brazil" },
    { city: "Boboshevo", state: "Kjustendil", country: "Bulgaria" },
    { city: "Bossangoa", state: "Ouham", country: "Central African Republic" },
    { city: "Bose", state: "Guangxi", country: "China" },
    { city: "Boshan", state: "Shandong", country: "China" },
    { city: "Boshan", state: "Shandong Sheng", country: "China" },
    { city: "Barbosa", state: "Antioquia", country: "Colombia" },
    { city: "Bosconia", state: "Cesar", country: "Colombia" },
    { city: "Barbosa", state: "Santander", country: "Colombia" },
    {
      city: "Bosobolo",
      state: "Equateur",
      country: "Congo The Democratic Republic Of The",
    },
    { city: "Tobosi", state: "Cartago", country: "Costa Rica" },
    {
      city: "Boshnjaci",
      state: "Vukovar-Srijem",
      country: "Croatia (Hrvatska)",
    },
    { city: "Los Arabos", state: "Matanzas", country: "Cuba" },
    { city: "Boskovice", state: "Jihomoravsky", country: "Czech Republic" },
    { city: "GroBostheim", state: "Bayern", country: "Germany" },
    { city: "Fallingbostel", state: "Niedersachsen", country: "Germany" },
    { city: "Aboso", state: "Western", country: "Ghana" },
    { city: "Bosarkany", state: "Gyor-Moson-Sopron", country: "Hungary" },
    { city: "Hajduboszormeny", state: "Hajdu-Bihar", country: "Hungary" },
    { city: "Hajduszoboszlo", state: "Hajdu-Bihar", country: "Hungary" },
    { city: "Boscoreale", state: "Campania", country: "Italy" },
    { city: "Boscotrecase", state: "Campania", country: "Italy" },
    { city: "Bosisio Parini", state: "Lecco", country: "Italy" },
    { city: "Bosisio Parini", state: "Lecco Province", country: "Italy" },
    { city: "Cesano Boscone", state: "Lombardia", country: "Italy" },
    { city: "Bosilovo", state: "Strumica", country: "Macedonia" },
    { city: "Ambositra", state: "Fianarantsoa", country: "Madagascar" },
    { city: "El Bosque", state: "Chiapas", country: "Mexico" },
    { city: "Raboso", state: "Puebla", country: "Mexico" },
    { city: "Isla del Bosque", state: "Sinaloa", country: "Mexico" },
    { city: "Bosque de Saloya", state: "Tabasco", country: "Mexico" },
    {
      city: "'s-Hertogenbosch",
      state: "Noord-Brabant",
      country: "Netherlands The",
    },
    { city: "Den Bosch", state: "Noord-Brabant", country: "Netherlands The" },
    { city: "Boskoop", state: "Zuid-Holland", country: "Netherlands The" },
    { city: "Obosi", state: "Anambra", country: "Nigeria" },
    { city: "Bosso", state: "Niger", country: "Nigeria" },
    { city: "Emboscada", state: "Cordillera", country: "Paraguay" },
    { city: "Ambos", state: "Huanuco", country: "Peru" },
    { city: "Camara de Lobos", state: "Madeira", country: "Portugal" },
    { city: "Dalboset", state: "Caras-Severin", country: "Romania" },
    { city: "Bolbosi", state: "Gorj", country: "Romania" },
    { city: "Bosorod", state: "Hunedoara", country: "Romania" },
    { city: "Bosanci", state: "Suceava", country: "Romania" },
    { city: "Boshany", state: "Trenciansky", country: "Slovakia" },
    { city: "Bosaso", state: "Bari", country: "Somalia" },
    { city: "Taboshar", state: "Sughd", country: "Tajikistan" },
    { city: "Boston", state: "England", country: "United Kingdom" },
    {
      city: "Newtown Saint Boswells",
      state: "Scotland",
      country: "United Kingdom",
    },
    { city: "Bostonia", state: "California", country: "United States" },
    { city: "Bossier City", state: "Louisiana", country: "United States" },
    { city: "Boston", state: "Massachusetts", country: "United States" },
    { city: "South Boston", state: "Massachusetts", country: "United States" },
    { city: "South Boston", state: "Virginia", country: "United States" },
    { city: "Bosque", state: "Arizona", country: "United States" },
    { city: "Boswell", state: "Arkansas", country: "United States" },
    { city: "Bostwick", state: "Florida", country: "United States" },
    { city: "Bostwick", state: "Georgia", country: "United States" },
    { city: "Boston", state: "Georgia", country: "United States" },
    { city: "New Boston", state: "Illinois", country: "United States" },
    { city: "Boston", state: "Indiana", country: "United States" },
    { city: "Boswell", state: "Indiana", country: "United States" },
    { city: "Boston", state: "Kentucky", country: "United States" },
    { city: "Bosco", state: "Louisiana", country: "United States" },
    { city: "New Boston", state: "Michigan", country: "United States" },
    { city: "Boschertown", state: "Missouri", country: "United States" },
    { city: "Boss", state: "Missouri", country: "United States" },
    { city: "Bosworth", state: "Missouri", country: "United States" },
    { city: "Bostwick", state: "Nebraska", country: "United States" },
    { city: "Escabosa", state: "New Mexico", country: "United States" },
    { city: "Bosque Farms", state: "New Mexico", country: "United States" },
    { city: "Bosque", state: "New Mexico", country: "United States" },
    { city: "North Boston", state: "New York", country: "United States" },
    { city: "Bostic", state: "North Carolina", country: "United States" },
    { city: "Boston Heights", state: "Ohio", country: "United States" },
    { city: "Toboso", state: "Ohio", country: "United States" },
    { city: "New Boston", state: "Ohio", country: "United States" },
    { city: "Boswell", state: "Oklahoma", country: "United States" },
    { city: "Boston", state: "Pennsylvania", country: "United States" },
    { city: "Boswell", state: "Pennsylvania", country: "United States" },
    { city: "Jobos", state: "Puerto Rico", country: "United States" },
    { city: "Jobos Comunidad", state: "Puerto Rico", country: "United States" },
    { city: "New Boston", state: "Texas", country: "United States" },
    { city: "Boston", state: "Texas", country: "United States" },
    { city: "Boston", state: "Virginia", country: "United States" },
    { city: "Boston Harbor", state: "Washington", country: "United States" },
    { city: "Lake Bosworth", state: "Washington", country: "United States" },
    { city: "Boscobel", state: "Wisconsin", country: "United States" },
    { city: "Bosler", state: "Wyoming", country: "United States" },
  ];

  const [locations, setLocations] = useState<ComboBoxOption<string>[]>([]);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (searchTerm.length === 3) {
      console.log("greater than 3");

      const flattenedNames = () => {
        return sampleData.map((location: Location) => {
          return {
            value: location.city,
            label:
              location.city + ", " + location.state + ", " + location.country,
          };
        });
      };
      setLocations(flattenedNames);

      // call api here on searchTerm and set result to a state
      // use that object for ComboBox instead of sampleData
    }
  }, [searchTerm]);

  return (
    <FormSection title="Review" className={textColor}>
      <FormField
        control={form.control}
        name="reviewHeadline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Review Headline*</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="textReview"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tell us about your co-op experience*</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-between space-x-2">
        {/* <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        {/* LOCATION COMOBOX TESTER*/}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <ComboBox
                variant="form"
                defaultLabel={locationLabel || "Select location..."}
                searchPlaceholder="Search location..."
                searchEmpty="No location found."
                valuesAndLabels={locations}
                currLabel={locationLabel}
                onChange={(value) => {
                  setSearchTerm(value);
                  field.onChange(value);
                }}
                onSelect={(currentValue) => {
                  setLocationLabel(
                    currentValue === locationLabel ? "" : currentValue,
                  );
                  field.onChange(currentValue);
                }}
              />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="hourlyPay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Pay (USD)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
}
