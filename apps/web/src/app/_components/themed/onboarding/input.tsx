import { Input as InputPrimitive } from "@cooper/ui/input";

export function Input(props: React.ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      className="border-cooper-gray-300 text-cooper-gray-400 h-12 rounded-full border-2 text-lg shadow-none"
      {...props}
    />
  );
}
