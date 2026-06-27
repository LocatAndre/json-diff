import type { ReactNode } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldOptionGroup {
  label: string;
  options: SelectFieldOption[];
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options?: SelectFieldOption[];
  groups?: SelectFieldOptionGroup[];
  /** Labels shown in the trigger; defaults to option labels */
  displayItems?: Record<string, string>;
  triggerClassName?: string;
  labelClassName?: string;
  fieldClassName?: string;
  size?: "sm" | "default";
  icon?: ReactNode;
  orientation?: "horizontal" | "vertical";
}

export function SelectField({
  id,
  label,
  value,
  onValueChange,
  options = [],
  groups = [],
  displayItems,
  triggerClassName,
  labelClassName,
  fieldClassName,
  size = "default",
  icon,
  orientation = "horizontal",
}: SelectFieldProps) {
  const groupedOptions = groups.flatMap((group) => group.options);
  const allOptions = [...options, ...groupedOptions];
  const items =
    displayItems ??
    Object.fromEntries(allOptions.map((option) => [option.value, option.label]));

  return (
    <Field
      orientation={orientation}
      className={cn("w-auto shrink-0 items-center", fieldClassName)}
    >
      <FieldLabel htmlFor={id} className={cn("shrink-0", labelClassName)}>
        {label}
      </FieldLabel>
      <Select
        value={value}
        items={items}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onValueChange(nextValue);
          }
        }}
      >
        <SelectTrigger id={id} size={size} className={cn("min-w-0", triggerClassName)}>
          {icon}
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          {groups.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
