import { Input as InputPrimitive } from "@cooper/ui/input";

export function Input(props: React.ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      className="h-12 rounded-lg border-2 border-cooper-gray-300 text-lg shadow-none hover:bg-accent"
      {...props}
    />
  );
}
