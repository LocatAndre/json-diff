import { ChevronDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { parseSchema, validateAgainstSchema } from "@/lib/schemaValidate";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages.js";

interface SchemaPanelProps {
  schemaInput: string;
  onSchemaChange: (value: string) => void;
  leftValue: unknown | null;
  rightValue: unknown | null;
}

export function SchemaPanel({
  schemaInput,
  onSchemaChange,
  leftValue,
  rightValue,
}: SchemaPanelProps) {
  const [open, setOpen] = useState(Boolean(schemaInput.trim()));

  const parsedSchema = useMemo(() => {
    if (!schemaInput.trim()) return null;
    return parseSchema(schemaInput);
  }, [schemaInput]);

  const leftValidation = useMemo(() => {
    if (!parsedSchema?.ok || leftValue === null) return null;
    return validateAgainstSchema(leftValue, parsedSchema.schema);
  }, [parsedSchema, leftValue]);

  const rightValidation = useMemo(() => {
    if (!parsedSchema?.ok || rightValue === null) return null;
    return validateAgainstSchema(rightValue, parsedSchema.schema);
  }, [parsedSchema, rightValue]);

  const schemaError = parsedSchema && !parsedSchema.ok ? parsedSchema.error : undefined;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardHeader className="gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              {m.schema_label()}
            </CardTitle>
            <CollapsibleTrigger
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <ChevronDownIcon
                className={cn("transition-transform", open && "rotate-180")}
              />
              {open ? m.schema_collapse() : m.schema_expand()}
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 p-4 pt-0">
            <Field data-invalid={Boolean(schemaError)}>
              <FieldLabel htmlFor="schema-input">{m.schema_label()}</FieldLabel>
              <Textarea
                id="schema-input"
                value={schemaInput}
                onChange={(event) => onSchemaChange(event.target.value)}
                spellCheck={false}
                placeholder={m.schema_placeholder()}
                aria-invalid={Boolean(schemaError)}
                className="field-sizing-fixed h-32 resize-none overflow-y-auto font-mono text-sm leading-6"
              />
              <FieldError>{schemaError}</FieldError>
            </Field>

            {parsedSchema?.ok && (
              <div className="grid gap-3 sm:grid-cols-2">
                <SchemaValidationResult label={m.json_a()} result={leftValidation} />
                <SchemaValidationResult label={m.json_b()} result={rightValidation} />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function SchemaValidationResult({
  label,
  result,
}: {
  label: string;
  result: ReturnType<typeof validateAgainstSchema> | null;
}) {
  if (!result) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-[var(--color-inset)] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm">{label}</span>
        <Badge
          variant={result.valid ? "secondary" : "destructive"}
          className={cn(
            result.valid &&
              "border-[color-mix(in_srgb,var(--color-added)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-added)_12%,transparent)] text-[var(--color-added)]",
          )}
        >
          {result.valid ? m.schema_valid() : m.schema_invalid()}
        </Badge>
      </div>

      {!result.valid && (
        <ul className="space-y-1 text-muted-foreground text-xs">
          {result.errors.slice(0, 5).map((error) => (
            <li key={`${error.path}-${error.message}`} className="font-mono">
              {error.path}: {error.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
