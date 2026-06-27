import { CheckIcon, LinkIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ARRAY_MODES, getArrayModeLabel } from "@/lib/arrayMessages";
import { getFormatDescription, getFormatLabel } from "@/lib/formatMessages";
import type { ArrayCompareMode } from "@/lib/jsonDiff";
import { FORMAT_MODES, type FormatMode } from "@/lib/jsonFormat";
import type { PersistedDiffOptions } from "@/lib/storage";
import { m } from "@/paraglide/messages.js";

interface EditorToolbarProps {
  formatMode: FormatMode;
  onFormatModeChange: (mode: FormatMode) => void;
  arrayMode: ArrayCompareMode;
  onArrayModeChange: (mode: ArrayCompareMode) => void;
  arrayKey: string;
  onArrayKeyChange: (key: string) => void;
  diffOptions: PersistedDiffOptions;
  onDiffOptionsChange: (options: PersistedDiffOptions) => void;
  onSample: () => void;
  onFormat: () => void;
  onClear: () => void;
  onResetSession: () => void;
  onSwap: () => void;
  onShare: () => void;
  shareState?: "idle" | "success" | "error" | "too-long";
}

export function EditorToolbar({
  formatMode,
  onFormatModeChange,
  arrayMode,
  onArrayModeChange,
  arrayKey,
  onArrayKeyChange,
  diffOptions,
  onDiffOptionsChange,
  onSample,
  onFormat,
  onClear,
  onResetSession,
  onSwap,
  onShare,
  shareState = "idle",
}: EditorToolbarProps) {
  const formatItems = Object.fromEntries(
    FORMAT_MODES.map((mode) => [mode, getFormatLabel(mode)]),
  );
  const arrayItems = Object.fromEntries(
    ARRAY_MODES.map((mode) => [mode, getArrayModeLabel(mode)]),
  );

  const shareLabel =
    shareState === "success"
      ? m.share_success()
      : shareState === "error"
        ? m.share_error()
        : shareState === "too-long"
          ? m.share_url_too_long()
          : m.btn_share();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
        <Field orientation="horizontal" className="w-full items-start sm:w-auto">
          <FieldLabel htmlFor="format-mode" className="shrink-0 pt-2">
            {m.format_label()}
          </FieldLabel>
          <div className="w-full space-y-1 sm:w-[260px]">
            <Select
              value={formatMode}
              items={formatItems}
              onValueChange={(value) => {
                if (value) {
                  onFormatModeChange(value as FormatMode);
                }
              }}
            >
              <SelectTrigger id="format-mode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {getFormatLabel(mode)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>{getFormatDescription(formatMode)}</FieldDescription>
          </div>
        </Field>

        <Field orientation="horizontal" className="w-full items-start sm:w-auto">
          <FieldLabel htmlFor="array-mode" className="shrink-0 pt-2">
            {m.array_mode_label()}
          </FieldLabel>
          <Select
            value={arrayMode}
            items={arrayItems}
            onValueChange={(value) => {
              if (value) {
                onArrayModeChange(value as ArrayCompareMode);
              }
            }}
          >
            <SelectTrigger
              id="array-mode"
              className="w-full min-w-[220px] sm:w-[240px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ARRAY_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {getArrayModeLabel(mode)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {arrayMode === "by-key" && (
          <Field orientation="horizontal" className="w-full items-center sm:w-auto">
            <FieldLabel htmlFor="array-key" className="shrink-0">
              {m.array_key_label()}
            </FieldLabel>
            <Input
              id="array-key"
              value={arrayKey}
              onChange={(event) => onArrayKeyChange(event.target.value)}
              placeholder={m.array_key_placeholder()}
              className="w-full min-w-[120px] sm:w-[160px]"
            />
          </Field>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap justify-start gap-2">
          <Button variant="outline" onClick={onShare}>
            {shareState === "success" ? <CheckIcon /> : <LinkIcon />}
            {shareLabel}
          </Button>
          <Button variant="outline" onClick={onSwap}>
            {m.btn_swap()}
          </Button>
          <Button variant="outline" onClick={onSample}>
            {m.btn_sample()}
          </Button>
          <Button variant="outline" onClick={onFormat}>
            {m.btn_format()}
          </Button>
        </div>
        <div className="flex flex-wrap justify-start gap-2">
          <Button variant="outline" onClick={onResetSession}>
            {m.btn_reset_session()}
          </Button>
          <Button variant="destructive" onClick={onClear}>
            {m.btn_clear()}
          </Button>
        </div>
      </div>

      <Accordion
        defaultValue={
          diffOptions.treatNullAsMissing ||
          diffOptions.numericTolerance ||
          diffOptions.maxDepth !== undefined
            ? ["diff-options"]
            : []
        }
        className="rounded-lg border border-border bg-[var(--color-inset)] px-3"
      >
        <AccordionItem value="diff-options">
          <AccordionTrigger>{m.diff_options_label()}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Field orientation="horizontal" className="w-auto items-center">
                <Checkbox
                  id="treat-null-as-missing"
                  checked={diffOptions.treatNullAsMissing ?? false}
                  onCheckedChange={(checked) =>
                    onDiffOptionsChange({
                      ...diffOptions,
                      treatNullAsMissing: checked,
                    })
                  }
                />
                <Label htmlFor="treat-null-as-missing" className="font-normal">
                  {m.option_treat_null_as_missing()}
                </Label>
              </Field>

              <Field orientation="horizontal" className="w-auto items-center">
                <Checkbox
                  id="numeric-tolerance"
                  checked={diffOptions.numericTolerance ?? false}
                  onCheckedChange={(checked) =>
                    onDiffOptionsChange({
                      ...diffOptions,
                      numericTolerance: checked,
                    })
                  }
                />
                <Label htmlFor="numeric-tolerance" className="font-normal">
                  {m.option_numeric_tolerance()}
                </Label>
              </Field>

              <Field orientation="horizontal" className="w-auto items-center">
                <FieldLabel htmlFor="max-depth" className="shrink-0">
                  {m.option_max_depth_label()}
                </FieldLabel>
                <Input
                  id="max-depth"
                  type="number"
                  min={1}
                  value={diffOptions.maxDepth ?? ""}
                  onChange={(event) => {
                    const raw = event.target.value;
                    onDiffOptionsChange({
                      ...diffOptions,
                      maxDepth: raw ? Number(raw) : undefined,
                    });
                  }}
                  placeholder={m.option_max_depth_placeholder()}
                  className="w-24"
                />
              </Field>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <p className="text-muted-foreground text-xs">{m.share_url_warning()}</p>
    </div>
  );
}
