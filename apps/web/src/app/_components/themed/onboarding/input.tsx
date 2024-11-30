import { Input as InputPrimitive } from "@cooper/ui/input";

export function Input(props: React.ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      className="h-12 rounded-full border-2 border-cooper-gray-300 text-lg text-cooper-gray-400 shadow-none"
      {...props}
    />
  );
}
