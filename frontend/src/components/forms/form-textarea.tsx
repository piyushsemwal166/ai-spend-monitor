import { FormField } from "@/components/forms/form-field";
import { Textarea } from "@/components/ui/textarea";

export function FormTextarea(props: {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
}) {
  const { label, error, ...textareaProps } = props;

  return (
    <FormField label={label} error={error}>
      <Textarea {...textareaProps} />
    </FormField>
  );
}