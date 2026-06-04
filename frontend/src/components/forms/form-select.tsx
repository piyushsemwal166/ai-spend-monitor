import { FormField } from "@/components/forms/form-field";
import { Select } from "@/components/ui/select";

export function FormSelect(props: {
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  error?: string;
}) {
  const { label, options, error, ...selectProps } = props;

  return (
    <FormField label={label} error={error}>
      <Select {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormField>
  );
}