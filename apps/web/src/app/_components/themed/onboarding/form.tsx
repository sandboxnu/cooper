import {
  FormLabel as FormLabelPrimitive,
  FormMessage as FormMessagePrimitive,
} from "@cooper/ui/form";

export function FormLabel({
  children,
  required,
  ...props
}: React.ComponentProps<typeof FormLabelPrimitive> & { required?: boolean }) {
  return (
    <FormLabelPrimitive className="text-lg font-semibold text-black" {...props}>
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </FormLabelPrimitive>
  );
}

export function FormMessage(
  props: React.ComponentProps<typeof FormMessagePrimitive>,
) {
  return <FormMessagePrimitive className="text-base" {...props} />;
}
