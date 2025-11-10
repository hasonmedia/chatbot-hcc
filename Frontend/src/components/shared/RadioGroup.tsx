import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RadioGroupSettingProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options?: Array<{ value: string; label: string; id: number }>;
}

export function RadioGroupSetting({
  value,
  onValueChange,
  options = [
    { value: "gemini", label: "Gemini", id: 1 },
    { value: "gpt", label: "OpenAI", id: 2 },
  ],
}: RadioGroupSettingProps) {
  return (
    <RadioGroup value={value} onValueChange={onValueChange}>
      {options.map((option, index) => (
        <div key={option.value} className="flex items-center gap-3">
          <RadioGroupItem value={option.value} id={`r${index + 1}`} />
          <Label htmlFor={`r${index + 1}`}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}
