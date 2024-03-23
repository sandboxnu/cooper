import { FormLabel as Label } from "../ui/form";

type FormLabelProps = React.ComponentProps<typeof Label>;

function FormLabel({ ...props }: FormLabelProps) {
  return (
    <Label {...props} className="text-2xl font-semibold text-cooper-blue-600">
      {props.children}
    </Label>
  );
}

export default FormLabel;
