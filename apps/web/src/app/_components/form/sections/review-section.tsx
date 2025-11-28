"use client";

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

import { FormSection } from "~/app/_components/form/form-section";
import { api } from "~/trpc/react";
import { NumberedRating } from "../numbered-rating";

/**
 * ReviewSection component renders form fields for writing a co-op review.
 */
export function ReviewSection() {
  const form = useFormContext();

  return (
    <FormSection>
      <FormField
        control={form.control}
        name="reviewHeadline"
        render={({ field }) => (
          <FormItem className="flex flex-row gap-4 md:gap-14 pt-6 pl-2 md:pl-0 items-center">
            <FormLabel className="text-sm text-cooper-gray-400 md:w-60 text-right">
              Review Headline
            </FormLabel>
            <div className="flex-1">
              <Input
                {...field}
                placeholder="Ex. SWE Experience @ Google"
                className="border border-cooper-gray-150 w-full rounded-lg h-10 text-sm"
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="textReview"
        render={({ field }) => (
          <FormItem className="flex flex-col md:flex-row md:gap-14 pl-2 md:pl-0 pt-4">
            <FormLabel className="text-sm text-cooper-gray-400 md:w-60 md:text-right">
              Your co-op experience
            </FormLabel>
            <div className="flex-1">
              <Textarea
                {...field}
                placeholder="Write about your co-op experience..."
                className="border border-cooper-gray-150 w-full text-sm"
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex flex-row gap-4 md:gap-14 pt-2.5">
        <div className="text-sm text-cooper-gray-400 pl-2 md:pl-0 md:w-60 text-right">
          Rate
        </div>
        <div className="flex flex-col justify-between overflow-hidden md:flex-col gap-3.5">
          <FormField
            control={form.control}
            name="supervisorRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-cooper-gray-450">
                  Supervisor rating
                </FormLabel>
                <FormControl>
                  <NumberedRating {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="overallRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-cooper-gray-450">
                  Overall co-op experience
                </FormLabel>
                <FormControl>
                  <NumberedRating {...field} />
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
                <FormLabel className="text-sm text-cooper-gray-450">
                  Company culture
                </FormLabel>
                <FormControl>
                  <NumberedRating {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interviewRating"
            render={({ field }) => (
              <FormItem className=" pb-12">
                <FormLabel className="text-sm text-cooper-gray-450">
                  Interview experience
                </FormLabel>
                <FormControl>
                  <NumberedRating {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </FormSection>
  );
}
