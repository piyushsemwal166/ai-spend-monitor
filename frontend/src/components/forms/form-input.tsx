import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";

export function FormInput(props: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  const { label, error, ...inputProps } = props;

  return (
    <FormField label={label} error={error}>
      <Input {...inputProps} />
    </FormField>
  );
}