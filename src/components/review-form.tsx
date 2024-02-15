"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

const formSchema = z.object({
  reviewHeadline: z.string().min(8, {
    message: "The review headline must be at least 8 characters.",
  }),
  pros: z.string().min(8, {
    message: "Pros must be at least 8 characters.",
  }),
  cons: z.string().min(8, {
    message: "Cons must be at least 8 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  hourlyPay: z.coerce.number(),
});

export function ReviewForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reviewHeadline: "",
      pros: "",
      cons: "",
      location: "",
      hourlyPay: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  // Header Data
  // going to fix the below TODO useMemo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const headerSections = [
    { title: "Co-op Cycle", range: { l: 0, r: 830 } },
    { title: "Ratings", range: { l: 830, r: 1120 } },
    { title: "Review", range: { l: 1120, r: 1780 } },
    { title: "Company Details", range: { l: 1780, r: 2600 } },
    { title: "Submit", range: { l: 2600, r: 10000000 } },
  ] as const;

  // Header Sticky State
  const [headerPercentage, setHeaderPercentage] = useState<number>(50);
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [higlightedSectionIdx, setHighlightedSectionIdx] = useState<number>(0);
  useEffect(() => {
    // Helper Function
    const indexOfRange = (num: number): number => {
      let out = 0;
      headerSections.forEach((section, idx) => {
        if (num >= section.range.l && num < section.range.r) {
          out = idx;
          return;
        }
      });
      return out;
    };

    // Scroll Handler
    const handleScroll = () => {
      // Set the header percentage to be either 100% width or some linear interpolation that has a minimum of 50%
      setHeaderPercentage(
        window.scrollY >= 20 ? 100 : Math.round(window.scrollY * 2.5) + 50,
      );
      setIsSticky(window.scrollY > 20);
      setHighlightedSectionIdx(indexOfRange(window.scrollY));
      console.log(window.scrollY, indexOfRange(window.scrollY));
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headerSections]);

  return (
    <>
      <div
        className={`my-8 block ${isSticky ? "sticky top-[-18%] md:top-[-17%] lg:top-[-16%] xl:top-[-14%]" : ""}`}
      >
        <div
          className={`space-4 flex min-w-[66vw] flex-col rounded-xl bg-white p-8 ${isSticky ? "outline" : ""}`}
          style={{
            width: `${headerPercentage}vw`,
            transition: "width 0.3s; outline 0.7s",
          }}
        >
          <h1 className="text-3xl font-semibold">Submit a Co-op Review</h1>
          <p className="my-4">
            description about this form here - Lorem ipsum dolor sit amet,
            consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore ma.
          </p>
          <div className={`mt-8 flex justify-around`}>
            {headerSections.map((section, idx) => {
              const widthProp = ` w-[${1 / headerSections.length}%]`;
              return (
                <div
                  className={"flex flex-col items-center" + widthProp}
                  key={section.title + idx}
                >
                  <div
                    className={`space-8 mx-6 mt-4 flex h-8 w-8 flex-col items-center justify-center rounded-full border-2 border-black font-semibold lg:h-11 lg:w-11 ${higlightedSectionIdx === idx ? "bg-blue-200" : ""}`}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-center">{section.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex min-w-[66vw] flex-col">
        <div className="flex flex-col space-y-4 rounded-xl bg-white p-8">
          <h2 className="text-2xl font-semibold">Review</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                name="pros"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pros*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Talk about some pros of working at [company]."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cons*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Talk about some cons of working at [company]."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-around space-x-2">
                <FormField
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
                />
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
              <Button type="submit" variant="outline">
                Submit
              </Button>
            </form>
          </Form>
        </div>
        <div className="my-6 h-[30vh] rounded-xl bg-blue-300">2</div>
        <div className="my-6 h-[70vh] rounded-xl bg-green-300">3</div>
        <div className="my-6 h-[90vh] rounded-xl bg-red-300">4</div>
        <div className="my-6 h-[100vh] rounded-xl bg-orange-300">5</div>
      </div>
    </>
  );
}
